import Player from './Player';
import Enemy from './Enemy';
import Controls from './Controls';
import World from './World';
import HUD from './HUD';
import * as PIXI from 'pixi.js';

export class Scene {

    constructor(domId, width, height) {
        this.controls = new Controls();
        this.width = width;
        this.height = height;
        this.paused = false;

        // builds the webgl renderer if available in browser
        this.renderer = new PIXI.autoDetectRenderer(width, height);
        this.renderer.view.setAttribute('class', 'renderer');

        // attach the scene to the DOM
        let sceneElement = document.getElementById(domId);
        sceneElement.append(this.renderer.view);

        this.restart();
    }

    restart(unpause) {
        if (this.paused && !unpause) {
            return;
        }
        console.log(`restarting: ${this}`);
        // create stage
        this.stage = new PIXI.Container();

        // create world and add physics
        this.world = new World(60);

        // add new player to stage
        this.player = new Player(50, 300, 400, this.world);
        this.stage.addChild(this.player.graphics);

        // create HUD
        this.hud = new HUD(50, 25, 250, this.world, this.player);
        this.stage.addChild(this.hud.graphics);

        this.enemies = [];

        // add new enemy to stage
        this.enemy = new Enemy(50, 200, 100, this.world);
        this.stage.addChild(this.enemy.graphics);
        this.enemies.push(this.enemy);

        // // add second enemy to stage
        this.enemy2 = new Enemy(50, 500, 200, this.world);
        this.stage.addChild(this.enemy2.graphics);
        this.enemies.push(this.enemy2);

        // // add new bodies to world
        this.world.addBody(this.player.body);
        this.world.addBody(this.enemy.body);
        this.world.addBody(this.enemy2.body);

        this.paused = false;
        this.tick();
    }

    restartScreen() {
        this.paused = true;
        this.hud.restart(this.restart.bind(this));
    }

    tick() {
        console.log(`tick..`)
        // draw
        this.renderer.render(this.stage);

        if (!this.paused) {
            window.requestAnimationFrame(this.tick.bind(this));
        }

        // step physics
        this.world.update();

        // update positions of objects in scene
        let playerOkay = this.player.update(this.controls.getState(), this.width, this.height, this.stage, this.world);

        // game end conditions
        if (!playerOkay) {
            this.restartScreen();
        }

        // update enemies
        this.enemies.forEach((enemy) => enemy.update(this.controls.getState(), this.width, this.height, this.stage, this.world, this.player));

        // start all enemies firing
        this.enemies.forEach((enemy) => enemy.fire(this.stage, this.world));

        // // update HUD
        this.hud.update();

        // clear collisions
        this.world.clearCollisions();
    }

}

export default Scene;