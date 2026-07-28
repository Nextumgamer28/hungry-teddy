/**
 * ==========================================================================
 * JS/STORAGE.JS
 * Hungry Teddy - Persistent State Manager
 * Handles localStorage reading/writing with automatic validation, 
 * version checking, data migration, and corruption recovery.
 * ==========================================================================
 */

'use strict';

class AppStorage {
    constructor() {
        this.key = window.Constants.STORAGE_KEY;
        this.version = window.Config.APP.VERSION;
        this.data = null;
        
        // Deep copy of the default schema
        this.defaultSchema = {
            version: this.version,
            user: {
                name: null,
                visitCount: 0,
                lastVisitDate: null
            },
            preferences: {
                language: 'hinglish',
                sound: true
            },
            memory: {
                favoriteItem: null,
                totalOrders: 0
            }
        };
    }

    /**
     * Bootstraps the storage system.
     */
    init() {
        this._load();
        this._checkVersionAndMigrate();
        this.save(); // Force save to guarantee structure
        
        // Emit readiness
        window.AppEventBus.publish(window.Constants.EVENTS.STORAGE_READY, this.data);
    }

    /**
     * Safely load and parse data from localStorage.
     * Recovers from JSON corruption automatically.
     */
    _load() {
        try {
            const rawData = localStorage.getItem(this.key);
            if (rawData) {
                this.data = JSON.parse(rawData);
            } else {
                this.data = this._clone(this.defaultSchema);
            }
        } catch (error) {
            console.error('[AppStorage] Data corruption detected. Resetting to defaults.', error);
            this.data = this._clone(this.defaultSchema);
        }

        // Deep merge to ensure missing keys from updates are populated
        this.data = this._deepMerge(this._clone(this.defaultSchema), this.data);
    }

    /**
     * Checks versions and runs migration logic if coming from an older schema.
     */
    _checkVersionAndMigrate() {
        if (!this.data.version || this.data.version !== this.version) {
            console.log(`[AppStorage] Migrating from ${this.data.version || 'v1'} to ${this.version}`);
            
            // Phase 1 to Phase 2 manual imports
            try {
                if (this.data.user.name === null) {
                    const legacyName = localStorage.getItem('teddy_user_name');
                    if (legacyName) this.data.user.name = legacyName;
                }
                if (this.data.preferences.language === 'hinglish') {
                    const legacyLang = localStorage.getItem('teddy_lang');
                    if (legacyLang) this.data.preferences.language = legacyLang;
                }
                if (this.data.preferences.sound === true) {
                    const legacyMuted = localStorage.getItem('teddy_muted');
                    if (legacyMuted === 'true') this.data.preferences.sound = false;
                }
            } catch(e) {}

            this.data.version = this.version;
            
            // Clean up legacy keys
            try {
                localStorage.removeItem('teddy_user_name');
                localStorage.removeItem('teddy_lang');
                localStorage.removeItem('teddy_muted');
                localStorage.removeItem('teddy_volume');
            } catch(e) {}
        }
    }

    /**
     * Saves current state to localStorage synchronously.
     */
    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.data));
        } catch (error) {
            console.error('[AppStorage] Quota exceeded or storage unavailable.', error);
        }
    }

    /**
     * Get a value using dot notation (e.g., 'user.name').
     * @param {string} path 
     * @returns {any}
     */
    get(path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], this.data);
    }

    /**
     * Set a value using dot notation and trigger auto-save.
     * @param {string} path 
     * @param {any} value 
     */
    set(path, value) {
        const parts = path.split('.');
        const last = parts.pop();
        let current = this.data;

        for (const part of parts) {
            if (current[part] === undefined) current[part] = {};
            current = current[part];
        }

        current[last] = value;
        this.save();
    }

    /**
     * Wipe all data and restore to default schema.
     */
    reset() {
        this.data = this._clone(this.defaultSchema);
        this.save();
    }

    /**
     * Utility: Deep clone an object.
     */
    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Utility: Deep merge objects securely.
     */
    _deepMerge(target, source) {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], this._deepMerge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    }
}

window.AppStorage = AppStorage;
