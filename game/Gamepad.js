class Gamepad {

    constructor() {
        this.gamepads = {};
        this.state = {
            left: false,
            right: false,
            up: false,
            down: false
        };
    }

    getState() {
        this.queryGamepad();
        return this.state;
    }

    queryGamepad() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        // query all gamepads
        for (var i = 0; i < gamepads.length; i++) {
            var gp = gamepads[i];
            if (gp) {
                // console.log()
                this.state.up = gp.buttons[12].pressed ? true : false;
                this.state.down = gp.buttons[13].pressed ? true : false;
                this.state.right = gp.buttons[15].pressed ? true : false;
                this.state.left = gp.buttons[14].pressed ? true : false;
                this.state.fire = gp.buttons[0].pressed ? true : false;
            }
        }
    }

    connected() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        // query all gamepads
        for (var i = 0; i < gamepads.length; i++) {
            var gp = gamepads[i];
            if (gp) {
                return true;
            }
        }

        return false;
    }
}

export default Gamepad;