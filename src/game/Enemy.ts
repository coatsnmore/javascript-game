import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import { World } from './World';
import { Player } from './Player';

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

export class Enemy {
    private world: World;
    private size: number;
    private speed: number;
    private turnSpeed: number;
    private health: number;
    private graphics: PIXI.Container;
    private hull!: PIXI.Graphics;
    private engine!: PIXI.Graphics;
    public body: p2.Body;
    private shape!: p2.Box;
    private bullets: BulletConfig;
    private turnDirection: boolean;
    private adjustToPlayer: boolean;

    constructor(size: number, x: number, y: number, world: World) {
        this.world = world;
        this.size = size;
        this.speed = 100;
        this.turnSpeed = 1;
        this.health = 25; // Half of player's health
        this.bullets = {
            collection: [],
            speed: 50,
            max: 1,
            size: 5,
            rate: 1, // second(s)
            okayToFire: true
        };
        this.turnDirection = false;
        this.adjustToPlayer = false;

        this.graphics = this.createGraphics(x, y);
        this.body = this.createBody(x, y);

        // start adjustment update timer
        setInterval(() => {
            this.adjustToPlayer = true;
        }, 5000);
    }

    private createGraphics(x: number, y: number): PIXI.Container {
        const container = new PIXI.Container();

        const hull = new PIXI.Graphics();
        this.hull = hull;
        hull.beginFill(0xc93c2a);
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

        container.rotation = Math.PI;

        return container;
    }

    private createBody(x: number, y: number): p2.Body {
        const body = new p2.Body({
            mass: 0.1,
            angularVelocity: 0.6,
            damping: 0.8,
            angularDamping: 0,
            position: [x, y]
        });

        this.world.getBodies().enemies.push(body.id);

        const shape = new p2.Box({
            width: this.size,
            height: this.size
        });
        body.addShape(shape);
        this.shape = shape;
        return body;
    }

    private cleanupBullets(stage: PIXI.Container, world: World): void {
        // Remove all bullets from stage and world
        for (let j = this.bullets.collection.length - 1; j >= 0; j--) {
            const bullet = this.bullets.collection[j];
            if (bullet.graphics.parent) {
                bullet.graphics.parent.removeChild(bullet.graphics);
            }
            world.removeBody(bullet.body);
        }
        this.bullets.collection = [];
    }

    update(controls: ControlState, sceneWidth: number, sceneHeight: number, stage: PIXI.Container, world: World, player: Player): boolean {
        // Handle player bullet hits
        if (world.getBodies().collisions.enemies.includes(this.body.id)) {
            this.health -= 10; // Same damage as player takes
            console.log(`Enemy health: ${this.health}`);
            
            // Check if enemy is destroyed
            if (this.health <= 0) {
                console.log('Enemy destroyed!');
                // Clean up all bullets before returning
                this.cleanupBullets(stage, world);
                return false;
            }
        }

        // control enemy fire
        if (this.bullets.okayToFire) {
            this.fire(stage, world);
        }

        if (this.adjustToPlayer) {
            if (this.turnDirection) {
                this.body.angularVelocity = 1;
            } else {
                this.body.angularVelocity = -1;
            }
            this.turnDirection = !this.turnDirection;
            this.adjustToPlayer = false;
        }

        // warp on boundaries
        this.warp(sceneWidth, sceneHeight);

        // update graphics
        this.graphics.x = this.body.position[0];
        this.graphics.y = this.body.position[1];
        this.graphics.rotation = this.body.angle;

        // Debug: Log current collisions
        console.log('Current collisions:', world.getBodies().collisions.enemyBullets);
        console.log('Current bullets:', this.bullets.collection.map(b => b.body.id));

        // update bullets and remove collided bullets
        for (let j = this.bullets.collection.length - 1; j >= 0; j--) {
            const bullet = this.bullets.collection[j];
            const collisions = world.getBodies().collisions;
            
            // Check if bullet hit something (player or other enemy bullets)
            if (collisions.enemyBullets.includes(bullet.body.id) || 
                (collisions.player !== null && collisions.player === bullet.body.id)) {
                console.log('Removing bullet:', bullet.body.id);
                // Remove bullet from stage and world
                stage.removeChild(bullet.graphics);
                world.removeBody(bullet.body);
                this.bullets.collection.splice(j, 1);
                console.log('Bullet removed. Remaining bullets:', this.bullets.collection.length);
                continue;
            }

            // Update bullet position
            bullet.graphics.x = bullet.body.position[0];
            bullet.graphics.y = bullet.body.position[1];
        }

        return true;
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

        // Create bullet graphics
        bullet.graphics.beginFill(0xFF0000); // Red bullets for enemies
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

        // Set bullet velocity (inherit enemy velocity and add bullet speed)
        bullet.body.velocity[0] = this.body.velocity[0] + magnitude * Math.cos(angle);
        bullet.body.velocity[1] = this.body.velocity[1] + magnitude * Math.sin(angle);

        // Add to stage and world first
        stage.addChild(bullet.graphics);
        world.addBody(bullet.body);

        // Register bullet with world after adding to physics world
        world.getBodies().enemyBullets.push(bullet.body.id);

        this.bullets.collection.push(bullet);
        bullet.active = true;

        this.bullets.okayToFire = false;
        setTimeout(() => {
            this.bullets.okayToFire = true;
        }, this.bullets.rate * 1000);
    }

    getGraphics(): PIXI.Container {
        return this.graphics;
    }

    updateBoundaries(width: number, height: number): void {
        // Update enemy position if it's outside the new boundaries
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
} 