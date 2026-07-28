/**
 * ==========================================================================
 * JS/CONFIG.JS
 * Hungry Teddy - Central Configuration
 * Application parameters, timings, feature flags, and calendar logic.
 * ==========================================================================
 */

'use strict';

window.Config = Object.freeze({
    APP: {
        VERSION: '2.0.0',
        DEBUG: false // Set to false for production
    },

    FEATURES: {
        ENABLE_FESTIVALS: true,
        ENABLE_TIME_GREETINGS: true,
        ENABLE_FOOD_REACTIONS: true,
        ENABLE_AUTONOMOUS_IDLE: true
    },

    TIMING: {
        // Cooldowns to prevent spamming reactions (in milliseconds)
        REACTION_COOLDOWN: 5000,
        FOOD_REACTION_COOLDOWN: 8000,
        IDLE_CHAT_MIN_DELAY: 15000,
        
        // Animations
        WAKE_DELAY: 800,
        DIALOGUE_READ_TIME_PER_CHAR: 40,
        MIN_DIALOGUE_TIME: 2000
    },

    TIME_BOUNDARIES: {
        MORNING_START: 5,   // 05:00 AM
        AFTERNOON_START: 12, // 12:00 PM
        EVENING_START: 17,   // 05:00 PM
        NIGHT_START: 22      // 10:00 PM
    },

    // MM-DD format for yearly recurring festivals/events
    FESTIVALS: {
        '01-01': 'new_year',
        '02-14': 'valentines',
        '08-15': 'independence_india',
        '10-31': 'halloween',
        '12-25': 'christmas',
        '12-31': 'new_year_eve'
    },

    // Food category to expression mapping
    FOOD_REACTIONS: {
        mains: {
            expression: window.Constants.EXPRESSIONS.EXCITED,
            weight: 0.8
        },
        starters: {
            expression: window.Constants.EXPRESSIONS.HAPPY,
            weight: 0.5
        },
        desserts: {
            expression: window.Constants.EXPRESSIONS.SURPRISE,
            weight: 0.9
        },
        drinks: {
            expression: window.Constants.EXPRESSIONS.THINKING,
            weight: 0.4
        }
    }
});
