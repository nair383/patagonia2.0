// --- SISTEMA DE PARTÍCULAS DORADAS / CÍTRICAS FLOTANTES EN CANVAS ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    const numberOfParticles = window.innerWidth < 768 ? 22 : 48; // Optimizado para rendimiento móvil

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.2 + 0.9;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4 - 0.25; // Tienden a subir ligeramente con elegancia
            this.opacity = Math.random() * 0.55 + 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 95, 31, ${this.opacity})`; // Tono acorde al acento neón cítrico
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- ANIMACIONES AL SCROLL (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToReveal = document.querySelectorAll('.info-card, .product-card, .map-section h2, .menu-container h1, .hero-content');
    elementsToReveal.forEach((el, index) => {
        el.classList.add(index % 2 === 0 ? 'reveal-slide-up' : 'reveal-scale');
        observer.observe(el);
    });
});

// --- LÓGICA DEL CARRITO DE COMPRAS Y MENÚ ---
let cart = JSON.parse(localStorage.getItem('patagonia_cart')) || [];

const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    });
}

if (closeCart) {
    closeCart.addEventListener('click', closeCartSidebar);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartSidebar);
}

function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
    
    if(cartSidebar) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    }
}

function updateCart() {
    localStorage.setItem('patagonia_cart', JSON.stringify(cart));
    
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        cartCount.textContent = '0';
        cartTotal.textContent = '$0';
        return;
    }

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;

        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <span>$${(item.price * item.quantity).toLocaleString('es-CL')}</span>
            </div>
            <div class="cart-item-actions">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartCount.textContent = count;
    cartTotal.textContent = `$${total.toLocaleString('es-CL')}`;
}

function changeQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

// Enviar pedido por WhatsApp
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        let message = 'Hola, ¡Quiero hacer el siguiente pedido desde la web!%0A%0A';
        let total = 0;

        cart.forEach(item => {
            let subtotal = item.price * item.quantity;
            total += subtotal;
            message += `- ${item.quantity}x ${item.name} ($${subtotal.toLocaleString('es-CL')})%0A`;
        });

        message += `%0A*Total a pagar: $${total.toLocaleString('es-CL')}*`;
        message += `%0A%0A(Dirección de entrega / Retiro en local: Av. Echeñique 4715, Ñuñoa)`;

        const whatsappUrl = `https://wa.me/56968431740?text=${message}`;
        window.open(whatsappUrl, '_blank');
    });
}

// Inicializar estado al cargar
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');

            productCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});