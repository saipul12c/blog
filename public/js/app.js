// Fungsi untuk memuat dan menampilkan daftar post
async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    const posts = await response.json();
    
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
      postsContainer.innerHTML = '<div class="no-posts"><p>Belum ada post. <a href="/add" class="btn">Buat post pertama</a></p></div>';
      return;
    }
    
    posts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'post-card';
      
      // Handle thumbnail dengan fallback
      const thumbnailSrc = post.thumbnail || '/images/placeholder.jpg';
      
      postCard.innerHTML = `
        <div class="post-thumbnail-container">
          <img src="${thumbnailSrc}" alt="${post.title}" class="post-thumbnail" 
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
        </div>
        <div class="post-content">
          <h3 class="post-title">${post.title}</h3>
          <div class="post-meta">
            <span>${post.category}</span>
            <span>${post.date}</span>
          </div>
          <p class="post-excerpt">${post.excerpt}</p>
          <div class="post-stats">
            <span>👁️ ${post.views || 0}</span>
            <span>❤️ ${post.likes || 0}</span>
            <span>📤 ${post.shares || 0}</span>
          </div>
          <div class="post-actions">
            <a href="/edit/${post.id}" class="btn btn-edit">Edit</a>
            <button class="btn btn-danger" onclick="deletePost('${post.id}')">Hapus</button>
          </div>
        </div>
      `;
      
      postsContainer.appendChild(postCard);
    });
  } catch (error) {
    console.error('Error loading posts:', error);
    showAlert('Gagal memuat daftar post', 'error');
  }
}

// Fungsi untuk menghapus post
async function deletePost(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus post ini?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Post berhasil dihapus', 'success');
      loadPosts(); // Muat ulang daftar post
    } else {
      showAlert('Gagal menghapus post', 'error');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    showAlert('Gagal menghapus post', 'error');
  }
}

// Fungsi untuk menampilkan alert
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  document.body.insertBefore(alertDiv, document.body.firstChild);
  
  // Hapus alert setelah 5 detik
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Fungsi untuk memuat data post ke form edit
async function loadPostForEdit() {
  const pathParts = window.location.pathname.split('/');
  const postId = pathParts[pathParts.length - 1];
  
  if (!postId || postId === 'edit') return;
  
  try {
    const response = await fetch(`/api/posts/${postId}`);
    const post = await response.json();
    
    // Isi form dengan data post
    document.getElementById('title').value = post.title || '';
    document.getElementById('slug').value = post.slug || '';
    document.getElementById('metaTitle').value = post.metaTitle || '';
    document.getElementById('metaDescription').value = post.metaDescription || '';
    document.getElementById('keywords').value = post.keywords ? post.keywords.join(', ') : '';
    document.getElementById('author').value = post.author || '';
    document.getElementById('authorAvatar').value = post.authorAvatar || '';
    document.getElementById('authorBio').value = post.authorBio || '';
    document.getElementById('authorLink').value = post.authorLink || '';
    
    // Untuk thumbnail, imageFull, dan gallery, kita akan set opsi URL dan menampilkan preview
    if (post.thumbnail) {
      setImageOption('thumbnail', 'url');
      document.getElementById('thumbnailUrl').value = post.thumbnail;
      showPreview('thumbnailPreview', post.thumbnail);
    }
    
    if (post.imageFull) {
      setImageOption('imageFull', 'url');
      document.getElementById('imageFullUrl').value = post.imageFull;
      showPreview('imageFullPreview', post.imageFull);
    }
    
    if (post.gallery && post.gallery.length > 0) {
      setImageOption('gallery', 'url');
      document.getElementById('galleryUrls').value = post.gallery.join(', ');
      showGalleryPreview('galleryPreview', post.gallery);
    }
    
    document.getElementById('category').value = post.category || '';
    document.getElementById('tags').value = post.tags ? post.tags.join(', ') : '';
    document.getElementById('readTime').value = post.readTime || '';
    document.getElementById('wordCount').value = post.wordCount || '';
    document.getElementById('readingLevel').value = post.readingLevel || '';
    document.getElementById('featured').checked = post.featured || false;
    document.getElementById('excerpt').value = post.excerpt || '';
    document.getElementById('content').value = post.content || '';
    document.getElementById('relatedPosts').value = post.relatedPosts ? post.relatedPosts.join(', ') : '';
    document.getElementById('series').value = post.series || '';
    document.getElementById('source').value = post.source || '';
    document.getElementById('language').value = post.language || '';
    document.getElementById('canonicalUrl').value = post.canonicalUrl || '';
    
    // Simpan ID post untuk update
    document.getElementById('post-form').dataset.postId = postId;
  } catch (error) {
    console.error('Error loading post for edit:', error);
    showAlert('Gagal memuat data post', 'error');
  }
}

// Fungsi untuk menangani submit form
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const postId = form.dataset.postId;
  const isEdit = !!postId;
  
  // Buat FormData untuk mengirim file dan text
  const formData = new FormData();
  
  // Tambahkan field teks
  formData.append('title', document.getElementById('title').value);
  formData.append('slug', document.getElementById('slug').value);
  formData.append('metaTitle', document.getElementById('metaTitle').value);
  formData.append('metaDescription', document.getElementById('metaDescription').value);
  formData.append('keywords', document.getElementById('keywords').value);
  formData.append('author', document.getElementById('author').value);
  formData.append('authorAvatar', document.getElementById('authorAvatar').value);
  formData.append('authorBio', document.getElementById('authorBio').value);
  formData.append('authorLink', document.getElementById('authorLink').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('tags', document.getElementById('tags').value);
  formData.append('readTime', document.getElementById('readTime').value);
  formData.append('wordCount', document.getElementById('wordCount').value);
  formData.append('readingLevel', document.getElementById('readingLevel').value);
  formData.append('featured', document.getElementById('featured').checked ? 'on' : 'off');
  formData.append('excerpt', document.getElementById('excerpt').value);
  formData.append('content', document.getElementById('content').value);
  formData.append('relatedPosts', document.getElementById('relatedPosts').value);
  formData.append('series', document.getElementById('series').value);
  formData.append('source', document.getElementById('source').value);
  formData.append('language', document.getElementById('language').value);
  formData.append('canonicalUrl', document.getElementById('canonicalUrl').value);
  
  // Handle thumbnail
  const thumbnailOption = getSelectedOption('thumbnail');
  if (thumbnailOption === 'upload') {
    const thumbnailFile = document.getElementById('thumbnailFile').files[0];
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
  } else {
    formData.append('thumbnailUrl', document.getElementById('thumbnailUrl').value);
  }
  
  // Handle imageFull
  const imageFullOption = getSelectedOption('imageFull');
  if (imageFullOption === 'upload') {
    const imageFullFile = document.getElementById('imageFullFile').files[0];
    if (imageFullFile) {
      formData.append('imageFull', imageFullFile);
    }
  } else {
    formData.append('imageFullUrl', document.getElementById('imageFullUrl').value);
  }
  
  // Handle gallery
  const galleryOption = getSelectedOption('gallery');
  if (galleryOption === 'upload') {
    const galleryFiles = document.getElementById('galleryFiles').files;
    for (let i = 0; i < galleryFiles.length; i++) {
      formData.append('gallery', galleryFiles[i]);
    }
  } else {
    formData.append('galleryUrls', document.getElementById('galleryUrls').value);
  }
  
  try {
    let response;
    
    if (isEdit) {
      // Update post yang sudah ada
      response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      // Buat post baru
      response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
      });
    }
    
    const result = await response.json();
    
    if (result.success) {
      showAlert(`Post berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`, 'success');
      
      // Redirect ke halaman dashboard setelah 2 detik
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      showAlert(`Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} post`, 'error');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    showAlert(`Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} post`, 'error');
  }
}

// Fungsi untuk mengatur opsi upload/URL
function setImageOption(field, option) {
  // Update tombol
  document.querySelectorAll(`[data-field="${field}"] .upload-option-btn`).forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-field="${field}"] [data-option="${option}"]`).classList.add('active');
  
  // Tampilkan input yang sesuai
  document.getElementById(`${field}Upload`).classList.toggle('hidden', option !== 'upload');
  document.getElementById(`${field}Url`).classList.toggle('hidden', option !== 'url');
}

// Fungsi untuk mendapatkan opsi yang dipilih
function getSelectedOption(field) {
  const activeBtn = document.querySelector(`[data-field="${field}"] .upload-option-btn.active`);
  return activeBtn ? activeBtn.dataset.option : 'url';
}

// Fungsi untuk menampilkan preview gambar
function showPreview(previewId, src) {
  const preview = document.getElementById(previewId);
  if (preview) {
    preview.innerHTML = `<img src="${src}" alt="Preview">`;
  }
}

// Fungsi untuk menampilkan preview galeri
function showGalleryPreview(previewId, images) {
  const preview = document.getElementById(previewId);
  if (preview) {
    preview.innerHTML = images.map(src => `
      <div class="image-preview">
        <img src="${src}" alt="Preview">
        <button type="button" class="remove-image" onclick="removeGalleryImage(this)">×</button>
      </div>
    `).join('');
  }
}

// Fungsi untuk menangani perubahan file input
function handleFileChange(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    
    reader.readAsDataURL(input.files[0]);
  }
}

// Fungsi untuk menangani perubahan file input galeri (multiple)
function handleGalleryChange(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  preview.innerHTML = '';
  
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      const reader = new FileReader();
      
      reader.onload = (function(file) {
        return function(e) {
          const imgContainer = document.createElement('div');
          imgContainer.className = 'image-preview';
          imgContainer.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button type="button" class="remove-image" onclick="removeGalleryImage(this)">×</button>
          `;
          preview.appendChild(imgContainer);
        };
      })(input.files[i]);
      
      reader.readAsDataURL(input.files[i]);
    }
  }
}

// Fungsi untuk menghapus gambar dari galeri preview
function removeGalleryImage(button) {
  button.closest('.image-preview').remove();
}

// Fungsi untuk drag and drop
function setupDragAndDrop() {
  const dropAreas = document.querySelectorAll('.upload-area');
  
  dropAreas.forEach(area => {
    area.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('dragover');
    });
    
    area.addEventListener('dragleave', function() {
      this.classList.remove('dragover');
    });
    
    area.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      const field = this.dataset.field;
      
      if (files.length > 0) {
        if (field === 'gallery') {
          // Untuk galeri, tambahkan ke input file yang sudah ada
          const input = document.getElementById('galleryFiles');
          const dt = new DataTransfer();
          
          // Tambahkan file yang sudah ada
          for (let i = 0; i < input.files.length; i++) {
            dt.items.add(input.files[i]);
          }
          
          // Tambahkan file baru
          for (let i = 0; i < files.length; i++) {
            dt.items.add(files[i]);
          }
          
          input.files = dt.files;
          handleGalleryChange('galleryFiles', 'galleryPreview');
        } else {
          // Untuk single file, ganti file yang ada
          const input = document.getElementById(field + 'File');
          input.files = files;
          handleFileChange(field + 'File', field + 'Preview');
        }
      }
    });
  });
}

// Inisialisasi berdasarkan halaman
document.addEventListener('DOMContentLoaded', function() {
  // Halaman dashboard
  if (document.getElementById('posts-container')) {
    loadPosts();
  }
  
  // Halaman edit
  if (window.location.pathname.includes('/edit/')) {
    loadPostForEdit();
  }
  
  // Form post
  const postForm = document.getElementById('post-form');
  if (postForm) {
    postForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Inisialisasi opsi upload/URL
  document.querySelectorAll('.upload-option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const field = this.closest('.upload-option').dataset.field;
      const option = this.dataset.option;
      setImageOption(field, option);
    });
  });
  
  // Event listener untuk file input
  const thumbnailFileInput = document.getElementById('thumbnailFile');
  if (thumbnailFileInput) {
    thumbnailFileInput.addEventListener('change', function() {
      handleFileChange('thumbnailFile', 'thumbnailPreview');
    });
  }
  
  const imageFullFileInput = document.getElementById('imageFullFile');
  if (imageFullFileInput) {
    imageFullFileInput.addEventListener('change', function() {
      handleFileChange('imageFullFile', 'imageFullPreview');
    });
  }
  
  const galleryFilesInput = document.getElementById('galleryFiles');
  if (galleryFilesInput) {
    galleryFilesInput.addEventListener('change', function() {
      handleGalleryChange('galleryFiles', 'galleryPreview');
    });
  }
  
  // Setup drag and drop
  setupDragAndDrop();
});