import * as Matter from 'matter-js';

export class Player {

    constructor() {
        this.canJump = true;
        this.jumpRate = 1;

        this.canHover = true;
        this.hoverRate = 1;
        this.hoverFuel = 50;
        this.hoverFuelCapacity = 100;
        this.hovering = false;

        this.fillStyle = 'black';
        this.strokeStyle = 'white';

        this.body = Matter.Bodies.circle(800, 0, 50, {
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
    fire() {
        // this.bullets.okayToFire = false;
        // let restartFire = function () {
        //     this.bullets.okayToFire = true;
        //     // console.log('itso kay to fire again');
        // }.bind(this);
        // setTimeout(restartFire, this.bullets.rate * 1000);
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

        console.log(`this.hoverFuel: ${this.hoverFuel}`);
    }
}