# Blog Dashboard

Dashboard untuk mengelola blog pribadi dengan fitur CRUD (Create, Read, Update, Delete) dan upload gambar, dilengkapi dengan API Public.

## Fitur

- 📊 Dashboard dengan statistik
- ✨ Tambah, edit, hapus post blog
- 📁 Upload gambar dengan drag & drop
- 🔗 Opsi upload file atau gunakan URL
- 📱 Responsive design
- 🔍 API Public dengan CORS support
- 📄 Pagination, filtering, dan sorting
- 📈 Auto-increment views

## Instalasi

1. Clone atau download project ini
2. Jalankan `npm install` untuk menginstall dependencies
3. Jalankan `npm run setup` untuk membuat folder yang diperlukan
4. Jalankan `npm start` untuk menjalankan server
5. Buka http://localhost:3000 di browser

## Struktur Data

Data disimpan dalam file `data/data.json` dengan format array of objects. Setiap object mewakili satu post blog dengan properti yang lengkap.

File gambar yang di-upload disimpan di folder `public/uploads/` dengan subfolder:
- thumbnails/ untuk thumbnail
- full-images/ untuk gambar utama  
- gallery/ untuk galeri

## API Public

### Endpoints:

1. **GET /api/public/posts** - Daftar post dengan pagination & filtering
   - Query parameters: `page`, `limit`, `category`, `tag`, `featured`, `sort`
   - Example: `http://localhost:3000/api/public/posts?page=1&limit=5&category=Fotografi`

2. **GET /api/public/posts/:slug** - Detail post berdasarkan slug
   - Example: `http://localhost:3000/api/public/posts/tips-fotografi-pemula`

3. **GET /api/public/categories** - Daftar kategori
4. **GET /api/public/authors** - Daftar authors  
5. **GET /api/public/stats** - Statistik blog

### Contoh Penggunaan API:

```javascript
// Mendapatkan post terbaru
fetch('http://localhost:3000/api/public/posts?limit=5')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data.data);
    }
  });

// Mendapatkan detail post
fetch('http://localhost:3000/api/public/posts/tips-fotografi-pemula')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data.data);
    }
  });