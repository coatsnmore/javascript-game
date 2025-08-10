interface GamepadState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
    restart: boolean;
}

interface NavigatorWithGamepad extends Navigator {
    webkitGetGamepads?: () => (GamepadDevice | null)[];
}

interface GamepadButton {
    pressed: boolean;
    value: number;
}

interface GamepadDevice {
    readonly buttons: readonly GamepadButton[];
    readonly axes: readonly number[];
    id: string;
    index: number;
    mapping: string;
    timestamp: number;
    vibrationActuator?: GamepadHapticActuator;
}

export class Gamepad {
    private gamepads: { [key: number]: GamepadDevice | null };
    private state: GamepadState;
    private activeGamepadIndex: number | null;

    constructor() {
        this.gamepads = {};
        this.state = {
            left: false,
            right: false,
            up: false,
            down: false,
            fire: false,
            restart: false
        };
        this.activeGamepadIndex = null;

        // Set up gamepad connection listeners
        window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.gamepads[e.gamepad.index] = e.gamepad;
            this.activeGamepadIndex = e.gamepad.index;
        });

        window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
            console.log('Gamepad disconnected:', e.gamepad.id);
            delete this.gamepads[e.gamepad.index];
            if (this.activeGamepadIndex === e.gamepad.index) {
                this.activeGamepadIndex = null;
                // Reset state when active gamepad is disconnected
                this.state = {
                    left: false,
                    right: false,
                    up: false,
                    down: false,
                    fire: false,
                    restart: false
                };
            }
        });
    }

    getState(): GamepadState {
        this.queryGamepad();
        return this.state;
    }

    private queryGamepad(): void {
        const nav = navigator as NavigatorWithGamepad;
        const gamepads = nav.getGamepads ? nav.getGamepads() : (nav.webkitGetGamepads ? nav.webkitGetGamepads() : []);

        // If we have an active gamepad, only query that one
        if (this.activeGamepadIndex !== null) {
            const gp = gamepads[this.activeGamepadIndex] as GamepadDevice | null;
            if (gp) {
                this.updateStateFromGamepad(gp);
                return;
            }
        }

        // Otherwise, query all gamepads and use the first connected one
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i] as GamepadDevice | null;
            if (gp) {
                this.activeGamepadIndex = i;
                this.updateStateFromGamepad(gp);
                return;
            }
        }
    }

    private updateStateFromGamepad(gp: GamepadDevice): void {
        // D-pad (buttons 12-15) or left stick (axes 0,1)
        const leftStickX = gp.axes[0];
        const leftStickY = gp.axes[1];
        
        // Use both D-pad and left stick for movement
        this.state.up = gp.buttons[12].pressed || leftStickY < -0.5;
        this.state.down = gp.buttons[13].pressed || leftStickY > 0.5;
        this.state.left = gp.buttons[14].pressed || leftStickX < -0.5;
        this.state.right = gp.buttons[15].pressed || leftStickX > 0.5;
        
        // Fire button (A button or right trigger)
        this.state.fire = gp.buttons[0].pressed || gp.buttons[7].pressed;

        // Throttle (up button or left trigger)
        this.state.up = this.state.up || gp.buttons[6].pressed;

        // Any button press will trigger restart
        this.state.restart = gp.buttons.some(button => button.pressed);
    }

    connected(): boolean {
        return this.activeGamepadIndex !== null;
    }
} 