import * as PIXI from 'pixi.js';

export class ImpactEffect {
    private container: PIXI.Container;
    private particles: PIXI.ParticleContainer;
    private particleTextures: PIXI.Texture[];
    private activeEffects: Set<number>;

    constructor() {
        this.container = new PIXI.Container();
        this.particles = new PIXI.ParticleContainer(100, {
            scale: true,
            position: true,
            rotation: true,
            alpha: true
        });
        this.container.addChild(this.particles);
        this.activeEffects = new Set();
        
        // Create particle textures
        this.particleTextures = this.createParticleTextures();
    }

    private createParticleTextures(): PIXI.Texture[] {
        const textures: PIXI.Texture[] = [];
        const renderer = PIXI.autoDetectRenderer({ width: 4, height: 4 });
        
        // Create different particle shapes
        const shapes = [
            () => {
                const graphics = new PIXI.Graphics();
                graphics.beginFill(0xFFFFFF);
                graphics.drawCircle(2, 2, 2);
                graphics.endFill();
                return graphics;
            },
            () => {
                const graphics = new PIXI.Graphics();
                graphics.beginFill(0xFFD700);
                graphics.drawCircle(2, 2, 1.5);
                graphics.endFill();
                return graphics;
            },
            () => {
                const graphics = new PIXI.Graphics();
                graphics.beginFill(0xFF4500);
                graphics.drawCircle(2, 2, 1);
                graphics.endFill();
                return graphics;
            }
        ];

        shapes.forEach(shape => {
            const graphics = shape();
            renderer.render(graphics);
            textures.push(renderer.generateTexture(graphics));
            graphics.destroy();
        });

        renderer.destroy();
        return textures;
    }

    createImpact(x: number, y: number, type: 'enemy' | 'player'): void {
        const effectId = Date.now();
        this.activeEffects.add(effectId);

        const particleCount = type === 'enemy' ? 8 : 12;
        const colors = type === 'enemy' ? [0xFF0000, 0xFF4500] : [0x00FF00, 0x00FFFF];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Sprite(
                this.particleTextures[Math.floor(Math.random() * this.particleTextures.length)]
            );
            
            // Set initial properties
            particle.x = x;
            particle.y = y;
            particle.alpha = 1;
            particle.scale.set(1);
            particle.tint = colors[Math.floor(Math.random() * colors.length)];
            
            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Add to particle container
            this.particles.addChild(particle);
            
            // Animate particle
            let frame = 0;
            const animate = () => {
                if (!this.activeEffects.has(effectId)) {
                    this.particles.removeChild(particle);
                    return;
                }

                frame++;
                particle.x += vx;
                particle.y += vy;
                particle.alpha -= 0.02;
                particle.scale.x -= 0.01;
                particle.scale.y -= 0.01;

                if (particle.alpha <= 0) {
                    this.particles.removeChild(particle);
                } else {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        }

        // Remove effect after duration
        setTimeout(() => {
            this.activeEffects.delete(effectId);
        }, 1000);
    }

    getContainer(): PIXI.Container {
        return this.container;
    }
} 