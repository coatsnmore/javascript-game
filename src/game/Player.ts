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
    private sceneWidth: number;
    private sceneHeight: number;
    private score: number;
    private rotationSpeed: number;
    private lastHitTime: number;
    private hitCooldown: number;

    constructor(x: number, y: number, sceneWidth: number, sceneHeight: number) {
        this.sceneWidth = sceneWidth;
        this.sceneHeight = sceneHeight;
        this.health = 100;
        this.score = 0;
        this.size = 30;
        this.speed = 200;
        this.rotationSpeed = 3;
        this.lastHitTime = 0;
        this.hitCooldown = 1000; // 1 second cooldown between hits

        // Create player body
        this.body = new p2.Body({
            mass: 1,
            damping: 0.5,
            angularDamping: 0.5
        });
        this.body.position[0] = x;
        this.body.position[1] = y;

        // Create player shape
        const shape = new p2.Box({
            width: this.size,
            height: this.size
        });
        this.body.addShape(shape);

        // Create player graphics
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0x00FF00);
        this.graphics.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
        this.graphics.endFill();

        // Initialize bullets
        this.bullets = {
            collection: [],
            speed: 400,
            size: 5,
            rate: 0.2,
            okayToFire: true
        };
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
        const collisions = world.getBodies().collisions;
        console.log('Player collisions:', collisions);
        
        // Handle enemy bullet hits
        if (collisions.player === this.body.id && collisions.enemyBullets.length > 0) {
            const currentTime = Date.now();
            if (currentTime - this.lastHitTime > this.hitCooldown) {
                this.health -= 10; // Take damage from enemy bullets
                this.lastHitTime = currentTime;
                console.log(`Player health: ${this.health}`);
            }
        }

        // control player fire
        if (controls.fire && this.bullets.okayToFire) {
            this.fire(stage, world);
        }

        // control player movement
        if (controls.up) {
            const angle = this.body.angle - Math.PI / 2;
            this.body.force[0] = Math.cos(angle) * this.speed;
            this.body.force[1] = Math.sin(angle) * this.speed;
        }
        if (controls.down) {
            const angle = this.body.angle - Math.PI / 2;
            this.body.force[0] = -Math.cos(angle) * this.speed;
            this.body.force[1] = -Math.sin(angle) * this.speed;
        }
        if (controls.left) {
            this.body.angularVelocity = -this.rotationSpeed;
        }
        if (controls.right) {
            this.body.angularVelocity = this.rotationSpeed;
        }

        // warp on boundaries
        this.warp(sceneWidth, sceneHeight);

        // update graphics
        this.graphics.x = this.body.position[0];
        this.graphics.y = this.body.position[1];
        this.graphics.rotation = this.body.angle;

        // update bullets and remove collided bullets
        for (let j = this.bullets.collection.length - 1; j >= 0; j--) {
            const bullet = this.bullets.collection[j];
            
            // Check if bullet hit anything
            if (collisions.playerBullets.includes(bullet.body.id)) {
                // Remove bullet from stage and world
                if (bullet.graphics.parent) {
                    bullet.graphics.parent.removeChild(bullet.graphics);
                }
                world.removeBody(bullet.body);
                this.bullets.collection.splice(j, 1);
                continue;
            }

            // Update bullet position
            bullet.graphics.x = bullet.body.position[0];
            bullet.graphics.y = bullet.body.position[1];
        }

        return this.health > 0;
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
        world.addBody(bullet.body, 'playerBullet');
        console.log('Fired player bullet:', bullet.body.id);

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
        world.addBody(bullet.body, 'playerBullet');

        this.bullets.collection.push(bullet);
        bullet.active = true;

        this.bullets.okayToFire = false;
        setTimeout(() => {
            this.bullets.okayToFire = true;
        }, this.bullets.rate * 1000);
    }
} 