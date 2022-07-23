import * as Tone from 'tone'

export class AudioPlayer {

    constructor() {
        this.bulletFireSynth = new Tone.Synth().toDestination();
        this.fuelEmptySynth = new Tone.Synth().toDestination();
        this.killSynth = new Tone.Synth().toDestination();
    }

    static {

    }

    playKill() {
        this.killSynth.triggerAttackRelease("C4", "0.1");
    }

    playBulletFire() {
        this.bulletFireSynth.triggerAttackRelease("D5", "0.1");
    }

    playFuelEmpty() {
        this.fuelEmptySynth.triggerAttackRelease("D3", "0.1");
    }

}