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
3. Jalankan `npm run setup` untuk membuat folder yang diperlukan (Opsional: Server akan otomatis membuatnya jika belum ada)
4. Jalankan `npm start` untuk menjalankan server
5. Buka `http://localhost:3000` di browser

## Struktur Data

Data disimpan dalam file `data/data.json`.
File gambar yang di-upload disimpan di folder `public/uploads/` dengan subfolder:
- `thumbnails/` untuk thumbnail
- `full-images/` untuk gambar utama

## API Public

Base URL: `http://localhost:3000/api/public`

### Endpoints:

1. **GET /posts** - Daftar post dengan pagination & filtering
   - Query parameters: `page`, `limit`, `category`, `tag`, `featured`, `sort`
   - Example: `/api/public/posts?page=1&limit=5&category=Tech`

2. **GET /posts/:slug** - Detail post berdasarkan slug
3. **GET /categories** - Daftar kategori
4. **GET /authors** - Daftar authors  
5. **GET /stats** - Statistik blog

### Contoh Penggunaan API:

```javascript
// Mendapatkan post terbaru
fetch('/api/public/posts?limit=5')
  .then(response => response.json())
  .then(data => console.log(data));
```