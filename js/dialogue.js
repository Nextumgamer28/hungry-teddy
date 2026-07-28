/**
==========================================================================
JS/DIALOGUE.JS
Hungry Teddy - Premium Dialogue Engine
High-performance rendering engine for Mascot conversations.
Handles queuing, typing animations, interruptions, and UI state.
Fully decoupled from content (driven by EventBus and LanguageController).
==========================================================================
*/
'use strict';
class DialogueController {
constructor() {
// DOM Caching - Prevents layout thrashing and redundant queries
this.dialogueBox = document.getElementById('dialogue-box');
this.dialogueText = document.getElementById('dialogue-text');
this.dialogueSpeaker = document.getElementById('dialogue-speaker');
this.statusBadge = document.getElementById('teddy-status-badge');
this.optionsContainer = document.getElementById('dialogue-options');
this.nameInputCard = document.getElementById('name-input-card');
this.nameForm = document.getElementById('name-form');
this.userNameInput = document.getElementById('user-name-input');
this.userGenderInput = document.getElementById('user-gender-input');
this.quickActionBar = document.getElementById('quick-action-bar');
this.tapHint = document.getElementById('tap-hint');
    
// Engine State
    this.isTyping = false;
    this.isWaitingForName = false;
    this.hasWokenUp = false;
    
    // Typing & Queue Mechanics
    this.dialogueQueue = [];
    this.currentTimeout = null;
    this.currentFullText = '';
    this.currentOnComplete = null;
    
    // Configurable Timings
    this.baseTypingSpeed = window.Config?.TIMING?.DIALOGUE_READ_TIME_PER_CHAR || 35; 

    // Status / Inactivity
    this.inactivityTimer = null;
    this.inactivityThreshold = 30000; // 30 seconds of inactivity to sleep

    // Pre-bind methods for event listeners
    this.skipTyping = this.skipTyping.bind(this);
    this.resetInactivity = this.resetInactivity.bind(this);
}

/**
 * Initializes the dialogue engine and binds essential UI events
 */
init() {
    this._setupNameForm();
    this._setupDialogueInteractions();
    this.updateStatus('welcoming', 'Welcoming');
    this.dialogueText.classList.add('typewriter-cursor');
    
    // Bind interaction events to reset inactivity timer
    document.addEventListener('mousemove', this.resetInactivity);
    document.addEventListener('click', this.resetInactivity);
    document.addEventListener('touchstart', this.resetInactivity);
    document.addEventListener('scroll', this.resetInactivity);
    this.resetInactivity();
}

/**
 * Binds click events to allow users to skip typing animations
 */
_setupDialogueInteractions() {
    if (this.dialogueBox) {
        this.dialogueBox.addEventListener('click', () => {
            if (this.isTyping) this.skipTyping(false);
        });
    }
}

/**
 * Replaces the current queue with a new sequence and plays it.
 * @param {Array|Object} sequence - Dialogue steps to process
 * @param {boolean} interrupt - If true, clears the active queue and stops current typing
 */
playSequence(sequence, interrupt = true) {
    if (interrupt) {
        this.dialogueQueue = [];
        if (this.isTyping) {
            this.skipTyping(true); // Silent interrupt
        }
    }
    
    const steps = Array.isArray(sequence) ? sequence : [sequence];
    this.dialogueQueue.push(...steps);
    
    if (!this.isTyping) {
        this.processQueue();
    }
}

/**
 * Processes the next item in the dialogue queue
 */
processQueue() {
    if (this.isTyping || this.dialogueQueue.length === 0) return;

    const step = this.dialogueQueue.shift();

    // Standard string payload
    if (typeof step === 'string') {
        this.typeText(step);
        return;
    }

    // Advanced object payload (text, actions, delays, choices)
    if (typeof step === 'object' && step !== null) {
        const executeStep = () => {
            if (typeof step.action === 'function') {
                try { step.action(); } 
                catch (e) { console.error('[DialogueEngine] Action error:', e); }
            }
            
            if (step.text) {
                this.typeText(step.text, () => {
                    if (step.options) this.showOptions(step.options);
                });
            } else {
                this.processQueue(); // Move to next step if no text provided
            }
        };

        if (step.delay) {
            this.updateStatus('thinking', 'Thinking...');
            this.currentTimeout = setTimeout(executeStep, step.delay);
        } else {
            executeStep();
        }
    }
}

/**
 * High-performance typing effect with organic punctuation pacing.
 * @param {string} text - Text to render
 * @param {Function} onComplete - Execution callback
 */
typeText(text, onComplete = null) {
    this._clearTimers();
    
    this.isTyping = true;
    this.updateStatus('speaking', 'Speaking');
    this.currentFullText = text;
    this.currentOnComplete = onComplete;
    
    // UI Reset
    this.dialogueText.textContent = '';
    this.optionsContainer.innerHTML = ''; 
    this.dialogueText.classList.add('typewriter-cursor');
    
    // Sync Mascot Animation
    if (window.App?.modules?.teddy) {
        window.App.modules.teddy.startTalkingAnimation();
    }
    
    let charIndex = 0;
    
    const typeNextChar = () => {
        if (charIndex < this.currentFullText.length) {
            const char = this.currentFullText[charIndex];
            this.dialogueText.textContent += char;
            charIndex++;
            
            // Optimized Audio Hook (Plays sound every 3rd character)
            if (charIndex % 3 === 0 && window.App?.modules?.sound) {
                window.App.modules.sound.play('type');
            }

            // Organic pacing logic
            let delay = this.baseTypingSpeed;
            if (/[.!?]/.test(char)) delay += 200; // Sentence break
            else if (/[,\-:]/.test(char)) delay += 80; // Clause break

            this.currentTimeout = setTimeout(typeNextChar, delay);
        } else {
            this._finishTyping();
            this.processQueue();
        }
    };

    typeNextChar();
}

/**
 * Instantly renders remaining text.
 * @param {boolean} silent - If true, aborts callbacks (used for hard interruptions)
 */
skipTyping(silent = false) {
    if (!this.isTyping) return;
    
    this._clearTimers();
    this.dialogueText.textContent = this.currentFullText;
    
    this._finishTyping(silent);
    
    if (!silent) {
        setTimeout(() => this.processQueue(), 50);
    }
}

/**
 * Cleans up state after typing finishes.
 */
_finishTyping(silent = false) {
    this.isTyping = false;
    this.dialogueText.classList.remove('typewriter-cursor');
    
    if (window.App?.modules?.teddy) {
        window.App.modules.teddy.stopTalkingAnimation();
    }

    if (!silent && this.currentOnComplete) {
        const callback = this.currentOnComplete;
        this.currentOnComplete = null;
        callback();
    }
    
    if (this.dialogueQueue.length === 0) {
        this.updateStatus('happy', 'Happy');
    }
}

/**
 * Safely clears active timeouts to prevent overlapping loops.
 */
_clearTimers() {
    if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
    }
}

/**
 * Dynamically renders interactive choice buttons via DocumentFragment.
 * @param {Array} options - [{label: 'String', onClick: Function}]
 */
showOptions(options) {
    this.optionsContainer.innerHTML = '';
    if (!Array.isArray(options) || options.length === 0) return;
    
    const fragment = document.createDocumentFragment();
    
    options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary glass-btn-hover fade-in-up';
        btn.style.animationDelay = `${index * 0.1}s`;
        btn.textContent = opt.label;
        
        btn.addEventListener('click', () => {
            this.optionsContainer.innerHTML = '';
            if (typeof opt.onClick === 'function') opt.onClick();
        }, { once: true });
        
        fragment.appendChild(btn);
    });
    
    this.optionsContainer.appendChild(fragment);
}

/* ======================================================================
   PHASE 2 ARCHITECTURE BRIDGES
   These methods route legacy mascot calls to the new Personality Engine.
   ====================================================================== */

/**
 * Triggered by teddy.js when mascot wakes up.
 * Offloads logic to Personality Engine via EventBus.
 */
triggerWakeUpFlow() {
    if (this.tapHint) this.tapHint.classList.add('fade-out');
    this.hasWokenUp = true;
    this.updateStatus('welcoming', 'Welcoming');
    
    if (window.AppEventBus && window.Constants) {
        window.AppEventBus.publish(window.Constants.EVENTS.TEDDY_WAKE);
    }
}

/**
 * Triggered by teddy.js when mascot is tapped.
 * Offloads logic to Personality Engine via EventBus.
 */
triggerIdleChat() {
    if (this.isWaitingForName) return;
    
    this.updateStatus('hungry', 'Hungry');
    
    if (window.AppEventBus && window.Constants) {
        window.AppEventBus.publish(window.Constants.EVENTS.TEDDY_TAP);
    }
}

resetInactivity() {
    if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
    }
    
    // Wake up if sleeping
    if (this.statusBadge && this.statusBadge.classList.contains('sleeping')) {
        this.updateStatus('welcoming', 'Welcoming');
        if (window.App?.modules?.teddy) {
            window.App.modules.teddy.container.classList.remove('sleeping-state');
            window.App.modules.teddy.isAwake = true;
        }
    }

    this.inactivityTimer = setTimeout(() => {
        this.updateStatus('sleeping', 'Sleeping...');
        if (window.App?.modules?.teddy) {
            window.App.modules.teddy.container.classList.add('sleeping-state');
            window.App.modules.teddy.isAwake = false;
        }
    }, this.inactivityThreshold);
}

/**
 * Updates the UI Status Badge above the dialogue box.
 * @param {string} type - CSS status class (e.g., 'sleeping', 'awake')
 * @param {string} label - Text to display
 */
updateStatus(type, label) {
    if (!this.statusBadge) return;
    
    this.statusBadge.className = `status-badge ${type}`;
    this.statusBadge.textContent = label;
}

/* ======================================================================
   USER INPUT HANDLING
   ====================================================================== */

/**
 * Triggers the UI to request the user's name (Called by Language/Personality).
 */
showNameInput() {
    this.isWaitingForName = true;
    this.dialogueBox.style.display = 'none';
    
    this.nameInputCard.classList.remove('hidden');
    this.nameInputCard.classList.add('bounce-in');
    
    setTimeout(() => {
        if (this.userNameInput) this.userNameInput.focus();
    }, 500);
}

/**
 * Form binding for user introduction.
 * Stores name via StorageManager and alerts PersonalityEngine.
 */
_setupNameForm() {
    if (!this.nameForm || !this.userNameInput) return;

    this.nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const rawName = this.userNameInput.value.trim();
        if (rawName.length < 2) return;
        
        const rawGender = this.userGenderInput ? this.userGenderInput.value : 'neutral';
        if (!rawGender) return;

        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        this.isWaitingForName = false;
        
        // Switch UI views
        this.nameInputCard.classList.add('hidden');
        this.dialogueBox.style.display = 'block';

        // Route to Phase 2 Central Architecture
        if (window.AppEventBus && window.Constants) {
            if (window.App?.modules?.storage) {
                window.App.modules.storage.set('user.name', formattedName);
                window.App.modules.storage.set('user.gender', rawGender);
            } else {
                try { 
                    localStorage.setItem('teddy_user_name', formattedName); 
                    localStorage.setItem('teddy_user_gender', rawGender); 
                } catch(e) {}
            }
            window.AppEventBus.publish(window.Constants.EVENTS.USER_NAME_SET, { name: formattedName, gender: rawGender });
        }
    });
}

/**
 * Reveals the quick jump action buttons (Menu).
 */
showActionButtons() {
    if (this.quickActionBar && this.quickActionBar.classList.contains('hidden')) {
        this.quickActionBar.classList.remove('hidden');
        this.quickActionBar.classList.add('fade-in-up');
    }
}
}

// Global Export
window.DialogueController = DialogueController;
