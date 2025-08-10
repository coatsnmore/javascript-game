import './style.css';
import { Scene } from './game/Scene';
import * as PIXI from 'pixi.js';

// Get viewport dimensions
const getViewportDimensions = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

// Initialize the game scene with viewport dimensions
const dimensions = getViewportDimensions();
const scene = new Scene('scene', dimensions.width, dimensions.height);

// Handle window resize
window.addEventListener('resize', () => {
    const newDimensions = getViewportDimensions();
    scene.resize(newDimensions.width, newDimensions.height);
});

// Example Matter.js game setup (commented out)
// import { Game } from './game/Game';
// const game = new Game(); 