/**
 * ==========================================================================
 * JS/APP.JS
 * Hungry Teddy - Main Application Bootstrapper & Lifecycle Controller
 * Responsible ONLY for module instantiation, dependency injection, 
 * safe initialization sequencing, and high-level UI binding.
 * ==========================================================================
 */

'use strict';

class HungryTeddyApp {
    constructor() {
        // DOM Caching - Querying the DOM once to prevent layout thrashing
        this.body = document.body;
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');

        this.header = document.getElementById('main-header');
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.mainNav = document.getElementById('main-nav');
        this.cartToggle = document.getElementById('cart-toggle');
        this.cartDrawer = document.getElementById('cart-drawer');
        this.cartCloseBtn = document.getElementById('cart-close-btn');
        this.modalOverlay = document.getElementById('modal-overlay');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.mobileFloatingCart = document.getElementById('mobile-floating-cart');
        this.mobileOrderBtn = document.getElementById('mobile-order-btn');
        this.orderBottomSheet = document.getElementById('order-bottom-sheet');
        this.sheetCloseBtn = document.getElementById('sheet-close-btn');
        
        // Application State Registry
        this.isLoaded = false;
        this.eventsBound = false;
        this.modules = {};

        // Bind contexts for event callbacks
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.toggleBottomSheet = this.toggleBottomSheet.bind(this);
        this._handleOverlayClick = this._handleOverlayClick.bind(this);
        this._handleGlobalError = this._handleGlobalError.bind(this);
    }

    /**
     * Entry Point: Synchronizes application startup sequence
     */
    init() {
        this._setupGlobalErrorHandling();
        this.setupCopyrightYear();
        this.setupGlobalEventListeners();
        this.startLoadingSequence();
    }

    /**
     * Catches and logs unhandled exceptions without crashing the rendering loop
     */
    _setupGlobalErrorHandling() {
        window.addEventListener('error', this._handleGlobalError);
        window.addEventListener('unhandledrejection', this._handleGlobalError);
    }

    _handleGlobalError(event) {
        const isDebug = window.Config?.APP?.DEBUG || false;
        if (isDebug) {
            console.error('[App Global Error]', event.error || event.reason || event);
        }
    }

    /**
     * Strict Sequential Module Instantiation.
     * Prevents race conditions and guarantees dependency availability.
     */
    bootstrapModules() {
        const debug = window.Config?.APP?.DEBUG || false;
        if (debug) console.time('[App] Bootstrap');

        // 1. Dependency Validation
        if (!window.Config || !window.Constants || !window.AppEventBus) {
            this._handleFatalError(new Error('Critical globals (Config, Constants, EventBus) are missing.'));
            return;
        }

        const loadModule = (moduleName, ClassReference, isFatal, ...args) => {
            try {
                if (debug) console.time(`[App] Load: ${moduleName}`);
                
                // Handle pre-instantiated singletons or uninitialized class references safely
                if (typeof ClassReference === 'object' && ClassReference !== null) {
                    this.modules[moduleName] = ClassReference;
                } else if (typeof ClassReference === 'function') {
                    this.modules[moduleName] = new ClassReference(...args);
                    if (typeof this.modules[moduleName].init === 'function') {
                        this.modules[moduleName].init();
                    }
                } else {
                    throw new Error(`Invalid reference for module: ${moduleName}`);
                }

                if (debug) console.timeEnd(`[App] Load: ${moduleName}`);
            } catch (error) {
                console.error("Module Failed:", moduleName);
                console.error(error);
                if (isFatal) {
                    throw error;
                }
            }
        };

        try {
            console.log("Loading Storage");
            loadModule('storage', window.AppStorage, true);
            
            console.log("Loading Language");
            loadModule('language', window.LanguageController, true);

            console.log("Loading Personality");
            loadModule('personality', window.PersonalityEngine, true, this.modules.storage);
            
            console.log("Loading Dialogue");
            loadModule('dialogue', window.DialogueController, true);
            
            console.log("Loading Menu");
            loadModule('menu', window.MenuController, false);
            
            console.log("Loading Sound");
            loadModule('sound', window.SoundManager, false);
            
            console.log("Loading Teddy");
            loadModule('teddy', window.TeddyController, true, this.modules.dialogue, this.modules.sound);

            console.log("Loading AI Brain");
            if (window.AIBrain) {
                this.modules.aiBrain = new window.AIBrain(
                    this.modules.language, 
                    this.modules.storage, 
                    this.modules.personality
                );
            }

            // 8. Application Ready Event Broadcast
            window.AppEventBus.publish(window.Constants.EVENTS.APP_READY, { 
                version: window.Config.APP.VERSION 
            });

        } catch (fatalError) {
            this._handleFatalError(fatalError);
        }

        if (debug) console.timeEnd('[App] Bootstrap');
    }

    /**
     * Halts application gracefully on critical failure
     * @param {Error} error 
     */
    _handleFatalError(error) {
        console.error('[App] Bootstrap Halted.', error);
        
        requestAnimationFrame(() => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.remove('hidden', 'fade-out');
                this.loadingScreen.innerHTML = `
                    <div style="color:white; text-align:center; padding: 2rem;">
                        <h2>Oops!</h2>
                        <p>Teddy is currently hibernating. Please refresh the page or try again later.</p>
                    </div>
                `;
            }
        });
    }

    /**
     * Artificial loading pacing to ensure fonts, SVGs, and dictionaries parse smoothly
     */
    startLoadingSequence() {
        let progress = 0;
        const totalDuration = 2000;
        const intervalTime = 50;
        const step = (100 / (totalDuration / intervalTime));

        const loadingInterval = setInterval(() => {
            progress += step + (Math.random() * 2);
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                this.updateLoadingUI(progress);
                
                // Final render frame allowance before transition
                setTimeout(() => this.completeLoading(), 400);
            } else {
                this.updateLoadingUI(progress);
            }
        }, intervalTime);

        // Fallback: fast-forward if the browser's native load event fires early
        window.addEventListener('load', () => {
            if (progress < 80) progress = 80;
        }, { once: true });
    }

    /**
     * Updates loading UI securely using RequestAnimationFrame
     */
    updateLoadingUI(percentage) {
        const rounded = Math.floor(percentage);
        
        requestAnimationFrame(() => {
            if (this.progressBar) this.progressBar.style.width = `${rounded}%`;
            if (this.progressText) this.progressText.textContent = `${rounded}%`;
            if (this.loadingScreen) this.loadingScreen.setAttribute('aria-valuenow', rounded.toString());
        });
    }

    /**
     * Transitions from loading context to the interactive application context
     */
    completeLoading() {
        if (this.isLoaded) return;
        this.isLoaded = true;

        requestAnimationFrame(() => {
            if (this.loadingScreen) this.loadingScreen.classList.add('fade-out');
        });
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
                this.body.classList.remove('is-loading');
                
                // Initialize subsystems after DOM is freed from loader painting
                this.bootstrapModules();
                this.initScrollReveal();
            });
        }, 500); // Matches CSS .fade-out transition duration
    }

    /**
     * Centralized high-level UI event listener registration
     */
    setupGlobalEventListeners() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        // Mobile Navigation Toggle
        if (this.mobileMenuToggle && this.mainNav) {
            this.mobileMenuToggle.addEventListener('click', () => {
                requestAnimationFrame(() => {
                    const isExpanded = this.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
                    this.mobileMenuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
                    
                    if (!isExpanded) { 
                        this.mainNav.style.display = 'block'; 
                        this.mainNav.classList.add('bounce-in'); 
                    } else { 
                        this.mainNav.style.display = 'none'; 
                        this.mainNav.classList.remove('bounce-in'); 
                    }
                });
            });
        }

        // Navigation Links Smooth Scroll & Active State
        if (this.navLinks.length > 0) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (link.getAttribute('href').startsWith('#')) {
                        requestAnimationFrame(() => {
                            this.navLinks.forEach(l => l.classList.remove('active'));
                            link.classList.add('active');
                            
                            // Auto-close mobile menu gracefully
                            if (window.innerWidth < 768 && this.mainNav) {
                                this.mainNav.style.display = 'none';
                                this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
                            }
                        });
                    }
                });
            });
        }

        // Drawer & Bottom Sheet Controllers
        if (this.cartToggle) this.cartToggle.addEventListener('click', () => this.toggleCartDrawer(true));
        if (this.cartCloseBtn) this.cartCloseBtn.addEventListener('click', () => this.toggleCartDrawer(false));
        
        if (this.mobileOrderBtn) this.mobileOrderBtn.addEventListener('click', () => this.toggleBottomSheet(true));
        
        if (this.mobileFloatingCart) this.mobileFloatingCart.addEventListener('click', () => this.toggleBottomSheet(true));
        
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.toggleCartDrawer(false);
                setTimeout(() => this.toggleBottomSheet(true), 300);
            });
        }

        if (this.sheetCloseBtn) this.sheetCloseBtn.addEventListener('click', () => this.toggleBottomSheet(false));

        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', this._handleOverlayClick);
        }
    }

    /**
     * Toggles the shopping cart drawer visibility
     */
    toggleCartDrawer(isOpen) {
        if (!this.cartDrawer || !this.modalOverlay) return;
        
        requestAnimationFrame(() => {
            if (isOpen) {
                this.cartDrawer.classList.add('open');
                this.cartDrawer.setAttribute('aria-hidden', 'false');
                this.modalOverlay.classList.remove('hidden');
                this.modalOverlay.classList.add('active');
                this.body.style.overflow = 'hidden';
                
                if (this.mobileOrderBtn) this.mobileOrderBtn.style.opacity = '0'; this.mobileOrderBtn.style.pointerEvents = 'none';
                if (this.mobileFloatingCart) this.mobileFloatingCart.style.opacity = '0'; this.mobileFloatingCart.style.pointerEvents = 'none';
                if (this.modules.sound) this.modules.sound.play('pop');
                
                if (window.AppEventBus && window.Constants) {
                    window.AppEventBus.publish(window.Constants.EVENTS.CART_OPENED);
                }
            } else {
                this.cartDrawer.classList.remove('open');
                this.cartDrawer.setAttribute('aria-hidden', 'true');
                
                if (!this.orderBottomSheet?.classList.contains('open')) {
                    this.modalOverlay.classList.remove('active');
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            this.modalOverlay.classList.add('hidden');
                            this.body.style.overflow = '';
                        });
                    }, 300);
                }
                if (this.mobileOrderBtn && !this.orderBottomSheet?.classList.contains('open')) {
                    this.mobileOrderBtn.style.opacity = ''; this.mobileOrderBtn.style.pointerEvents = '';
                }
                if (this.mobileFloatingCart && !this.orderBottomSheet?.classList.contains('open')) {
                    this.mobileFloatingCart.style.opacity = ''; this.mobileFloatingCart.style.pointerEvents = '';
                }
            }
        });
    }

    /**
     * Toggles the mobile platforms bottom sheet visibility
     */
    toggleBottomSheet(isOpen) {
        if (!this.orderBottomSheet || !this.modalOverlay) return;
        
        requestAnimationFrame(() => {
            if (isOpen) {
                this.orderBottomSheet.classList.add('open');
                this.orderBottomSheet.setAttribute('aria-hidden', 'false');
                this.modalOverlay.classList.remove('hidden');
                this.modalOverlay.classList.add('active');
                this.body.style.overflow = 'hidden';
                
                if (this.mobileOrderBtn) this.mobileOrderBtn.style.opacity = '0'; this.mobileOrderBtn.style.pointerEvents = 'none';
                if (this.mobileFloatingCart) this.mobileFloatingCart.style.opacity = '0'; this.mobileFloatingCart.style.pointerEvents = 'none';
                if (this.modules.sound) this.modules.sound.play('pop');
            } else {
                this.orderBottomSheet.classList.remove('open');
                this.orderBottomSheet.setAttribute('aria-hidden', 'true');
                
                if (!this.cartDrawer?.classList.contains('open')) {
                    this.modalOverlay.classList.remove('active');
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            this.modalOverlay.classList.add('hidden');
                            this.body.style.overflow = '';
                        });
                    }, 300);
                }
                if (this.mobileOrderBtn && !this.cartDrawer?.classList.contains('open')) {
                    this.mobileOrderBtn.style.opacity = ''; this.mobileOrderBtn.style.pointerEvents = '';
                }
                if (this.mobileFloatingCart && !this.cartDrawer?.classList.contains('open')) {
                    this.mobileFloatingCart.style.opacity = ''; this.mobileFloatingCart.style.pointerEvents = '';
                }
            }
        });
    }

    /**
     * Closes any open modals when the overlay background is clicked
     */
    _handleOverlayClick() {
        this.toggleCartDrawer(false);
        this.toggleBottomSheet(false);
    }

    /**
     * Initializes the IntersectionObserver for hardware-accelerated scroll reveals
     */
    initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.story-card, .menu-item-skeleton, .contact-info, .order-on-section'
        );
        
        if (revealElements.length === 0) return;

        // Apply base class outside observer loop for performance
        requestAnimationFrame(() => {
            revealElements.forEach(el => el.classList.add('reveal-on-scroll'));
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.classList.add('reveal-visible');
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            root: null, 
            rootMargin: '0px 0px -50px 0px', 
            threshold: 0.1 
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /**
     * Dynamically updates the footer copyright year
     */
    setupCopyrightYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear().toString();
        }
    }
}

// Expose strictly one global instance
window.App = new HungryTeddyApp();

// Boot on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});
