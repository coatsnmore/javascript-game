import * as p2 from 'p2';
import { GameState } from './GameState';
import { ImpactEffect } from './effects/ImpactEffect';
import { HealthBar } from './ui/HealthBar';

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
    private gameState: GameState;
    private lastUpdateTime: number;
    private impactEffect: ImpactEffect;
    private healthBar: HealthBar;
    private playerHealth: number;
    private readonly MAX_PLAYER_HEALTH: number = 100;

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
        this.gameState = new GameState(this);
        this.lastUpdateTime = Date.now();
        this.impactEffect = new ImpactEffect();
        this.playerHealth = this.MAX_PLAYER_HEALTH;
        this.healthBar = new HealthBar(this.MAX_PLAYER_HEALTH);
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
                        // Create impact effect at player position
                        const playerBody = this.world.bodies.find(b => b.id === this.bodies.player);
                        if (playerBody) {
                            this.impactEffect.createImpact(playerBody.position[0], playerBody.position[1], 'player');
                            // Reduce player health
                            this.playerHealth = Math.max(0, this.playerHealth - 10);
                            this.healthBar.setHealth(this.playerHealth);
                        }
                    }
                    this.bodies.collisions.player = this.bodies.player;
                }
                if (this.bodies.enemies.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemies.push(e.bodyB.id);
                    this.bodies.collisions.player = this.bodies.player;
                    // Create impact effect at player position
                    const playerBody = this.world.bodies.find(b => b.id === this.bodies.player);
                    if (playerBody) {
                        this.impactEffect.createImpact(playerBody.position[0], playerBody.position[1], 'player');
                        // Reduce player health
                        this.playerHealth = Math.max(0, this.playerHealth - 20);
                        this.healthBar.setHealth(this.playerHealth);
                    }
                }
            } else if (e.bodyB.id === this.bodies.player) {
                // Player got hit by A
                if (this.bodies.enemyBullets.includes(e.bodyA.id)) {
                    console.log('Player hit by enemy bullet:', e.bodyA.id);
                    if (!this.bodies.collisions.enemyBullets.includes(e.bodyA.id)) {
                        this.bodies.collisions.enemyBullets.push(e.bodyA.id);
                        // Create impact effect at player position
                        const playerBody = this.world.bodies.find(b => b.id === this.bodies.player);
                        if (playerBody) {
                            this.impactEffect.createImpact(playerBody.position[0], playerBody.position[1], 'player');
                            // Reduce player health
                            this.playerHealth = Math.max(0, this.playerHealth - 10);
                            this.healthBar.setHealth(this.playerHealth);
                        }
                    }
                    this.bodies.collisions.player = this.bodies.player;
                }
                if (this.bodies.enemies.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemies.push(e.bodyA.id);
                    this.bodies.collisions.player = this.bodies.player;
                    // Create impact effect at player position
                    const playerBody = this.world.bodies.find(b => b.id === this.bodies.player);
                    if (playerBody) {
                        this.impactEffect.createImpact(playerBody.position[0], playerBody.position[1], 'player');
                        // Reduce player health
                        this.playerHealth = Math.max(0, this.playerHealth - 20);
                        this.healthBar.setHealth(this.playerHealth);
                    }
                }
            }

            // Check for enemy collisions with player bullets
            if (this.bodies.enemies.includes(e.bodyA.id)) {
                // Enemy A got hit by B
                if (this.bodies.playerBullets.includes(e.bodyB.id)) {
                    this.bodies.collisions.enemies.push(e.bodyA.id);
                    this.bodies.collisions.playerBullets.push(e.bodyB.id);
                    // Add coins for enemy death
                    this.gameState.addCoins(1);
                    // Create impact effect at enemy position
                    const enemyBody = this.world.bodies.find(b => b.id === e.bodyA.id);
                    if (enemyBody) {
                        this.impactEffect.createImpact(enemyBody.position[0], enemyBody.position[1], 'enemy');
                    }
                }
            } else if (this.bodies.enemies.includes(e.bodyB.id)) {
                // Enemy B got hit by A
                if (this.bodies.playerBullets.includes(e.bodyA.id)) {
                    this.bodies.collisions.enemies.push(e.bodyB.id);
                    this.bodies.collisions.playerBullets.push(e.bodyA.id);
                    // Add coins for enemy death
                    this.gameState.addCoins(1);
                    // Create impact effect at enemy position
                    const enemyBody = this.world.bodies.find(b => b.id === e.bodyB.id);
                    if (enemyBody) {
                        this.impactEffect.createImpact(enemyBody.position[0], enemyBody.position[1], 'enemy');
                    }
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
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;

        // Update game state
        this.gameState.update(deltaTime);

        // Debug: Log collisions before world step
        console.log('Collisions before world step:', this.bodies.collisions);
        this.world.step(1 / this.fps);
        // Debug: Log collisions after world step
        console.log('Collisions after world step:', this.bodies.collisions);
    }

    getGameState(): GameState {
        return this.gameState;
    }

    getImpactEffect(): ImpactEffect {
        return this.impactEffect;
    }

    getHealthBar(): HealthBar {
        return this.healthBar;
    }

    getWorld(): p2.World {
        return this.world;
    }
} 