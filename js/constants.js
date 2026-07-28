/**
 * ==========================================================================
 * JS/CONSTANTS.JS
 * Hungry Teddy - Core Application Constants
 * Single source of truth for all magic strings, event names, and IDs.
 * ==========================================================================
 */

'use strict';

window.Constants = Object.freeze({
    // Storage Key
    STORAGE_KEY: 'hungry_teddy_save_data',

    // Application Modules
    MODULES: {
        STORAGE: 'storage',
        EVENTS: 'events',
        PERSONALITY: 'personality',
        APP: 'app',
        TEDDY: 'teddy',
        DIALOGUE: 'dialogue',
        MENU: 'menu',
        SOUND: 'sound',
        LANGUAGE: 'language'
    },

    // Global Event Bus Names
    EVENTS: {
        APP_READY: 'app:ready',
        STORAGE_READY: 'storage:ready',
        LANG_CHANGED: 'language:changed',
        
        // Teddy Events
        TEDDY_WAKE: 'teddy:wake',
        TEDDY_TAP: 'teddy:tap',
        TEDDY_SLEEP: 'teddy:sleep',
        
        // User Actions
        USER_NAME_SET: 'user:name_set',
        ITEM_ADDED: 'cart:item_added',
        CART_OPENED: 'cart:opened',
        RESERVATION_MADE: 'reservation:made',
        
        // Brain/Personality Outputs
        REQUEST_DIALOGUE: 'personality:request_dialogue',
        REQUEST_EXPRESSION: 'personality:request_expression'
    },

    // Teddy Expressions (Must match teddy.js targets)
    EXPRESSIONS: {
        NEUTRAL: 'neutral',
        HAPPY: 'happy',
        SURPRISE: 'surprise',
        THINKING: 'thinking',
        SLEEPY: 'sleepy',
        EXCITED: 'excited'
    },

    // Time Boundaries (24h format)
    TIME_OF_DAY: {
        MORNING: 'morning',
        AFTERNOON: 'afternoon',
        EVENING: 'evening',
        NIGHT: 'night'
    },

    // Internal Moods for Randomization logic
    MOODS: {
        HUNGRY: 'hungry',
        PLAYFUL: 'playful',
        CHILL: 'chill',
        SLEEPY: 'sleepy'
    }
});
