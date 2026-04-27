/**
 * Blog Frontend Logic - Premium Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    loadCategories();

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadPosts(categoryFilter.value);
        });
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

async function loadPosts(category = '') {
    const container = document.getElementById('blog-container');
    const url = category 
        ? `/api/public/posts?category=${encodeURIComponent(category)}`
        : '/api/public/posts';

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map((post, index) => `
                <article class="post-card bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 flex flex-col h-full reveal" style="animation-delay: ${index * 0.1}s">
                    <div class="relative overflow-hidden group h-64">
                        <img src="${post.thumbnail || '/images/placeholder.jpg'}" 
                             alt="${escapeHTML(post.title)}" 
                             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                        <div class="absolute top-6 left-6">
                            <span class="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-primary shadow-lg uppercase tracking-wider">
                                ${escapeHTML(post.category)}
                            </span>
                        </div>
                    </div>
                    <div class="p-8 flex flex-col flex-grow">
                        <div class="flex items-center text-[11px] font-bold text-slate-400 mb-4 space-x-4 uppercase tracking-widest">
                            <span><i class="far fa-calendar-alt mr-2 text-primary"></i> ${new Date(post.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <span><i class="far fa-user mr-2 text-primary"></i> ${escapeHTML(post.author)}</span>
                        </div>
                        <h3 class="text-2xl font-bold mb-4 text-slate-900 line-clamp-2 hover:text-primary transition leading-tight">
                            <a href="#">${escapeHTML(post.title)}</a>
                        </h3>
                        <p class="text-slate-500 text-base mb-8 line-clamp-2 leading-relaxed font-medium">
                            ${escapeHTML(post.excerpt) || 'Temukan wawasan mendalam dan perspektif baru dalam artikel berkualitas tinggi ini.'}
                        </p>
                        <div class="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div class="flex space-x-5 text-xs text-slate-400 font-bold">
                                <span class="flex items-center gap-1.5"><i class="far fa-eye text-primary"></i> ${post.views || 0}</span>
                                <span class="flex items-center gap-1.5"><i class="far fa-heart text-primary"></i> ${post.likes || 0}</span>
                            </div>
                            <a href="#" class="text-primary font-black text-sm flex items-center group uppercase tracking-widest">
                                Read More
                                <i class="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `).join('');

            // Re-trigger reveal animations for dynamic content
            if (typeof triggerReveal === 'function') {
                triggerReveal();
            }
        } else {
            container.innerHTML = `
                <div class="col-span-full py-40 text-center">
                    <div class="text-8xl mb-8">🏜️</div>
                    <h3 class="text-3xl font-black text-slate-900 mb-4">Belum ada konten</h3>
                    <p class="text-slate-500 text-lg max-w-md mx-auto">Sepertinya belum ada artikel yang dipublikasikan di kategori ini. Silakan cek kembali nanti.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p class="col-span-full py-20 text-center text-red-500 font-bold">Gagal memuat artikel. Silakan coba lagi nanti.</p>';
    }
}

async function loadCategories() {
    const filter = document.getElementById('category-filter');
    if (!filter) return;

    try {
        const response = await fetch('/api/public/categories');
        const result = await response.json();

        if (result.success) {
            result.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.name} (${cat.count})`;
                filter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
