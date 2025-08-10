import * as PIXI from 'pixi.js';

export class FuelBar {
    private container: PIXI.Container;
    private bar: PIXI.Graphics;
    private outline: PIXI.Graphics;
    private maxWidth: number;
    private height: number;
    private currentFuel: number;
    private maxFuel: number;

    constructor(maxFuel: number, width: number = 200, height: number = 20) {
        this.container = new PIXI.Container();
        this.maxWidth = width;
        this.height = height;
        this.maxFuel = maxFuel;
        this.currentFuel = maxFuel;

        // Create outline
        this.outline = new PIXI.Graphics();
        this.outline.lineStyle(2, 0xFFFFFF);
        this.outline.drawRect(0, 0, width, height);
        this.container.addChild(this.outline);

        // Create fuel bar
        this.bar = new PIXI.Graphics();
        this.updateBar();
        this.container.addChild(this.bar);
    }

    private updateBar(): void {
        this.bar.clear();
        this.bar.beginFill(0x808080); // Grey color
        const width = (this.currentFuel / this.maxFuel) * this.maxWidth;
        this.bar.drawRect(0, 0, width, this.height);
        this.bar.endFill();
    }

    setFuel(fuel: number): void {
        this.currentFuel = Math.max(0, Math.min(fuel, this.maxFuel));
        this.updateBar();
    }

    getContainer(): PIXI.Container {
        return this.container;
    }

    setPosition(x: number, y: number): void {
        this.container.x = x;
        this.container.y = y;
    }
} 