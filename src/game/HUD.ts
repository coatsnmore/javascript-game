import * as PIXI from 'pixi.js';
import { World } from './World';
import { Player } from './Player';

export class HUD {
    private world: World;
    private size: number;
    private player: Player;
    private readonly HEALTH_WIDTH = 5;
    private readonly HEALTH_HEIGHT = 100;
    private graphics: PIXI.Container;
    private healthDisplay: PIXI.Graphics = new PIXI.Graphics();

    constructor(size: number, x: number, y: number, world: World, player: Player) {
        this.world = world;
        this.size = size;
        this.player = player;
        this.graphics = new PIXI.Container();
        this.createGraphics(x, y);
    }

    private createGraphics(x: number, y: number): void {
        const healthText = new PIXI.Text('Health', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xE34242,
            align: 'center'
        });
        this.graphics.addChild(healthText);

        this.showHealth(this.HEALTH_HEIGHT, x, y);

        // position
        this.graphics.x = x;
        this.graphics.y = y;

        // adjust graphics center
        this.graphics.pivot.x = this.size / 2;
        this.graphics.pivot.y = this.size / 2;
    }

    private showHealth(playerHealth: number, x?: number, y?: number): void {
        x = x || this.graphics.x;
        y = y || this.graphics.y;
        const healthDisplay = new PIXI.Graphics();
        this.healthDisplay = healthDisplay;
        healthDisplay.beginFill(0x80f442);
        healthDisplay.lineStyle(5, 0x80f442);
        healthDisplay.drawRect(x, y, this.HEALTH_WIDTH, -playerHealth);
        this.graphics.addChildAt(healthDisplay, 0);
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

        gameOver.x = 100;
        gameOver.y = 100;
        this.graphics.addChild(gameOver);
    }

    update(): void {
        // refresh health
        this.graphics.removeChild(this.healthDisplay);
        this.showHealth(this.player.getHealth());
    }
} 