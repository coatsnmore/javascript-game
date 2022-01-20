import Matter from "matter-js";

export class Controls {
    constructor(engine, player) {
        this.engine = engine;
        this.player = player;
        const keyHandlers = {
            KeyD: () => {
                this.player.right()
            },
            KeyA: () => {
                this.player.left()
            },
            KeyW: () => {
                this.player.up()
            },
            KeyS: () => {
                this.player.down()
            },
            Space: () => {
                this.player.jump();
            }
        };

        const keysDown = new Set();
        document.addEventListener("keydown", event => {
            // console.log(`code: ${event.code}`)
            event.preventDefault();
            keysDown.add(event.code);
        });
        document.addEventListener("keyup", event => {
            keysDown.delete(event.code);
        });

        this.keysDown = keysDown;
        this.keyHandlers = keyHandlers;
    }

    handle() {
        this.keysDown.forEach(k => {
            this.keyHandlers[k]?.();
        });
    }
}