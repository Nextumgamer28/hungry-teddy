/**
 * ==========================================================================
 * JS/TEDDY.JS
 * Hungry Teddy - Premium Mascot Interactive Controller
 * Handles SVG states, animations, click/touch events, and state sync.
 * Optimized for high performance, memory safety, and 60fps rendering.
 * Features an organic autonomous personality engine and physics-based expressions.
 * ==========================================================================
 */

'use strict';

class TeddyController {
    /**
     * @param {Object} dialogueController - Reference to DialogueController instance
     * @param {Object} soundManager - Reference to SoundManager instance (optional)
     */
    constructor(dialogueController, soundManager = null) {
        // Dependencies
        this.dialogue = dialogueController;
        this.sound = soundManager;
        this.events = window.AppEventBus;
        this.constants = window.Constants;

        // Cached DOM Elements to prevent layout thrashing
        this.stage = document.getElementById('teddy-stage');
        this.container = document.getElementById('teddy-container');
        
        // Eye elements
        this.eyesAwake = document.getElementById("eyes-awake");
        this.leftPupil = document.getElementById("left-pupil");
        this.rightPupil = document.getElementById("right-pupil");
        this.eyeClosedLeft = document.getElementById("eye-closed-left");
        this.eyeClosedRight = document.getElementById("eye-closed-right");
        this.leftEyeGroup = document.getElementById("left-eye-group");
        this.rightEyeGroup = document.getElementById("right-eye-group");

        // Ear & Face elements
        this.leftEar = document.getElementById("ear-left");
        this.rightEar = document.getElementById("ear-right");
        this.faceGroup = document.getElementById("face-group");
        this.teddyCharacter = document.getElementById("teddy-character");
        this.ears = document.getElementById("teddy-ears");
        this.mouth = document.getElementById("teddy-mouth");
        this.blushLeft = document.getElementById("blush-left");
        this.blushRight = document.getElementById("blush-right");

        /* =========================
           Organic Render State
        ========================= */

        this.renderState = {
            eyeX: 0,
            eyeY: 0,
            headX: 0,
            headY: 0,
            bodyY: 0,
            bodyScale: 1,
            mouthCurve: 216,
            blushOpacity: 0,
            eyeScaleY: 1,
            expression: this.constants ? this.constants.EXPRESSIONS.NEUTRAL : "neutral",
            
            // Advanced Interpolation Targets
            mouthL: 188,
            mouthR: 212,
            mouthY: 206,
            mouthRY: 206,
            mouthCX: 200,
            mouthC: 216,
            earAngle: 0,
            headTilt: 0,
            bodyYOffset: 0,
            eyeOffsetX: 0,
            eyeOffsetY: 0,
            breathSpeedMultiplier: 1
        };

        // Expression & Personality Tracking
        this.expression = this.renderState.expression;
        this._lastExpression = this.expression;

        // Pointer & Eye Tracking
        this.blinkTimer = null;
        this.pointerX = 0;
        this.pointerY = 0;
        this.eyeTargetX = 0;
        this.eyeTargetY = 0;
        this.eyeCurrentX = 0;
        this.eyeCurrentY = 0;
        this.eyeAnimationFrame = null;

        // Saccade Engine (Micro Eye Movements)
        this.saccadeX = 0;
        this.saccadeY = 0;
        this.currentSaccadeX = 0;
        this.currentSaccadeY = 0;
        this.lastSaccadeTime = performance.now();

        // Head Tracking
        this.headTargetX = 0;
        this.headTargetY = 0;
        this.headCurrentX = 0;
        this.headCurrentY = 0;
        this.headTargetTilt = 0;
        this.headCurrentTilt = 0;

        // Advanced Physics Variables
        this.earRotation = 0;
        this.earVelocity = 0;
        this.earSpring = 0.18;
        this.earDamping = 0.80;
        
        this.bodyYVel = 0;
        this.bodyScaleVel = 0;
        this.bodySpring = 0.12;
        this.bodyDamping = 0.75;

        // Talking & Breathing
        this.isTalking = false;
        this.talkAnimationFrame = null;
        this.talkOffset = 0;
        this.breathOffset = 0;
        this.breathSpeed = 0.03;
        this.breathAmount = 1.5;

        // Mouth Animation
        this.mouthState = 0;
        this.mouthSpeed = 90;
        this.mouthTimer = performance.now(); 
        
        // Autonomous Personality Engine
        this.lastInteractionTime = performance.now();
        this.autoEyeX = 0;
        this.autoEyeY = 0;
        this.autoHeadTilt = 0;
        this.lastAutoActionTime = 0;
        this.nextAutoActionDelay = 3000;
        
        // Core State
        this.isAwake = false;
        this.isAnimating = false;
        
        // Performance & Memory Management Flags
        this.idleTimer = null;
        this._animationTimers = new Set();
        this._eventsBound = false;
        this._trackingBound = false;
        this._isAnimatingEyes = false;
        this.lastFrameTime = 0;
        
        // Layout Thrashing Prevention
        this.stageRect = null;
        this.lastRectUpdate = 0;

        // Pre-bind event handlers
        this.handleInteraction = this.handleInteraction.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.updateStageRect = this.updateStageRect.bind(this);
        this._handleExpressionRequest = this._handleExpressionRequest.bind(this);
    }

    init() {
        if (!this.stage || !this.container) return;

        requestAnimationFrame(() => {
            this.container.classList.add('sleeping-state');
        });

        this.setupEventListeners();
        this.setupEyeTracking();
        this._bindEventBus();
        
        if (this.dialogue && this.sound) {
            this.dialogue.onTypeChar = () => this.sound.play('type');
        }
    }

    _bindEventBus() {
        if (!this.events || !this.constants) return;
        this.events.subscribe(this.constants.EVENTS.REQUEST_EXPRESSION, this._handleExpressionRequest, this);
    }

    _handleExpressionRequest(data) {
        if (data && data.expression) {
            this.expression = data.expression;
        }
    }

    setupEventListeners() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        this.stage.addEventListener('click', this.handleInteraction);

        this.stage.addEventListener('touchstart', (e) => {
            if (e.cancelable) e.preventDefault();
            this.handleInteraction(e);
        }, { passive: false });

        this.stage.addEventListener('keydown', this.handleKeyPress);

        window.addEventListener('resize', this.updateStageRect, { passive: true });
        window.addEventListener('scroll', this.updateStageRect, { passive: true });
    }

    setupEyeTracking() {
        if (this._trackingBound) return;
        this._trackingBound = true;

        document.addEventListener('pointermove', (e) => {
            this.pointerX = e.clientX;
            this.pointerY = e.clientY;
            this.lastInteractionTime = performance.now();
            this.calculateEyeTarget();
        }, { passive: true });

        document.addEventListener('pointerleave', () => {
            this.eyeTargetX = 0;
            this.eyeTargetY = 0;
            this.headTargetX = 0;
            this.headTargetY = 0;
            this.headTargetTilt = 0;
        });

        document.addEventListener('touchmove', (e) => {
            if (!e.touches.length) return;
            this.pointerX = e.touches[0].clientX;
            this.pointerY = e.touches[0].clientY;
            this.lastInteractionTime = performance.now();
            this.calculateEyeTarget();
        }, { passive: true });

        document.addEventListener("touchend", () => {
            this.eyeTargetX = 0;
            this.eyeTargetY = 0;
            this.headTargetX = 0;
            this.headTargetY = 0;
            this.headTargetTilt = 0;
        }, { passive: true });

        this.animateEyes();
    }

    updateStageRect() {
        if (!this.stage) return;
        this.stageRect = this.stage.getBoundingClientRect();
        this.lastRectUpdate = performance.now();
    }

    calculateEyeTarget() {
        if (!this.stage || !this.isAwake) return;

        const now = performance.now();
        if (!this.stageRect || now - this.lastRectUpdate > 250) {
            this.updateStageRect();
        }

        if (!this.stageRect) return;

        const centerX = this.stageRect.left + (this.stageRect.width / 2);
        const centerY = this.stageRect.top + (this.stageRect.height / 2);

        const dx = (this.pointerX - centerX) * 0.035;
        const dy = (this.pointerY - centerY) * 0.035;

        this.eyeTargetX = Math.max(-14, Math.min(14, dx));
        this.eyeTargetY = Math.max(-12, Math.min(12, dy));

        this.headTargetX = Math.max(-21, Math.min(21, this.eyeTargetX * 1.5));
        this.headTargetY = Math.max(-15, Math.min(15, this.eyeTargetY * 1.5));
        this.headTargetTilt = Math.max(-8, Math.min(8, this.eyeTargetX * 0.5));
    }

    animateEyes() {
        if (this._isAnimatingEyes) return; 
        this._isAnimatingEyes = true;

        const animate = () => {
            const now = performance.now();
            const dt = this.lastFrameTime ? Math.min((now - this.lastFrameTime) / 16.666, 2.5) : 1;
            this.lastFrameTime = now;
            const time = now * 0.001;

            // ==========================================
            // AUTONOMOUS PERSONALITY ENGINE (Delegated to personality.js state, executed here)
            // ==========================================
            if (this.isAwake && !this.dialogue?.isTyping && window.Config?.FEATURES?.ENABLE_AUTONOMOUS_IDLE) {
                if (now - this.lastInteractionTime > 4000) {
                    if (now - this.lastAutoActionTime > this.nextAutoActionDelay) {
                        this.lastAutoActionTime = now;
                        this.nextAutoActionDelay = 2000 + Math.random() * 4000;
                        
                        const r = Math.random();
                        if (r < 0.25) {
                            // Glance at dialogue box
                            this.autoEyeX = -1.5 - Math.random() * 0.5;
                            this.autoEyeY = -0.8 - Math.random() * 0.3;
                            this.autoHeadTilt = -2;
                        } else if (r < 0.6) {
                            // Look around randomly
                            this.autoEyeX = (Math.random() - 0.5) * 2;
                            this.autoEyeY = (Math.random() - 0.5) * 1.5;
                            this.autoHeadTilt = (Math.random() - 0.5) * 5;
                        } else {
                            // Return to center calmly
                            this.autoEyeX = 0;
                            this.autoEyeY = 0;
                            this.autoHeadTilt = 0;
                        }
                        
                        if (Math.random() < 0.4) this.blink(); // Natural blink when shifting gaze
                    }
                } else {
                    this.autoEyeX = 0;
                    this.autoEyeY = 0;
                    this.autoHeadTilt = 0;
                }
            } else {
                this.autoEyeX = 0;
                this.autoEyeY = 0;
                this.autoHeadTilt = 0;
            }

            // ==========================================
            // EYE SACCADES (Micro Movements)
            // ==========================================
            if (this.isAwake && now - this.lastSaccadeTime > 300 + Math.random() * 800) {
                this.saccadeX = (Math.random() - 0.5) * 1.2;
                this.saccadeY = (Math.random() - 0.5) * 1.2;
                this.lastSaccadeTime = now;
            }
            this.currentSaccadeX += (this.saccadeX - this.currentSaccadeX) * 0.4 * dt;
            this.currentSaccadeY += (this.saccadeY - this.currentSaccadeY) * 0.4 * dt;

            // ==========================================
            // EXPRESSION PHYSICS & IMPULSES
            // ==========================================
            if (this._lastExpression !== this.expression) {
                if (this.expression === 'surprise') {
                    this.earVelocity -= 45; 
                    this.bodyYVel += 8; 
                    this.bodyScaleVel -= 0.05;
                } else if (this.expression === 'excited') {
                    this.earVelocity += 40;
                    this.bodyYVel -= 12;
                    this.bodyScaleVel += 0.08;
                } else if (this.expression === 'happy') {
                    this.earVelocity += 18;
                    this.bodyYVel -= 4;
                } else if (this.expression === 'sleepy') {
                    this.earVelocity -= 15;
                    this.bodyYVel += 2;
                } else if (this.expression === 'thinking') {
                    this.earVelocity += 10;
                }
                this._lastExpression = this.expression;
            }

            // ==========================================
            // EXPRESSION TARGET MATRIX
            // ==========================================
            const exprTargets = {
                neutral: { 
                    mouthL: 188, mouthR: 212, mouthY: 206, mouthRY: 206, mouthCX: 200, mouthC: 216, 
                    blush: 0, eyeScale: 1, earAngle: 0, headTilt: 0, bodyScale: 1, bodyYOffset: 0, 
                    eyeOffsetX: 0, eyeOffsetY: 0, breathSpeedMultiplier: 1 
                },
                happy: { 
                    mouthL: 172, mouthR: 228, mouthY: 196, mouthRY: 196, mouthCX: 200, mouthC: 228, 
                    blush: 0.75, eyeScale: 0.7, earAngle: 14, headTilt: 5, bodyScale: 1.015, bodyYOffset: -2, 
                    eyeOffsetX: 0, eyeOffsetY: -1, breathSpeedMultiplier: 1.25 
                },
                surprise: { 
                    mouthL: 194, mouthR: 206, mouthY: 214, mouthRY: 214, mouthCX: 200, mouthC: 232, 
                    blush: 0.1, eyeScale: 1.4, earAngle: -25, headTilt: -12, bodyScale: 1.04, bodyYOffset: -6, 
                    eyeOffsetX: 0, eyeOffsetY: -2, breathSpeedMultiplier: 1 
                },
                thinking: { 
                    mouthL: 194, mouthR: 208, mouthY: 206, mouthRY: 200, mouthCX: 206, mouthC: 198, 
                    blush: 0, eyeScale: 0.95, earAngle: 4, headTilt: 18, bodyScale: 1, bodyYOffset: 0, 
                    eyeOffsetX: 2, eyeOffsetY: -1, breathSpeedMultiplier: 0.8 
                },
                sleepy: { 
                    mouthL: 188, mouthR: 212, mouthY: 210, mouthRY: 210, mouthCX: 200, mouthC: 214, 
                    blush: 0, eyeScale: 0.2, earAngle: -18, headTilt: 12, bodyScale: 0.98, bodyYOffset: 6, 
                    eyeOffsetX: 0, eyeOffsetY: 5, breathSpeedMultiplier: 0.45 
                },
                excited: { 
                    mouthL: 160, mouthR: 240, mouthY: 192, mouthRY: 192, mouthRY: 192, mouthCX: 200, mouthC: 246, 
                    blush: 1.0, eyeScale: 0.75, earAngle: 28, headTilt: -4, bodyScale: 1.06, bodyYOffset: -8, 
                    eyeOffsetX: 0, eyeOffsetY: -1, breathSpeedMultiplier: 1.8 
                }
            };

            const target = exprTargets[this.expression] || exprTargets.neutral;
            
            let baseSpeed = 0.15;
            if (this.expression === 'surprise') baseSpeed = 0.4;
            else if (this.expression === 'sleepy') baseSpeed = 0.05;
            else if (this.expression === 'excited') baseSpeed = 0.28;
            else if (this.expression === 'happy') baseSpeed = 0.12;

            const speed = baseSpeed * dt;

            // Interpolate Base State Values
            this.renderState.mouthL += (target.mouthL - this.renderState.mouthL) * speed;
            this.renderState.mouthR += (target.mouthR - this.renderState.mouthR) * speed;
            this.renderState.mouthY += (target.mouthY - this.renderState.mouthY) * speed;
            this.renderState.mouthRY += (target.mouthRY - this.renderState.mouthRY) * speed;
            this.renderState.mouthCX += (target.mouthCX - this.renderState.mouthCX) * speed;
            this.renderState.mouthC += (target.mouthC - this.renderState.mouthC) * speed;
            this.renderState.blushOpacity += (target.blush - this.renderState.blushOpacity) * speed;
            this.renderState.eyeScaleY += (target.eyeScale - this.renderState.eyeScaleY) * speed;
            this.renderState.earAngle += (target.earAngle - this.renderState.earAngle) * speed;
            this.renderState.headTilt += (target.headTilt - this.renderState.headTilt) * speed;
            this.renderState.eyeOffsetX += (target.eyeOffsetX - this.renderState.eyeOffsetX) * speed;
            this.renderState.eyeOffsetY += (target.eyeOffsetY - this.renderState.eyeOffsetY) * speed;
            this.renderState.breathSpeedMultiplier += (target.breathSpeedMultiplier - this.renderState.breathSpeedMultiplier) * speed;

            // ==========================================
            // SPRING PHYSICS (Body)
            // ==========================================
            this.bodyYVel += (target.bodyYOffset - this.renderState.bodyYOffset) * this.bodySpring;
            this.bodyYVel *= this.bodyDamping;
            this.renderState.bodyYOffset += this.bodyYVel;

            this.bodyScaleVel += (target.bodyScale - this.renderState.bodyScale) * this.bodySpring;
            this.bodyScaleVel *= this.bodyDamping;
            this.renderState.bodyScale += this.bodyScaleVel;

            // ==========================================
            // ORGANIC MICRO-ANIMATIONS
            // ==========================================
            let microHeadTilt = 0;
            let microBodyY = 0;
            let microEyeX = 0;
            let microEyeY = 0;
            let microMouthC = 0;
            let microEarAngle = 0;

            const organicSway = Math.sin(time * 1.31) * Math.cos(time * 0.83);
            const organicDrift = Math.sin(time * 2.11) * Math.sin(time * 1.67);

            if (this.expression === 'happy') {
                microBodyY = Math.sin(time * 4) * 1.5 + organicSway;
                microMouthC = Math.sin(time * 3) * 1.5;
                microEarAngle = Math.cos(time * 2.5) * 2 + organicDrift;
                microHeadTilt = organicSway * 1.5;
            } else if (this.expression === 'excited') {
                microBodyY = Math.sin(time * 12) * 4;
                microHeadTilt = Math.sin(time * 8) * 3;
                microEarAngle = Math.sin(time * 10) * 6;
                microMouthC = Math.sin(time * 15) * 2;
            } else if (this.expression === 'thinking') {
                microHeadTilt = Math.sin(time * 1.2) * 2.5 + organicSway * 2;
                microEyeX = Math.sin(time * 1.5) * 1.5;
                microEyeY = Math.cos(time * 1.1) * 1;
                microMouthC = organicDrift * 1.5;
            } else if (this.expression === 'sleepy') {
                microHeadTilt = Math.sin(time * 0.8) * 3;
                microBodyY = Math.sin(time * 1.2) * 2;
                microEarAngle = organicSway * 2;
            } else if (this.expression === 'surprise') {
                microBodyY = Math.sin(time * 15) * 0.4; 
                microHeadTilt = organicDrift * 0.5;
            } else {
                microHeadTilt = organicSway * 1;
                microEarAngle = organicDrift * 1.5;
                microEyeX = organicSway * 0.5;
            }

            microEyeX += this.currentSaccadeX;
            microEyeY += this.currentSaccadeY;

            // ==========================================
            // APPLYING TO SVG
            // ==========================================

            // Eye Tracking Integration
            const targetEyeX = this.isAwake ? (this.eyeTargetX + this.autoEyeX) : 0;
            const targetEyeY = this.isAwake ? (this.eyeTargetY + this.autoEyeY) : 0;
            this.eyeCurrentX += (targetEyeX - this.eyeCurrentX) * 0.15 * dt;
            this.eyeCurrentY += (targetEyeY - this.eyeCurrentY) * 0.15 * dt;

            let finalEyeX = this.eyeCurrentX + this.renderState.eyeOffsetX + microEyeX;
            let finalEyeY = this.eyeCurrentY + this.renderState.eyeOffsetY + microEyeY;

            finalEyeX = Math.max(-14, Math.min(14, finalEyeX));
            finalEyeY = Math.max(-12, Math.min(12, finalEyeY));

            if (this.leftEyeGroup) {
                this.leftEyeGroup.setAttribute(
                    "transform",
                    `translate(${finalEyeX + 160} ${finalEyeY + 165}) scale(1 ${this.renderState.eyeScaleY}) translate(-160 -165)`
                );
            }

            if (this.rightEyeGroup) {
                this.rightEyeGroup.setAttribute(
                    "transform",
                    `translate(${finalEyeX + 240} ${finalEyeY + 165}) scale(1 ${this.renderState.eyeScaleY}) translate(-240 -165)`
                );
            }

            // Head Tracking & Breathing Integration
            const targetHeadX = this.isAwake ? (this.headTargetX + (this.autoEyeX * 2)) : 0;
            const targetHeadY = this.isAwake ? (this.headTargetY + (this.autoEyeY * 2)) : 0;
            const targetHeadTilt = this.isAwake ? this.headTargetTilt : 0;
            
            this.headCurrentX += (targetHeadX - this.headCurrentX) * 0.20 * dt;
            this.headCurrentY += (targetHeadY - this.headCurrentY) * 0.20 * dt;
            this.headCurrentTilt += (targetHeadTilt - this.headCurrentTilt) * 0.20 * dt;
            
            let faceY = this.headCurrentY;
            this.breathOffset += (this.breathSpeed * this.renderState.breathSpeedMultiplier) * dt;

            if (!this.isTalking) {
                faceY += Math.sin(this.breathOffset) * this.breathAmount;
            }

            if (this.isTalking) {
                this.talkOffset += 0.25 * dt;
                faceY += Math.sin(this.talkOffset) * 1.8;
            } else {
                this.talkOffset = 0;
            }

            // Apply Head Tilt
            if (this.faceGroup) {
                this.faceGroup.setAttribute("transform", `translate(${this.headCurrentX} ${faceY}) rotate(${this.renderState.headTilt + this.autoHeadTilt + microHeadTilt + this.headCurrentTilt} 200 200)`);
            }

            // Apply Body
            if (this.teddyCharacter) {
                let bY = this.renderState.bodyYOffset + microBodyY;
                let bScaleY = this.renderState.bodyScale;
                let bScaleX = this.renderState.bodyScale;
                
                if (!this.isTalking) {
                    const breathe = Math.sin(this.breathOffset);
                    bY += breathe * 0.8;
                    bScaleY += breathe * 0.0035; 
                    bScaleX -= breathe * 0.0015; 
                }

                if (this.isTalking) {
                    const talkBreathe = Math.sin(this.talkOffset);
                    bScaleY += talkBreathe * 0.002;
                    bScaleX -= talkBreathe * 0.001;
                }

                this.teddyCharacter.setAttribute("transform", `translate(0 ${bY}) scale(${bScaleX} ${bScaleY})`);
            }

            // Apply Ears Physics
            if (this.ears) {
                const physicsTarget = this.headCurrentX * 0.55 + Math.sin(this.breathOffset) * 2;
                this.earVelocity += (physicsTarget - this.earRotation) * this.earSpring;
                this.earVelocity *= this.earDamping;
                this.earRotation += this.earVelocity;
                this.ears.setAttribute("transform", `rotate(${this.earRotation} 200 180)`);
            }

            const finalEarAngle = this.renderState.earAngle + microEarAngle;
            if (this.leftEar) this.leftEar.setAttribute("transform", `rotate(${-finalEarAngle} 90 95)`);
            if (this.rightEar) this.rightEar.setAttribute("transform", `rotate(${finalEarAngle} 310 95)`);
            
            // Apply Mouth
            if (this.mouth) {
                let mL = this.renderState.mouthL;
                let mR = this.renderState.mouthR;
                let mY = this.renderState.mouthY;
                let mRY = this.renderState.mouthRY;
                let mCX = this.renderState.mouthCX;
                let mC = this.renderState.mouthC + microMouthC;

                if (this.isTalking) {
                    if (now - this.mouthTimer > this.mouthSpeed) {
                        this.mouthTimer = now;
                        this.mouthState = (this.mouthState + 1) % 3;
                    }
                    if (this.mouthState === 1) {
                        mC += 8;
                        mY -= 1.5;
                        mRY -= 1.5;
                    }
                    if (this.mouthState === 2) {
                        mC += 18;
                        mY -= 4;
                        mRY -= 4;
                        mL -= 4;
                        mR += 4;
                    }
                } else {
                    this.mouthState = 0;
                }

                this.mouth.setAttribute("d", `M ${mL} ${mY} Q ${mCX} ${mC} ${mR} ${mRY}`);
            }

            // Apply Blush
            if (this.blushLeft) this.blushLeft.setAttribute("opacity", this.renderState.blushOpacity.toString());
            if (this.blushRight) this.blushRight.setAttribute("opacity", this.renderState.blushOpacity.toString());

            this.eyeAnimationFrame = requestAnimationFrame(animate);
        };

        this.eyeAnimationFrame = requestAnimationFrame(animate);
    }
    
    handleInteraction(e) {
        this.lastInteractionTime = performance.now();

        if (this.dialogue && this.dialogue.isTyping) {
            this.dialogue.skipTyping();
            return;
        }

        if (!this.isAwake) {
            this.wakeUpSequence();
        } else {
            this.awakeInteraction();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleInteraction(e);
        }
    }

    _runAnimation(className, duration) {
        if (!this.container || this.isAnimating) return;
        
        this.isAnimating = true;

        requestAnimationFrame(() => {
            this.container.classList.add(className);
        });

        const timerId = setTimeout(() => {
            requestAnimationFrame(() => {
                this.container.classList.remove(className);
                this.isAnimating = false;
            });
            this._animationTimers.delete(timerId);
        }, duration);

        this._animationTimers.add(timerId);
    }

    wakeUpSequence() {
        if (this.isAnimating || this.isAwake) return;
        
        this.isAnimating = true;
        this.isAwake = true;

        this.autoEyeX = 0;
        this.autoEyeY = 0;
        this.eyeCurrentX = 0;
        this.eyeCurrentY = 0;
        this.eyeTargetX = 0;
        this.eyeTargetY = 0;
        this.saccadeX = 0;
        this.saccadeY = 0;

        if (this.sound) this.sound.play('surprise');

        this.expression = this.constants ? this.constants.EXPRESSIONS.SURPRISE : 'surprise';

        requestAnimationFrame(() => {
            this.container.classList.remove('sleeping-state');
            this.container.classList.add('awake-state', 'teddy-waking-up');
        });

        if (this.events && this.constants) {
            this.events.publish(this.constants.EVENTS.TEDDY_WAKE);
        } else if (this.dialogue && typeof this.dialogue.triggerWakeUpFlow === 'function') {
             // Fallback for Phase 1 architecture if events are not fully wired
            this.dialogue.triggerWakeUpFlow();
        }

        const timerId = setTimeout(() => {
            requestAnimationFrame(() => {
                this.container.classList.remove('teddy-waking-up');
                this.isAnimating = false;
                if (this.expression === (this.constants ? this.constants.EXPRESSIONS.SURPRISE : 'surprise')) {
                     this.expression = this.constants ? this.constants.EXPRESSIONS.NEUTRAL : 'neutral';
                }
                this.blink();
                this.startBlinking();
            });
            this._animationTimers.delete(timerId);
        }, 800);

        this._animationTimers.add(timerId);
    }

    awakeInteraction() {
        if (this.isAnimating) return;

        this.bodyYVel += 6; 
        this.bodyScaleVel -= 0.03; 
        this.earVelocity -= 20; 
        this.renderState.breathSpeedMultiplier = 2.5; 
        if (this.eyesAwake.style.display !== "none") this.blink(); 
        
        this.isAnimating = true;

        setTimeout(() => {
            this.isAnimating = false;
            
            if (this.events && this.constants) {
                this.events.publish(this.constants.EVENTS.TEDDY_TAP);
            } else {
                 // Fallback for Phase 1 architecture
                const reactionType = Math.random();
                if (reactionType > 0.6) {
                    this.waveArm();
                } else if (reactionType > 0.3) {
                    this.wiggleEars();
                } else {
                    this.showHappyState();
                }
                if (this.dialogue && !this.dialogue.isWaitingForName && typeof this.dialogue.triggerIdleChat === 'function') {
                    this.dialogue.triggerIdleChat();
                }
            }
        }, 150);
    }

    waveArm() {
        if (this.sound) this.sound.play('pop');
        this.expression = this.constants ? this.constants.EXPRESSIONS.EXCITED : 'excited';
        this._runAnimation('teddy-waving', 1500);
        setTimeout(() => { 
            if (this.expression === (this.constants ? this.constants.EXPRESSIONS.EXCITED : 'excited')) {
                this.expression = this.constants ? this.constants.EXPRESSIONS.NEUTRAL : 'neutral';
            } 
        }, 1500);
    }

    wiggleEars() {
        this.expression = this.constants ? this.constants.EXPRESSIONS.THINKING : 'thinking';
        this._runAnimation('teddy-wiggle-ears', 800);
        setTimeout(() => { 
            if (this.expression === (this.constants ? this.constants.EXPRESSIONS.THINKING : 'thinking')) {
                this.expression = this.constants ? this.constants.EXPRESSIONS.NEUTRAL : 'neutral';
            } 
        }, 1200);
    }

    showHappyState() {
        this.expression = this.constants ? this.constants.EXPRESSIONS.HAPPY : 'happy';
        this._runAnimation('teddy-happy', 2000);
        setTimeout(() => { 
            if (this.expression === (this.constants ? this.constants.EXPRESSIONS.HAPPY : 'happy')) {
                this.expression = this.constants ? this.constants.EXPRESSIONS.NEUTRAL : 'neutral';
            } 
        }, 2000);
    }

    startBlinking() {
        clearTimeout(this.blinkTimer);
        this.scheduleNextBlink();
    }

    scheduleNextBlink() {
        clearTimeout(this.blinkTimer);
        
        let delay = 3000 + Math.random() * 4000;
        if (this.expression === (this.constants ? this.constants.EXPRESSIONS.SLEEPY : 'sleepy')) delay = 2000 + Math.random() * 2000;

        this.blinkTimer = setTimeout(() => {
            this.blink();
            this.scheduleNextBlink();
        }, delay);
    }

    blink() {
        if (!this.isAwake) return;
        if (!this.eyesAwake || !this.eyeClosedLeft || !this.eyeClosedRight) return;

        this.eyesAwake.style.display = "none";
        this.eyeClosedLeft.style.display = "";
        this.eyeClosedRight.style.display = "";

        let blinkDuration = 160;
        if (this.expression === (this.constants ? this.constants.EXPRESSIONS.SLEEPY : 'sleepy')) blinkDuration = 350;
        else if (this.expression === (this.constants ? this.constants.EXPRESSIONS.SURPRISE : 'surprise')) blinkDuration = 100;

        setTimeout(() => {
            this.eyeClosedLeft.style.display = "none";
            this.eyeClosedRight.style.display = "none";
            this.eyesAwake.style.display = "";
        }, blinkDuration);
    }

    startTalkingAnimation() {
        this.isTalking = true;
        this.mouthTimer = performance.now();
    }

    stopTalkingAnimation() {
        this.isTalking = false;
        this.mouthState = 0;
    }
}

// Global Export
window.TeddyController = TeddyController;
