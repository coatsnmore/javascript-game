import { Player } from './Player';
import { Enemy } from './Enemy';
import { Controls } from './Controls';
import { World } from './World';
import { HUD } from './HUD';
import { Drop } from './Drop';
import { Timer } from './ui/Timer';
import * as PIXI from 'pixi.js';
import * as p2 from 'p2';

export class Scene {
    private controls: Controls;
    private width: number;
    private height: number;
    private paused: boolean;
    private app: PIXI.Application;
    private world!: World;
    private player!: Player;
    private hud!: HUD;
    private enemies: Enemy[] = [];
    private drops: Drop[] = [];
    private enemySpawnTimer: number = 0;
    private readonly ENEMY_SPAWN_INTERVAL: number = 10000; // 10 seconds in milliseconds
    private timer!: Timer;

    constructor(domId: string, width: number, height: number) {
        this.controls = new Controls();
        this.width = width;
        this.height = height;
        this.paused = false;

        // Create PIXI Application
        this.app = new PIXI.Application({
            width: width,
            height: height,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            resizeTo: window // This will make the canvas automatically resize to the window
        });

        // attach the scene to the DOM
        const sceneElement = document.getElementById(domId);
        if (!sceneElement) {
            throw new Error(`Element with id ${domId} not found`);
        }

        // If it's a canvas, replace it with our PIXI canvas
        if (sceneElement instanceof HTMLCanvasElement) {
            sceneElement.parentNode?.replaceChild(this.app.view as HTMLCanvasElement, sceneElement);
        } else {
            sceneElement.appendChild(this.app.view as HTMLCanvasElement);
        }

        // Set up the game loop
        this.app.ticker.add(() => {
            this.update();
        });

        this.restart();
    }

    // Add resize method
    resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        
        // Update app size
        this.app.renderer.resize(width, height);
        
        // Update HUD position
        if (this.hud) {
            this.hud.resize(width, height);
        }
        
        // Update player boundaries
        if (this.player) {
            this.player.updateBoundaries(width, height);
        }
        
        // Update enemy boundaries
        this.enemies.forEach(enemy => {
            enemy.updateBoundaries(width, height);
        });
    }

    private getRandomSpawnPosition(): { x: number, y: number } {
        // Randomly choose which edge to spawn from (0: top, 1: right, 2: bottom, 3: left)
        const edge = Math.floor(Math.random() * 4);
        const padding = 50; // Keep ships away from the very edge
        
        switch (edge) {
            case 0: // Top edge
                return {
                    x: Math.random() * (this.app.screen.width - 2 * padding) + padding,
                    y: padding
                };
            case 1: // Right edge
                return {
                    x: this.app.screen.width - padding,
                    y: Math.random() * (this.app.screen.height - 2 * padding) + padding
                };
            case 2: // Bottom edge
                return {
                    x: Math.random() * (this.app.screen.width - 2 * padding) + padding,
                    y: this.app.screen.height - padding
                };
            case 3: // Left edge
                return {
                    x: padding,
                    y: Math.random() * (this.app.screen.height - 2 * padding) + padding
                };
            default:
                return { x: 0, y: 0 }; // Should never happen
        }
    }

    private update(): void {
        if (this.paused) {
            return;
        }

        // update world
        this.world.update();

        // Process collisions for all enemies before updating
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const enemyAlive = enemy.update(this.controls.getState(), this.app.screen.width, this.app.screen.height, this.app.stage, this.world, this.player);
            
            if (!enemyAlive) {
                // Remove enemy from stage and world
                this.app.stage.removeChild(enemy.getGraphics());
                this.world.removeBody(enemy.body);
                this.enemies.splice(i, 1);

                // Always drop a health item
                const drop = new Drop(enemy.body.position[0], enemy.body.position[1], 'health', 20, this.world);
                this.app.stage.addChild(drop.getGraphics());
                this.drops.push(drop);
                
                // Create a new enemy after a short delay
                setTimeout(() => {
                    const spawnPos = this.getRandomSpawnPosition();
                    const newEnemy = new Enemy(50, spawnPos.x, spawnPos.y, this.world);
                    this.app.stage.addChild(newEnemy.getGraphics());
                    this.world.addBody(newEnemy.body);
                    this.enemies.push(newEnemy);
                }, 3000);
            }
        }

        // Update drops
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            drop.update();

            // Check if drop has expired
            if (!drop.getGraphics().parent) {
                this.drops.splice(i, 1);
                continue;
            }

            // Check for collision with player
            const playerBody = this.world.getBodies().player;
            const dropBody = drop.getBody();
            const playerBodyObj = this.world.getWorld().bodies.find((b: p2.Body) => b.id === playerBody);
            if (!playerBodyObj) continue;

            const distance = Math.sqrt(
                Math.pow(dropBody.position[0] - playerBodyObj.position[0], 2) +
                Math.pow(dropBody.position[1] - playerBodyObj.position[1], 2)
            );

            if (distance < 50) { // Increased collision radius for easier collection
                // Apply health
                if (drop.getType() === 'health') {
                    this.player.heal(drop.getValue());
                }
                // Remove drop
                this.app.stage.removeChild(drop.getGraphics());
                this.world.removeBody(drop.getBody());
                this.drops.splice(i, 1);
            }
        }

        // update player
        const playerAlive = this.player.update(this.controls.getState(), this.app.screen.width, this.app.screen.height, this.app.stage, this.world);
        if (!playerAlive) {
            this.paused = true;
            // Pause timer when game ends
            this.timer.pause();
            // Remove player and enemies from stage but keep HUD
            this.app.stage.removeChild(this.player.getGraphics());
            this.enemies.forEach(enemy => {
                this.app.stage.removeChild(enemy.getGraphics());
            });
            this.hud.restart(this.restart.bind(this));
            return;
        }

        // update HUD
        this.hud.update();

        // update timer
        this.timer.update();

        // Enemy spawning logic
        this.enemySpawnTimer += this.app.ticker.deltaMS;
        if (this.enemySpawnTimer >= this.ENEMY_SPAWN_INTERVAL) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
        }

        // Clear collisions after all processing is complete
        this.world.clearCollisions();
    }

    restart(unpause?: boolean): void {
        if (this.paused && !unpause) {
            return;
        }
        console.log(`restarting: ${this}`);
        
        // Clear existing stage
        this.app.stage.removeChildren();

        // create world and add physics
        this.world = new World(60);

        // add new player to stage
        this.player = new Player(50, 300, 400, this.world);
        this.app.stage.addChild(this.player.getGraphics());

        // create HUD
        this.hud = new HUD(50, 25, 250, this.world, this.player, this.app);
        this.app.stage.addChild(this.hud.getGraphics());

        // create timer
        this.timer = new Timer(10, 10);
        this.app.stage.addChild(this.timer.getGraphics());

        this.enemies = [];
        this.drops = [];
        this.enemySpawnTimer = 0;
        this.timer.reset();

        // add new enemy to stage
        const enemy = new Enemy(50, 200, 100, this.world);
        this.app.stage.addChild(enemy.getGraphics());
        this.enemies.push(enemy);

        // add second enemy to stage
        const enemy2 = new Enemy(50, 500, 200, this.world);
        this.app.stage.addChild(enemy2.getGraphics());
        this.enemies.push(enemy2);

        // add third enemy to stage
        const enemy3 = new Enemy(50, 300, 100, this.world);
        this.app.stage.addChild(enemy3.getGraphics());
        this.enemies.push(enemy3);

        // add new bodies to world
        this.world.addBody(this.player.getBody());
        this.world.addBody(enemy.body);
        this.world.addBody(enemy2.body);
        this.world.addBody(enemy3.body);

        this.paused = false;
    }

    restartScreen(): void {
        this.paused = true;
        this.hud.restart(this.restart.bind(this));
    }

    private spawnEnemy(): void {
        const spawnPos = this.getRandomSpawnPosition();
        const newEnemy = new Enemy(50, spawnPos.x, spawnPos.y, this.world);
        this.app.stage.addChild(newEnemy.getGraphics());
        this.world.addBody(newEnemy.body);
        this.enemies.push(newEnemy);
        console.log('New enemy spawned at:', spawnPos);
    }

    tick(): void {
        // This method is now handled by PIXI's ticker
        this.update();
    }
} 