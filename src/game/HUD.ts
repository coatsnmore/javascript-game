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
    private gameOverContainer: PIXI.Container | null = null;
    private flashTimer: number = 0;
    private flashInterval: number = 0.5; // seconds between flashes
    private flashVisible: boolean = true;
    private flashTicker: PIXI.Ticker | null = null;

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

    resize(width: number, height: number): void {
        // Update health bar background
        const healthBarBg = this.graphics.children[0] as PIXI.Graphics;
        healthBarBg.clear();
        healthBarBg.beginFill(0x333333);
        healthBarBg.drawRect(0, 0, width, this.HEALTH_HEIGHT);
        healthBarBg.endFill();

        // Update health bar position
        this.graphics.y = height - this.HEALTH_HEIGHT;

        // Update health display
        this.showHealth(this.player.getHealth());

        // Update game over screen if it exists
        if (this.gameOverContainer) {
            const gameOverText = this.gameOverContainer.children[1] as PIXI.Text;
            const timerText = this.gameOverContainer.children[2] as PIXI.Text;
            const flashOutline = this.gameOverContainer.children[0] as PIXI.Graphics;

            // Update positions
            gameOverText.x = width / 2;
            gameOverText.y = height / 2 - 50;
            timerText.x = width / 2;
            timerText.y = height / 2 + 50;

            // Update flash outline
            flashOutline.clear();
            flashOutline.lineStyle(8, 0xFFFF00);
            flashOutline.drawRect(
                gameOverText.x - gameOverText.width / 2 - 20,
                gameOverText.y - gameOverText.height / 2 - 20,
                gameOverText.width + 40,
                gameOverText.height + 40
            );
        }
    }

    restart(restartCallBack: (unpause: boolean) => void): void {
        // Clean up any existing game over screen
        this.cleanup();
        
        // Create game over container
        this.gameOverContainer = new PIXI.Container();
        
        // Create game over text with outline
        const gameOverText = new PIXI.Text('GAME OVER', {
            fontFamily: 'Arial',
            fontSize: 72,
            fontWeight: 'bold',
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 6
        });
        
        // Create timer text
        const elapsedTime = this.world.getGameState().getElapsedTime();
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        const timerText = new PIXI.Text(`Time Survived: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 4
        });
        
        // Center the texts
        gameOverText.anchor.set(0.5);
        gameOverText.x = this.app.screen.width / 2;
        gameOverText.y = this.app.screen.height / 2 - 50;
        
        timerText.anchor.set(0.5);
        timerText.x = this.app.screen.width / 2;
        timerText.y = this.app.screen.height / 2 + 50;
        
        // Create flashing outline
        const flashOutline = new PIXI.Graphics();
        flashOutline.lineStyle(8, 0xFFFF00);
        flashOutline.drawRect(
            gameOverText.x - gameOverText.width / 2 - 20,
            gameOverText.y - gameOverText.height / 2 - 20,
            gameOverText.width + 40,
            gameOverText.height + 40
        );
        
        // Add all to container
        this.gameOverContainer.addChild(flashOutline);
        this.gameOverContainer.addChild(gameOverText);
        this.gameOverContainer.addChild(timerText);
        
        // Add to stage directly instead of HUD graphics
        this.app.stage.addChild(this.gameOverContainer);
        
        // Set up click handler for the entire screen
        this.app.stage.eventMode = 'static';
        this.app.stage.cursor = 'pointer';
        
        // Start flashing after 5 seconds
        setTimeout(() => {
            this.startFlashing();
        }, 5000);
        
        // Handle restart on any click
        const clickHandler = () => {
            this.cleanup();
            restartCallBack(true);
        };
        
        this.app.stage.on('pointerdown', clickHandler);
    }

    private startFlashing(): void {
        if (!this.gameOverContainer) return;
        
        // Get the flash outline (first child)
        const flashOutline = this.gameOverContainer.children[0] as PIXI.Graphics;
        
        // Create a new ticker for flashing
        this.flashTicker = new PIXI.Ticker();
        this.flashTicker.add(() => {
            this.flashTimer += this.flashTicker!.deltaMS / 1000;
            
            if (this.flashTimer >= this.flashInterval) {
                this.flashTimer = 0;
                this.flashVisible = !this.flashVisible;
                flashOutline.alpha = this.flashVisible ? 1 : 0;
            }
        });
        
        this.flashTicker.start();
    }

    private cleanup(): void {
        // Stop flashing ticker
        if (this.flashTicker) {
            this.flashTicker.destroy();
            this.flashTicker = null;
        }
        
        // Remove game over container from stage
        if (this.gameOverContainer) {
            this.app.stage.removeChild(this.gameOverContainer);
            this.gameOverContainer = null;
        }
        
        // Reset stage event handling
        this.app.stage.eventMode = 'none';
        this.app.stage.cursor = 'default';
        this.app.stage.removeAllListeners('pointerdown');
    }

    update(): void {
        this.showHealth(this.player.getHealth());
    }

    getGraphics(): PIXI.Container {
        return this.graphics;
    }
} 