import { Game } from './Game.js';
import { setWord, guessLetter, guessWord } from '../services/hangman.js';

export class Hangman extends Game {
    constructor() {
        super('hangman');
        this.word         = '';
        this.maskedWord   = '';
        this.lettersGuessed = [];
        this.errors       = 0;
        this.maxErrors    = 10;
    }

    onBothPlayersJoined(_players) {
        this.status = 'choosing';
    }

    handleMove(data, socketId, players) {
        const [wordPicker, guesser] = players;

        if (this.status === 'choosing') {
            if (socketId !== wordPicker.id) return null;
            setWord(this, data.value);
            this.status = 'playing';
            return { finished: false };
        }

        if (this.status === 'playing') {
            if (socketId !== guesser.id) return null;

            if (data.type === 'letter') guessLetter(this, data.value, players);
            if (data.type === 'word') guessWord(this, data.value, players);

            if (this.status === 'finished') {
                return this.buildFinishedResult(players);
            }

            return { finished: false };
        }

        return null;
    }

    buildFinishedResult(players) {
        const [wordPicker, guesser] = players;

        const guesserWon = this.lastResult === 'guesser';

        return {
            finished: true,
            winner:   guesserWon ? guesser    : wordPicker,
            loser:    guesserWon ? wordPicker  : guesser,
        };
    }

    reset() {
        this.word           = '';
        this.maskedWord     = '';
        this.lettersGuessed = [];
        this.errors         = 0;
        this.status         = 'waiting';
        this.lastResult     = null;
    }

    serialize() {
        return {
            status:          this.status,
            gameType:        this.gameType,
            word:            this.word,
            maskedWord:      this.maskedWord,
            lettersGuessed:  this.lettersGuessed,
            errors:          this.errors,
            maxErrors:       this.maxErrors,
            lastResult:      this.lastResult
        };
    }
}
