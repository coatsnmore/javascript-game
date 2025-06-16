import * as p2 from 'p2';

interface GameBodies {
    player: number[];
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
    private bodies: {
        player: number[],
        playerBullets: number[],
        enemies: number[],
        enemyBullets: number[],
        collisions: {
            player: number | null,
            playerBullets: number[],
            enemies: number[],
            enemyBullets: number[]
        }
    };

    constructor(fps: number = 60) {
        this.fps = fps;
        this.world = new p2.World({
            gravity: [0, 0]
        });
        
        // Initialize bodies object
        this.bodies = {
            player: [],
            playerBullets: [],
            enemies: [],
            enemyBullets: [],
            collisions: {
                player: null,
                playerBullets: [],
                enemies: [],
                enemyBullets: []
            }
        };
        this.detectCollisions();
    }

    getBodies(): GameBodies {
        return this.bodies;
    }

    clearCollisions(): void {
        // Clear all collision arrays
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
        if (this.bodies.player.includes(body.id)) {
            this.bodies.player = this.bodies.player.filter(id => id !== body.id);
        } else if (this.bodies.playerBullets.includes(body.id)) {
            this.bodies.playerBullets = this.bodies.playerBullets.filter(id => id !== body.id);
        } else if (this.bodies.enemies.includes(body.id)) {
            this.bodies.enemies = this.bodies.enemies.filter(id => id !== body.id);
        } else if (this.bodies.enemyBullets.includes(body.id)) {
            this.bodies.enemyBullets = this.bodies.enemyBullets.filter(id => id !== body.id);
        }
    }

    detectCollisions(): void {
        // Clear previous collisions
        this.bodies.collisions = {
            player: null,
            playerBullets: [],
            enemies: [],
            enemyBullets: []
        };

        // Get all bodies
        const bodies = this.world.bodies;
        
        // Check each body against others
        for (let i = 0; i < bodies.length; i++) {
            const bodyA = bodies[i];
            
            // Skip if body is not in our tracking arrays
            if (!this.bodies.player.includes(bodyA.id) && 
                !this.bodies.playerBullets.includes(bodyA.id) &&
                !this.bodies.enemies.includes(bodyA.id) &&
                !this.bodies.enemyBullets.includes(bodyA.id)) {
                continue;
            }

            for (let j = i + 1; j < bodies.length; j++) {
                const bodyB = bodies[j];
                
                // Skip if body is not in our tracking arrays
                if (!this.bodies.player.includes(bodyB.id) && 
                    !this.bodies.playerBullets.includes(bodyB.id) &&
                    !this.bodies.enemies.includes(bodyB.id) &&
                    !this.bodies.enemyBullets.includes(bodyB.id)) {
                    continue;
                }

                // Check if bodies are colliding
                if (this.world.narrowphase.contactEquations.some(contact => 
                    (contact.bodyA.id === bodyA.id && contact.bodyB.id === bodyB.id) ||
                    (contact.bodyA.id === bodyB.id && contact.bodyB.id === bodyA.id)
                )) {
                    console.log('Collision detected:', bodyA.id, bodyB.id);
                    
                    // Player hit by enemy bullet
                    if (this.bodies.player.includes(bodyA.id) && this.bodies.enemyBullets.includes(bodyB.id)) {
                        this.bodies.collisions.player = bodyA.id;
                        this.bodies.collisions.enemyBullets.push(bodyB.id);
                    }
                    else if (this.bodies.player.includes(bodyB.id) && this.bodies.enemyBullets.includes(bodyA.id)) {
                        this.bodies.collisions.player = bodyB.id;
                        this.bodies.collisions.enemyBullets.push(bodyA.id);
                    }
                    
                    // Enemy hit by player bullet
                    if (this.bodies.enemies.includes(bodyA.id) && this.bodies.playerBullets.includes(bodyB.id)) {
                        this.bodies.collisions.enemies.push(bodyA.id);
                        this.bodies.collisions.playerBullets.push(bodyB.id);
                    }
                    else if (this.bodies.enemies.includes(bodyB.id) && this.bodies.playerBullets.includes(bodyA.id)) {
                        this.bodies.collisions.enemies.push(bodyB.id);
                        this.bodies.collisions.playerBullets.push(bodyA.id);
                    }
                }
            }
        }
    }

    update(): void {
        this.world.step(1 / this.fps);
    }
} 