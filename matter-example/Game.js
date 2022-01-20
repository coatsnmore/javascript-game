import * as Matter from 'matter-js';
import { Controls } from './Controls';
import { Player } from './Player'

export class Game {

    constructor() {

        this.engine = Matter.Engine.create();
        this.render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false // <-- important
            }
        });
        this.world = this.engine.world;
        this.player = new Player();
        this.controls = new Controls(this.engine, this.player);

        Matter.Events.on(this.engine, "beforeUpdate", event => {
            this.controls.handle();
            this.player.update();
        });

        Matter.Events.on(this.engine, 'collisionStart', function (event) {
            // We know there was a collision so fetch involved elements ...
            var aElm = document.getElementById(event.pairs[0].bodyA.elementId);
            var bElm = document.getElementById(event.pairs[0].bodyB.elementId);

            event.pairs.forEach(pair => {
                console.log(`collision between: ${pair.bodyA} and ${pair.bodyB}`);
                // if (pair.bodyA.id === this.player.body.id || pair.bodyB.id === this.player.body.id) {
                //     this.player.canJump = true;
                // }
            });
        });

        Matter.Composite.add(
            this.engine.world, this.createBoundaries()
        );

        Matter.Composite.add(
            this.engine.world, [this.player.body]
        );

        Matter.Composite.add(
            this.engine.world, this.createBodies()
        );
        Matter.Render.run(this.render);
        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, this.engine);

        // this.mouseControl();
    }

    createBodies() {
        let bodies = [];
        for (var i = 0; i < 50; i++) {
            bodies.push(this.createBody());
        }
        return bodies;
    }

    createBody() {
        let body = Matter.Bodies.circle(800, 0, 50, {
            // inertia: Infinity,
            friction: 0.1
        });
        return body;
    };

    mouseControl() {
        var mouse = Matter.Mouse.create(this.render.canvas),
            mouseConstraint = Matter.MouseConstraint.create(this.engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: true
                    }
                }
            });

        Matter.Composite.add(this.world, mouseConstraint);

        // keep the mouse in sync with rendering
        this.render.mouse = mouse;
    }

    createBoundaries() {

        let boundaries = [];

        const ground = Matter.Bodies.rectangle(0, window.innerHeight, window.innerWidth * 2, 60, {
            isStatic: true
        });
        const leftWall = Matter.Bodies.rectangle(0, window.innerHeight / 2, 60, window.innerHeight * 5, {
            isStatic: true
        });
        const rightWall = Matter.Bodies.rectangle(window.innerWidth - 10, window.innerHeight / 2, 100, window.innerHeight * 5, {
            isStatic: true
        });

        const platform = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight / 2, 500, 20, {
            isStatic: true
        });

        boundaries.push(ground, leftWall, rightWall, platform);

        return boundaries;
    }

}