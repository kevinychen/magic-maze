export enum Phase {

    INTRO,
    EXIT,
}

const SONGS: { [phase: number]: string[] } = {
    [Phase.INTRO]: ['./fallen_leaves.mp3', './working_now.mp3', './happy_days.mp3'],
    [Phase.EXIT]: ['./sound_of_passion.mp3', './working_now.mp3', './happy_days.mp3'],
};
const MAX_VOLUME = 0.5;

export class AudioController {

    private static instance = new AudioController();

    private backgroundAudio = new Audio();
    private currentPhase?: Phase = undefined;
    private currentIndex: number = 0;
    private timeout?: NodeJS.Timeout = undefined;

    static getInstance() {
        return AudioController.instance;
    }

    private constructor() {
        this.backgroundAudio.volume = MAX_VOLUME;
    }

    start = () => {
        if (this.currentPhase === undefined) {
            this.currentPhase = Phase.INTRO;
            this.setPhaseInternal();
        }
    }

    setPhase = (phase: Phase) => {
        if (this.currentPhase !== undefined && phase !== this.currentPhase) {
            this.currentPhase = phase;
            this.setPhaseInternal();
        }
    }

    toggleSound = () => {
        this.backgroundAudio.volume = MAX_VOLUME - this.backgroundAudio.volume;
    }

    private setPhaseInternal = () => {
        this.backgroundAudio.pause();
        const songs = SONGS[this.currentPhase!];
        this.backgroundAudio.src = songs[(this.currentIndex++) % songs.length];
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
        }
        this.backgroundAudio.currentTime = 0;
        this.backgroundAudio.play();
        this.backgroundAudio.onended = () => setTimeout(this.setPhaseInternal, 2000);
    }
};
