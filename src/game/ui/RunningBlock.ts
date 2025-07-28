import * as PIXI from 'pixi.js';

export class RunningBlock {
    private graphics: PIXI.Container;
    private block: PIXI.Graphics;
    private animationTime: number = 0;

    constructor(x: number, y: number) {
        this.graphics = new PIXI.Container();
        this.graphics.x = x;
        this.graphics.y = y;

        // Create the running block
        this.block = new PIXI.Graphics();
        this.block.beginFill(0x00ff00);
        this.block.drawRect(0, 0, 20, 20);
        this.block.endFill();
        
        this.graphics.addChild(this.block);
    }

    update(deltaTime: number): void {
        this.animationTime += deltaTime;
        
        // Make the block pulse
        const pulse = Math.sin(this.animationTime * 0.01) * 0.3 + 0.7;
        this.block.alpha = pulse;
        
        // Rotate the block slowly
        this.block.rotation += 0.02;
    }

    getGraphics(): PIXI.Container {
        return this.graphics;
    }

    setPosition(x: number, y: number): void {
        this.graphics.x = x;
        this.graphics.y = y;
    }
} 