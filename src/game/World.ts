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
        this.bodies = {
            player: 0,
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

    addBody(body: p2.Body): void {
        this.world.addBody(body);
    }

    removeBody(body: p2.Body): void {
        // Remove from physics world
        this.world.removeBody(body);

        // Remove from tracking arrays
        if (body.id === this.bodies.player) {
            this.bodies.player = 0;
        } else if (this.bodies.playerBullets.includes(body.id)) {
            this.bodies.playerBullets = this.bodies.playerBullets.filter(id => id !== body.id);
        } else if (this.bodies.enemies.includes(body.id)) {
            this.bodies.enemies = this.bodies.enemies.filter(id => id !== body.id);
        } else if (this.bodies.enemyBullets.includes(body.id)) {
            this.bodies.enemyBullets = this.bodies.enemyBullets.filter(id => id !== body.id);
        }
    }

    private detectCollisions(): void {
        this.world.on('beginContact', (e: p2.BeginContactEvent) => {
            console.log('Collision detected between:', e.bodyA.id, 'and', e.bodyB.id);
            
            // Check for player collisions
            if (e.bodyA.id === this.bodies.player) {
                // Player got hit by B
                if (this.bodies.enemyBullets.includes(e.bodyB.id)) {
                    console.log('Player hit by enemy bullet:', e.bodyB.id);
                    if (!this.bodies.collisions.enemyBullets.includes(e.bodyB.id)) {
                        this.bodies.collisions.enemyBullets.push(e.bodyB.id);
                    }
                    this.bodies.collisions.player = this.bodies.player;
                }
                if (this.bodies.enemies.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemies.push(e.bodyB.id);
                    this.bodies.collisions.player = this.bodies.player;
                }
            } else if (e.bodyB.id === this.bodies.player) {
                // Player got hit by A
                if (this.bodies.enemyBullets.includes(e.bodyA.id)) {
                    console.log('Player hit by enemy bullet:', e.bodyA.id);
                    if (!this.bodies.collisions.enemyBullets.includes(e.bodyA.id)) {
                        this.bodies.collisions.enemyBullets.push(e.bodyA.id);
                    }
                    this.bodies.collisions.player = this.bodies.player;
                }
                if (this.bodies.enemies.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemies.push(e.bodyA.id);
                    this.bodies.collisions.player = this.bodies.player;
                }
            }

            // Check for enemy collisions with player bullets
            if (this.bodies.enemies.includes(e.bodyA.id)) {
                // Enemy A got hit by B
                if (this.bodies.playerBullets.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemies.push(e.bodyA.id);
                    this.bodies.collisions.playerBullets.push(e.bodyB.id);
                }
            } else if (this.bodies.enemies.includes(e.bodyB.id)) {
                // Enemy B got hit by A
                if (this.bodies.playerBullets.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemies.push(e.bodyB.id);
                    this.bodies.collisions.playerBullets.push(e.bodyA.id);
                }
            }

            // Check for enemy bullet collisions with other enemy bullets
            if (this.bodies.enemyBullets.includes(e.bodyA.id) && this.bodies.enemyBullets.includes(e.bodyB.id)) {
                console.log('Enemy bullet collision between:', e.bodyA.id, 'and', e.bodyB.id);
                // Only add each bullet ID once
                if (!this.bodies.collisions.enemyBullets.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemyBullets.push(e.bodyA.id);
                }
                if (!this.bodies.collisions.enemyBullets.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemyBullets.push(e.bodyB.id);
                }
            }

            // Debug: Log current collisions after processing
            console.log('Current collisions after processing:', this.bodies.collisions);
        });
    }

    update(): void {
        // Debug: Log collisions before world step
        console.log('Collisions before world step:', this.bodies.collisions);
        this.world.step(1 / this.fps);
        // Debug: Log collisions after world step
        console.log('Collisions after world step:', this.bodies.collisions);
    }
} 