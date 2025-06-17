import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import { World } from './World';

export type DropType = 'health';

export class Drop {
    private graphics: PIXI.Graphics;
    private body: p2.Body;
    private type: DropType;
    private value: number;
    private world: World;
    private shape: p2.Circle;
    private lifetime: number = 10000; // 10 seconds
    private createdAt: number;

    constructor(x: number, y: number, type: DropType, value: number, world: World) {
        this.type = type;
        this.value = value;
        this.world = world;
        this.createdAt = Date.now();

        // Create graphics
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0x00ff00); // Green for health
        this.graphics.drawCircle(0, 0, 10);
        this.graphics.endFill();
        this.graphics.position.set(x, y);

        // Create physics body
        this.body = new p2.Body({
            mass: 0.1,
            position: [x, y],
            type: p2.Body.DYNAMIC
        });

        // Create shape
        this.shape = new p2.Circle({ radius: 10 });
        this.body.addShape(this.shape);

        // Add to world
        this.world.addBody(this.body);
    }

    update(): void {
        // Update graphics position
        this.graphics.position.set(this.body.position[0], this.body.position[1]);

        // Check if drop has expired
        if (Date.now() - this.createdAt > this.lifetime) {
            this.destroy();
        }
    }

    destroy(): void {
        this.world.removeBody(this.body);
    }

    getGraphics(): PIXI.Graphics {
        return this.graphics;
    }

    getBody(): p2.Body {
        return this.body;
    }

    getType(): DropType {
        return this.type;
    }

    getValue(): number {
        return this.value;
    }
} 