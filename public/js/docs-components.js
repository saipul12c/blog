/**
 * Shared Components for Documentation
 */

const SharedComponents = {
    getSidebar: (activeId) => {
        return `
        <aside class="sidebar hidden lg:flex flex-col p-8 shadow-2xl">
            <div class="mb-12">
                <a href="/" class="text-2xl font-bold flex items-center gap-2">
                    <div class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <span class="gradient-text">BLOG</span><span class="text-slate-900 font-extrabold tracking-tight">API</span>
                </a>
                <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-[0.2em]">Documentation v2.0</p>
            </div>

            <nav class="space-y-10 overflow-y-auto pr-2">
                <div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Dasar-dasar</h4>
                    <div class="space-y-1">
                        <a href="/docs/index.html#overview" class="sidebar-link ${activeId === 'overview' ? 'active' : ''}">Overview & Auth</a>
                        <a href="/docs/index.html#rate-limiting" class="sidebar-link">Rate Limiting</a>
                        <a href="/docs/index.html#errors" class="sidebar-link">Error Handling</a>
                    </div>
                </div>

                <div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Endpoints</h4>
                    <div class="space-y-1">
                        <a href="/docs/posts.html" class="sidebar-link ${activeId === 'posts' ? 'active' : ''}">Posts API</a>
                        <a href="/docs/categories.html" class="sidebar-link ${activeId === 'categories' ? 'active' : ''}">Categories API</a>
                        <a href="/docs/authors.html" class="sidebar-link ${activeId === 'authors' ? 'active' : ''}">Authors API</a>
                        <a href="/docs/stats.html" class="sidebar-link ${activeId === 'stats' ? 'active' : ''}">Statistics API</a>
                    </div>
                </div>

                <div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Resources</h4>
                    <div class="space-y-1">
                        <a href="/faq" class="sidebar-link">FAQ Support</a>
                        <a href="/policy" class="sidebar-link">Policy</a>
                    </div>
                </div>
            </nav>
            
            <div class="mt-auto pt-10">
                <div class="bg-slate-900 p-6 rounded-3xl text-white text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <p class="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Butuh Bantuan?</p>
                    <a href="mailto:support@blogapi.com" class="text-sm font-bold border-b-2 border-primary pb-1 hover:text-primary transition">Kontak Admin</a>
                </div>
            </div>
        </aside>
        `;
    },

    getFooter: () => {
        return `
        <footer class="bg-white border-t border-slate-200 py-16 px-8 lg:px-20 mt-20">
            <div class="flex flex-col md:flex-row justify-between items-center gap-8">
                <p class="text-slate-500 font-medium">&copy; 2026 BlogApp Engine. Premium Documentation Suite.</p>
                <div class="flex gap-10 font-bold text-sm text-slate-400">
                    <a href="/about" class="hover:text-primary transition">About</a>
                    <a href="/faq" class="hover:text-primary transition">FAQ</a>
                    <a href="/policy" class="hover:text-primary transition">Privacy</a>
                </div>
            </div>
        </footer>
        `;
    },

    getMobileToggle: () => {
        return `
        <button class="lg:hidden fixed bottom-8 right-8 w-16 h-16 gradient-bg text-white rounded-full shadow-2xl z-50 flex items-center justify-center text-2xl mobile-sidebar-toggle">
            <i class="fas fa-bars"></i>
        </button>
        `;
    },

    init: (activeId) => {
        const sidebarContainer = document.getElementById('sidebar-container');
        const footerContainer = document.getElementById('footer-container');
        const toggleContainer = document.getElementById('toggle-container');

        if (sidebarContainer) sidebarContainer.innerHTML = SharedComponents.getSidebar(activeId);
        if (footerContainer) footerContainer.innerHTML = SharedComponents.getFooter();
        if (toggleContainer) toggleContainer.innerHTML = SharedComponents.getMobileToggle();
    }
};
