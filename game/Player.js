import * as PIXI from 'pixi.js';

export class Player {

    constructor(size, x, y, world) {
        this.world = world;
        this.size = size;
        this.graphics(x, y);
        this.body(x, y);
        this.world = world;
        this.speed = 20;
        this.turnSpeed = 0.5;
        this.bullets = {
            collection: [],
            speed: 50,
            max: 1,
            size: 5,
            rate: 1, // second(s)
            okayToFire: true
        };
        this.health = 50;
    }

    getHealth() {
        return this.health;
    }

    graphics(x, y) {
        this.graphics = new PIXI.Container();

        let hull = new PIXI.Graphics();
        this.hull = hull;
        hull.beginFill(0xBAC6D6);
        // player.graphics.lineStyle(5, 0xFF0000);
        hull.moveTo(0, this.size);
        hull.lineTo(0, this.size * (2 / 3));
        hull.lineTo(this.size / 2, 0);
        hull.lineTo(this.size, this.size * (2 / 3));
        hull.lineTo(this.size, this.size);
        hull.lineTo(this.size * (2 / 3), this.size * (2 / 3));
        hull.lineTo(this.size * (1 / 3), this.size * (2 / 3));
        hull.endFill();
        this.graphics.addChildAt(hull, 0);

        let engine = new PIXI.Graphics();
        this.engine = engine;
        engine.beginFill(0xF7ED60);
        // player.graphics.lineStyle(5, 0xFF0000);
        engine.moveTo(this.size * (1 / 3), this.size * (2 / 3));
        engine.lineTo(this.size * (2 / 3), this.size * (2 / 3));
        engine.lineTo(this.size * (1 / 2), this.size);
        engine.endFill();
        engine.alpha = 0;

        this.graphics.addChildAt(engine, 1);

        // position
        this.graphics.x = x;
        this.graphics.y = y;

        // adjust graphics center
        this.graphics.pivot.x = this.size / 2;
        this.graphics.pivot.y = this.size / 2;

        return this.graphics;
    }

    body(x, y) {
        this.body = new p2.Body({
            mass: 0.1,
            angularVelocity: 0,
            damping: 0.8,
            angularDamping: 0,
            position: [x, y]
        });
        this.world.getBodies().player = this.body.id;

        this.shape = new p2.Box({
            width: this.size,
            height: this.size
        });
        this.body.addShape(this.shape);
        return this.body;
    }

    update(controls, sceneWidth, sceneHeight, stage, world) {
        // basicContols(controls);

        // handle player hit
        if (world.getBodies().collisions.player) {
            this.health -= 10;
            console.error(`player health: ${this.health}!!`);
        }

        // test player death
        if (this.health <= 0) {
            console.error(`player died!!!`);
            return false;
            // do something like end game?
        }

        // handle player fire
        if (controls.fire) {
            this.fire(stage, world);
            // this.enemy.fire(this.stage, this.world);
        }

        // player angles
        if (controls.left) {
            this.body.angularVelocity = -1 * this.turnSpeed;
        } else if (controls.right) {
            this.body.angularVelocity = this.turnSpeed;
        } else {
            this.body.angularVelocity = 0;
        }

        // console.log('this.body.angularVelocity: ' + this.body.angularVelocity);

        // velocity
        if (controls.up) {
            let angle = this.body.angle + Math.PI / 2;
            // console.log('angle: ' + angle);
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

        // update bullets graphics
        for (var j = 0; j < this.bullets.collection.length; j++) {
            var bullet = this.bullets.collection[j];
            bullet.graphics.x = bullet.body.position[0];
            bullet.graphics.y = bullet.body.position[1];
        }

        return true;
    }

    getGraphics() {
        return this.graphics;
    }

    warp(sceneWidth, sceneHeight) {

        let x = this.body.position[0],
            y = this.body.position[1];
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

    /**
     * Basic Controls for testing.
     */
    basicContols(controls) {
        if (controls.left) {
            this.graphics.x--;
        } else if (controls.right) {
            this.graphics.x++;
        } else if (controls.up) {
            this.graphics.y--;
        } else if (controls.down) {
            this.graphics.y++;
        }
    }

    fire(stage, world) {
        if (!this.bullets.okayToFire) {
            return false;
        }
        var magnitude = this.speed * 1.5,
            angle = this.body.angle - Math.PI / 2;

        var bullet = {
            graphics: new PIXI.Graphics(),
            body: new p2.Body({
                mass: 0,
                damping: 0,
                angularDamping: 0
            }),
            active: false
        };

        this.world.getBodies().playerBullets.push(bullet.body.id);

        // adjust physics
        bullet.body.velocity[0] += magnitude * Math.cos(angle) + this.body.velocity[0];
        bullet.body.velocity[1] += magnitude * Math.sin(angle) + this.body.velocity[1];
        bullet.body.position[0] = (this.size / 2) * Math.cos(angle) + this.body.position[0];
        bullet.body.position[1] = (this.size / 2) * Math.sin(angle) + this.body.position[1];

        // Create bullet shape
        var bulletShape = new p2.Circle({
            radius: this.bullets.size
        });
        bullet.body.addShape(bulletShape);
        world.addBody(bullet.body);

        //graphics
        bullet.graphics.beginFill(0xFFFFFF);
        bullet.graphics.lineStyle(1, 0xFF0000);
        bullet.graphics.drawRect(0, 0, this.bullets.size, this.bullets.size);
        bullet.graphics.drawCircle(0, 0, this.bullets.size);
        bullet.graphics.endFill();
        stage.addChild(bullet.graphics);

        this.bullets.collection.push(bullet);

        // handle fire rate
        this.bullets.okayToFire = false;
        let restartFire = function () {
            this.bullets.okayToFire = true;
            // console.log('itso kay to fire again');
        }.bind(this);
        setTimeout(restartFire, this.bullets.rate * 1000);
    }
}

export default Player;