import * as PIXI from 'pixi.js';
import { World } from './World';
import { Player } from './Player';

export class HUD {
    private world: World;
    private size: number;
    private player: Player;
    private readonly HEALTH_HEIGHT = 20;
    private graphics: PIXI.Container;
    private healthDisplay: PIXI.Graphics = new PIXI.Graphics();
    private app: PIXI.Application;

    constructor(size: number, x: number, y: number, world: World, player: Player, app: PIXI.Application) {
        this.world = world;
        this.size = size;
        this.player = player;
        this.app = app;
        this.graphics = new PIXI.Container();
        this.createGraphics();
    }

    private createGraphics(): void {
        // Create health bar background
        const healthBarBg = new PIXI.Graphics();
        healthBarBg.beginFill(0x333333);
        healthBarBg.drawRect(0, 0, this.app.screen.width, this.HEALTH_HEIGHT);
        healthBarBg.endFill();
        this.graphics.addChild(healthBarBg);

        // Create health text
        const healthText = new PIXI.Text('Health', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            align: 'center'
        });
        healthText.x = 10;
        healthText.y = 2;
        this.graphics.addChild(healthText);

        // Create initial health bar
        this.showHealth(this.player.getHealth());

        // Position at bottom of screen
        this.graphics.y = this.app.screen.height - this.HEALTH_HEIGHT;
    }

    private showHealth(playerHealth: number): void {
        // Remove old health display
        if (this.healthDisplay.parent) {
            this.graphics.removeChild(this.healthDisplay);
        }

        // Create new health display
        this.healthDisplay = new PIXI.Graphics();
        this.healthDisplay.beginFill(0x80f442);
        this.healthDisplay.drawRect(0, 0, this.app.screen.width * (playerHealth / 50), this.HEALTH_HEIGHT);
        this.healthDisplay.endFill();
        this.graphics.addChildAt(this.healthDisplay, 1);
    }

    restart(restartCallBack: (unpause: boolean) => void): void {
        const gameOver = new PIXI.Container();
        const gameOverText = new PIXI.Text('Game Over!!!', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xE34242,
            align: 'center'
        });
        gameOver.addChild(gameOverText);

        gameOver.eventMode = 'static';
        gameOver.cursor = 'pointer';
        gameOver.on('pointerdown', () => {
            console.log(`button touched to restart...`);
            restartCallBack(true);
        });

        gameOver.x = this.app.screen.width / 2 - gameOverText.width / 2;
        gameOver.y = this.app.screen.height / 2 - gameOverText.height / 2;
        this.graphics.addChild(gameOver);
    }

    update(): void {
        this.showHealth(this.player.getHealth());
    }
} 