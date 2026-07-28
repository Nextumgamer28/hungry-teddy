/**
 * ==========================================================================
 * JS/PERSONALITY.JS
 * Hungry Teddy - The Central Brain (Logic & Conversation Engine)
 * Pure logic module. Dictates what Teddy feels and says based on context,
 * time, memory, and events. Outputs decisions via the EventBus.
 * No DOM manipulation or direct animation calls exist here.
 * ==========================================================================
 */

'use strict';

class PersonalityEngine {
    constructor(storageManager) {
        this.storage = storageManager;
        this.events = window.AppEventBus;
        this.config = window.Config;
        this.constants = window.Constants;
        
        // Brain State
        this.lastReactionTime = 0;
        this.currentMood = this.constants.MOODS.CHILL;
        this.isWakingUp = false;
    }

    /**
     * Bootstraps the personality engine and wires up sensory inputs.
     */
    init() {
        this._bindSensoryInputs();
        this._updateVisitCounters();
        this._calculateBaseMood();
    }

    /**
     * Listen to global events acting as "senses".
     */
    _bindSensoryInputs() {
        this.events.subscribe(this.constants.EVENTS.TEDDY_WAKE, this.handleWakeUp, this);
        this.events.subscribe(this.constants.EVENTS.TEDDY_TAP, this.handleTap, this);
        this.events.subscribe(this.constants.EVENTS.ITEM_ADDED, this.handleItemAdded, this);
        this.events.subscribe(this.constants.EVENTS.USER_NAME_SET, this.handleNameLearned, this);
    }

    /**
     * Maintains visit history to dictate familiar vs. new interactions.
     */
    _updateVisitCounters() {
        const now = Date.now();
        const visits = this.storage.get('user.visitCount') || 0;
        
        // Count as a new visit only if it's been more than 6 hours
        const lastVisit = this.storage.get('user.lastVisitDate') || 0;
        const hoursSinceLast = (now - lastVisit) / (1000 * 60 * 60);

        if (hoursSinceLast > 6 || visits === 0) {
            this.storage.set('user.visitCount', visits + 1);
            this.storage.set('user.lastVisitDate', now);
        }
    }

    /**
     * Calculates the ambient mood based on time and visits.
     */
    _calculateBaseMood() {
        const timeOfDay = this._getTimeOfDay();
        if (timeOfDay === this.constants.TIME_OF_DAY.NIGHT) {
            this.currentMood = this.constants.MOODS.SLEEPY;
        } else if (timeOfDay === this.constants.TIME_OF_DAY.AFTERNOON) {
            this.currentMood = this.constants.MOODS.HUNGRY;
        } else {
            this.currentMood = this.constants.MOODS.CHILL;
        }
    }

    /**
     * Core reaction to waking up (first interaction of session).
     */
    handleWakeUp() {
        this.isWakingUp = true;
        const name = this.storage.get('user.name');
        const visits = this.storage.get('user.visitCount');
        
        // Base Expression logic
        this.requestExpression(this.constants.EXPRESSIONS.SURPRISE);

        let dialogueKey = '';
        let vars = { name: name || '' };

        if (!name) {
            dialogueKey = 'flow_new_user'; // System triggers name prompt
        } else if (visits > 1 && this.config.FEATURES.ENABLE_FESTIVALS) {
            const festival = this._getFestival();
            if (festival) {
                dialogueKey = `flow_festival_${festival}`;
            } else {
                dialogueKey = `flow_return_${this._getTimeOfDay()}`;
            }
        } else {
            dialogueKey = 'flow_return_standard';
        }

        // Delay dialogue request slightly to allow wake animation to hit apex
        setTimeout(() => {
            this.requestDialogue(dialogueKey, vars);
            this.isWakingUp = false;
        }, this.config.TIMING.WAKE_DELAY);
    }

    /**
     * Reaction to being tapped while awake.
     */
    handleTap() {
        const now = performance.now();
        if (now - this.lastReactionTime < this.config.TIMING.REACTION_COOLDOWN) return;
        this.lastReactionTime = now;

        const name = this.storage.get('user.name') || 'friend';
        
        this.requestExpression(this._getRandomReactionExpression());
        this.requestDialogue('random_idle', { name });
    }

    /**
     * Context-aware reaction to food being added to the cart.
     * @param {Object} item - { id: 'm1', category: 'mains', title: '...' }
     */
    handleItemAdded(item) {
        if (!this.config.FEATURES.ENABLE_FOOD_REACTIONS) return;
        
        const now = performance.now();
        if (now - this.lastReactionTime < this.config.TIMING.FOOD_REACTION_COOLDOWN) return;
        this.lastReactionTime = now;

        const reactionRules = this.config.FOOD_REACTIONS[item.category] || { expression: this.constants.EXPRESSIONS.HAPPY };
        
        this.requestExpression(reactionRules.expression);
        this.requestDialogue(`reaction_food_${item.category}`, { itemTitle: item.title || 'that' });
        
        // Memory building
        this.storage.set('memory.favoriteItem', item.id);
        const total = this.storage.get('memory.totalOrders') || 0;
        this.storage.set('memory.totalOrders', total + 1);
    }

    /**
     * Follow-up sequence when the user introduces themselves.
     */
    handleNameLearned() {
        const name = this.storage.get('user.name');
        this.requestExpression(this.constants.EXPRESSIONS.EXCITED);
        this.requestDialogue('flow_name_learned', { name });
    }

    /**
     * Standardized output method for requesting visual expression changes.
     * @param {string} expressionId 
     */
    requestExpression(expressionId) {
        this.events.publish(this.constants.EVENTS.REQUEST_EXPRESSION, {
            expression: expressionId
        });
    }

    /**
     * Standardized output method for requesting dialogue sequences.
     * @param {string} key - Dictionary lookup key
     * @param {Object} variables - Interpolation variables (e.g. { name: 'Bob' })
     */
    requestDialogue(key, variables = {}) {
        this.events.publish(this.constants.EVENTS.REQUEST_DIALOGUE, {
            key: key,
            vars: variables
        });
    }

    /* ======================================================================
       INTERNAL UTILITIES & CONTEXT EVALUATORS
       ====================================================================== */

    _getTimeOfDay() {
        const hour = new Date().getHours();
        const bounds = this.config.TIME_BOUNDARIES;
        
        if (hour >= bounds.MORNING_START && hour < bounds.AFTERNOON_START) {
            return this.constants.TIME_OF_DAY.MORNING;
        } else if (hour >= bounds.AFTERNOON_START && hour < bounds.EVENING_START) {
            return this.constants.TIME_OF_DAY.AFTERNOON;
        } else if (hour >= bounds.EVENING_START && hour < bounds.NIGHT_START) {
            return this.constants.TIME_OF_DAY.EVENING;
        } else {
            return this.constants.TIME_OF_DAY.NIGHT;
        }
    }

    _getFestival() {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const todayStr = `${month}-${day}`;
        
        return this.config.FESTIVALS[todayStr] || null;
    }

    _getRandomReactionExpression() {
        const expressions = [
            this.constants.EXPRESSIONS.HAPPY,
            this.constants.EXPRESSIONS.THINKING,
            this.constants.EXPRESSIONS.EXCITED,
            this.constants.EXPRESSIONS.SURPRISE
        ];
        return expressions[Math.floor(Math.random() * expressions.length)];
    }
}

window.PersonalityEngine = PersonalityEngine;
