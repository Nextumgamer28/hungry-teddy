'use strict';

class MenuController {
    constructor() {
        this.menuGrid = document.getElementById('menu-grid');
        this.cartBadge = document.getElementById('cart-badge');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalPrice = document.getElementById('cart-total-price');
        this.checkoutBtn = document.getElementById('checkout-btn');

        this.currentCategory = 'all';
        this.cart = [];
        this.isAnimating = false;
        
        this.fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ffffff0d'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='40'%3E%F0%9F%8D%BD%EF%B8%8F%3C/text%3E%3C/svg%3E";
        
        this.menuData = [
            {
                id: 'm1',
                title: "Classic Masala Maggi",
                description: "The timeless street-style comfort bowl, tossed with signature spices and fresh herbs.",
                price: 69,
                category: "maggi",
                available: true,
                recommended: false,
                bestseller: true,
                chefSpecial: false,
                image: "assets/food-image/Classic Masala Maggi.webp"
            },
            {
                id: 'm2',
                title: "Double Masala Maggi",
                description: "For the spice lovers. An extra kick of our secret masala blend for a fiery experience.",
                price: 99,
                category: "maggi",
                available: true,
                recommended: true,
                bestseller: false,
                chefSpecial: false,
                image: "assets/food-image/Double Masala Maggi.webp"
            },
            {
                id: 'm3',
                title: "Cheese Maggi",
                description: "Creamy, gooey goodness melting into classic masala noodles. Ultimate comfort food.",
                price: 99,
                category: "maggi",
                available: true,
                recommended: false,
                bestseller: true,
                chefSpecial: false,
                image: "assets/food-image/Cheese maggi.webp"
            },
            {
                id: 'm4',
                title: "Corn Masala Maggi",
                description: "Sweet golden corn kernels folded into hot, spicy masala noodles.",
                price: 99,
                category: "maggi",
                available: true,
                recommended: false,
                bestseller: false,
                chefSpecial: false,
                image: "assets/food-image/Corn Masala Maggi.webp"
            },
            {
                id: 'p1',
                title: "Homestyle Aloo Paratha",
                description: "Soft, wholesome flatbread stuffed with spiced mashed potatoes, roasted perfectly in ghee.",
                price: 68,
                category: "paratha",
                available: true,
                recommended: false,
                bestseller: true,
                chefSpecial: false,
                image: "assets/food-image/Homestyle Aloo Paratha.webp"
            },
            {
                id: 'p2',
                title: "Jeera Aloo Paratha",
                description: "A comforting twist with cumin-tempered potatoes packed inside a crisp, golden crust.",
                price: 88,
                category: "paratha",
                available: true,
                recommended: true,
                bestseller: false,
                chefSpecial: false,
                image: "assets/food-image/Jeera Aloo Paratha.webp"
            },
            {
                id: 'p3',
                title: "Stuffed Aloo Pyaaz Paratha",
                description: "Loaded with crispy onions and spiced potatoes. Served hot and fresh.",
                price: 89,
                category: "paratha",
                available: true,
                recommended: false,
                bestseller: true,
                chefSpecial: true,
                image: "assets/food-image/Stuffed Aloo Pyaaz Paratha.webp"
            },
            {
                id: 'r1',
                title: "Street Style Masala Fried Rice",
                description: "Wok-tossed long-grain rice with fresh vegetables and zesty street-style spices.",
                price: 109,
                category: "rice",
                available: true,
                recommended: true,
                bestseller: false,
                chefSpecial: true,
                image: "assets/food-image/Street Style Masala Fried Rice.webp"
            },
            {
                id: 'pz1',
                title: "Margherita Pizza",
                description: "Classic wood-fired style crust with rich tomato concasse and molten mozzarella cheese.",
                price: 208,
                category: "pizza",
                available: true,
                recommended: false,
                bestseller: true,
                chefSpecial: false,
                image: "assets/food-image/Margherita Pizza.webp"
            },
            {
                id: 'pz2',
                title: "Cheesy Onion Pizza",
                description: "Generously topped with caramelized onions and a heavy layer of premium melted cheese.",
                price: 198,
                category: "pizza",
                available: true,
                recommended: true,
                bestseller: false,
                chefSpecial: false,
                image: "assets/food-image/Cheesy Onion Pizza.webp"
            },
            {
                id: 'pz3',
                title: "Sweet Corn Pizza",
                description: "Crispy crust layered with signature sauce, stringy cheese, and sweet golden corn.",
                price: 188,
                category: "pizza",
                available: true,
                recommended: false,
                bestseller: true,
                chefSpecial: true,
                image: "assets/food-image/Sweet Corn Pizza.webp"
            },
            {
                id: 'b1',
                title: "Kadak Milk Tea",
                description: "Authentic, strong Indian chai brewed with aromatic spices to awaken your senses.",
                price: 30,
                category: "beverage",
                available: true,
                recommended: true,
                bestseller: true,
                chefSpecial: false,
                image: "assets/food-image/Kadak Milk Tea.webp"
            }
        ];
    }

    init() {
        if (!this.menuGrid) {
            console.warn("[MenuController] Missing menu grid element.");
            return;
        }

        this.setupFilters();
        
        setTimeout(() => {
            this.renderMenu(this.currentCategory);
        }, 600);
    }

    setupFilters() {
        const filterContainer = document.querySelector('.menu-filters');
        if (filterContainer) {
            filterContainer.innerHTML = `
                <button class="filter-btn active" data-category="all" role="tab" aria-selected="true">All</button>
                <button class="filter-btn" data-category="maggi" role="tab" aria-selected="false">Maggi</button>
                <button class="filter-btn" data-category="paratha" role="tab" aria-selected="false">Paratha</button>
                <button class="filter-btn" data-category="rice" role="tab" aria-selected="false">Rice</button>
                <button class="filter-btn" data-category="pizza" role="tab" aria-selected="false">Pizza</button>
                <button class="filter-btn" data-category="beverage" role="tab" aria-selected="false">Beverage</button>
            `;
            this.filterButtons = filterContainer.querySelectorAll('.filter-btn');
        } else {
            this.filterButtons = document.querySelectorAll('.filter-btn');
        }

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isAnimating) return;

                this.filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                
                const target = e.currentTarget;
                target.classList.add('active');
                target.setAttribute('aria-selected', 'true');

                this.currentCategory = target.getAttribute('data-category');
                
                this.isAnimating = true;
                this.menuGrid.classList.add('fade-out');
                
                setTimeout(() => {
                    this.renderMenu(this.currentCategory);
                    this.menuGrid.classList.remove('fade-out');
                    setTimeout(() => { this.isAnimating = false; }, 300);
                }, 300);
            });
        });
    }

    generateBadgesHTML(item) {
        let badges = '';
        if (item.chefSpecial) badges += `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 4px;">⭐ Chef Special</span>`;
        if (item.bestseller) badges += `<span style="background: rgba(231, 76, 60, 0.2); color: #fc8019; padding: 2px 8px; border-radius: 4px;">🔥 Bestseller</span>`;
        if (item.recommended) badges += `<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 4px;">❤️ Teddy Recommends</span>`;
        if (!item.available) badges += `<span style="background: rgba(107, 114, 128, 0.2); color: #a0a5b5; padding: 2px 8px; border-radius: 4px;">Out of Stock</span>`;
        
        if (!badges) return '';
        return `<div style="display: flex; gap: 6px; margin-bottom: 8px; font-size: 0.7rem; flex-wrap: wrap; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${badges}</div>`;
    }

    renderMenu(category) {
        this.menuGrid.innerHTML = ''; 

        const filteredItems = category === 'all' 
            ? this.menuData 
            : this.menuData.filter(item => item.category === category);

        if (filteredItems.length === 0) {
            this.menuGrid.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1;">Teddy ate everything in this category. (Check back later!)</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        filteredItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'menu-item-card glass-card reveal-on-scroll reveal-visible';
            card.style.animationDelay = `${index * 0.05}s`;
            
            const imageStyle = item.available ? '' : 'filter: grayscale(100%) opacity(0.6);';
            const btnState = item.available ? '' : 'disabled style="opacity:0.4; cursor:not-allowed;"';

            card.innerHTML = `
                <div class="menu-item-icon" style="padding: 0; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 100%; height: 220px; flex-shrink: 0; border-radius: 0;">
                    <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='${this.fallbackImage}';" style="width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 0; ${imageStyle}">
                </div>
                <div class="menu-item-info" style="padding: 1rem; flex: 1; display: flex; flex-direction: column;">
                    ${this.generateBadgesHTML(item)}
                    <h3 class="menu-item-title">${item.title}</h3>
                    <p class="menu-item-desc">${item.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.5rem;">
                        <span class="menu-item-price" style="margin: 0;">₹${item.price.toFixed(2)}</span>
                        <div class="menu-item-controls" id="item-controls-${item.id}" data-id="${item.id}" data-state="${btnState}"></div>
                    </div>
                </div>
            `;

            

            fragment.appendChild(card);
        });

        this.menuGrid.appendChild(fragment);
        this.updateItemControls();
    }

    updateItemControls() {
        const controlContainers = document.querySelectorAll('.menu-item-controls');
        controlContainers.forEach(container => {
            const itemId = container.getAttribute('data-id');
            const btnState = container.getAttribute('data-state');
            const cartItem = this.cart.find(item => item.id === itemId);
            
            if (cartItem && cartItem.quantity > 0) {
                container.innerHTML = `
                    <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.25rem; border-radius:var(--border-radius-pill); border: 1px solid rgba(245, 158, 11, 0.3);">
                        <button class="btn-icon qty-btn minus-btn" data-id="${itemId}" style="width:28px; height:28px; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">-</button>
                        <span style="font-weight:700; min-width:20px; text-align:center; font-size:1rem; color:#FFFFFF;">${cartItem.quantity}</span>
                        <button class="btn-icon qty-btn plus-btn" data-id="${itemId}" style="width:28px; height:28px; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">+</button>
                    </div>
                `;
                const minusBtn = container.querySelector('.minus-btn');
                const plusBtn = container.querySelector('.plus-btn');
                if (minusBtn) minusBtn.addEventListener('click', () => this.updateQuantity(itemId, -1));
                if (plusBtn) plusBtn.addEventListener('click', () => this.updateQuantity(itemId, 1));
            } else {
                container.innerHTML = `
                    <button class="btn-icon glass-btn add-to-cart-btn" data-id="${itemId}" aria-label="Add to tray" title="Add to Tray" ${btnState}>
                        +
                    </button>
                `;
                const addBtn = container.querySelector('.add-to-cart-btn');
                if (addBtn && !addBtn.hasAttribute('disabled')) {
                    addBtn.addEventListener('click', () => this.addToCart(itemId, addBtn));
                }
            }
        });
    }

    addToCart(itemId, buttonElement) {
        const product = this.menuData.find(item => item.id === itemId);
        if (!product || !product.available) return;

        const existingItem = this.cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '✓';
        buttonElement.style.background = 'rgba(16, 185, 129, 0.2)';
        buttonElement.style.borderColor = '#10b981';
        buttonElement.style.color = '#10b981';
        
        if (window.AppEventBus && window.Constants) {
            window.AppEventBus.publish(window.Constants.EVENTS.ITEM_ADDED, {
                id: product.id,
                category: product.category,
                title: product.title
            });
        }

        if (window.App && window.App.modules && window.App.modules.sound) {
            window.App.modules.sound.play('pop');
        }

        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.style.background = '';
            buttonElement.style.borderColor = '';
            buttonElement.style.color = '';
        }, 800);

        this.updateCartUI();
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartUI();
    }

    updateQuantity(itemId, change) {
        const item = this.cart.find(i => i.id === itemId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            this.updateCartUI();
        }
    }

    updateCartUI() {
        if (!this.cartItemsContainer || !this.cartBadge) return;
        this.updateItemControls();

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        this.cartBadge.textContent = totalItems;
        
        this.cartBadge.classList.remove('bounce-in');
        void this.cartBadge.offsetWidth;
        this.cartBadge.classList.add('bounce-in');

        if (this.cartTotalPrice) {
            this.cartTotalPrice.textContent = `₹${totalPrice.toFixed(2)}`;
        }

        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = totalItems === 0;
        }

        // Mobile Floating Cart UI Update
        const mobileFloatingCart = document.getElementById('mobile-floating-cart');
        if (mobileFloatingCart) {
            const mCount = document.getElementById('mobile-cart-count');
            const mTotal = document.getElementById('mobile-cart-total');
            if (mCount) mCount.textContent = `${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
            if (mTotal) mTotal.textContent = `₹${totalPrice.toFixed(2)}`;
            
            if (totalItems > 0) {
                document.body.classList.add('cart-has-items');
                mobileFloatingCart.classList.add('visible');
                mobileFloatingCart.classList.remove('bounce-anim');
                void mobileFloatingCart.offsetWidth;
                mobileFloatingCart.classList.add('bounce-anim');
            } else {
                document.body.classList.remove('cart-has-items');
                mobileFloatingCart.classList.remove('visible');
            }
        }

        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your tray is currently empty. Teddy is waiting for your order!</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        this.cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            
            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.75rem; flex:1; overflow:hidden;">
                    <div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: rgba(255,255,255,0.05);">
                        <img src="${item.image}" alt="${item.title}" onerror="this.onerror=null; this.src='${this.fallbackImage}';" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                    </div>
                    <div style="min-width:0;">
                        <h4 style="margin:0; font-size:0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
                        <span style="color:var(--accent-gold); font-size:0.875rem;">₹${item.price.toFixed(2)}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.25rem; border-radius:var(--border-radius-pill); margin-left: 0.5rem; flex-shrink: 0;">
                    <button class="btn-icon qty-btn minus" data-id="${item.id}" style="width:28px; height:28px; font-size:1rem;">-</button>
                    <span style="font-weight:600; min-width:20px; text-align:center; font-size:0.9rem;">${item.quantity}</span>
                    <button class="btn-icon qty-btn plus" data-id="${item.id}" style="width:28px; height:28px; font-size:1rem;">+</button>
                </div>
            `;

            row.querySelector('.minus').addEventListener('click', () => this.updateQuantity(item.id, -1));
            row.querySelector('.plus').addEventListener('click', () => this.updateQuantity(item.id, 1));

            fragment.appendChild(row);
        });

        this.cartItemsContainer.innerHTML = '';
        this.cartItemsContainer.appendChild(fragment);
    }
}

window.MenuController = MenuController;
