import * as Matter from 'matter-js';

export class Player {

    constructor(engine) {
        this.engine = engine;

        // jump
        this.canJump = true;
        this.jumpRate = 1;

        // hover
        this.canHover = true;
        this.hoverRate = 1;
        this.hoverFuel = 50;
        this.hoverFuelCapacity = 100;
        this.hovering = false;

        // fire
        this.fireRate = 1;
        this.canFire = true;

        // graphics
        this.fillStyle = 'black';
        this.strokeStyle = 'white';
        this.radius = 50;

        // physics
        this.body = Matter.Bodies.circle(800, 0, this.radius, {
            inertia: Infinity,
            friction: 0.1,
            label: 'player',
            render: {
                fillStyle: this.fillStyle,
                strokeStyle: this.strokeStyle,
                lineWidth: 3,
                wireframes: false
            }
        });
    }
    up() {
        if (this.hoverFuel > 0) {
            Matter.Body.applyForce(this.body, {
                x: this.body.position.x,
                y: this.body.position.y
            }, { x: 0.00, y: -0.01 });

            this.hoverFuel -= 2;
            this.hovering = true;
        }
    }
    down() {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
        }, { x: 0.00, y: 0.01 })
    }
    left() {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
        }, { x: -0.02, y: 0 })
    }
    right() {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
        }, { x: 0.02, y: 0 })
    }
    jump() {
        if (this.canJump) {
            Matter.Body.applyForce(this.body, {
                x: this.body.position.x,
                y: this.body.position.y
            }, { x: 0.00, y: -0.5 })

            this.canJump = false;
            let restartTimer = function () {
                this.canJump = true;
            }.bind(this);
            setTimeout(restartTimer, this.jumpRate * 1000);
        }
    }
    fire() {
        if (this.canFire) {
            Matter.Composite.add(
                this.engine.world, [this.createBullet()]
            );
            this.canFire = false;
            let restartTimer = function () {
                this.canFire = true;
            }.bind(this);
            setTimeout(restartTimer, this.fireRate * 1000);
        }

    }
    createBullet() {
        let bullet = Matter.Bodies.circle(this.body.position.x, this.body.position.y + this.radius + 2, 20, {
            inertia: Infinity,
            friction: 0.1,
            label: 'bullet',
            render: {
                fillStyle: 'black',
                strokeStyle: 'black',
                wireframes: false
            }
        });
        return bullet;
    }
    update() {
        if (this.hoverFuel < this.hoverFuelCapacity) {
            this.hoverFuel++;
        }

        if (this.hoverFuel > 0) {
            this.body.render.fillStyle = this.fillStyle;
            this.body.render.strokeStyle = this.strokeStyle;
        } else {
            this.body.render.fillStyle = 'white';
            this.body.render.strokeStyle = 'black';
        }

        // console.log(`this.hoverFuel: ${this.hoverFuel}`);
    }
}