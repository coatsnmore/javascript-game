import { Player } from './Player';
import { Enemy } from './Enemy';
import { Controls } from './Controls';
import { World } from './World';
import { HUD } from './HUD';
import * as PIXI from 'pixi.js';

export class Scene {
    private controls: Controls;
    private width: number;
    private height: number;
    private paused: boolean;
    private app: PIXI.Application;
    private world: World;
    private player: Player;
    private hud: HUD;
    private enemies: Enemy[] = [];

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
            autoDensity: true
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

    private update(): void {
        const controls = this.controls.getState();

        // If game is paused, only check for restart
        if (this.paused) {
            if (controls.restart) {
                this.restart(true);
            }
            return;
        }

        // step physics
        this.world.update();

        // update positions of objects in scene
        const playerOkay = this.player.update(controls, this.width, this.height, this.app.stage, this.world);

        // game end conditions
        if (!playerOkay) {
            this.restartScreen();
            return;
        }

        // update enemies
        this.enemies.forEach((enemy) => enemy.update(controls, this.width, this.height, this.app.stage, this.world, this.player));

        // start all enemies firing
        this.enemies.forEach((enemy) => enemy.fire(this.app.stage, this.world));

        // update HUD
        this.hud.update();

        // clear collisions
        this.world.clearCollisions();
    }

    restart(unpause?: boolean): void {
        if (this.paused && !unpause) {
            return;
        }
        console.log(`restarting: ${this}`);
        
        // Clear existing stage
        if (this.app.stage.children.length > 0) {
            this.app.stage.removeChildren();
        }

        // create world and add physics
        this.world = new World(60);

        // add new player to stage
        this.player = new Player(50, 300, 400, this.world);
        this.app.stage.addChild(this.player.getGraphics());

        // create HUD
        this.hud = new HUD(50, 25, 250, this.world, this.player);
        this.app.stage.addChild(this.hud.graphics);

        this.enemies = [];

        // add new enemy to stage
        const enemy = new Enemy(50, 200, 100, this.world);
        this.app.stage.addChild(enemy.graphics);
        this.enemies.push(enemy);

        // add second enemy to stage
        const enemy2 = new Enemy(50, 500, 200, this.world);
        this.app.stage.addChild(enemy2.graphics);
        this.enemies.push(enemy2);

        // add new bodies to world
        this.world.addBody(this.player.body);
        this.world.addBody(enemy.body);
        this.world.addBody(enemy2.body);

        this.paused = false;
    }

    restartScreen(): void {
        this.paused = true;
        this.hud.restart(this.restart.bind(this));
    }

    tick(): void {
        // This method is now handled by PIXI's ticker
        this.update();
    }
} 