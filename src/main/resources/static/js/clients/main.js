document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Dark Mode Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('customer-theme', newTheme);
            
            const icon = themeToggle.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('customer-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
});

// Mock Cart System
const addToCart = (productId) => {
    // In real app, this would be an API call
    console.log(`Adding product ${productId} to cart`);
    
    // Simple UI Feedback
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        let current = parseInt(cartCount.innerText);
        cartCount.innerText = current + 1;
        
        // Pulse animation
        cartCount.style.transform = 'scale(1.5)';
        setTimeout(() => cartCount.style.transform = 'scale(1)', 200);
    }
    
    // Show Toast
    showToast('Đã thêm sản phẩm vào giỏ hàng!');
};

const showToast = (message) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: white;
        padding: 12px 25px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 0.9rem;
        z-index: 2000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease forwards;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// CSS Animations for JS
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideUp {
        from { transform: translate(-50%, 50px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 50px); opacity: 0; }
    }
`;
document.head.appendChild(style);
