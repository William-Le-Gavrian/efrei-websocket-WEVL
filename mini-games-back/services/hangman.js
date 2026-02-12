export function setWord(game, word) {
    const wordToGuess = word.trim().toUpperCase();
    if (30 < word.length) {
        return;
    }
    game.word = wordToGuess;
    game.maskedWord = wordToGuess.replace(/[A-Z]/g, '_').replace(/ /g, " ");
    game.status = 'playing';
}

export function guessLetter(game, letter) {
    letter = letter.toUpperCase();

    game.lettersGuessed.push(letter);

    if (game.word.includes(letter)) {
        let newMaskedWord = "";
        for (let i = 0; i < game.word.length; i++) {
            if (game.word[i] === letter) {
                newMaskedWord += letter;
            } else {
                newMaskedWord += game.maskedWord[i];
            }
        }
        game.maskedWord = newMaskedWord;
    }

    if (game.maskedWord === game.word) {
        game.status = 'finished';
        game.lastResult = game.players[1].id;
    } else {
        game.errors++;
        isGameOver(game);
    }
}

export function guessWord(game, word) {
    word = word.trim().toUpperCase();

    if(word === game.word){
        game.status = 'finished';
        game.lastResult = game.players[1].id;
    } else {
        game.errors++;
        isGameOver(game);
    }
}

function isGameOver(game) {
    if(game.errors >= game.maxErrors) {
        game.status = 'finished';
        game.lastResult = game.players[0].id;
    }
}