// Visual element classes for the Ecological Cycle Simulator

// Base class for all animated elements
class AnimatedElement {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.scale = 1;
        this.rotation = 0;
        this.opacity = 1;
        this.time = Utils.random(0, 1000);
    }

    update(deltaTime) {
        this.time += deltaTime;
    }

    draw(ctx) {
        // Override in subclasses
    }
}

// Dog character - tokidoki style
class Dog extends AnimatedElement {
    constructor(x, y) {
        super(x, y);
        this.baseY = y;
        this.state = 'idle'; // idle, walking, pooping, celebrating
        this.direction = 1;

        // Visual properties
        this.bodyColor = Utils.randomChoice(['#FFB6D9', '#B4E7CE', '#FFF4B8']);
        this.eyeBlinkTimer = 0;
        this.eyeBlinkInterval = Utils.random(3000, 5000);
        this.isBlinking = false;
        this.blinkDuration = 150;

        // Animation properties
        this.walkCycle = 0;
        this.tailWagAngle = 0;
        this.earTwitchTimer = 0;
        this.breathePhase = 0;

        // Poop animation
        this.poopTimer = 0;
        this.poopDuration = 2000;
        this.isPooping = false;

        // Idle behaviors
        this.idleTimer = 0;
        this.idleBehavior = null;

        // Colors with gradients
        this.noseColor = '#FF69B4';
        this.blushIntensity = 0.3;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.breathePhase += deltaTime / 1000;

        // Eye blinking
        this.eyeBlinkTimer += deltaTime;
        if (this.eyeBlinkTimer >= this.eyeBlinkInterval) {
            this.isBlinking = true;
            this.eyeBlinkTimer = 0;
            this.eyeBlinkInterval = Utils.random(3000, 5000);
            setTimeout(() => this.isBlinking = false, this.blinkDuration);
        }

        // Ear twitch
        this.earTwitchTimer += deltaTime;

        // Tail wag
        this.tailWagAngle = Math.sin(this.time / 300) * 0.4;

        switch(this.state) {
            case 'idle':
                this.updateIdle(deltaTime);
                break;
            case 'walking':
                this.updateWalking(deltaTime);
                break;
            case 'pooping':
                this.updatePooping(deltaTime);
                break;
            case 'celebrating':
                this.updateCelebrating(deltaTime);
                break;
        }
    }

    updateIdle(deltaTime) {
        // Breathing animation
        this.y = this.baseY + Math.sin(this.breathePhase * 2) * 2;

        // Weight shift
        const shift = Math.sin(this.time / 1000) * 3;
        this.rotation = shift * 0.02;

        // Random idle behaviors
        this.idleTimer += deltaTime;
        if (this.idleTimer > 10000 && !this.idleBehavior) {
            this.idleBehavior = Utils.randomChoice(['scratch', 'yawn', 'stretch']);
            this.idleTimer = 0;
        }
    }

    updateWalking(deltaTime) {
        this.walkCycle += deltaTime / 100;

        // Bob up and down
        this.y = this.baseY + Math.sin(this.walkCycle) * 5;

        // Body rotation while walking
        this.rotation = Math.sin(this.walkCycle) * 0.1;
    }

    updatePooping(deltaTime) {
        this.poopTimer += deltaTime;

        const progress = this.poopTimer / this.poopDuration;

        // Squatting animation
        if (progress < 0.3) {
            this.scale = 1 - progress * 0.2;
        } else if (progress < 0.7) {
            // Straining
            this.blushIntensity = 0.8;
        } else if (progress < 1.0) {
            // Relief
            this.scale = 0.94 + (progress - 0.7) * 0.2;
            this.blushIntensity = 0.3;
        }

        if (progress >= 1.0) {
            this.finishPooping();
        }
    }

    updateCelebrating(deltaTime) {
        // Jump animation
        const jumpPhase = Math.sin(this.time / 200) * 15;
        this.y = this.baseY - Math.abs(jumpPhase);
        this.rotation = Math.sin(this.time / 150) * 0.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale * this.direction, this.scale);

        // Shadow
        this.drawShadow(ctx);

        // Body
        this.drawBody(ctx);

        // Tail
        this.drawTail(ctx);

        // Legs
        this.drawLegs(ctx);

        // Head
        this.drawHead(ctx);

        // Ears
        this.drawEars(ctx);

        // Eyes
        this.drawEyes(ctx);

        // Nose
        this.drawNose(ctx);

        // Blush
        this.drawBlush(ctx);

        // Special effects based on state
        if (this.state === 'pooping' && this.poopTimer > 500) {
            this.drawPoopingEffects(ctx);
        }

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 50, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBody(ctx) {
        // Main body with gradient and camo pattern
        const gradient = ctx.createRadialGradient(-10, -10, 0, 0, 0, 40);
        gradient.addColorStop(0, this.bodyColor);
        gradient.addColorStop(1, this.adjustColor(this.bodyColor, -20));

        // Outline
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Body shape (rounded rectangle)
        ctx.beginPath();
        ctx.ellipse(0, 0, 40, 35, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.stroke();

        // Glossy highlight
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-15, -15, 15, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Breathing motion (belly)
        const bellyScale = 1 + Math.sin(this.breathePhase * 2) * 0.05;
        ctx.save();
        ctx.scale(bellyScale, bellyScale);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.adjustColor(this.bodyColor, 20);
        ctx.beginPath();
        ctx.ellipse(0, 10, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawTail(ctx) {
        ctx.save();
        ctx.translate(-35, 0);
        ctx.rotate(this.tailWagAngle);

        // Tail (marshmallow shape)
        const tailGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        tailGradient.addColorStop(0, '#FFFFFF');
        tailGradient.addColorStop(1, this.bodyColor);

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = tailGradient;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawLegs(ctx) {
        const legOffset = this.state === 'walking' ? Math.sin(this.walkCycle) * 10 : 0;

        // Back legs
        this.drawLeg(ctx, -15, 25, legOffset);
        this.drawLeg(ctx, -5, 30, -legOffset);

        // Front legs
        this.drawLeg(ctx, 15, 25, -legOffset);
        this.drawLeg(ctx, 25, 30, legOffset);
    }

    drawLeg(ctx, x, y, offset) {
        ctx.save();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 15 + offset);

        ctx.strokeStyle = this.bodyColor;
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#8B4513';
        ctx.stroke();

        // Paw
        ctx.fillStyle = this.adjustColor(this.bodyColor, -30);
        ctx.beginPath();
        ctx.ellipse(x, y + 18 + offset, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawHead(ctx) {
        // Head (large round head)
        const headGradient = ctx.createRadialGradient(-5, -35, 0, 0, -30, 30);
        headGradient.addColorStop(0, this.bodyColor);
        headGradient.addColorStop(1, this.adjustColor(this.bodyColor, -15));

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -30, 30, 28, 0, 0, Math.PI * 2);
        ctx.fillStyle = headGradient;
        ctx.fill();
        ctx.stroke();

        // Head highlight
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-10, -40, 12, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawEars(ctx) {
        const earTwitch = Math.sin(this.earTwitchTimer / 2000) * 0.1;

        // Left ear
        ctx.save();
        ctx.translate(-20, -45);
        ctx.rotate(-0.3 + earTwitch);
        this.drawEar(ctx);
        ctx.restore();

        // Right ear
        ctx.save();
        ctx.translate(20, -45);
        ctx.rotate(0.3 - earTwitch);
        ctx.scale(-1, 1);
        this.drawEar(ctx);
        ctx.restore();
    }

    drawEar(ctx) {
        const earGradient = ctx.createLinearGradient(0, -10, 0, 10);
        earGradient.addColorStop(0, this.bodyColor);
        earGradient.addColorStop(1, this.adjustColor(this.bodyColor, -20));

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-8, -10, -5, -20);
        ctx.quadraticCurveTo(-2, -25, 5, -22);
        ctx.quadraticCurveTo(10, -15, 8, -5);
        ctx.closePath();
        ctx.fillStyle = earGradient;
        ctx.fill();
        ctx.stroke();

        // Inner ear
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(0, -10, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEyes(ctx) {
        const eyeSize = this.isBlinking ? 2 : 10;
        const eyeHeight = this.isBlinking ? 1 : 10;

        // Left eye
        this.drawEye(ctx, -12, -32, eyeSize, eyeHeight);

        // Right eye
        this.drawEye(ctx, 12, -32, eyeSize, eyeHeight);
    }

    drawEye(ctx, x, y, width, height) {
        // Eye white
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!this.isBlinking) {
            // Pupil
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(x, y, width * 0.5, height * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Star highlights (3 stars)
            this.drawStarHighlight(ctx, x - 3, y - 3, 2);
            this.drawStarHighlight(ctx, x + 1, y - 2, 1.5);
            this.drawStarHighlight(ctx, x - 1, y + 2, 1);
        }
    }

    drawStarHighlight(ctx, x, y, size) {
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.9;
        Utils.drawStar(ctx, x, y, size, 4, 0.5);
        ctx.fill();
        ctx.restore();
    }

    drawNose(ctx) {
        // Glossy nose
        const noseGradient = ctx.createRadialGradient(-2, -18, 0, 0, -15, 8);
        noseGradient.addColorStop(0, '#FF1493');
        noseGradient.addColorStop(1, '#C71585');

        ctx.fillStyle = noseGradient;
        ctx.strokeStyle = '#8B0051';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, -15, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nose highlight
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(-2, -17, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, -8);
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(-8, -5, -10, -8);
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(8, -5, 10, -8);
        ctx.stroke();
    }

    drawBlush(ctx) {
        ctx.save();
        ctx.globalAlpha = this.blushIntensity;

        const blushGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        blushGradient.addColorStop(0, '#FF69B4');
        blushGradient.addColorStop(1, 'rgba(255, 105, 180, 0)');

        // Left blush
        ctx.fillStyle = blushGradient;
        ctx.beginPath();
        ctx.ellipse(-18, -25, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right blush
        ctx.beginPath();
        ctx.ellipse(18, -25, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawPoopingEffects(ctx) {
        // Stress lines
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const wobble = Math.sin(this.poopTimer / 50) * 2;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-50 + i * 10, -10 + wobble);
            ctx.lineTo(-45 + i * 10, -20 + wobble);
            ctx.stroke();
        }

        // Sweat drops
        const sweatPhase = Math.floor(this.poopTimer / 200) % 3;
        for (let i = 0; i < sweatPhase; i++) {
            ctx.fillStyle = '#B0E0E6';
            ctx.strokeStyle = '#4682B4';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(-30 + i * 15, -50 + i * 5, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    // State changes
    startPooping(callback) {
        this.state = 'pooping';
        this.isPooping = true;
        this.poopTimer = 0;
        this.poopCallback = callback;
    }

    finishPooping() {
        this.state = 'celebrating';
        this.isPooping = false;
        if (this.poopCallback) {
            this.poopCallback();
        }
        setTimeout(() => {
            this.state = 'idle';
        }, 1000);
    }

    celebrate() {
        this.state = 'celebrating';
        setTimeout(() => {
            this.state = 'idle';
        }, 1500);
    }

    adjustColor(color, amount) {
        const col = color.replace('#', '');
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}

// Grass element
class Grass extends AnimatedElement {
    constructor(x, y, level = 0) {
        super(x, y);
        this.level = level; // 0: sprout, 1: bush, 2: shrub, 3: sapling, 4: tree
        this.blades = [];
        this.flowers = [];
        this.berries = [];
        this.glowing = false;
        this.glowIntensity = 0;

        this.initializeForLevel();
    }

    initializeForLevel() {
        this.blades = [];
        this.flowers = [];
        this.berries = [];

        const bladeCount = [6, 20, 30, 40, 0][this.level];

        for (let i = 0; i < bladeCount; i++) {
            this.blades.push({
                x: Utils.random(-30, 30),
                height: Utils.random(10, 30),
                phase: Utils.random(0, Math.PI * 2),
                width: Utils.random(3, 6)
            });
        }

        // Flowers for bush
        if (this.level === 1) {
            for (let i = 0; i < 5; i++) {
                this.flowers.push({
                    x: Utils.random(-25, 25),
                    y: Utils.random(-20, -10),
                    color: Utils.randomChoice(['#FF69B4', '#FFD700', '#FF6347', '#FF69B4']),
                    rotation: Utils.random(0, Math.PI * 2),
                    phase: Utils.random(0, Math.PI * 2)
                });
            }
        }

        // Berries for shrub
        if (this.level === 2) {
            for (let i = 0; i < 10; i++) {
                this.berries.push({
                    x: Utils.random(-30, 30),
                    y: Utils.random(-30, -10),
                    color: Utils.randomChoice(['#FF0000', '#FFA500', '#FFD700']),
                    size: 0,
                    targetSize: Utils.random(4, 7),
                    growthProgress: i * 0.1
                });
            }
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update glow
        if (this.glowing) {
            this.glowIntensity = 0.5 + Math.sin(this.time / 200) * 0.5;
        } else {
            this.glowIntensity = 0;
        }

        // Update berry growth
        this.berries.forEach(berry => {
            if (berry.size < berry.targetSize) {
                berry.size = Math.min(berry.targetSize, berry.size + deltaTime / 1000);
            }
        });
    }

    draw(ctx) {
        if (this.level >= 4) return; // Tree is drawn separately

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        if (this.glowing) {
            Utils.addGlow(ctx, '#FFD700', 20 * this.glowIntensity);
        }

        // Draw blades
        this.blades.forEach((blade, i) => {
            this.drawBlade(ctx, blade, i);
        });

        // Draw flowers
        this.flowers.forEach(flower => {
            this.drawFlower(ctx, flower);
        });

        // Draw berries
        this.berries.forEach(berry => {
            this.drawBerry(ctx, berry);
        });

        Utils.removeGlow(ctx);
        ctx.restore();
    }

    drawBlade(ctx, blade, index) {
        ctx.save();
        ctx.translate(blade.x, 0);

        const windPhase = this.time / 1000 + blade.phase;
        const windOffset = Math.sin(windPhase) * 10;

        ctx.rotate(windOffset * 0.05);

        // Gradient from dark to light
        const gradient = ctx.createLinearGradient(0, 0, 0, -blade.height);
        gradient.addColorStop(0, '#228B22');
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, '#90EE90');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(-blade.width / 2, 0);
        ctx.quadraticCurveTo(-blade.width / 4, -blade.height / 2, 0, -blade.height);
        ctx.quadraticCurveTo(blade.width / 4, -blade.height / 2, blade.width / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sparkle at tip
        const sparkleOpacity = 0.3 + Math.sin(this.time / 500 + blade.phase) * 0.3;
        ctx.save();
        ctx.globalAlpha = sparkleOpacity;
        ctx.fillStyle = '#FFFF00';
        Utils.drawStar(ctx, 0, -blade.height, 3, 4, 0.5);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    drawFlower(ctx, flower) {
        ctx.save();
        ctx.translate(flower.x, flower.y);

        const openPhase = Math.sin(this.time / 1000 + flower.phase) * 0.2 + 0.8;
        ctx.scale(openPhase, openPhase);
        ctx.rotate(flower.rotation);

        // Petals
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);

            ctx.fillStyle = flower.color;
            ctx.strokeStyle = this.adjustColorBrightness(flower.color, -30);
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.ellipse(0, -6, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        // Center
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawBerry(ctx, berry) {
        if (berry.size === 0) return;

        ctx.save();
        ctx.translate(berry.x, berry.y);

        const gradient = ctx.createRadialGradient(-1, -1, 0, 0, 0, berry.size);
        gradient.addColorStop(0, berry.color);
        gradient.addColorStop(1, this.adjustColorBrightness(berry.color, -40));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, berry.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-berry.size * 0.3, -berry.size * 0.3, berry.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    adjustColorBrightness(color, amount) {
        const col = color.replace('#', '');
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    setGlowing(glowing) {
        this.glowing = glowing;
    }

    upgrade() {
        if (this.level < 4) {
            this.level++;
            this.initializeForLevel();
        }
    }
}

// Tree class - large animated tree with facial features
class Tree extends AnimatedElement {
    constructor(x, y) {
        super(x, y);
        this.baseY = y;
        this.breathePhase = 0;
        this.eyeBlinkTimer = 0;
        this.eyeBlinkInterval = Utils.random(4000, 7000);
        this.isBlinking = false;
        this.expression = 'happy'; // happy, surprised, sad
        this.camoPattern = null;
        this.camoTime = 0;
        this.fireflies = [];

        // Initialize fireflies
        for (let i = 0; i < 5; i++) {
            this.fireflies.push({
                angle: Utils.random(0, Math.PI * 2),
                speed: Utils.random(0.001, 0.003),
                distance: Utils.random(60, 90)
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.breathePhase += deltaTime / 2000;
        this.camoTime += deltaTime;

        // Eye blinking
        this.eyeBlinkTimer += deltaTime;
        if (this.eyeBlinkTimer >= this.eyeBlinkInterval) {
            this.isBlinking = true;
            this.eyeBlinkTimer = 0;
            this.eyeBlinkInterval = Utils.random(4000, 7000);
            setTimeout(() => this.isBlinking = false, 200);
        }

        // Update fireflies
        this.fireflies.forEach(fly => {
            fly.angle += fly.speed * deltaTime;
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Breathing motion
        const breathe = Math.sin(this.breathePhase) * 0.03;
        ctx.scale(1 + breathe, 1 - breathe * 0.5);

        // Shadow
        this.drawShadow(ctx);

        // Trunk
        this.drawTrunk(ctx);

        // Canopy
        this.drawCanopy(ctx);

        // Fireflies
        this.drawFireflies(ctx);

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 100, 60, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawTrunk(ctx) {
        // Trunk with BAPE camo pattern
        const trunkWidth = 40;
        const trunkHeight = 100;

        // Base trunk color
        const gradient = ctx.createLinearGradient(-trunkWidth/2, 0, trunkWidth/2, 0);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#8B4513');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;

        // Draw trunk
        ctx.beginPath();
        ctx.moveTo(-trunkWidth/2, 0);
        ctx.lineTo(-trunkWidth/2, -trunkHeight);
        ctx.quadraticCurveTo(-trunkWidth/3, -trunkHeight-10, 0, -trunkHeight-10);
        ctx.quadraticCurveTo(trunkWidth/3, -trunkHeight-10, trunkWidth/2, -trunkHeight);
        ctx.lineTo(trunkWidth/2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Camo pattern overlay
        if (!this.camoPattern) {
            this.camoPattern = Utils.generateCamoPattern(
                ctx,
                trunkWidth,
                trunkHeight,
                ['#6B4423', '#8B5A2B', '#A0714A', '#7D5A3F'],
                this.camoTime
            );
        }

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.drawImage(this.camoPattern, -trunkWidth/2, -trunkHeight);
        ctx.restore();

        // Face on trunk
        this.drawFace(ctx, 0, -trunkHeight/2);

        // Texture lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-trunkWidth/2 + 5, -20 - i * 15);
            ctx.quadraticCurveTo(0, -22 - i * 15, trunkWidth/2 - 5, -20 - i * 15);
            ctx.stroke();
        }
    }

    drawFace(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        const eyeHeight = this.isBlinking ? 2 : 10;

        // Eyes
        if (this.expression === 'happy') {
            this.drawHappyEyes(ctx, eyeHeight);
        } else if (this.expression === 'surprised') {
            this.drawSurprisedEyes(ctx);
        } else if (this.expression === 'sad') {
            this.drawSadEyes(ctx);
        }

        // Mouth
        this.drawMouth(ctx);

        ctx.restore();
    }

    drawHappyEyes(ctx, height) {
        // Heart-shaped eyes
        const eyeScale = height / 10;

        ctx.save();
        ctx.scale(eyeScale, eyeScale);

        // Left eye
        ctx.fillStyle = '#FF1493';
        Utils.drawHeart(ctx, -10, 0, 10);
        ctx.fill();

        // Right eye
        Utils.drawHeart(ctx, 10, 0, 10);
        ctx.fill();

        // Sparkles
        ctx.fillStyle = '#FFFF00';
        Utils.drawStar(ctx, -10, -3, 3, 4, 0.5);
        ctx.fill();
        Utils.drawStar(ctx, 10, -3, 3, 4, 0.5);
        ctx.fill();

        ctx.restore();
    }

    drawSurprisedEyes(ctx) {
        // Large circular eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(-10, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(10, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-10, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSadEyes(ctx) {
        // Downturned eyes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.quadraticCurveTo(-10, 5, -5, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.quadraticCurveTo(10, 5, 15, 0);
        ctx.stroke();
    }

    drawMouth(ctx) {
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        if (this.expression === 'happy') {
            // Smiling
            ctx.beginPath();
            ctx.moveTo(-12, 15);
            ctx.quadraticCurveTo(0, 25, 12, 15);
            ctx.stroke();
        } else if (this.expression === 'surprised') {
            // Open O
            ctx.beginPath();
            ctx.arc(0, 18, 8, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Sad frown
            ctx.beginPath();
            ctx.moveTo(-12, 20);
            ctx.quadraticCurveTo(0, 15, 12, 20);
            ctx.stroke();
        }
    }

    drawCanopy(ctx) {
        // Large fluffy cloud-shaped canopy
        const canopyY = -130;

        // Gradient from pink center to green edges
        const gradient = ctx.createRadialGradient(0, canopyY, 0, 0, canopyY, 100);
        gradient.addColorStop(0, '#FFB6D9');
        gradient.addColorStop(0.5, '#90EE90');
        gradient.addColorStop(1, '#32CD32');

        // Glow/rim lighting
        Utils.addGlow(ctx, '#FFFF00', 15);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;

        // Draw cloud shape with multiple circles
        ctx.beginPath();
        ctx.arc(-50, canopyY + 20, 40, 0, Math.PI * 2);
        ctx.arc(-20, canopyY - 10, 50, 0, Math.PI * 2);
        ctx.arc(20, canopyY - 10, 50, 0, Math.PI * 2);
        ctx.arc(50, canopyY + 20, 40, 0, Math.PI * 2);
        ctx.arc(0, canopyY + 30, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        Utils.removeGlow(ctx);

        // Inner details - lighter spots
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-30, canopyY - 5, 25, 0, Math.PI * 2);
        ctx.arc(25, canopyY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawFireflies(ctx) {
        this.fireflies.forEach(fly => {
            const x = Math.cos(fly.angle) * fly.distance;
            const y = -130 + Math.sin(fly.angle) * fly.distance * 0.5;

            const pulse = Math.sin(this.time / 200 + fly.angle) * 0.5 + 0.5;

            ctx.save();
            ctx.globalAlpha = pulse;
            Utils.addGlow(ctx, '#FFFF00', 10);
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            Utils.removeGlow(ctx);
            ctx.restore();
        });
    }
}

// Bird class - chibi style round bird
class Bird extends AnimatedElement {
    constructor(x, y) {
        super(x, y);
        this.targetX = x;
        this.targetY = y;
        this.baseY = y;
        this.state = 'perched'; // flying, perched
        this.color = Utils.randomChoice(['#4169E1', '#9370DB', '#FF69B4', '#00CED1']);
        this.wingPhase = 0;
        this.bobPhase = 0;
        this.lookDirection = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.wingPhase += deltaTime / 100;
        this.bobPhase += deltaTime / 500;

        if (this.state === 'perched') {
            // Bob up and down
            this.y = this.baseY + Math.sin(this.bobPhase) * 3;

            // Occasional head turns
            if (Math.random() < 0.01) {
                this.lookDirection = Utils.random(-0.3, 0.3);
            }
        } else if (this.state === 'flying') {
            // Move towards target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                this.x += (dx / dist) * 3;
                this.y += (dy / dist) * 3 + Math.sin(this.wingPhase) * 2;
                this.rotation = Math.atan2(dy, dx);
            } else {
                this.land();
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.state === 'flying') {
            ctx.rotate(this.rotation);
        }

        ctx.scale(this.scale, this.scale);

        // Shadow
        if (this.state === 'perched') {
            this.drawShadow(ctx);
        }

        // Body
        this.drawBody(ctx);

        // Wings
        this.drawWings(ctx);

        // Eyes
        this.drawEyes(ctx);

        // Beak
        this.drawBeak(ctx);

        // Accessories (star on head)
        this.drawAccessory(ctx);

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 25, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBody(ctx) {
        // Metallic sheen gradient
        const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, 20);
        gradient.addColorStop(0, this.adjustColorBrightness(this.color, 60));
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.adjustColorBrightness(this.color, -40));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Round body
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Belly
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glossy highlight
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-7, -7, 6, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawWings(ctx) {
        const wingFlap = this.state === 'flying' ?
            Math.sin(this.wingPhase * 3) * 0.5 :
            Math.sin(this.wingPhase) * 0.1;

        // Left wing
        ctx.save();
        ctx.translate(-10, 0);
        ctx.rotate(-0.3 - wingFlap);

        ctx.fillStyle = this.adjustColorBrightness(this.color, -20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Right wing
        ctx.save();
        ctx.translate(10, 0);
        ctx.rotate(0.3 + wingFlap);

        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawEyes(ctx) {
        ctx.save();
        ctx.rotate(this.lookDirection);

        // Large pearl eyes
        const eyeGradient = ctx.createRadialGradient(-1, -1, 0, 0, 0, 5);
        eyeGradient.addColorStop(0, '#FFFFFF');
        eyeGradient.addColorStop(1, '#E0E0E0');

        // Left eye
        ctx.fillStyle = eyeGradient;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-6, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right eye
        ctx.beginPath();
        ctx.arc(6, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-5, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-5.5, -6, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6.5, -6, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawBeak(ctx) {
        ctx.fillStyle = '#FFA500';
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(-2, 2);
        ctx.lineTo(2, 2);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawAccessory(ctx) {
        // Star on head
        ctx.save();
        const twinkle = 0.8 + Math.sin(this.time / 300) * 0.2;
        ctx.scale(twinkle, twinkle);

        Utils.addGlow(ctx, '#FFD700', 5);
        ctx.fillStyle = '#FFD700';
        Utils.drawStar(ctx, 0, -18, 5, 5, 0.5);
        ctx.fill();
        Utils.removeGlow(ctx);

        ctx.restore();
    }

    flyTo(x, y) {
        this.state = 'flying';
        this.targetX = x;
        this.targetY = y;
    }

    land() {
        this.state = 'perched';
        this.baseY = this.y;
        this.rotation = 0;
    }

    poop(callback) {
        // Trigger poop animation
        setTimeout(() => {
            if (callback) callback(this.x, this.y + 20);
        }, 500);
    }

    adjustColorBrightness(color, amount) {
        const col = color.replace('#', '');
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}

// Human character
class Human extends AnimatedElement {
    constructor(x, y) {
        super(x, y);
        this.mood = 'happy'; // happy, surprised, angry, rage
        this.outfit = Utils.randomChoice(['#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3']);
        this.hasAxe = false;
        this.isChopping = false;
        this.walkCycle = 0;
        this.state = 'idle'; // idle, walking, chopping
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.state === 'walking') {
            this.walkCycle += deltaTime / 100;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Shadow
        this.drawShadow(ctx);

        // Body
        this.drawBody(ctx);

        // Head
        this.drawHead(ctx);

        // Arms
        this.drawArms(ctx);

        // Legs
        this.drawLegs(ctx);

        // Hat
        this.drawHat(ctx);

        // Axe if has one
        if (this.hasAxe) {
            this.drawAxe(ctx);
        }

        // Emotion indicators
        this.drawEmotions(ctx);

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 60, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBody(ctx) {
        // Streetwear outfit
        const gradient = ctx.createLinearGradient(0, -10, 0, 30);
        gradient.addColorStop(0, this.outfit);
        gradient.addColorStop(1, this.adjustColorBrightness(this.outfit, -30));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        Utils.roundRect(ctx, -15, -10, 30, 40, 5);
        ctx.fill();
        ctx.stroke();

        // Logo pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NIGO', 0, 10);
    }

    drawHead(ctx) {
        // Round head
        ctx.fillStyle = '#FFD7B5';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, -25, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Face
        this.drawFace(ctx);
    }

    drawFace(ctx) {
        ctx.save();
        ctx.translate(0, -25);

        // Eyes based on mood
        ctx.fillStyle = '#000000';
        if (this.mood === 'angry' || this.mood === 'rage') {
            // Jagged angry eyes
            ctx.beginPath();
            ctx.moveTo(-8, -2);
            ctx.lineTo(-4, -5);
            ctx.lineTo(-4, -2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(8, -2);
            ctx.lineTo(4, -5);
            ctx.lineTo(4, -2);
            ctx.fill();
        } else if (this.mood === 'surprised') {
            // Wide eyes
            ctx.beginPath();
            ctx.arc(-5, -2, 3, 0, Math.PI * 2);
            ctx.arc(5, -2, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Happy dots
            ctx.beginPath();
            ctx.arc(-5, -2, 2, 0, Math.PI * 2);
            ctx.arc(5, -2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        if (this.mood === 'happy') {
            ctx.moveTo(-6, 4);
            ctx.quadraticCurveTo(0, 8, 6, 4);
        } else if (this.mood === 'surprised') {
            ctx.arc(0, 5, 4, 0, Math.PI * 2);
        } else {
            ctx.moveTo(-6, 8);
            ctx.quadraticCurveTo(0, 4, 6, 8);
        }
        ctx.stroke();

        ctx.restore();
    }

    drawHat(ctx) {
        // Baseball cap
        ctx.fillStyle = '#2C3E50';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Cap top
        ctx.beginPath();
        ctx.ellipse(0, -40, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bill
        ctx.beginPath();
        ctx.ellipse(8, -33, 10, 4, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawArms(ctx) {
        const armSwing = this.state === 'walking' ? Math.sin(this.walkCycle) * 0.3 : 0;

        // Left arm
        ctx.save();
        ctx.translate(-15, 0);
        ctx.rotate(armSwing);

        ctx.strokeStyle = this.outfit;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, 20);
        ctx.stroke();

        // Hand
        ctx.fillStyle = '#FFD7B5';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-5, 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(15, 0);
        ctx.rotate(-armSwing);

        ctx.strokeStyle = this.outfit;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(5, 20);
        ctx.stroke();

        // Hand
        ctx.fillStyle = '#FFD7B5';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(5, 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawLegs(ctx) {
        const legSwing = this.state === 'walking' ? Math.sin(this.walkCycle) * 0.2 : 0;

        // Left leg
        ctx.save();
        ctx.translate(-8, 30);
        ctx.rotate(legSwing);

        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 25);
        ctx.stroke();

        // Shoe
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 28, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(8, 30);
        ctx.rotate(-legSwing);

        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 25);
        ctx.stroke();

        // Shoe
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 28, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawAxe(ctx) {
        ctx.save();
        ctx.translate(20, -10);

        // Handle
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(5, 30);
        ctx.stroke();

        // Blade
        const bladeGradient = ctx.createLinearGradient(-5, -5, 5, 5);
        bladeGradient.addColorStop(0, '#E0E0E0');
        bladeGradient.addColorStop(0.5, '#FFFFFF');
        bladeGradient.addColorStop(1, '#C0C0C0');

        ctx.fillStyle = bladeGradient;
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-8, -15);
        ctx.lineTo(8, -15);
        ctx.lineTo(10, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shine
        Utils.addGlow(ctx, '#FFFFFF', 5);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -10);
        ctx.lineTo(2, -12);
        ctx.stroke();
        Utils.removeGlow(ctx);

        ctx.restore();
    }

    drawEmotions(ctx) {
        if (this.mood === 'surprised' || this.mood === 'angry') {
            // Exclamation marks
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.translate(15 + i * 12, -50 - i * 5);
                ctx.scale(1 + i * 0.2, 1 + i * 0.2);

                ctx.fillStyle = this.mood === 'angry' ? '#FF0000' : '#FFD700';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;

                // Exclamation line
                ctx.fillRect(-2, -10, 4, 12);
                ctx.strokeRect(-2, -10, 4, 12);

                // Dot
                ctx.beginPath();
                ctx.arc(0, 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        }

        if (this.mood === 'rage') {
            // Red aura and smoke
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(0, -20, 40 + Math.sin(this.time / 100) * 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    adjustColorBrightness(color, amount) {
        const col = color.replace('#', '');
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}

// Poop class
class Poop extends AnimatedElement {
    constructor(x, y, isGolden = false) {
        super(x, y);
        this.isGolden = isGolden;
        this.bouncePhase = 0;
        this.bouncing = true;
        this.bounceCount = 0;
        this.steamParticles = [];
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.bouncing && this.bounceCount < 2) {
            this.bouncePhase += deltaTime / 100;

            if (this.bouncePhase > Math.PI) {
                this.bounceCount++;
                this.bouncePhase = 0;
            }
        } else {
            this.bouncing = false;
        }

        // Generate steam
        if (Math.random() < 0.05) {
            this.steamParticles.push({
                x: Utils.random(-5, 5),
                y: -15,
                life: 1,
                speed: Utils.random(0.5, 1)
            });
        }

        // Update steam
        this.steamParticles.forEach(steam => {
            steam.y -= steam.speed;
            steam.life -= deltaTime / 2000;
        });

        this.steamParticles = this.steamParticles.filter(s => s.life > 0);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Bounce animation
        if (this.bouncing) {
            const bounce = Math.abs(Math.sin(this.bouncePhase)) * (10 - this.bounceCount * 5);
            ctx.translate(0, -bounce);

            // Squash and stretch
            const squash = 1 + Math.sin(this.bouncePhase) * 0.2;
            ctx.scale(1 / squash, squash);
        }

        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);

        // Shadow
        if (!this.bouncing) {
            this.drawShadow(ctx);
        }

        // Poop spiral
        this.drawPoopSpiral(ctx);

        // Steam
        this.drawSteam(ctx);

        // Stink cloud
        this.drawStinkCloud(ctx);

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawPoopSpiral(ctx) {
        const color = this.isGolden ? '#FFD700' : '#8B4513';
        const highlightColor = this.isGolden ? '#FFED4E' : '#A0522D';

        // Base spiral
        const gradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, 15);
        gradient.addColorStop(0, highlightColor);
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.isGolden ? '#DAA520' : '#654321';
        ctx.lineWidth = 2;

        // Bottom swirl
        ctx.beginPath();
        ctx.arc(0, 5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Middle swirl
        ctx.beginPath();
        ctx.arc(0, -2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Top swirl
        ctx.beginPath();
        ctx.arc(0, -8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shine if golden
        if (this.isGolden) {
            Utils.addGlow(ctx, '#FFFF00', 10);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(-4, -6, 3, 0, Math.PI * 2);
            ctx.fill();
            Utils.removeGlow(ctx);
        }
    }

    drawSteam(ctx) {
        this.steamParticles.forEach(steam => {
            ctx.save();
            ctx.globalAlpha = steam.life * 0.5;
            ctx.fillStyle = '#FFFFFF';

            ctx.beginPath();
            ctx.arc(steam.x, steam.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    drawStinkCloud(ctx) {
        const wobble = Math.sin(this.time / 200);

        for (let i = 0; i < 3; i++) {
            const offset = i * 15;
            const x = Math.sin((this.time + offset) / 500) * 10;
            const y = -20 - offset;
            const opacity = 0.4 - i * 0.1;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#9370DB';

            // Wavy cloud shape
            ctx.beginPath();
            for (let j = 0; j < 8; j++) {
                const angle = (j / 8) * Math.PI * 2;
                const wave = Math.sin(angle * 3 + this.time / 200) * 0.3 + 1;
                const radius = (8 - i * 2) * wave;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;

                if (j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }
}

// Toilet building
class Toilet extends AnimatedElement {
    constructor(x, y) {
        super(x, y);
        this.color = Utils.randomChoice(['#FFB6D9', '#B4E7CE', '#FFF4B8', '#DDA0DD']);
        this.doorOpen = false;
        this.doorPhase = 0;
        this.flagAngle = 0;
        this.windowGlow = 0;
        this.occupied = false;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Flag waving
        this.flagAngle = Math.sin(this.time / 300) * 0.3;

        // Window glow flicker
        if (this.occupied) {
            this.windowGlow = 0.5 + Math.random() * 0.5;
        } else {
            this.windowGlow = 0;
        }

        // Door animation
        if (this.doorOpen && this.doorPhase < 1) {
            this.doorPhase = Math.min(1, this.doorPhase + deltaTime / 300);
        } else if (!this.doorOpen && this.doorPhase > 0) {
            this.doorPhase = Math.max(0, this.doorPhase - deltaTime / 300);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Shadow
        this.drawShadow(ctx);

        // Building
        this.drawBuilding(ctx);

        // Roof
        this.drawRoof(ctx);

        // Windows
        this.drawWindows(ctx);

        // Door
        this.drawDoor(ctx);

        // Flag
        this.drawFlag(ctx);

        // Stars decoration
        this.drawStars(ctx);

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 80, 40, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBuilding(ctx) {
        // Main building body
        const gradient = ctx.createLinearGradient(-30, -60, 30, 0);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.adjustColorBrightness(this.color, -30));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        Utils.roundRect(ctx, -30, -60, 60, 60, 10);
        ctx.fill();
        ctx.stroke();

        // Decorative panels
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        Utils.roundRect(ctx, -25, -55, 50, 50, 8);
        ctx.stroke();
    }

    drawRoof(ctx) {
        // Roof
        const roofGradient = ctx.createLinearGradient(0, -75, 0, -60);
        roofGradient.addColorStop(0, '#FF6B6B');
        roofGradient.addColorStop(1, '#DC143C');

        ctx.fillStyle = roofGradient;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-40, -60);
        ctx.lineTo(0, -80);
        ctx.lineTo(40, -60);
        ctx.lineTo(30, -60);
        ctx.lineTo(0, -75);
        ctx.lineTo(-30, -60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawWindows(ctx) {
        // Left window
        this.drawWindow(ctx, -15, -40);

        // Right window
        this.drawWindow(ctx, 15, -40);
    }

    drawWindow(ctx, x, y) {
        ctx.save();

        // Window frame
        ctx.fillStyle = '#87CEEB';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        Utils.roundRect(ctx, x - 6, y - 6, 12, 12, 2);
        ctx.fill();
        ctx.stroke();

        // Glow if occupied
        if (this.windowGlow > 0) {
            ctx.save();
            ctx.globalAlpha = this.windowGlow;
            Utils.addGlow(ctx, '#FFFF00', 10);
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(x - 5, y - 5, 10, 10);
            Utils.removeGlow(ctx);
            ctx.restore();
        }

        // Window cross
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x, y + 6);
        ctx.moveTo(x - 6, y);
        ctx.lineTo(x + 6, y);
        ctx.stroke();

        ctx.restore();
    }

    drawDoor(ctx) {
        const doorWidth = 20;
        const doorHeight = 30;
        const doorX = -doorWidth / 2;
        const doorY = -doorHeight + 5;

        // Door
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.save();
        ctx.translate(doorX, doorY);

        // Door opens to the right
        if (this.doorPhase > 0) {
            ctx.save();
            ctx.translate(0, doorHeight / 2);
            ctx.scale(1 - this.doorPhase * 0.95, 1);
            ctx.translate(0, -doorHeight / 2);
        }

        Utils.roundRect(ctx, 0, 0, doorWidth, doorHeight, 3);
        ctx.fill();
        ctx.stroke();

        // Door knob
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(doorWidth - 5, doorHeight / 2, 2, 0, Math.PI * 2);
        ctx.fill();

        if (this.doorPhase > 0) {
            ctx.restore();

            // Show "in use" sign if door is open
            if (this.occupied) {
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('IN USE', doorWidth / 2, doorHeight / 2);
            }
        }

        ctx.restore();
    }

    drawFlag(ctx) {
        ctx.save();
        ctx.translate(0, -80);

        // Pole
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -15);
        ctx.stroke();

        // Flag
        ctx.save();
        ctx.translate(0, -15);
        ctx.rotate(this.flagAngle);

        ctx.fillStyle = '#FF1493';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(12, -3);
        ctx.lineTo(12, 3);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }

    drawStars(ctx) {
        // Rotating stars around the toilet
        for (let i = 0; i < 3; i++) {
            const angle = (this.time / 1000) + (i * Math.PI * 2 / 3);
            const x = Math.cos(angle) * 50;
            const y = -40 + Math.sin(angle) * 30;
            const phase = Math.sin(this.time / 200 + i);
            const size = 4 + phase * 2;

            ctx.save();
            ctx.globalAlpha = 0.6 + phase * 0.4;
            Utils.addGlow(ctx, '#FFD700', 5);
            ctx.fillStyle = '#FFD700';
            Utils.drawStar(ctx, x, y, size, 5, 0.5);
            ctx.fill();
            Utils.removeGlow(ctx);
            ctx.restore();
        }
    }

    adjustColorBrightness(color, amount) {
        const col = color.replace('#', '');
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}

// Cloud - background element
class Cloud extends AnimatedElement {
    constructor(x, y, size = 1) {
        super(x, y);
        this.size = size;
        this.baseY = y;
        this.speed = Utils.random(0.1, 0.3) * size;
        this.expression = Utils.randomChoice(['smile', 'bigSmile', 'content']);
        this.expressionTimer = 0;
        this.expressionInterval = Utils.random(3000, 5000);
        this.eyeBlinkTimer = 0;
        this.isBlinking = false;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Move horizontally
        this.x += this.speed * deltaTime / 16;

        // Breathing scale
        const breathe = Math.sin(this.time / 2000) * 0.05;
        this.scale = this.size * (0.95 + breathe);

        // Vertical drift
        this.y = this.baseY + Math.sin(this.time / 3000) * 10;

        // Change expression
        this.expressionTimer += deltaTime;
        if (this.expressionTimer >= this.expressionInterval) {
            this.expression = Utils.randomChoice(['smile', 'bigSmile', 'content']);
            this.expressionTimer = 0;
            this.expressionInterval = Utils.random(3000, 5000);
        }

        // Blinking
        this.eyeBlinkTimer += deltaTime;
        if (this.eyeBlinkTimer >= 3000) {
            this.isBlinking = true;
            this.eyeBlinkTimer = 0;
            setTimeout(() => this.isBlinking = false, 150);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Cloud body
        this.drawCloudBody(ctx);

        // Face
        this.drawFace(ctx);

        ctx.restore();
    }

    drawCloudBody(ctx) {
        const gradient = ctx.createRadialGradient(-10, -10, 0, 0, 0, 50);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.6, '#F0F0F0');
        gradient.addColorStop(1, '#D0D0D0');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 2;

        // Multiple overlapping circles for cloud shape
        ctx.beginPath();
        ctx.arc(-25, 5, 20, 0, Math.PI * 2);
        ctx.arc(-10, -10, 25, 0, Math.PI * 2);
        ctx.arc(10, -10, 25, 0, Math.PI * 2);
        ctx.arc(25, 5, 20, 0, Math.PI * 2);
        ctx.arc(0, 10, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    drawFace(ctx) {
        // Eyes
        const eyeHeight = this.isBlinking ? 2 : 6;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-10, -5, 4, eyeHeight, 0, 0, Math.PI * 2);
        ctx.ellipse(10, -5, 4, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        if (this.expression === 'smile') {
            ctx.moveTo(-8, 5);
            ctx.quadraticCurveTo(0, 10, 8, 5);
        } else if (this.expression === 'bigSmile') {
            ctx.moveTo(-12, 5);
            ctx.quadraticCurveTo(0, 15, 12, 5);
        } else {
            ctx.moveTo(-8, 8);
            ctx.quadraticCurveTo(0, 10, 8, 8);
        }
        ctx.stroke();
    }
}
