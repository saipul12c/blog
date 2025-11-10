const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'public/uploads/';
    
    // Tentukan subfolder berdasarkan fieldname
    if (file.fieldname === 'thumbnail') {
      uploadPath += 'thumbnails/';
    } else if (file.fieldname === 'imageFull') {
      uploadPath += 'full-images/';
    } else if (file.fieldname === 'gallery') {
      uploadPath += 'gallery/';
    } else {
      uploadPath += 'others/';
    }
    
    // Pastikan folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    // Hanya izinkan gambar
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan!'), false);
    }
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Enable CORS untuk API public
app.use('/api/public', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Helper functions untuk membaca dan menulis data
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add-post.html'));
});

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

app.get('/edit/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'edit-post.html'));
});

// API Routes untuk Dashboard (Protected)
app.get('/api/posts', (req, res) => {
  const posts = readData();
  res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post tidak ditemukan' });
  }
});

// =============================================
// API PUBLIC ROUTES - Bisa diakses oleh semua orang
// =============================================

// GET /api/public/posts - Daftar semua post dengan pagination & filtering
app.get('/api/public/posts', (req, res) => {
  try {
    const posts = readData();
    
    // Filter hanya post yang published
    const publishedPosts = posts.filter(post => post.status === 'published');
    
    // Query parameters untuk filtering dan pagination
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      featured,
      sort = 'date_desc'
    } = req.query;
    
    let filteredPosts = [...publishedPosts];
    
    // Filter by category
    if (category) {
      filteredPosts = filteredPosts.filter(post => 
        post.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by tag
    if (tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }
    
    // Filter by featured
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      filteredPosts = filteredPosts.filter(post => post.featured === isFeatured);
    }
    
    // Sorting
    switch(sort) {
      case 'date_asc':
        filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date_desc':
      default:
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'views_desc':
        filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes_desc':
        filteredPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    // Response data
    const response = {
      success: true,
      data: paginatedPosts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        thumbnail: post.thumbnail,
        imageFull: post.imageFull,
        category: post.category,
        tags: post.tags,
        author: post.author,
        authorAvatar: post.authorAvatar,
        authorBio: post.authorBio,
        date: post.date,
        updatedAt: post.updatedAt,
        readTime: post.readTime,
        wordCount: post.wordCount,
        readingLevel: post.readingLevel,
        views: post.views,
        likes: post.likes,
        shares: post.shares,
        featured: post.featured,
        rating: post.rating,
        gallery: post.gallery,
        series: post.series,
        language: post.language
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit)
      },
      filters: {
        categories: [...new Set(publishedPosts.map(p => p.category))],
        tags: [...new Set(publishedPosts.flatMap(p => p.tags))],
        availableSorts: [
          { value: 'date_desc', label: 'Terbaru' },
          { value: 'date_asc', label: 'Terlama' },
          { value: 'views_desc', label: 'Populer' },
          { value: 'likes_desc', label: 'Paling Disukai' }
        ]
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in public API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
});

// GET /api/public/posts/:slug - Detail post berdasarkan slug
app.get('/api/public/posts/:slug', (req, res) => {
  try {
    const posts = readData();
    const post = posts.find(p => 
      p.slug === req.params.slug && p.status === 'published'
    );
    
    if (post) {
      // Increment views
      post.views = (post.views || 0) + 1;
      writeData(posts);
      
      res.json({
        success: true,
        data: {
          id: post.id,
          slug: post.slug,
          title: post.title,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          excerpt: post.excerpt,
          content: post.content,
          thumbnail: post.thumbnail,
          imageFull: post.imageFull,
          category: post.category,
          tags: post.tags,
          author: post.author,
          authorAvatar: post.authorAvatar,
          authorBio: post.authorBio,
          authorLink: post.authorLink,
          date: post.date,
          updatedAt: post.updatedAt,
          readTime: post.readTime,
          wordCount: post.wordCount,
          readingLevel: post.readingLevel,
          views: post.views,
          likes: post.likes,
          shares: post.shares,
          featured: post.featured,
          rating: post.rating,
          gallery: post.gallery,
          comments: post.comments,
          commentCount: post.commentCount,
          relatedPosts: post.relatedPosts,
          series: post.series,
          source: post.source,
          language: post.language,
          canonicalUrl: post.canonicalUrl
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Post tidak ditemukan' 
      });
    }
  } catch (error) {
    console.error('Error in public API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
});

// GET /api/public/categories - Daftar semua kategori
app.get('/api/public/categories', (req, res) => {
  try {
    const posts = readData();
    const publishedPosts = posts.filter(post => post.status === 'published');
    
    const categories = [...new Set(publishedPosts.map(p => p.category))].map(category => {
      const categoryPosts = publishedPosts.filter(p => p.category === category);
      return {
        name: category,
        count: categoryPosts.length,
        latestPost: categoryPosts.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      };
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in categories API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
});

// GET /api/public/authors - Daftar semua authors
app.get('/api/public/authors', (req, res) => {
  try {
    const posts = readData();
    const publishedPosts = posts.filter(post => post.status === 'published');
    
    const authors = [...new Set(publishedPosts.map(p => p.author))].map(author => {
      const authorPosts = publishedPosts.filter(p => p.author === author);
      const firstPost = authorPosts[0];
      
      return {
        name: author,
        avatar: firstPost?.authorAvatar,
        bio: firstPost?.authorBio,
        link: firstPost?.authorLink,
        postCount: authorPosts.length,
        totalViews: authorPosts.reduce((sum, post) => sum + (post.views || 0), 0),
        totalLikes: authorPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
      };
    });
    
    res.json({
      success: true,
      data: authors
    });
  } catch (error) {
    console.error('Error in authors API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
});

// GET /api/public/stats - Statistik blog
app.get('/api/public/stats', (req, res) => {
  try {
    const posts = readData();
    const publishedPosts = posts.filter(post => post.status === 'published');
    
    const stats = {
      totalPosts: publishedPosts.length,
      totalViews: publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0),
      totalLikes: publishedPosts.reduce((sum, post) => sum + (post.likes || 0), 0),
      totalShares: publishedPosts.reduce((sum, post) => sum + (post.shares || 0), 0),
      totalComments: publishedPosts.reduce((sum, post) => sum + (post.commentCount || 0), 0),
      categoriesCount: [...new Set(publishedPosts.map(p => p.category))].length,
      authorsCount: [...new Set(publishedPosts.map(p => p.author))].length,
      featuredPosts: publishedPosts.filter(post => post.featured).length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
});

// Handle upload untuk multiple fields
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'imageFull', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

app.post('/api/posts', uploadFields, (req, res) => {
  const posts = readData();
  const body = req.body;
  
  // Handle file paths
  const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
  const imageFullFile = req.files['imageFull'] ? req.files['imageFull'][0] : null;
  const galleryFiles = req.files['gallery'] ? req.files['gallery'] : [];
  
  const newPost = {
    id: Date.now().toString(),
    title: body.title,
    slug: body.slug,
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
    keywords: body.keywords ? body.keywords.split(',').map(k => k.trim()) : [],
    author: body.author,
    authorAvatar: body.authorAvatar,
    authorBio: body.authorBio,
    authorLink: body.authorLink,
    thumbnail: thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : body.thumbnailUrl,
    imageFull: imageFullFile ? `/uploads/full-images/${imageFullFile.filename}` : body.imageFullUrl,
    category: body.category,
    tags: body.tags ? body.tags.split(',').map(t => t.trim()) : [],
    readTime: body.readTime,
    wordCount: parseInt(body.wordCount) || 0,
    readingLevel: body.readingLevel,
    featured: body.featured === 'on',
    excerpt: body.excerpt,
    content: body.content,
    gallery: galleryFiles.length > 0 ? galleryFiles.map(f => `/uploads/gallery/${f.filename}`) : (body.galleryUrls ? body.galleryUrls.split(',').map(g => g.trim()) : []),
    relatedPosts: body.relatedPosts ? body.relatedPosts.split(',').map(r => r.trim()) : [],
    series: body.series,
    source: body.source,
    language: body.language,
    canonicalUrl: body.canonicalUrl,
    date: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    status: 'published',
    views: 0,
    likes: 0,
    shares: 0,
    commentCount: 0,
    comments: []
  };
  
  posts.push(newPost);
  if (writeData(posts)) {
    res.json({ success: true, post: newPost });
  } else {
    res.status(500).json({ error: 'Gagal menyimpan post' });
  }
});

app.put('/api/posts/:id', uploadFields, (req, res) => {
  const posts = readData();
  const index = posts.findIndex(p => p.id === req.params.id);
  const body = req.body;
  
  if (index !== -1) {
    // Handle file paths
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
    const imageFullFile = req.files['imageFull'] ? req.files['imageFull'][0] : null;
    const galleryFiles = req.files['gallery'] ? req.files['gallery'] : [];
    
    const updatedPost = {
      ...posts[index],
      title: body.title,
      slug: body.slug,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      keywords: body.keywords ? body.keywords.split(',').map(k => k.trim()) : [],
      author: body.author,
      authorAvatar: body.authorAvatar,
      authorBio: body.authorBio,
      authorLink: body.authorLink,
      category: body.category,
      tags: body.tags ? body.tags.split(',').map(t => t.trim()) : [],
      readTime: body.readTime,
      wordCount: parseInt(body.wordCount) || 0,
      readingLevel: body.readingLevel,
      featured: body.featured === 'on',
      excerpt: body.excerpt,
      content: body.content,
      relatedPosts: body.relatedPosts ? body.relatedPosts.split(',').map(r => r.trim()) : [],
      series: body.series,
      source: body.source,
      language: body.language,
      canonicalUrl: body.canonicalUrl,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Jika ada file baru, update path
    if (thumbnailFile) {
      updatedPost.thumbnail = `/uploads/thumbnails/${thumbnailFile.filename}`;
    } else if (body.thumbnailUrl) {
      updatedPost.thumbnail = body.thumbnailUrl;
    }
    
    if (imageFullFile) {
      updatedPost.imageFull = `/uploads/full-images/${imageFullFile.filename}`;
    } else if (body.imageFullUrl) {
      updatedPost.imageFull = body.imageFullUrl;
    }
    
    if (galleryFiles.length > 0) {
      updatedPost.gallery = galleryFiles.map(f => `/uploads/gallery/${f.filename}`);
    } else if (body.galleryUrls) {
      updatedPost.gallery = body.galleryUrls.split(',').map(g => g.trim());
    }
    
    posts[index] = updatedPost;
    
    if (writeData(posts)) {
      res.json({ success: true, post: posts[index] });
    } else {
      res.status(500).json({ error: 'Gagal mengupdate post' });
    }
  } else {
    res.status(404).json({ error: 'Post tidak ditemukan' });
  }
});

app.delete('/api/posts/:id', (req, res) => {
  const posts = readData();
  const filteredPosts = posts.filter(p => p.id !== req.params.id);
  
  if (writeData(filteredPosts)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Gagal menghapus post' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔗 API Public tersedia di:`);
  console.log(`   - GET http://localhost:${PORT}/api/public/posts`);
  console.log(`   - GET http://localhost:${PORT}/api/public/posts/:slug`);
  console.log(`   - GET http://localhost:${PORT}/api/public/categories`);
  console.log(`   - GET http://localhost:${PORT}/api/public/authors`);
  console.log(`   - GET http://localhost:${PORT}/api/public/stats`);
});