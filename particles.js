// Particle system for decorative effects

class Particle {
    constructor(x, y, type, config = {}) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        this.maxLife = config.maxLife || 3000;
        this.age = 0;
        this.dead = false;

        // Movement
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 1;

        // Appearance
        this.color = config.color || '#FFD700';
        this.size = config.size || 10;
        this.startSize = this.size;
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.opacity = config.opacity || 1;

        // Animation
        this.scaleOscillate = config.scaleOscillate || false;
        this.sineOffset = Utils.random(0, Math.PI * 2);
        this.swingAmplitude = config.swingAmplitude || 0;
        this.swingFrequency = config.swingFrequency || 1;
    }

    update(deltaTime) {
        this.age += deltaTime;
        this.life = 1 - (this.age / this.maxLife);

        if (this.life <= 0) {
            this.dead = true;
            return;
        }

        // Apply velocity
        this.x += this.vx * deltaTime / 16;
        this.y += this.vy * deltaTime / 16;

        // Apply gravity
        this.vy += this.gravity * deltaTime / 16;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Rotation
        this.rotation += this.rotationSpeed * deltaTime / 16;

        // Oscillating scale
        if (this.scaleOscillate) {
            const oscillation = Math.sin(this.age / 200 + this.sineOffset);
            this.size = this.startSize * (0.9 + oscillation * 0.1);
        }

        // Swing motion
        if (this.swingAmplitude > 0) {
            this.x += Math.sin(this.age / 1000 * this.swingFrequency) * this.swingAmplitude * deltaTime / 16;
        }

        // Fade out
        this.opacity = this.life;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        switch(this.type) {
            case 'star':
                this.drawStar(ctx);
                break;
            case 'heart':
                this.drawHeart(ctx);
                break;
            case 'musicNote':
                this.drawMusicNote(ctx);
                break;
            case 'sparkle':
                this.drawSparkle(ctx);
                break;
            case 'bubble':
                this.drawBubble(ctx);
                break;
            case 'feather':
                this.drawFeather(ctx);
                break;
            case 'leaf':
                this.drawLeaf(ctx);
                break;
            case 'exclamation':
                this.drawExclamation(ctx);
                break;
            case 'sweat':
                this.drawSweat(ctx);
                break;
            case 'stink':
                this.drawStink(ctx);
                break;
            case 'shine':
                this.drawShine(ctx);
                break;
            case 'confetti':
                this.drawConfetti(ctx);
                break;
        }

        ctx.restore();
    }

    drawStar(ctx) {
        Utils.addGlow(ctx, this.color, 10);
        ctx.fillStyle = this.color;
        Utils.drawStar(ctx, 0, 0, this.size, 5, 0.5);
        ctx.fill();
        Utils.removeGlow(ctx);
    }

    drawHeart(ctx) {
        Utils.addGlow(ctx, this.color, 8);
        ctx.fillStyle = this.color;
        Utils.drawHeart(ctx, 0, 0, this.size);
        ctx.fill();
        Utils.removeGlow(ctx);
    }

    drawMusicNote(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Note head
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.3, this.size * 0.3, this.size * 0.25, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Note stem
        ctx.beginPath();
        ctx.moveTo(this.size * 0.2, this.size * 0.2);
        ctx.lineTo(this.size * 0.2, -this.size * 0.6);
        ctx.stroke();
    }

    drawSparkle(ctx) {
        Utils.addGlow(ctx, this.color, 15);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Four-pointed sparkle
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();

        // Diagonal lines
        const diag = this.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(-diag, -diag);
        ctx.lineTo(diag, diag);
        ctx.moveTo(diag, -diag);
        ctx.lineTo(-diag, diag);
        ctx.stroke();

        Utils.removeGlow(ctx);
    }

    drawBubble(ctx) {
        const gradient = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 0, 0, 0, this.size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(150, 200, 255, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-this.size * 0.4, -this.size * 0.4, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFeather(ctx) {
        ctx.fillStyle = this.color;

        // Feather shaft
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Feather barbs
        for (let i = -this.size; i < this.size; i += 4) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            const width = this.size * 0.5 * (1 - Math.abs(i / this.size));
            ctx.quadraticCurveTo(width * 0.5, i - 2, width, i - 4);
            ctx.stroke();
        }
    }

    drawLeaf(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.6, -this.size * 0.3, this.size * 0.4, this.size * 0.3);
        ctx.quadraticCurveTo(this.size * 0.2, this.size * 0.6, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.2, this.size * 0.6, -this.size * 0.4, this.size * 0.3);
        ctx.quadraticCurveTo(-this.size * 0.6, -this.size * 0.3, 0, -this.size);
        ctx.closePath();
        ctx.fill();

        // Vein
        ctx.strokeStyle = 'rgba(0, 100, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();
    }

    drawExclamation(ctx) {
        ctx.fillStyle = this.color;

        // Exclamation line
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.2, -this.size);
        ctx.lineTo(-this.size * 0.2, 0);
        ctx.lineTo(this.size * 0.2, 0);
        ctx.lineTo(this.size * 0.2, -this.size);
        ctx.closePath();
        ctx.fill();

        // Exclamation dot
        ctx.beginPath();
        ctx.arc(0, this.size * 0.5, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSweat(ctx) {
        const gradient = ctx.createRadialGradient(0, -this.size * 0.3, 0, 0, 0, this.size);
        gradient.addColorStop(0, 'rgba(150, 200, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0.6)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.5, -this.size * 0.5, this.size * 0.5, 0);
        ctx.quadraticCurveTo(this.size * 0.5, this.size * 0.5, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.5, this.size * 0.5, -this.size * 0.5, 0);
        ctx.quadraticCurveTo(-this.size * 0.5, -this.size * 0.5, 0, -this.size);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-this.size * 0.2, -this.size * 0.5, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStink(ctx) {
        ctx.fillStyle = this.color;

        // Wavy stink cloud
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wave = Math.sin(angle * 3 + this.age / 100) * 0.2 + 1;
            const radius = this.size * wave;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }

    drawShine(ctx) {
        Utils.addGlow(ctx, '#ffffff', 20);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const len = this.size * (1 + Math.sin(this.age / 100) * 0.3);

        ctx.beginPath();
        ctx.moveTo(-len, 0);
        ctx.lineTo(len, 0);
        ctx.moveTo(0, -len);
        ctx.lineTo(0, len);
        ctx.stroke();

        Utils.removeGlow(ctx);
    }

    drawConfetti(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size * 0.3, -this.size, this.size * 0.6, this.size * 2);
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, type, config = {}) {
        this.particles.push(new Particle(x, y, type, config));
    }

    emitBurst(x, y, type, count, config = {}) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = config.speed || Utils.random(1, 3);
            const particleConfig = {
                ...config,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            };
            this.emit(x, y, type, particleConfig);
        }
    }

    update(deltaTime) {
        this.particles.forEach(particle => particle.update(deltaTime));
        this.particles = this.particles.filter(particle => !particle.dead);
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}
