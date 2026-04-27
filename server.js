const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// 1. Layer Keamanan: Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "/uploads/"],
      connectSrc: ["'self'"],
    },
  },
}));

// 2. Layer Keamanan: Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Terlalu banyak permintaan, coba lagi nanti.' }
});

const apiPublicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Rate limit API terlampaui. Maksimal 30 req/menit.' }
});

app.use('/api/', generalLimiter);
app.use('/api/public/', apiPublicLimiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Inisialisasi Storage
async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try { await fs.access(DATA_FILE); } catch { await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2)); }
  } catch (error) { console.error('❌ Inisialisasi storage gagal:', error); }
}
initStorage();

// Helper functions
async function readData() { try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf8')); } catch { return []; } }
async function writeData(data) { try { await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2)); return true; } catch { return false; } }

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

// =============================================
// ROUTES
// =============================================

// Halaman Statis
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/docs', (req, res) => res.redirect('/docs/index.html'));


app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/faq', (req, res) => res.sendFile(path.join(__dirname, 'public', 'faq.html')));
app.get('/policy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'policy.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));

// API Internal
app.get('/api/posts', async (req, res) => {
  res.json(await readData());
});

app.post('/api/posts', async (req, res) => {
  const posts = await readData();
  const title = xss(req.body.title || 'Untitled Post');
  const newPost = {
    id: Date.now().toString(),
    title: title,
    slug: slugify(title) + '-' + Math.floor(Math.random() * 1000),
    excerpt: xss(req.body.excerpt || ''),
    content: xss(req.body.content || ''),
    category: xss(req.body.category || 'Uncategorized'),
    author: xss(req.body.author || 'Admin'),
    date: new Date().toISOString().split('T')[0],
    thumbnail: xss(req.body.thumbnail || null),
    status: req.body.status || 'draft',
    views: 0,
    likes: 0,
    featured: req.body.featured === 'true',
    tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => xss(t.trim()))) : []
  };
  posts.push(newPost);
  await writeData(posts);
  res.status(201).json({ success: true, data: newPost });
});

// =============================================
// API PUBLIC ROUTES (CORS & Rate Limited)
// =============================================
app.use('/api/public', cors());

app.get('/api/public/posts', async (req, res) => {
  const posts = (await readData()).filter(post => post.status === 'published');
  const { page = 1, limit = 10, category, tag, featured, sort = 'date_desc', q } = req.query;
  
  let filteredPosts = [...posts];

  // Search by keyword
  if (q) {
    const query = q.toLowerCase();
    filteredPosts = filteredPosts.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.excerpt.toLowerCase().includes(query) ||
      (p.content && p.content.toLowerCase().includes(query))
    );
  }

  if (category) filteredPosts = filteredPosts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (tag) filteredPosts = filteredPosts.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  if (featured !== undefined) filteredPosts = filteredPosts.filter(p => p.featured === (featured === 'true'));

  // Sort
  if (sort === 'views_desc') filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
  else filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const startIndex = (page - 1) * limit;
  res.json({
    success: true,
    data: filteredPosts.slice(startIndex, startIndex + Number(limit)),
    pagination: { 
      page: Number(page), 
      limit: Number(limit), 
      total: filteredPosts.length, 
      totalPages: Math.ceil(filteredPosts.length / Number(limit)) 
    }
  });
});

app.get('/api/public/posts/:slug', async (req, res) => {
  const posts = await readData();
  const post = posts.find(p => p.slug === req.params.slug && p.status === 'published');
  if (!post) return res.status(404).json({ success: false, error: 'Post tidak ditemukan' });
  post.views = (post.views || 0) + 1;
  await writeData(posts);
  res.json({ success: true, data: post });
});

app.get('/api/public/categories', async (req, res) => {
  const posts = (await readData()).filter(post => post.status === 'published');
  const categories = [...new Set(posts.map(p => p.category))].map(cat => ({
    name: cat,
    count: posts.filter(p => p.category === cat).length
  }));
  res.json({ success: true, data: categories });
});

app.get('/api/public/authors', async (req, res) => {
  const posts = (await readData()).filter(post => post.status === 'published');
  const authorNames = [...new Set(posts.map(p => p.author))];
  
  const authors = authorNames.map(name => {
    const firstPost = posts.find(p => p.author === name);
    return {
      name: name,
      avatar: firstPost.authorAvatar || '/images/authors/default.jpg',
      bio: firstPost.authorBio || '',
      postCount: posts.filter(p => p.author === name).length
    };
  });
  
  res.json({ success: true, data: authors });
});

app.get('/api/public/stats', async (req, res) => {
  const posts = (await readData()).filter(post => post.status === 'published');
  res.json({
    success: true,
    data: {
      totalPosts: posts.length,
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0)
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan internal server' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server berjalan di http://localhost:${PORT}`);
});