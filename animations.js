// Animation helpers and preset animations

class AnimationManager {
    constructor() {
        this.animations = [];
        this.sequences = [];
    }

    addTween(object, property, target, duration, easing = 'linear', onComplete = null) {
        const tween = new Tween(object, property, target, duration, easing);
        tween.onComplete = onComplete;
        this.animations.push(tween);
        return tween;
    }

    addSequence(sequence) {
        this.sequences.push(sequence);
        return sequence;
    }

    update(deltaTime) {
        // Update all tweens
        this.animations.forEach(anim => anim.update(deltaTime));
        this.animations = this.animations.filter(anim => !anim.complete);

        // Update all sequences
        this.sequences.forEach(seq => seq.update(deltaTime));
        this.sequences = this.sequences.filter(seq => !seq.complete);
    }

    clear() {
        this.animations = [];
        this.sequences = [];
    }
}

// Preset animation effects
class AnimationEffects {
    // Shake animation
    static shake(object, intensity = 5, duration = 300) {
        const originalX = object.x;
        const originalY = object.y;
        const startTime = Date.now();

        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                object.x = originalX;
                object.y = originalY;
                clearInterval(shakeInterval);
                return;
            }

            const remaining = 1 - (elapsed / duration);
            const currentIntensity = intensity * remaining;
            object.x = originalX + Utils.random(-currentIntensity, currentIntensity);
            object.y = originalY + Utils.random(-currentIntensity, currentIntensity);
        }, 16);
    }

    // Bounce animation
    static bounce(object, animManager) {
        const originalY = object.y;
        const sequence = new AnimationSequence();

        sequence.add(new Tween(object, 'y', originalY - 30, 200, 'easeOutCubic'));
        sequence.add(new Tween(object, 'y', originalY, 200, 'easeOutBounce'));

        animManager.addSequence(sequence);
        return sequence;
    }

    // Pop-in animation
    static popIn(object, animManager) {
        object.scale = 0;
        const tween = new Tween(object, 'scale', 1, 500, 'easeOutElastic');
        animManager.animations.push(tween);
        return tween;
    }

    // Rotate and scale
    static rotateScale(object, animManager, targetScale = 1.2) {
        const sequence = new AnimationSequence();
        const originalRotation = object.rotation || 0;
        const originalScale = object.scale || 1;

        object.rotation = originalRotation;
        object.scale = originalScale;

        sequence.add(new Tween(object, 'rotation', originalRotation + Math.PI * 2, 1000, 'easeInOutCubic'));

        const scaleTween = new Tween(object, 'scale', targetScale, 500, 'easeOutCubic');
        scaleTween.onComplete = () => {
            animManager.addTween(object, 'scale', originalScale, 500, 'easeInOutCubic');
        };
        sequence.add(scaleTween);

        animManager.addSequence(sequence);
        return sequence;
    }

    // Pulse animation
    static pulse(object, targetScale = 1.2, duration = 300) {
        const originalScale = object.scale || 1;
        const startTime = Date.now();

        const pulseInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration * 2) {
                object.scale = originalScale;
                clearInterval(pulseInterval);
                return;
            }

            const progress = (elapsed % duration) / duration;
            const scale = elapsed < duration ?
                Utils.lerp(originalScale, targetScale, progress) :
                Utils.lerp(targetScale, originalScale, progress);

            object.scale = scale;
        }, 16);
    }

    // Wiggle animation
    static wiggle(object, angle = 0.3, duration = 200, times = 3) {
        const originalRotation = object.rotation || 0;
        let currentTime = 0;
        let direction = 1;

        const wiggleInterval = setInterval(() => {
            currentTime++;

            if (currentTime >= times * 2) {
                object.rotation = originalRotation;
                clearInterval(wiggleInterval);
                return;
            }

            const progress = (currentTime % 2) / 2;
            object.rotation = originalRotation + Math.sin(progress * Math.PI) * angle * direction;

            if (currentTime % 2 === 0) direction *= -1;
        }, duration / 2);
    }

    // Float animation (continuous)
    static float(object, amplitude = 10, frequency = 1, offset = 0) {
        if (!object.floatData) {
            object.floatData = {
                originalY: object.y,
                amplitude: amplitude,
                frequency: frequency,
                offset: offset,
                time: 0
            };
        }
    }

    static updateFloat(object, deltaTime) {
        if (!object.floatData) return;

        object.floatData.time += deltaTime / 1000;
        const wave = Math.sin(object.floatData.time * object.floatData.frequency + object.floatData.offset);
        object.y = object.floatData.originalY + wave * object.floatData.amplitude;
    }

    // Sway animation (continuous)
    static sway(object, amplitude = 0.1, frequency = 1, offset = 0) {
        if (!object.swayData) {
            object.swayData = {
                originalRotation: object.rotation || 0,
                amplitude: amplitude,
                frequency: frequency,
                offset: offset,
                time: 0
            };
        }
    }

    static updateSway(object, deltaTime) {
        if (!object.swayData) return;

        object.swayData.time += deltaTime / 1000;
        const wave = Math.sin(object.swayData.time * object.swayData.frequency + object.swayData.offset);
        object.rotation = object.swayData.originalRotation + wave * object.swayData.amplitude;
    }

    // Breathe animation (continuous scale)
    static breathe(object, amplitude = 0.05, frequency = 1, offset = 0) {
        if (!object.breatheData) {
            object.breatheData = {
                originalScale: object.scale || 1,
                amplitude: amplitude,
                frequency: frequency,
                offset: offset,
                time: 0
            };
        }
    }

    static updateBreathe(object, deltaTime) {
        if (!object.breatheData) return;

        object.breatheData.time += deltaTime / 1000;
        const wave = Math.sin(object.breatheData.time * object.breatheData.frequency + object.breatheData.offset);
        object.scale = object.breatheData.originalScale * (1 + wave * object.breatheData.amplitude);
    }

    // Screen flash
    static screenFlash(ctx, width, height, color = 'white', duration = 200) {
        const startTime = Date.now();

        const flashInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                clearInterval(flashInterval);
                return;
            }

            const opacity = 1 - (elapsed / duration);
            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }, 16);
    }

    // Ripple effect from point
    static ripple(particleSystem, x, y, color = 'rgba(255, 255, 255, 0.5)') {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                particleSystem.emit(x, y, 'shine', {
                    maxLife: 500,
                    size: 5 + i * 10,
                    color: color,
                    opacity: 0.5 - i * 0.15
                });
            }, i * 100);
        }
    }

    // Impact effect
    static impact(particleSystem, x, y) {
        // Shockwave
        particleSystem.emit(x, y, 'shine', {
            maxLife: 300,
            size: 40,
            color: 'rgba(255, 255, 255, 0.8)'
        });

        // Sparkles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = Utils.random(2, 5);
            particleSystem.emit(x, y, 'sparkle', {
                maxLife: 500,
                size: Utils.random(5, 10),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.1,
                color: Utils.randomChoice(['#FFD700', '#FFA500', '#FF69B4', '#00FFFF'])
            });
        }
    }

    // Success burst
    static successBurst(particleSystem, x, y) {
        // Stars
        particleSystem.emitBurst(x, y, 'star', 8, {
            maxLife: 1000,
            size: 15,
            speed: 3,
            gravity: -0.05,
            color: '#FFD700'
        });

        // Hearts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                particleSystem.emit(
                    x + Utils.random(-30, 30),
                    y + Utils.random(-30, 30),
                    'heart',
                    {
                        maxLife: 1500,
                        size: Utils.random(10, 20),
                        vy: -2,
                        gravity: 0.05,
                        color: Utils.randomChoice(['#FF69B4', '#FF1493', '#FFB6C1'])
                    }
                );
            }, i * 100);
        }
    }

    // Upgrade beam
    static upgradeBeam(ctx, x, y, width, height, duration = 2000, callback) {
        const startTime = Date.now();
        let beamActive = true;

        const drawBeam = () => {
            if (!beamActive) {
                if (callback) callback();
                return;
            }

            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                beamActive = false;
                return;
            }

            const progress = elapsed / duration;
            const opacity = Math.sin(progress * Math.PI);

            ctx.save();
            ctx.globalAlpha = opacity * 0.7;

            // Outer glow
            const gradient1 = ctx.createLinearGradient(x, y, x, y - height);
            gradient1.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
            gradient1.addColorStop(0.5, 'rgba(255, 200, 50, 0.6)');
            gradient1.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient1;
            ctx.fillRect(x - width / 2 - 20, y - height, width + 40, height);

            // Inner beam
            const gradient2 = ctx.createLinearGradient(x, y, x, y - height);
            gradient2.addColorStop(0, 'rgba(255, 255, 200, 1)');
            gradient2.addColorStop(0.5, 'rgba(255, 255, 100, 0.8)');
            gradient2.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

            ctx.fillStyle = gradient2;
            ctx.fillRect(x - width / 2, y - height, width, height);

            ctx.restore();

            requestAnimationFrame(drawBeam);
        };

        drawBeam();
    }

    // Rainbow sweep
    static rainbowSweep(ctx, width, height, duration = 2000) {
        const startTime = Date.now();
        let sweepActive = true;

        const drawSweep = () => {
            if (!sweepActive) return;

            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                sweepActive = false;
                return;
            }

            const progress = elapsed / duration;
            const x = width * progress;

            ctx.save();
            ctx.globalAlpha = 0.6;

            const gradient = ctx.createLinearGradient(x - 100, 0, x + 100, 0);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
            gradient.addColorStop(0.2, 'rgba(255, 0, 0, 0.8)');
            gradient.addColorStop(0.35, 'rgba(255, 165, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.8)');
            gradient.addColorStop(0.65, 'rgba(0, 255, 0, 0.8)');
            gradient.addColorStop(0.8, 'rgba(0, 0, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(128, 0, 128, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - 100, 0, 200, height);

            ctx.restore();

            requestAnimationFrame(drawSweep);
        };

        drawSweep();
    }
}
