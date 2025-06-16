import { Gamepad } from './Gamepad';

interface ControlState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
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
            fire: false
        };

        this.gamepad = new Gamepad();

        // setup PC keyboard interaction
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            this.changeControls(e.keyCode, true);
        }, false);

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            this.changeControls(e.keyCode, false);
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
            // d-pad
            case 37: // Left arrow
                this.state.left = state;
                break;
            case 39: // Right arrow
                this.state.right = state;
                break;
            case 38: // Up arrow
                this.state.up = state;
                break;
            case 40: // Down arrow
                this.state.down = state;
                break;
            case 32: // Space
                this.state.fire = state;
                break;
        }
    }
} 