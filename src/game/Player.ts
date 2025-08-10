import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import { World } from './World';

interface Bullet {
    graphics: PIXI.Graphics;
    body: p2.Body;
    active: boolean;
}

interface BulletConfig {
    collection: Bullet[];
    speed: number;
    max: number;
    size: number;
    rate: number;
    okayToFire: boolean;
}

interface ControlState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
}

export class Player {
    private world: World;
    private size: number;
    private speed: number;
    private turnSpeed: number;
    private health: number;
    private graphics: PIXI.Container;
    private hull!: PIXI.Graphics;
    private engine!: PIXI.Graphics;
    private body: p2.Body;
    private shape!: p2.Box;
    private bullets: BulletConfig;
    private readonly MAX_HEALTH: number = 100;

    constructor(size: number, x: number, y: number, world: World) {
        this.world = world;
        this.size = size;
        this.speed = 20;
        this.turnSpeed = 0.5;
        this.health = this.MAX_HEALTH;
        this.bullets = {
            collection: [],
            speed: 50,
            max: 1,
            size: 5,
            rate: 1, // second(s)
            okayToFire: true
        };

        this.graphics = this.createGraphics(x, y);
        this.body = this.createBody(x, y);
    }

    getHealth(): number {
        return this.health;
    }

    private createGraphics(x: number, y: number): PIXI.Container {
        const container = new PIXI.Container();

        const hull = new PIXI.Graphics();
        this.hull = hull;
        hull.beginFill(0xBAC6D6);
        hull.moveTo(0, this.size);
        hull.lineTo(0, this.size * (2 / 3));
        hull.lineTo(this.size / 2, 0);
        hull.lineTo(this.size, this.size * (2 / 3));
        hull.lineTo(this.size, this.size);
        hull.lineTo(this.size * (2 / 3), this.size * (2 / 3));
        hull.lineTo(this.size * (1 / 3), this.size * (2 / 3));
        hull.endFill();
        container.addChildAt(hull, 0);

        const engine = new PIXI.Graphics();
        this.engine = engine;
        engine.beginFill(0xF7ED60);
        engine.moveTo(this.size * (1 / 3), this.size * (2 / 3));
        engine.lineTo(this.size * (2 / 3), this.size * (2 / 3));
        engine.lineTo(this.size * (1 / 2), this.size);
        engine.endFill();
        engine.alpha = 0;

        container.addChildAt(engine, 1);

        // position
        container.x = x;
        container.y = y;

        // adjust graphics center
        container.pivot.x = this.size / 2;
        container.pivot.y = this.size / 2;

        return container;
    }

    private createBody(x: number, y: number): p2.Body {
        const body = new p2.Body({
            mass: 0.1,
            angularVelocity: 0,
            damping: 0.8,
            angularDamping: 0,
            position: [x, y]
        });
        this.world.getBodies().player = body.id;

        const shape = new p2.Box({
            width: this.size,
            height: this.size
        });
        body.addShape(shape);
        this.shape = shape;
        return body;
    }

    update(controls: ControlState, sceneWidth: number, sceneHeight: number, stage: PIXI.Container, world: World): boolean {
        // handle player hit
        if (world.getBodies().collisions.player) {
            // Only take damage once per frame, regardless of number of collisions
            this.health -= 10;
            console.error(`player health: ${this.health}!!`);
            // Clear collisions after taking damage
            world.clearCollisions();
        }

        // test player death
        if (this.health <= 0) {
            console.error(`player died!!!`);
            return false;
        }

        // handle player fire
        if (controls.fire) {
            this.fire(stage, world);
        }

        // player angles
        if (controls.left) {
            this.body.angularVelocity = -1 * this.turnSpeed;
        } else if (controls.right) {
            this.body.angularVelocity = this.turnSpeed;
        } else {
            this.body.angularVelocity = 0;
        }

        // velocity
        if (controls.up) {
            const angle = this.body.angle + Math.PI / 2;
            this.body.force[0] -= this.speed * Math.cos(angle);
            this.body.force[1] -= this.speed * Math.sin(angle);
            this.engine.alpha = 1;
        } else {
            this.engine.alpha = 0;
        }

        // warp player on boundaries
        this.warp(sceneWidth, sceneHeight);

        // update player graphics
        this.graphics.x = this.body.position[0];
        this.graphics.y = this.body.position[1];
        this.graphics.rotation = this.body.angle;

        // update bullets graphics and remove collided bullets
        for (let j = this.bullets.collection.length - 1; j >= 0; j--) {
            const bullet = this.bullets.collection[j];
            
            // Check if bullet hit something
            if (world.getBodies().collisions.playerBullets.includes(bullet.body.id)) {
                // Remove bullet from stage and world
                stage.removeChild(bullet.graphics);
                world.removeBody(bullet.body);
                this.bullets.collection.splice(j, 1);
                continue;
            }

            // Update bullet position
            bullet.graphics.x = bullet.body.position[0];
            bullet.graphics.y = bullet.body.position[1];
        }

        return true;
    }

    getGraphics(): PIXI.Container {
        return this.graphics;
    }

    private warp(sceneWidth: number, sceneHeight: number): void {
        const x = this.body.position[0];
        const y = this.body.position[1];
        if (x < 0) {
            this.body.position[0] = sceneWidth;
        } else if (x > sceneWidth) {
            this.body.position[0] = 0;
        }

        if (y < 0) {
            this.body.position[1] = sceneHeight;
        } else if (y > sceneHeight) {
            this.body.position[1] = 0;
        }
    }

    fire(stage: PIXI.Container, world: World): void {
        if (!this.bullets.okayToFire) {
            return;
        }

        const magnitude = this.bullets.speed;
        const angle = this.body.angle - Math.PI / 2;

        const bullet: Bullet = {
            graphics: new PIXI.Graphics(),
            body: new p2.Body({
                mass: 0,
                damping: 0,
                angularDamping: 0
            }),
            active: false
        };

        // Register bullet with world
        world.getBodies().playerBullets.push(bullet.body.id);

        // Create bullet graphics
        bullet.graphics.beginFill(0xFFFFFF);
        bullet.graphics.drawCircle(0, 0, this.bullets.size);
        bullet.graphics.endFill();

        // Position bullet at the front of the ship
        const offset = this.size / 2; // Distance from center to front
        bullet.body.position[0] = this.body.position[0] + offset * Math.cos(angle);
        bullet.body.position[1] = this.body.position[1] + offset * Math.sin(angle);

        // Add bullet shape
        const shape = new p2.Circle({
            radius: this.bullets.size
        });
        bullet.body.addShape(shape);

        // Set bullet velocity (inherit player velocity and add bullet speed)
        bullet.body.velocity[0] = this.body.velocity[0] + magnitude * Math.cos(angle);
        bullet.body.velocity[1] = this.body.velocity[1] + magnitude * Math.sin(angle);

        stage.addChild(bullet.graphics);
        world.addBody(bullet.body);

        this.bullets.collection.push(bullet);
        bullet.active = true;

        this.bullets.okayToFire = false;
        setTimeout(() => {
            this.bullets.okayToFire = true;
        }, this.bullets.rate * 1000);
    }

    updateBoundaries(width: number, height: number): void {
        // Update player position if it's outside the new boundaries
        if (this.body.position[0] < 0) {
            this.body.position[0] = 0;
        } else if (this.body.position[0] > width) {
            this.body.position[0] = width;
        }

        if (this.body.position[1] < 0) {
            this.body.position[1] = 0;
        } else if (this.body.position[1] > height) {
            this.body.position[1] = height;
        }
    }

    heal(amount: number): void {
        this.health = Math.min(this.MAX_HEALTH, this.health + amount);
    }

    getBody(): p2.Body {
        return this.body;
    }
} 