import { Gamepad } from './Gamepad';

interface ControlState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
    restart: boolean;
}

export class Controls {
    private state: ControlState;
    private gamepad: Gamepad;

    constructor() {
        this.state = {
            left: false,
            right: false,
            up: false,
            down: false,
            fire: false,
            restart: false
        };

        this.gamepad = new Gamepad();

        // setup PC keyboard interaction
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            this.changeControls(e.keyCode, true);
        }, false);

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            this.changeControls(e.keyCode, false);
        }, false);

        // setup mouse interaction
        window.addEventListener('mousedown', () => {
            this.state.fire = true;
        }, false);

        window.addEventListener('mouseup', () => {
            this.state.fire = false;
        }, false);
    }

    getState(): ControlState {
        // gamepad will override keyboard if connected
        if (this.gamepad.connected()) {
            return this.gamepad.getState();
        }

        return this.state;
    }

    private changeControls(code: number, state: boolean): void {
        switch (code) {
            // Arrow keys
            case 37: // Left arrow
            case 65: // A key
                this.state.left = state;
                break;
            case 39: // Right arrow
            case 68: // D key
                this.state.right = state;
                break;
            case 38: // Up arrow
            case 87: // W key
                this.state.up = state;
                break;
            case 40: // Down arrow
            case 83: // S key
                this.state.down = state;
                break;
            case 32: // Space
                this.state.fire = state;
                break;
            default:
                // Any other key press will trigger restart
                this.state.restart = state;
                break;
        }
    }
} 