import './style.css';
import { Scene } from './game/Scene';
import * as PIXI from 'pixi.js'

let scene = new Scene('scene', 800, 600)
scene.tick();

// import * as Body from './matter-example/Body'

// EXAMPLE MATTER GAME
// import { Game } from './matter-example/Game';
// let game = new Game();
// END EXAMPLE MATTER GAME

