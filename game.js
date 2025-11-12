// Main game engine for Ecological Cycle Simulator

class EcologicalCycleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Canvas dimensions
        this.width = 1200;
        this.height = 800;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game state
        this.state = 'playing'; // playing, transition, resetting
        this.cycleCount = 0;
        this.milestone = 0;

        // Managers
        this.particleSystem = new ParticleSystem();
        this.animationManager = new AnimationManager();

        // Game elements
        this.dog = null;
        this.grass = null;
        this.tree = null;
        this.birds = [];
        this.human = null;
        this.poops = [];
        this.toilets = [];
        this.clouds = [];

        // Background elements
        this.skyGradient = null;
        this.skyColorPhase = 0;
        this.groundY = 600;

        // Game counters
        this.poopCount = 0;
        this.grassLevel = 0; // 0-4: sprout, bush, shrub, sapling, tree
        this.birdCount = 0;
        this.birdPoopCount = 0;

        // Timing
        this.lastTime = Date.now();
        this.deltaTime = 0;

        // Initialize
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }

    init() {
        // Initialize clouds
        for (let i = 0; i < 8; i++) {
            this.clouds.push(new Cloud(
                Utils.random(0, this.width),
                Utils.random(50, 200),
                Utils.random(0.5, 1.2)
            ));
        }

        // Initialize dog
        this.dog = new Dog(200, this.groundY - 50);

        // Initialize grass
        this.grass = new Grass(500, this.groundY);
        this.grassLevel = 0;

        // Initialize human (off-screen initially)
        this.human = new Human(-100, this.groundY - 60);

        // Generate continuous ambient particles
        this.startAmbientParticles();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    handleResize() {
        const rect = this.canvas.getBoundingClientRect();
        const scale = Math.min(
            window.innerWidth / this.width,
            window.innerHeight / this.height
        );

        this.canvas.style.width = `${this.width * scale}px`;
        this.canvas.style.height = `${this.height * scale}px`;
    }

    handleClick(e) {
        if (this.state !== 'playing') return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Ripple effect
        AnimationEffects.ripple(this.particleSystem, x, y);

        // Screen shake
        this.screenShake(2, 100);

        // Dog poop action
        if (!this.dog.isPooping && this.dog.state !== 'celebrating') {
            this.triggerDogPoop();
        }
    }

    triggerDogPoop() {
        // Dog walks to grass
        this.dog.state = 'walking';
        const walkDuration = 1000;

        // Animate dog to grass position
        this.animationManager.addTween(
            this.dog,
            'x',
            this.grass.x - 80,
            walkDuration,
            'easeInOutCubic',
            () => {
                // Start pooping animation
                this.dog.startPooping(() => {
                    this.createPoop();
                });
            }
        );
    }

    createPoop() {
        // Chance for golden poop (lucky bonus)
        const isGolden = Math.random() < 0.05;
        const poop = new Poop(this.grass.x - 60 + this.poopCount * 25, this.groundY - 10, isGolden);

        // Pop-in animation
        AnimationEffects.popIn(poop, this.animationManager);

        // Impact effect
        AnimationEffects.impact(this.particleSystem, poop.x, poop.y);

        this.poops.push(poop);
        this.poopCount++;

        // Check for grass upgrade
        if (this.poopCount >= 5) {
            this.upgradeGrass();
        } else {
            // Make grass glow to show progress
            this.grass.setGlowing(this.poopCount >= 4);
        }

        // Dog celebrates
        setTimeout(() => {
            if (this.dog) this.dog.celebrate();
        }, 500);
    }

    upgradeGrass() {
        this.grass.setGlowing(false);

        // Flash effect on all poops
        this.poops.forEach(poop => {
            AnimationEffects.pulse(poop, 1.3, 200);
        });

        // Wait then absorb poops
        setTimeout(() => {
            this.absorbPoops();
        }, 600);
    }

    absorbPoops() {
        // Animate poops flying to grass center
        this.poops.forEach((poop, index) => {
            setTimeout(() => {
                // Fly to center animation
                this.animationManager.addTween(poop, 'x', this.grass.x, 500, 'easeInOutCubic');
                this.animationManager.addTween(poop, 'y', this.grass.y - 50, 500, 'easeInOutCubic', () => {
                    // Fade out
                    this.animationManager.addTween(poop, 'opacity', 0, 200, 'linear', () => {
                        // Remove poop
                        const idx = this.poops.indexOf(poop);
                        if (idx > -1) this.poops.splice(idx, 1);
                    });
                });

                this.animationManager.addTween(poop, 'scale', 0.3, 500, 'easeInCubic');
            }, index * 100);
        });

        // After all poops are absorbed, show upgrade beam
        setTimeout(() => {
            this.showUpgradeBeam();
        }, this.poops.length * 100 + 600);
    }

    showUpgradeBeam() {
        // Upgrade beam effect
        const beamWidth = 100;
        const beamHeight = 300;

        let beamActive = true;
        const beamStart = Date.now();
        const beamDuration = 2000;

        const drawBeam = () => {
            if (!beamActive) {
                this.completeGrassUpgrade();
                return;
            }

            const elapsed = Date.now() - beamStart;
            if (elapsed >= beamDuration) {
                beamActive = false;
                return;
            }

            requestAnimationFrame(drawBeam);
        };

        drawBeam();

        // Particles burst
        this.particleSystem.emitBurst(this.grass.x, this.grass.y, 'star', 30, {
            maxLife: 2000,
            size: 15,
            speed: 5,
            gravity: -0.02,
            color: '#FFD700'
        });

        // Success burst
        AnimationEffects.successBurst(this.particleSystem, this.grass.x, this.grass.y - 100);
    }

    completeGrassUpgrade() {
        this.grassLevel++;
        this.poopCount = 0;

        if (this.grassLevel < 4) {
            // Upgrade grass
            this.grass.upgrade();

            // Scale animation
            this.grass.scale = 0.5;
            this.animationManager.addTween(this.grass, 'scale', 1, 800, 'easeOutElastic');
        } else {
            // Transform into tree
            this.transformToTree();
        }
    }

    transformToTree() {
        // Remove grass
        this.grass = null;

        // Create tree with pop-in animation
        this.tree = new Tree(500, this.groundY);
        this.tree.scale = 0;
        this.animationManager.addTween(this.tree, 'scale', 1, 1000, 'easeOutElastic', () => {
            // Start spawning birds after tree appears
            this.spawnBirds();
        });

        // Massive particle burst
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.particleSystem.emit(
                    this.tree.x + Utils.random(-50, 50),
                    this.tree.y - 100 + Utils.random(-50, 50),
                    Utils.randomChoice(['star', 'heart', 'sparkle']),
                    {
                        maxLife: Utils.random(1000, 2000),
                        size: Utils.random(10, 20),
                        vx: Utils.random(-3, 3),
                        vy: Utils.random(-5, 0),
                        gravity: 0.1,
                        color: Utils.randomChoice(['#FFD700', '#FF69B4', '#00FFFF', '#FF1493'])
                    }
                );
            }, i * 50);
        }
    }

    spawnBirds() {
        const birdInterval = setInterval(() => {
            if (this.birdCount >= 5) {
                clearInterval(birdInterval);
                this.triggerBirdCrisis();
                return;
            }

            // Bird flies in from off-screen
            const bird = new Bird(-100, Utils.random(100, 300));
            bird.flyTo(
                this.tree.x + Utils.random(-60, 60),
                this.tree.y - 130 + Utils.random(-20, 20)
            );

            // Rainbow trail
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const hue = (i / 20) * 360;
                    const rgb = Utils.hslToRgb(hue / 360, 1, 0.5);
                    const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

                    this.particleSystem.emit(bird.x, bird.y, 'sparkle', {
                        maxLife: 500,
                        size: 5,
                        vx: Utils.random(-1, 1),
                        vy: Utils.random(-1, 1),
                        color: color
                    });
                }, i * 50);
            }

            this.birds.push(bird);
            this.birdCount++;
        }, 1500);
    }

    triggerBirdCrisis() {
        // Change tree expression
        if (this.tree) {
            this.tree.expression = 'surprised';
        }

        // Darken sky
        this.skyColorPhase = -1;

        // More birds fly in rapidly
        const extraBirds = 15;
        for (let i = 0; i < extraBirds; i++) {
            setTimeout(() => {
                const bird = new Bird(
                    Utils.randomChoice([
                        -100,
                        this.width + 100,
                        Utils.random(0, this.width)
                    ]),
                    -100
                );

                bird.flyTo(
                    this.tree.x + Utils.random(-100, 100),
                    this.tree.y - 130 + Utils.random(-40, 40)
                );

                this.birds.push(bird);
            }, i * 200);
        }

        // After all birds arrive, start pooping
        setTimeout(() => {
            this.startBirdPooping();
        }, extraBirds * 200 + 1000);
    }

    startBirdPooping() {
        // Birds poop continuously
        const poopInterval = setInterval(() => {
            if (this.human && this.human.mood === 'rage') {
                clearInterval(poopInterval);
                return;
            }

            // Random bird poops
            this.birds.forEach(bird => {
                if (Math.random() < 0.3) {
                    // Bird dropping falls
                    this.particleSystem.emit(
                        bird.x,
                        bird.y + 20,
                        'stink',
                        {
                            maxLife: 2000,
                            size: 8,
                            vy: 3,
                            gravity: 0.2,
                            color: 'rgba(255, 255, 255, 0.9)'
                        }
                    );

                    // Check if it hits the human
                    if (this.human && !this.human.hasAxe) {
                        const dist = Math.abs(bird.x - this.human.x);
                        if (dist < 50) {
                            this.hitHuman();
                        }
                    }
                }
            });

            this.birdPoopCount++;

            // Spawn human after some bird poop
            if (this.birdPoopCount === 3 && !this.human.x || this.human.x < 0) {
                this.spawnHuman();
            }
        }, 500);
    }

    spawnHuman() {
        // Human walks in from left
        this.human.x = -100;
        this.human.y = this.groundY - 60;
        this.human.mood = 'happy';
        this.human.state = 'walking';

        this.animationManager.addTween(
            this.human,
            'x',
            300,
            2000,
            'linear',
            () => {
                this.human.state = 'idle';
            }
        );
    }

    hitHuman() {
        // Screen shake
        this.screenShake(3, 200);

        // Human reaction
        if (this.human.mood === 'happy') {
            this.human.mood = 'surprised';

            // Exclamation particles
            for (let i = 0; i < 3; i++) {
                this.particleSystem.emit(
                    this.human.x + 20,
                    this.human.y - 50 - i * 10,
                    'exclamation',
                    {
                        maxLife: 1000,
                        size: 10 + i * 3,
                        vy: -1,
                        color: '#FFD700'
                    }
                );
            }

            // Hit animation
            AnimationEffects.pulse(this.human, 1.2, 200);

        } else if (this.human.mood === 'surprised') {
            this.human.mood = 'angry';

            // More exclamations
            for (let i = 0; i < 3; i++) {
                this.particleSystem.emit(
                    this.human.x + 20 + i * 15,
                    this.human.y - 50 - i * 10,
                    'exclamation',
                    {
                        maxLife: 1000,
                        size: 12 + i * 4,
                        vy: -2,
                        color: '#FF0000'
                    }
                );
            }

        } else if (this.human.mood === 'angry') {
            this.human.mood = 'rage';

            // Pull out axe
            this.human.hasAxe = true;

            // Bling effect on axe
            AnimationEffects.impact(this.particleSystem, this.human.x + 20, this.human.y - 10);

            // Chop down tree
            setTimeout(() => {
                this.chopTree();
            }, 1000);
        }
    }

    chopTree() {
        if (!this.tree) return;

        // Human walks to tree
        this.human.state = 'walking';
        this.animationManager.addTween(
            this.human,
            'x',
            this.tree.x - 100,
            1500,
            'linear',
            () => {
                this.human.state = 'chopping';
                this.performChop();
            }
        );
    }

    performChop() {
        // Tree reacts
        if (this.tree) {
            this.tree.expression = 'surprised';

            // Chopping animation with shake
            let chopCount = 0;
            const chopInterval = setInterval(() => {
                if (chopCount >= 5) {
                    clearInterval(chopInterval);
                    this.fellTree();
                    return;
                }

                // Impact on tree
                AnimationEffects.shake(this.tree, 10, 300);
                AnimationEffects.impact(
                    this.particleSystem,
                    this.tree.x - 20,
                    this.tree.y - 50
                );

                // Wood chips
                for (let i = 0; i < 5; i++) {
                    this.particleSystem.emit(
                        this.tree.x - 20,
                        this.tree.y - 50,
                        'confetti',
                        {
                            maxLife: 1000,
                            size: Utils.random(5, 10),
                            vx: Utils.random(-3, 3),
                            vy: Utils.random(-4, -1),
                            gravity: 0.2,
                            rotation: Utils.random(0, Math.PI * 2),
                            rotationSpeed: Utils.random(-0.2, 0.2),
                            color: '#8B4513'
                        }
                    );
                }

                chopCount++;
            }, 500);
        }
    }

    fellTree() {
        if (!this.tree) return;

        // Tree falls
        this.tree.expression = 'sad';

        // Birds fly away
        this.birds.forEach(bird => {
            bird.flyTo(
                Utils.randomChoice([-200, this.width + 200]),
                Utils.random(-100, 200)
            );
        });

        // Tree tilts and falls
        this.animationManager.addTween(this.tree, 'rotation', Math.PI / 2, 1500, 'easeInCubic');
        this.animationManager.addTween(this.tree, 'y', this.tree.y + 100, 1500, 'easeInCubic');
        this.animationManager.addTween(this.tree, 'opacity', 0, 1500, 'linear', () => {
            // Remove tree
            this.tree = null;

            // Build toilet
            this.buildToilet();
        });

        // Ground shake
        setTimeout(() => {
            this.screenShake(15, 500);

            // Dust clouds
            for (let i = 0; i < 10; i++) {
                this.particleSystem.emit(
                    this.width / 2 + Utils.random(-100, 100),
                    this.groundY,
                    'stink',
                    {
                        maxLife: 2000,
                        size: Utils.random(20, 40),
                        vx: Utils.random(-2, 2),
                        vy: Utils.random(-3, -1),
                        color: 'rgba(200, 200, 200, 0.6)'
                    }
                );
            }
        }, 1500);
    }

    buildToilet() {
        // Create toilet with construction animation
        const toilet = new Toilet(500 + this.toilets.length * 100, this.groundY);

        // Blueprint appearance
        toilet.opacity = 0;
        this.animationManager.addTween(toilet, 'opacity', 1, 500, 'linear');

        // Build from bottom to top
        toilet.scale = 0;
        this.animationManager.addTween(toilet, 'scale', 1, 1000, 'easeOutBounce', () => {
            // Spin and flash
            const originalRotation = toilet.rotation;
            this.animationManager.addTween(toilet, 'rotation', originalRotation + Math.PI * 2, 500, 'easeOutCubic', () => {
                toilet.rotation = 0;

                // Door opens
                toilet.doorOpen = true;
                toilet.occupied = true;

                // Reset for next cycle
                setTimeout(() => {
                    this.resetCycle();
                }, 2000);
            });
        });

        this.toilets.push(toilet);

        // Construction particles
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.particleSystem.emit(
                    toilet.x + Utils.random(-40, 40),
                    toilet.y + Utils.random(-60, 0),
                    'sparkle',
                    {
                        maxLife: 800,
                        size: Utils.random(5, 15),
                        vx: Utils.random(-2, 2),
                        vy: Utils.random(-3, 0),
                        color: Utils.randomChoice(['#FFD700', '#00FFFF', '#FF69B4'])
                    }
                );
            }, i * 30);
        }
    }

    resetCycle() {
        this.state = 'resetting';
        this.cycleCount++;

        // Fade out elements
        if (this.dog) {
            this.animationManager.addTween(this.dog, 'opacity', 0, 1000, 'linear');
        }

        if (this.human) {
            this.animationManager.addTween(this.human, 'opacity', 0, 1000, 'linear');
        }

        this.birds.forEach(bird => {
            this.animationManager.addTween(bird, 'opacity', 0, 1000, 'linear');
        });

        // Refresh scene
        setTimeout(() => {
            // Clear birds
            this.birds = [];
            this.birdCount = 0;
            this.birdPoopCount = 0;

            // Reset dog
            this.dog = new Dog(200, this.groundY - 50);

            // Reset grass
            this.grass = new Grass(500, this.groundY);
            this.grassLevel = 0;
            this.poopCount = 0;

            // New human with different outfit
            this.human = new Human(-100, this.groundY - 60);
            this.human.mood = 'happy';

            // Walk in with dog
            this.animationManager.addTween(this.human, 'x', 100, 2000, 'linear');

            // Reset sky
            this.skyColorPhase = 0;

            this.state = 'playing';

            // Milestone effects
            this.checkMilestone();
        }, 1500);

        // Confetti if milestone
        if (this.cycleCount % 10 === 0) {
            for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                    this.particleSystem.emit(
                        Utils.random(0, this.width),
                        -50,
                        'confetti',
                        {
                            maxLife: 3000,
                            size: Utils.random(5, 15),
                            vx: Utils.random(-3, 3),
                            vy: Utils.random(1, 5),
                            gravity: 0.1,
                            rotation: Utils.random(0, Math.PI * 2),
                            rotationSpeed: Utils.random(-0.3, 0.3),
                            color: Utils.randomChoice([
                                '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
                                '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
                            ])
                        }
                    );
                }, i * 30);
            }
        }
    }

    checkMilestone() {
        if (this.cycleCount === 10) {
            // Rainbow sweep
            AnimationEffects.rainbowSweep(this.ctx, this.width, this.height, 2000);
        } else if (this.cycleCount === 20) {
            // Fireworks
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const x = Utils.random(200, this.width - 200);
                    const y = Utils.random(200, 400);

                    // Firework burst
                    this.particleSystem.emitBurst(x, y, 'star', 30, {
                        maxLife: 2000,
                        size: 15,
                        speed: 8,
                        gravity: 0.1,
                        color: Utils.randomChoice(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'])
                    });
                }, i * 500);
            }
        } else if (this.cycleCount === 50) {
            // Screen flash
            AnimationEffects.screenFlash(this.ctx, this.width, this.height, 'white', 200);

            // Mega confetti
            for (let i = 0; i < 200; i++) {
                this.particleSystem.emit(
                    Utils.random(0, this.width),
                    Utils.random(0, this.height),
                    Utils.randomChoice(['star', 'heart', 'confetti']),
                    {
                        maxLife: 3000,
                        size: Utils.random(10, 25),
                        vx: Utils.random(-5, 5),
                        vy: Utils.random(-5, 5),
                        gravity: 0.15,
                        color: Utils.randomChoice([
                            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
                            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
                        ])
                    }
                );
            }
        }
    }

    startAmbientParticles() {
        // Continuous star generation
        setInterval(() => {
            this.particleSystem.emit(
                Utils.random(0, this.width),
                Utils.random(0, this.height),
                'star',
                {
                    maxLife: 3000,
                    size: Utils.random(3, 8),
                    vy: Utils.random(-0.5, -0.2),
                    vx: Utils.random(-0.2, 0.2),
                    color: Utils.randomChoice(['#FFD700', '#FF69B4', '#00FFFF', '#90EE90', '#DDA0DD']),
                    rotationSpeed: Utils.random(-0.1, 0.1)
                }
            );
        }, 2000);

        // Hearts from bottom
        setInterval(() => {
            this.particleSystem.emit(
                Utils.random(0, this.width),
                this.height + 50,
                'heart',
                {
                    maxLife: 4000,
                    size: Utils.random(10, 20),
                    vy: -1,
                    swingAmplitude: Utils.random(1, 3),
                    swingFrequency: Utils.random(1, 2),
                    color: Utils.randomChoice(['#FF69B4', '#FF1493', '#FFB6C1']),
                    scaleOscillate: true
                }
            );
        }, 3000);

        // Musical notes
        setInterval(() => {
            this.particleSystem.emit(
                Utils.random(0, this.width),
                Utils.random(100, this.height - 100),
                'musicNote',
                {
                    maxLife: 2000,
                    size: Utils.random(8, 15),
                    vy: Utils.random(-1, 1),
                    vx: Utils.random(-0.5, 0.5),
                    color: Utils.randomChoice(['#000000', '#FF00FF', '#00FFFF']),
                    scaleOscillate: true
                }
            );
        }, 4000);
    }

    screenShake(intensity, duration) {
        const startTime = Date.now();
        let shaking = true;

        const shake = () => {
            if (!shaking) {
                this.canvas.style.transform = 'translate(0, 0)';
                return;
            }

            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                shaking = false;
                this.canvas.style.transform = 'translate(0, 0)';
                return;
            }

            const remaining = 1 - (elapsed / duration);
            const currentIntensity = intensity * remaining;

            const x = Utils.random(-currentIntensity, currentIntensity);
            const y = Utils.random(-currentIntensity, currentIntensity);

            this.canvas.style.transform = `translate(${x}px, ${y}px)`;

            requestAnimationFrame(shake);
        };

        shake();
    }

    update(deltaTime) {
        // Update all game elements
        if (this.dog) this.dog.update(deltaTime);
        if (this.grass) this.grass.update(deltaTime);
        if (this.tree) this.tree.update(deltaTime);
        if (this.human) this.human.update(deltaTime);

        this.birds.forEach(bird => bird.update(deltaTime));
        this.poops.forEach(poop => poop.update(deltaTime));
        this.toilets.forEach(toilet => toilet.update(deltaTime));
        this.clouds.forEach(cloud => {
            cloud.update(deltaTime);
            // Wrap clouds around screen
            if (cloud.x > this.width + 100) {
                cloud.x = -100;
                cloud.baseY = Utils.random(50, 200);
            }
        });

        // Update particle system
        this.particleSystem.update(deltaTime);

        // Update animation manager
        this.animationManager.update(deltaTime);

        // Update sky color
        this.skyColorPhase += deltaTime / 10000;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw sky with gradient
        this.drawSky();

        // Draw clouds (back layer)
        this.clouds.filter((c, i) => i < 4).forEach(cloud => cloud.draw(this.ctx));

        // Draw ground
        this.drawGround();

        // Draw clouds (mid layer)
        this.clouds.filter((c, i) => i >= 4).forEach(cloud => cloud.draw(this.ctx));

        // Draw toilets
        this.toilets.forEach(toilet => toilet.draw(this.ctx));

        // Draw grass/tree
        if (this.grass) this.grass.draw(this.ctx);
        if (this.tree) this.tree.draw(this.ctx);

        // Draw poops
        this.poops.forEach(poop => poop.draw(this.ctx));

        // Draw human
        if (this.human) this.human.draw(this.ctx);

        // Draw dog
        if (this.dog) this.dog.draw(this.ctx);

        // Draw birds
        this.birds.forEach(bird => bird.draw(this.ctx));

        // Draw particles (foreground)
        this.particleSystem.draw(this.ctx);
    }

    drawSky() {
        // Dynamic gradient that shifts colors
        const colors = [
            ['#8ED6FF', '#D6EAFF'],  // Mint blue to light purple
            ['#FFD4E5', '#FFF0E5'],  // Peach pink to orange
            ['#FFFACD', '#E0FFE0']   // Lemon yellow to green
        ];

        let colorIndex = Math.floor(this.skyColorPhase) % colors.length;
        if (this.skyColorPhase < 0) {
            // Crisis mode - dark blue purple
            this.skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            this.skyGradient.addColorStop(0, '#1a1a3e');
            this.skyGradient.addColorStop(1, '#2d1b4e');
        } else {
            const nextIndex = (colorIndex + 1) % colors.length;
            const progress = this.skyColorPhase % 1;

            // Interpolate between color sets
            const startColor = colors[colorIndex];
            const endColor = colors[nextIndex];

            this.skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);

            // Blend colors
            this.skyGradient.addColorStop(0, startColor[0]);
            this.skyGradient.addColorStop(1, startColor[1]);
        }

        this.ctx.fillStyle = this.skyGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGround() {
        // Sidewalk
        const sidewalkGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
        sidewalkGradient.addColorStop(0, '#CCCCCC');
        sidewalkGradient.addColorStop(1, '#999999');

        this.ctx.fillStyle = sidewalkGradient;
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // Sidewalk lines
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.groundY);
            this.ctx.lineTo(i, this.height);
            this.ctx.stroke();
        }

        // Soil/grass strip
        const soilGradient = this.ctx.createLinearGradient(0, this.groundY - 100, 0, this.groundY);
        soilGradient.addColorStop(0, '#8B7355');
        soilGradient.addColorStop(1, '#654321');

        this.ctx.fillStyle = soilGradient;
        this.ctx.fillRect(0, this.groundY - 100, this.width, 100);

        // Pebbles
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % this.width; // Pseudo-random but consistent
            const y = this.groundY - ((i * 73) % 80) - 10;
            const size = ((i * 47) % 5) + 1;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    gameLoop() {
        const currentTime = Date.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        if (this.deltaTime > 100) this.deltaTime = 100;

        this.update(this.deltaTime);
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new EcologicalCycleGame();
});
