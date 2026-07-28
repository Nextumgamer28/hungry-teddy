/**
 * ==========================================================================
 * JS/SOUND.JS
 * Hungry Teddy - Procedural Web Audio Sound Manager
 * Synthesizes all application sound effects without external files.
 * ==========================================================================
 */

'use strict';

class SoundManager {
    constructor() {
        // State
        this.ctx = null;
        this.isSupported = !!(window.AudioContext || window.webkitAudioContext);
        
        // Load preferences from localStorage
        this.volume = parseFloat(localStorage.getItem('teddy_volume')) || 0.5;
        this.isMuted = localStorage.getItem('teddy_muted') === 'true';

        // DOM Elements for UI sync (if available)
        this.soundToggleBtn = document.getElementById('sound-toggle');
        this.iconOn = document.querySelector('.sound-on');
        this.iconOff = document.querySelector('.sound-off');

        // Sound generators map
        this.sounds = {
            'pop': () => this._playPop(),
            'type': () => this._playType(),
            'surprise': () => this._playSurprise(),
            'success': () => this._playSuccess(),
            'click': () => this._playClick(),
            'error': () => this._playError()
        };

        // Bind internal method
        this._unlockAudio = this._unlockAudio.bind(this);
    }

    /**
     * Initializes the sound manager and waits for first user interaction
     * to unlock the Web Audio context (browser autoplay policy).
     */
    init() {
        if (!this.isSupported) {
            console.warn("SoundManager: Web Audio API is not supported in this browser.");
            return;
        }

        this._syncUI();

        // Listen for UI toggle button
        if (this.soundToggleBtn) {
            this.soundToggleBtn.addEventListener('click', () => this.toggleMute());
        }

        // Attach listeners to unlock audio context on first interaction
        const events = ['touchstart', 'click', 'keydown'];
        events.forEach(event => {
            document.body.addEventListener(event, this._unlockAudio, { once: true, capture: true });
        });
    }

    /**
     * Private helper to instantiate AudioContext on user interaction
     */
    _unlockAudio() {
        if (this.ctx) return; // Already unlocked

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();

            // Play a silent oscillator to force the context to unlock
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(0);
            osc.stop(this.ctx.currentTime + 0.001);

            console.log("🧸 SoundManager: Web Audio API unlocked.");
        } catch (e) {
            console.warn("SoundManager: Failed to unlock AudioContext.", e);
        }
    }

    /**
     * Public method to play a sound effect by name
     * @param {string} soundName 
     */
    play(soundName) {
        if (!this.isSupported || this.isMuted || !this.ctx || !this.sounds[soundName]) {
            return;
        }

        // Ensure context is running (can be suspended by browser)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }

        try {
            this.sounds[soundName]();
        } catch (e) {
            // Silently fail to prevent interrupting the app flow
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        localStorage.setItem('teddy_volume', this.volume);
    }

    mute() {
        this.isMuted = true;
        localStorage.setItem('teddy_muted', 'true');
        this._syncUI();
    }

    unmute() {
        this.isMuted = false;
        localStorage.setItem('teddy_muted', 'false');
        this._syncUI();
        
        // Ensure context is created if user unmutes via UI before clicking elsewhere
        if (!this.ctx && this.isSupported) {
            this._unlockAudio();
        }
        
        this.play('pop'); // Feedback sound
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    _syncUI() {
        if (!this.iconOn || !this.iconOff) return;
        
        if (this.isMuted) {
            this.iconOn.classList.add('hidden');
            this.iconOff.classList.remove('hidden');
        } else {
            this.iconOn.classList.remove('hidden');
            this.iconOff.classList.add('hidden');
        }
    }

    /* ======================================================================
       WEB AUDIO API SYNTHESIZERS (Procedural Sound Generation)
       ====================================================================== */

    /**
     * Helper to create a basic tone
     */
    _createTone(type, freq, volMultiplier = 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(this.volume * volMultiplier, this.ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        return { osc, gain };
    }

    /**
     * Soft, bouncy pop (used for UI elements and cart)
     */
    _playPop() {
        const { osc, gain } = this._createTone('sine', 400, 0.4);
        
        // Quick pitch drop
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        // Quick fade out
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * Extremely short, subtle click (used for typewriter effect)
     */
    _playType() {
        const { osc, gain } = this._createTone('square', 150, 0.05);
        
        // Almost instant decay to act as a percussive click
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.03);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    /**
     * Ascending slide tone (used when Teddy wakes up or gets happy)
     */
    _playSurprise() {
        const { osc, gain } = this._createTone('triangle', 300, 0.3);
        
        // Slide pitch up
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.2);
        // Smooth fade out
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }

    /**
     * Cheerful major chord arpeggio (used for reservations/success actions)
     */
    _playSuccess() {
        // Frequencies for A4, C#5, E5 (A Major chord)
        const notes = [440, 554.37, 659.25];
        const time = this.ctx.currentTime;
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + (index * 0.1));
            
            gain.gain.setValueAtTime(0, time); // Start silent
            gain.gain.setValueAtTime(this.volume * 0.2, time + (index * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.01, time + (index * 0.1) + 0.4);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time + (index * 0.1));
            osc.stop(time + (index * 0.1) + 0.5);
        });
    }

    /**
     * Standard UI click (sharper than type, slightly lower volume)
     */
    _playClick() {
        const { osc, gain } = this._createTone('sine', 600, 0.15);
        
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }

    /**
     * Descending sawtooth (used for errors or invalid actions)
     */
    _playError() {
        const { osc, gain } = this._createTone('sawtooth', 200, 0.15);
        
        // Descending pitch
        osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }
}

// Make globally available
window.SoundManager = SoundManager;
