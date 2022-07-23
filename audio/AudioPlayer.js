import * as Tone from 'tone'

export class AudioPlayer {

    constructor() {
        this.playing = false;
        this.createInstruments()
        this.createControls();

        // set default tone transport values
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.swing = this.swing;
        Tone.Transport.swingSubdivision = '16n';
        Tone.Transport.loopStart = 0;
    }

    createInstruments() {
        this.bulletFireSynth = new Tone.MonoSynth().toDestination();
        this.fuelEmptySynth = new Tone.MonoSynth().toDestination();
        this.killSynth = new Tone.MonoSynth().toDestination();
        this.bassSynth = new Tone.MonoSynth({
            volume: -5,
            oscillator: {
                type: 'fmsquare5',
                modulationType: 'triangle',
                modulationIndex: 2,
                harmonicity: 0.501
            },
            filter: {
                Q: 1,
                type: 'lowpass',
                rolloff: -24
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.4,
                release: 2
            },
            filterEnvelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.8,
                release: 1.5,
                baseFrequency: 50,
                octaves: 4.4
            }
        }).toDestination();
    }

    createControls() {
        this.playBtn = document.getElementById('play-btn');
        this.bpmRange = document.getElementById('bpm-range');
        this.swingRange = document.getElementById('swing-range');
        this.filterRange = document.getElementById('filter-range');

        this.playBtn.addEventListener('click', event => {
            // Tone.Transport.stop();
            if (!this.playing) {
                this.playing = true;
                this.playBtn.value = 'stop';
                Tone.Master.mute = false;
                Tone.Transport.start('+0.1');
                this.soundtrack();
            } else {
                this.playing = false;
                this.playBtn.value = 'play';
                Tone.Transport.stop();
            }
        });

        this.bpmRange.addEventListener('input', event => {
            this.bpm = this.bpmRange.value;
            Tone.Transport.bpm.value = this.bpm;
        });

        this.swingRange.addEventListener('input', event => {
            this.swing = this.swingRange.value;
            Tone.Transport.swing = this.swing;
        });

        this.filterRange.addEventListener('input', event => {
            this.filter = this.filterRange.value;
            // this.pizzSynth.filterEnvelope.baseFrequency = filter;
            this.bassSynth.filterEnvelope.baseFrequency = this.filter;
            // Tone.Transport.seconds = filter;
        });

        this.bpm = this.bpmRange.value;
        this.swing = this.swingRange.value;
        this.filter = this.filterRange.value;
    }

    soundtrack() {
        // Bass notes array
        const bassNotes = [
            ['F#3', 'F#3'],
            null,
            ['F#3', 'F#3'],
            null,
            ['F#3', 'F#3'],
            null,
            null,
            null,
            ['F#3', 'F#3'],
            null,
            null,
            null,
            ['F#3', 'F#3'],
            null,
            null,
            null,
            ['E3', 'E3'],
            null,
            ['E3', 'E3'],
            null,
            ['E3', 'E3'],
            null,
            null,
            null,
            ['E3', 'E3'],
            null,
            null,
            null,
            ['E3', 'E3'],
            null,
            null,
            null,
            ['F#3', 'F#3'],
            null,
            ['F#3', 'F#3'],
            null,
            ['F#3', 'F#3'],
            null,
            null,
            null,
            ['F#3', 'F#3'],
            null,
            null,
            null,
            ['F#3', 'F#3'],
            null,
            null,
            null,
            ['G3', 'G3'],
            null,
            ['G3', 'G3'],
            null,
            ['G3', 'G3'],
            null,
            null,
            null,
            ['G3', 'G3'],
            null,
            null,
            null,
            ['G3', 'G3'],
            null,
            null,
            null
        ];

        let bassPart = new Tone.Sequence(
            (time, note) => {
                this.bassSynth.triggerAttackRelease(note, '10hz', time);
            },
            bassNotes,
            '16n'
        );
        bassPart.start();
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