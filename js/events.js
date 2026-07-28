/**
 * ==========================================================================
 * JS/EVENTS.JS
 * Hungry Teddy - Global Event Bus
 * Lightweight, zero-dependency PubSub system for cross-module communication.
 * Prevents memory leaks through strict Set utilization and error boundaries.
 * ==========================================================================
 */

'use strict';

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.debug = window.Config?.APP?.DEBUG || false;
    }

    /**
     * Subscribe to an event.
     * @param {string} event - Event name (from Constants.EVENTS)
     * @param {Function} callback - Function to execute
     * @param {Object} [context] - Execution context (this)
     * @returns {Function} Unsubscribe function
     */
    subscribe(event, callback, context = null) {
        if (!event || typeof callback !== 'function') {
            console.error('[EventBus] Invalid subscribe parameters.');
            return () => {};
        }

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const listener = { callback, context };
        
        // Prevent duplicate exact subscriptions
        const eventListeners = this.listeners.get(event);
        let exists = false;
        eventListeners.forEach(l => {
            if (l.callback === callback && l.context === context) exists = true;
        });

        if (!exists) {
            eventListeners.add(listener);
        }

        return () => this.unsubscribe(event, callback, context);
    }

    /**
     * Subscribe to an event only once.
     * @param {string} event 
     * @param {Function} callback 
     * @param {Object} [context] 
     */
    once(event, callback, context = null) {
        const wrapper = (...args) => {
            this.unsubscribe(event, wrapper, context);
            callback.apply(context, args);
        };
        this.subscribe(event, wrapper, context);
    }

    /**
     * Publish an event to all subscribers safely.
     * @param {string} event 
     * @param {any} [data] 
     */
    publish(event, data = null) {
        if (this.debug) {
            console.log(`[EventBus] Publish: ${event}`, data);
        }

        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(listener => {
            try {
                listener.callback.call(listener.context, data);
            } catch (error) {
                console.error(`[EventBus] Error executing subscriber for event: ${event}`, error);
            }
        });
    }

    /**
     * Remove a specific listener.
     * @param {string} event 
     * @param {Function} callback 
     * @param {Object} [context] 
     */
    unsubscribe(event, callback, context = null) {
        if (!this.listeners.has(event)) return;

        const eventListeners = this.listeners.get(event);
        eventListeners.forEach(listener => {
            if (listener.callback === callback && listener.context === context) {
                eventListeners.delete(listener);
            }
        });

        if (eventListeners.size === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Removes all listeners for a specific event.
     * @param {string} event 
     */
    clear(event) {
        this.listeners.delete(event);
    }

    /**
     * Completely wipe the event bus (for full resets).
     */
    destroy() {
        this.listeners.clear();
    }
}

// Global Singleton Instance
window.AppEventBus = new EventBus();
