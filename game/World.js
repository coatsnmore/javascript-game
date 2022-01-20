class World {
    constructor(fps) {
        this.fps = fps || 60;
        this.world = new p2.World({
            gravity: [0, 0]
        });
        this.detectCollisions();
    }

    getBodies() {
        return this.bodies;
    }

    clearCollisions() {
        this.bodies.collisions = {
            player: null,
            playerBullets: [],
            enemies: [],
            enemyBullets: [],
        }
    }

    detectCollisions() {
        this.bodies = {
            player: 1,
            playerBullets: [],
            enemies: [],
            enemyBullets: [],
            collisions: {
                player: null,
                playerBullets: [],
                enemies: [],
                enemyBullets: [],
            }
        };

        this.world.on('beginContact', function (e) {
            // console.log(`${e.bodyA.id} hit ${e.bodyB.id}!`);
            // console.log(`this.idRegistry ${JSON.stringify(this.idRegistry)}`);

            // if player hit
            if (e.bodyA.id === this.bodies.player) {
                // then got hit by B
               
                // enemy bullet hit player
                if (this.bodies.enemyBullets.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemyBullets.push(e.bodyB.id);
                    this.bodies.collisions.player = this.bodies.player;
                }

                // enemy hit player
                if (this.bodies.enemies.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemies.push(e.bodyB.id);
                    this.bodies.collisions.player = this.bodies.player;
                }

            } else if (e.bodyB.id === this.bodies.player) {
                // then got hit by A

                // enemy bullet hit player
                if (this.bodies.enemyBullets.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemyBullets.push(e.bodyA.id);
                    this.bodies.collisions.player = this.bodies.player;
                }

                // enemy hit player
                if (this.bodies.enemies.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemies.push(e.bodyA.id);
                    this.bodies.collisions.player = this.bodies.player;
                }
            }

        }.bind(this));
    }

    addBody(body) {
        this.world.addBody(body);
    }

    update() {
        this.world.step(1 / this.fps)
    }
}

export default World;