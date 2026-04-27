/**
 * Blog API Documentation Interactivity - Multi-page Edition
 */

document.addEventListener('DOMContentLoaded', function() {
    const origin = window.location.origin;
    
    // 1. Update Base URLs
    document.querySelectorAll('.base-url-text').forEach(el => {
        el.textContent = origin;
    });

    // Update {{BASE_URL}} in all code blocks
    document.querySelectorAll('pre code').forEach(el => {
        if (el.textContent.includes('{{BASE_URL}}')) {
            el.innerHTML = el.innerHTML.replace(/{{BASE_URL}}/g, origin);
        }
    });

    // 2. Tabs Logic
    const tabContainers = document.querySelectorAll('.tabs-container');
    
    tabContainers.forEach(container => {
        const buttons = container.querySelectorAll('.tab-btn');
        const contents = container.querySelectorAll('.tab-content');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                buttons.forEach(b => b.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const targetContent = container.querySelector(`.tab-content[data-lang="${lang}"]`);
                if (targetContent) targetContent.classList.add('active');
            });
        });
    });

    // 3. Sidebar Active State & ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.sidebar-link');

    function updateActiveLink() {
        let current = '';
        const scrollPosition = window.scrollY || window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollPosition >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        // Only update active state if the link points to an ID on the CURRENT page
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.includes(`#${current}`)) {
                link.classList.add('active');
            } else if (!href.includes('#')) {
                // For links without hash, handle them separately if needed
            } else {
                link.classList.remove('active');
            }
        });
    }

    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
    }

    // 4. Smooth Scrolling for internal anchors
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.getElementById(href.substring(1));
                if (targetElement) {
                    window.scrollTo({ top: targetElement.offsetTop - 100, behavior: 'smooth' });
                }
            }
        });
    });

    // 5. Mobile Sidebar Toggle
    const toggleBtn = document.querySelector('.mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('active');
            sidebar.classList.toggle('flex');
            const icon = toggleBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // 6. Copy Code
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.code-block-wrapper, .card');
            const code = codeBlock.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check text-emerald-500"></i>';
                setTimeout(() => btn.innerHTML = original, 2000);
            });
        });
    });

    // 7. Live Playground "Try It" Logic
    const paramsInputs = document.querySelectorAll('#param-limit, #param-category, #param-sort, #param-q');
    
    function updateDynamicEndpoint() {
        const limit = document.getElementById('param-limit')?.value || 10;
        const category = document.getElementById('param-category')?.value;
        const sort = document.getElementById('param-sort')?.value;
        const q = document.getElementById('param-q')?.value;
        
        let query = `?limit=${limit}`;
        if (category) query += `&category=${category}`;
        if (sort) query += `&sort=${sort}`;
        if (q) query += `&q=${encodeURIComponent(q)}`;
        
        const runBtn = document.getElementById('btn-run-posts');
        if (runBtn) {
            runBtn.setAttribute('data-endpoint', `/api/public/posts${query}`);
        }

        // Update Code Snippets Dynamically
        const jsCode = document.querySelector('.code-js');
        if (jsCode) jsCode.textContent = `fetch('/api/public/posts${query}')\n  .then(res => res.json())\n  .then(data => console.log(data));`;

        const axiosCode = document.querySelector('.code-axios');
        if (axiosCode) {
            let axiosParams = `{ limit: ${limit}`;
            if (category) axiosParams += `, category: '${category}'`;
            if (sort) axiosParams += `, sort: '${sort}'`;
            if (q) axiosParams += `, q: '${q}'`;
            axiosParams += ` }`;
            axiosCode.textContent = `const axios = require('axios');\n\naxios.get('/api/public/posts', {\n    params: ${axiosParams}\n})\n.then(res => console.log(res.data))\n.catch(err => console.error(err));`;
        }

        const pythonCode = document.querySelector('.code-python');
        if (pythonCode) {
            let pyParams = `{'limit': ${limit}`;
            if (category) pyParams += `, 'category': '${category}'`;
            if (sort) pyParams += `, 'sort': '${sort}'`;
            if (q) pyParams += `, 'q': '${q}'`;
            pyParams += `}`;
            pythonCode.textContent = `import requests\n\nurl = "{{BASE_URL}}/api/public/posts"\nparams = ${pyParams}\nres = requests.get(url, params=params)\nprint(res.json())`;
            // Re-apply BASE_URL replacement since we just overwrote it
            pythonCode.textContent = pythonCode.textContent.replace('{{BASE_URL}}', origin);
        }

        const phpCode = document.querySelector('.code-php');
        if (phpCode) {
            phpCode.textContent = `<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, "{{BASE_URL}}/api/public/posts${query}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);\n$data = json_decode($response, true);\nprint_r($data);\n?>`;
            phpCode.textContent = phpCode.textContent.replace('{{BASE_URL}}', origin);
        }

        const curlCode = document.querySelector('.code-curl');
        if (curlCode) {
            curlCode.textContent = `curl -X GET "{{BASE_URL}}/api/public/posts${query}" \\\n     -H "Accept: application/json"`;
            curlCode.textContent = curlCode.textContent.replace('{{BASE_URL}}', origin);
        }
    }

    paramsInputs.forEach(input => {
        input.addEventListener('input', updateDynamicEndpoint);
    });

    document.querySelectorAll('.try-it-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const endpoint = btn.getAttribute('data-endpoint');
            const parentSection = btn.closest('section');
            const resultWrapper = parentSection.querySelector('.playground-result-wrapper');
            
            if (!resultWrapper) {
                console.error('Playground result wrapper not found in section');
                return;
            }

            const codeEl = resultWrapper.querySelector('code');
            const statusBadge = resultWrapper.querySelector('.status-badge');
            
            // Show loading
            resultWrapper.classList.remove('hidden');
            resultWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            codeEl.textContent = '// Fetching data from ' + endpoint + ' ...';
            btn.disabled = true;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> RUNNING';

            const startTime = performance.now();

            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(0);
                
                // Update UI
                statusBadge.textContent = `${response.status} ${response.statusText}`;
                statusBadge.className = `status-badge status-${response.status >= 400 ? '400' : '200'}`;
                
                // Add/Update duration outside badge
                let durationEl = statusBadge.parentNode.querySelector('.duration-info');
                if (!durationEl) {
                    durationEl = document.createElement('span');
                    durationEl.className = 'duration-info ml-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest';
                    statusBadge.parentNode.appendChild(durationEl);
                }
                durationEl.textContent = `${duration}ms`;
                
                codeEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                statusBadge.textContent = 'Error';
                statusBadge.className = 'status-badge status-400';
                codeEl.textContent = `// Error: ${error.message}\n// Pastikan server berjalan di ${origin}`;
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    });
});
