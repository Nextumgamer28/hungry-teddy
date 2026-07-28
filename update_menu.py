import re

with open("js/menu.js", "r") as f:
    content = f.read()

# Replace in renderMenu
content = re.sub(
    r'<button class="btn-icon glass-btn add-to-cart-btn"[^>]*>[\s\S]*?</button>',
    r'<div class="menu-item-controls" id="item-controls-${item.id}" data-id="${item.id}" data-state="${btnState}"></div>',
    content
)

content = re.sub(
    r'if \(item\.available\) \{\s*const addBtn = card\.querySelector\(\'\.add-to-cart-btn\'\);\s*addBtn\.addEventListener\(\'click\', \(\) => this\.addToCart\(item\.id, addBtn\)\);\s*\}',
    r'',
    content
)

content = re.sub(
    r'this\.menuGrid\.appendChild\(fragment\);\n    \}',
    r'this.menuGrid.appendChild(fragment);\n        this.updateItemControls();\n    }\n\n    updateItemControls() {\n        const controlContainers = document.querySelectorAll(\'.menu-item-controls\');\n        controlContainers.forEach(container => {\n            const itemId = parseInt(container.getAttribute(\'data-id\'), 10);\n            const btnState = container.getAttribute(\'data-state\');\n            const cartItem = this.cart.find(item => item.id === itemId);\n            \n            if (cartItem && cartItem.quantity > 0) {\n                container.innerHTML = `\n                    <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.25rem; border-radius:var(--border-radius-pill); border: 1px solid rgba(245, 158, 11, 0.3);">\n                        <button class="btn-icon qty-btn minus-btn" data-id="${itemId}" style="width:28px; height:28px; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">-</button>\n                        <span style="font-weight:700; min-width:20px; text-align:center; font-size:1rem; color:var(--text-light);">${cartItem.quantity}</span>\n                        <button class="btn-icon qty-btn plus-btn" data-id="${itemId}" style="width:28px; height:28px; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">+</button>\n                    </div>\n                `;\n                const minusBtn = container.querySelector(\'.minus-btn\');\n                const plusBtn = container.querySelector(\'.plus-btn\');\n                if (minusBtn) minusBtn.addEventListener(\'click\', () => this.updateQuantity(itemId, -1));\n                if (plusBtn) plusBtn.addEventListener(\'click\', () => this.updateQuantity(itemId, 1));\n            } else {\n                container.innerHTML = `\n                    <button class="btn-icon glass-btn add-to-cart-btn" data-id="${itemId}" aria-label="Add to tray" title="Add to Tray" ${btnState}>\n                        +\n                    </button>\n                `;\n                const addBtn = container.querySelector(\'.add-to-cart-btn\');\n                if (addBtn && !addBtn.hasAttribute(\'disabled\')) {\n                    addBtn.addEventListener(\'click\', () => this.addToCart(itemId, addBtn));\n                }\n            }\n        });\n    }',
    content
)

# Call updateItemControls in updateCartUI
content = re.sub(
    r'if \(!this\.cartItemsContainer \|\| !this\.cartBadge\) return;',
    r'if (!this.cartItemsContainer || !this.cartBadge) return;\n        this.updateItemControls();',
    content
)

with open("js/menu.js", "w") as f:
    f.write(content)
