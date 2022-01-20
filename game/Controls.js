import Gamepad from './Gamepad';

export class Controls {

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
        window.addEventListener('keydown', function (e) {
            this.changeControls(e.keyCode, true);
        }.bind(this), false);

        window.addEventListener('keyup', function (e) {
            this.changeControls(e.keyCode, false);
        }.bind(this), false);
    }

    getState() {

        // gamepad will override keyboard if connected
        if (this.gamepad.connected()) {
            let gamepadState = this.gamepad.getState();
            return gamepadState;
        }

        return this.state;
    }

    changeControls(code, state) {

        // console.log('key code: ' + code);
        switch (code) {

            // d-pad
            case 37:
                this.state.left = state;
                break;
            case 39:
                this.state.right = state;
                break;
            case 38:
                this.state.up = state;
                break;
            case 40:
                this.state.down = state;
                break;
            case 32:
                this.state.fire = state;
                break;
        }
    }

}

export default Controls;