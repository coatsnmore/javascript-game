import * as PIXI from 'pixi.js';

export class HUD {

    constructor(size, x, y, world, player) {
        this.world = world;
        this.size = size;
        this.world = world;
        this.player = player;

        this.HEALTH_WIDTH = 5;
        this.HEALTH_HEIGHT = 100;

        this.graphics(x, y);
    }

    graphics(x, y) {
        this.graphics = new PIXI.Container();

        let healthText = new PIXI.Text('Health', {
            font: '24px Arial',
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

        return this.graphics;
    }

    showHealth(playerHealth, x, y) {
        x = x || this.graphics.x;
        y = y || this.graphics.y;
        let healthDisplay = new PIXI.Graphics();
        this.healthDisplay = healthDisplay;
        healthDisplay.beginFill(0x80f442);
        healthDisplay.lineStyle(5, 0x80f442);
        healthDisplay.drawRect(x, y, this.HEALTH_WIDTH, -playerHealth);
        this.graphics.addChildAt(healthDisplay, 0);
    }

    restart(restartCallBack) {

        let gameOver = new PIXI.Container();
        let gameOverText = new PIXI.Text('Game Over!!!', {
            font: '24px Arial',
            fill: 0xE34242,
            align: 'center'
        });
        gameOver.addChild(gameOverText);

        gameOver.interactive = true;
        gameOver.touchstart = gameOver.mousedown = () => {
            console.log(`button touched to restart...`);
            restartCallBack(true);
        }

        gameOver.x = 100;
        gameOver.y = 100;
        this.graphics.addChild(gameOver);
    }

    update() {
        // console.log(`refreshing player health at ${this.player.getHealth()}`);
        // refresh health
        let healthDisplay = this.graphics.removeChild(this.healthDisplay);
        this.showHealth(this.player.getHealth());
        // healthDisplay.setTransform({scaleY: 0.7});

    }
}

export default HUD;