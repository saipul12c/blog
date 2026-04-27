/**
 * Core UI Logic for Blog Project
 */

// Global function to trigger animations for dynamic content
window.triggerReveal = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        if (!el.classList.contains('animate-fade-in-up')) {
            el.style.opacity = '0';
            observer.observe(el);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Initial Trigger for Reveal Animations
    window.triggerReveal();

    // 3. Mobile Menu Toggle
    const menuBtns = document.querySelectorAll('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (menuBtns && mobileMenu) {
        menuBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        });
    }
});
