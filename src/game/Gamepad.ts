interface GamepadState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
}

interface NavigatorWithGamepad extends Navigator {
    webkitGetGamepads?: () => (GamepadDevice | null)[];
}

interface GamepadButton {
    pressed: boolean;
    value: number;
}

interface GamepadDevice {
    buttons: GamepadButton[];
    id: string;
    index: number;
    mapping: string;
    timestamp: number;
    vibrationActuator?: {
        type: string;
    };
}

export class Gamepad {
    private gamepads: { [key: number]: GamepadDevice | null };
    private state: GamepadState;

    constructor() {
        this.gamepads = {};
        this.state = {
            left: false,
            right: false,
            up: false,
            down: false,
            fire: false
        };
    }

    getState(): GamepadState {
        this.queryGamepad();
        return this.state;
    }

    private queryGamepad(): void {
        const nav = navigator as NavigatorWithGamepad;
        const gamepads = nav.getGamepads ? nav.getGamepads() : (nav.webkitGetGamepads ? nav.webkitGetGamepads() : []);
        // query all gamepads
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i] as GamepadDevice | null;
            if (gp) {
                this.state.up = gp.buttons[12].pressed;
                this.state.down = gp.buttons[13].pressed;
                this.state.right = gp.buttons[15].pressed;
                this.state.left = gp.buttons[14].pressed;
                this.state.fire = gp.buttons[0].pressed;
            }
        }
    }

    connected(): boolean {
        const nav = navigator as NavigatorWithGamepad;
        const gamepads = nav.getGamepads ? nav.getGamepads() : (nav.webkitGetGamepads ? nav.webkitGetGamepads() : []);
        // query all gamepads
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i] as GamepadDevice | null;
            if (gp) {
                return true;
            }
        }

        return false;
    }
} 