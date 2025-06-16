import * as p2 from 'p2';

interface GameBodies {
    player: number;
    playerBullets: number[];
    enemies: number[];
    enemyBullets: number[];
    collisions: {
        player: number | null;
        playerBullets: number[];
        enemies: number[];
        enemyBullets: number[];
    };
}

export class World {
    private fps: number;
    private world: p2.World;
    private bodies: GameBodies;

    constructor(fps: number = 60) {
        this.fps = fps;
        this.world = new p2.World({
            gravity: [0, 0]
        });
        this.detectCollisions();
    }

    getBodies(): GameBodies {
        return this.bodies;
    }

    clearCollisions(): void {
        this.bodies.collisions = {
            player: null,
            playerBullets: [],
            enemies: [],
            enemyBullets: [],
        };
    }

    private detectCollisions(): void {
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

        this.world.on('beginContact', (e: p2.BeginContactEvent) => {
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
        });
    }

    addBody(body: p2.Body): void {
        this.world.addBody(body);
    }

    update(): void {
        this.world.step(1 / this.fps);
    }
} 