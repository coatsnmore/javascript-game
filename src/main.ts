import './style.css';
import { Scene } from './game/Scene';
import * as PIXI from 'pixi.js';

// Initialize the game scene
const scene = new Scene('scene', 800, 600);
scene.tick();

// Example Matter.js game setup (commented out)
// import { Game } from './game/Game';
// const game = new Game(); 