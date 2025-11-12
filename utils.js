// Utility functions for the Ecological Cycle Simulator

class Utils {
    // Easing functions for smooth animations
    static easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    static easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    static easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    // Linear interpolation
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    // Random number in range
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Random integer in range
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Random choice from array
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Create gradient with multiple color stops
    static createGradient(ctx, x0, y0, x1, y1, colors) {
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        return gradient;
    }

    // Create radial gradient
    static createRadialGradient(ctx, x, y, r0, r1, colors) {
        const gradient = ctx.createRadialGradient(x, y, r0, x, y, r1);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        return gradient;
    }

    // Draw rounded rectangle
    static roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Draw star
    static drawStar(ctx, x, y, radius, points, inset) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.moveTo(0, 0 - radius);
        for (let i = 0; i < points; i++) {
            ctx.rotate(Math.PI / points);
            ctx.lineTo(0, 0 - (radius * inset));
            ctx.rotate(Math.PI / points);
            ctx.lineTo(0, 0 - radius);
        }
        ctx.closePath();
        ctx.restore();
    }

    // Draw heart
    static drawHeart(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        // Left curve
        ctx.bezierCurveTo(
            0, 0,
            -size / 2, 0,
            -size / 2, topCurveHeight
        );
        ctx.bezierCurveTo(
            -size / 2, (topCurveHeight + size * 0.3),
            -size / 3, (topCurveHeight + size * 0.5),
            0, size
        );
        // Right curve
        ctx.bezierCurveTo(
            size / 3, (topCurveHeight + size * 0.5),
            size / 2, (topCurveHeight + size * 0.3),
            size / 2, topCurveHeight
        );
        ctx.bezierCurveTo(
            size / 2, 0,
            0, 0,
            0, topCurveHeight
        );
        ctx.closePath();
        ctx.restore();
    }

    // Distance between two points
    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Angle between two points
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    // HSL to RGB conversion
    static hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    // Add glow effect
    static addGlow(ctx, color, blur) {
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
    }

    // Remove glow effect
    static removeGlow(ctx) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    // Draw with outline
    static drawWithOutline(ctx, drawFunc, fillColor, outlineColor, outlineWidth) {
        // Draw outline
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawFunc();
        ctx.stroke();

        // Draw fill
        ctx.fillStyle = fillColor;
        drawFunc();
        ctx.fill();
    }

    // Camouflage pattern generator
    static generateCamoPattern(ctx, width, height, colors, time = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const tempCtx = canvas.getContext('2d');

        // Create organic blob shapes for camo
        for (let i = 0; i < 15; i++) {
            const color = Utils.randomChoice(colors);
            tempCtx.fillStyle = color;

            const x = Utils.random(0, width);
            const y = Utils.random(0, height);
            const size = Utils.random(width * 0.1, width * 0.3);

            tempCtx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
                const radius = size * (0.7 + Math.sin(angle * 3 + time * 0.001) * 0.3);
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                if (angle === 0) tempCtx.moveTo(px, py);
                else tempCtx.lineTo(px, py);
            }
            tempCtx.closePath();
            tempCtx.fill();
        }

        return canvas;
    }
}

// Animation class for managing tweens
class Tween {
    constructor(object, property, target, duration, easing = 'linear') {
        this.object = object;
        this.property = property;
        this.start = object[property];
        this.target = target;
        this.duration = duration;
        this.elapsed = 0;
        this.easing = easing;
        this.complete = false;
        this.onComplete = null;
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
        const progress = Math.min(this.elapsed / this.duration, 1);

        let easedProgress = progress;
        switch(this.easing) {
            case 'easeOutElastic':
                easedProgress = Utils.easeOutElastic(progress);
                break;
            case 'easeOutBounce':
                easedProgress = Utils.easeOutBounce(progress);
                break;
            case 'easeInOutCubic':
                easedProgress = Utils.easeInOutCubic(progress);
                break;
            case 'easeOutCubic':
                easedProgress = Utils.easeOutCubic(progress);
                break;
            case 'easeInOutSine':
                easedProgress = Utils.easeInOutSine(progress);
                break;
        }

        this.object[this.property] = Utils.lerp(this.start, this.target, easedProgress);

        if (progress >= 1) {
            this.complete = true;
            if (this.onComplete) this.onComplete();
        }
    }
}

// Sequence of animations
class AnimationSequence {
    constructor() {
        this.animations = [];
        this.currentIndex = 0;
        this.complete = false;
    }

    add(animation) {
        this.animations.push(animation);
        return this;
    }

    then(callback) {
        this.animations.push({ type: 'callback', callback });
        return this;
    }

    update(deltaTime) {
        if (this.complete || this.animations.length === 0) return;

        const current = this.animations[this.currentIndex];

        if (current.type === 'callback') {
            current.callback();
            this.currentIndex++;
        } else {
            current.update(deltaTime);
            if (current.complete) {
                this.currentIndex++;
            }
        }

        if (this.currentIndex >= this.animations.length) {
            this.complete = true;
        }
    }
}
