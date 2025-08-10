import * as PIXI from 'pixi.js';

export class Timer {
    private graphics: PIXI.Container;
    private timerText: PIXI.Text;
    private startTime: number;
    private isRunning: boolean;

    constructor(x: number, y: number) {
        this.graphics = new PIXI.Container();
        this.graphics.x = x;
        this.graphics.y = y;
        
        this.startTime = Date.now();
        this.isRunning = true;

        // Create timer text
        this.timerText = new PIXI.Text('Time: 00:00', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 2
        });
        
        this.graphics.addChild(this.timerText);
    }

    update(): void {
        if (!this.isRunning) return;
        
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        this.timerText.text = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    pause(): void {
        this.isRunning = false;
    }

    resume(): void {
        this.isRunning = true;
    }

    reset(): void {
        this.startTime = Date.now();
        this.isRunning = true;
    }

    getGraphics(): PIXI.Container {
        return this.graphics;
    }

    setPosition(x: number, y: number): void {
        this.graphics.x = x;
        this.graphics.y = y;
    }

    getElapsedTime(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
} 