import * as PIXI from 'pixi.js';

export class HealthBar {
    private container: PIXI.Container;
    private bar: PIXI.Graphics;
    private outline: PIXI.Graphics;
    private maxWidth: number;
    private height: number;
    private currentHealth: number;
    private maxHealth: number;
    private shakeAnimation: number | null = null;

    constructor(maxHealth: number, width: number = 200, height: number = 20) {
        this.container = new PIXI.Container();
        this.maxWidth = width;
        this.height = height;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;

        // Create outline
        this.outline = new PIXI.Graphics();
        this.outline.lineStyle(2, 0xFFFFFF);
        this.outline.drawRect(0, 0, width, height);
        this.container.addChild(this.outline);

        // Create health bar
        this.bar = new PIXI.Graphics();
        this.updateBar();
        this.container.addChild(this.bar);
    }

    private updateBar(): void {
        this.bar.clear();
        this.bar.beginFill(0x00FF00);
        const width = (this.currentHealth / this.maxHealth) * this.maxWidth;
        this.bar.drawRect(0, 0, width, this.height);
        this.bar.endFill();
    }

    setHealth(health: number): void {
        const previousHealth = this.currentHealth;
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        this.updateBar();

        // If health decreased, trigger shake effect
        if (this.currentHealth < previousHealth) {
            this.triggerShakeEffect();
        }
    }

    private triggerShakeEffect(): void {
        // Cancel any existing shake animation
        if (this.shakeAnimation !== null) {
            cancelAnimationFrame(this.shakeAnimation);
        }

        const originalX = this.container.x;
        const originalY = this.container.y;
        let shakeTime = 0;
        const shakeDuration = 500; // 500ms
        const shakeIntensity = 5;

        const shake = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - shakeTime;
            
            if (elapsed < shakeDuration) {
                // Calculate shake offset using sine waves
                const offsetX = Math.sin(elapsed * 0.1) * shakeIntensity;
                const offsetY = Math.cos(elapsed * 0.15) * shakeIntensity;
                
                this.container.x = originalX + offsetX;
                this.container.y = originalY + offsetY;
                
                this.shakeAnimation = requestAnimationFrame(shake);
            } else {
                // Reset position
                this.container.x = originalX;
                this.container.y = originalY;
                this.shakeAnimation = null;
            }
        };

        shakeTime = Date.now();
        shake();
    }

    getContainer(): PIXI.Container {
        return this.container;
    }

    setPosition(x: number, y: number): void {
        this.container.x = x;
        this.container.y = y;
    }
} 