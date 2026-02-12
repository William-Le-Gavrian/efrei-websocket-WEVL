import React from 'react';
import Loader from "./Loader.jsx";
import {useState} from 'react';


function Hangman({gameState, socket}) {
    const [wordInput, setWordInput] = useState("");
    const [guessInput, setGuessInput] = useState("");

    if (!gameState) return (
        <Loader/>
    );

    const {players, status, lastResult, maskedWord, word, lettersGuessed = [], errors = 0, maxErrors = 10} = gameState;

    if (!players || players.length < 2) {
        return (
            <div
                className="min-h-[80vh] flex items-center justify-center text-blue-500 font-black italic tracking-widest uppercase text-center">
                En attente d'un second pilote...
            </div>
        );
    }

    const playerIndex = players.findIndex(player => player.id === socket.id);
    const isWordChooser = playerIndex === 0;
    const isGuesser = playerIndex === 1;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const handleSetWord = () => {
        socket.emit("make_move", {
            type: "word",
            value: wordInput.toUpperCase()
        });
        setWordInput("");
    };

    const handleLetterClick = (letter) => {
        socket.emit("make_move", {
            type: "letter",
            value: letter
        });
    };

    const handleGuessWord = () => {
        socket.emit("make_move", {
            type: "word",
            value: guessInput
        });
        setGuessInput("");
    };

    return (
        <div className="min-h-[80vh] text-white flex flex-col items-center p-6 font-gaming bg-transparent relative">

            <div
                className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl mb-10 text-center relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-rose-500/5 pointer-events-none"></div>
                {status === "choosing" && isWordChooser && (
                    <p className="text-blue-500 font-black tracking-widest uppercase mb-4">
                        À toi de choisir un mot !
                    </p>
                )}
                {status === "choosing" && isGuesser && (
                    <p className="text-blue-500 font-black tracking-widest uppercase">
                        L’adversaire choisit un mot...
                    </p>
                )}
            </div>

            {status === "choosing" && isWordChooser && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSetWord();
                    }}
                    className="flex flex-col items-center gap-4 mb-10 w-full max-w-md"
                >
                    <input
                        type="text"
                        value={wordInput}
                        onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                        maxLength={30}
                        placeholder="Tape ton mot ici"
                        className="w-full p-4 rounded-2xl text-black font-black border-2 border-white/10 focus:border-blue-500 backdrop-blur-sm placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                        Valider
                    </button>
                </form>
            )}

            {status !== "choosing" && (
                <h2 className="text-5xl sm:text-6xl font-black tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-8 animate-in fade-in zoom-in">
                    {maskedWord.split("").map((c, i) => (
                        <span key={i} className="inline-block px-2">{c}</span>
                    ))}
                </h2>
            )}

            {status === "playing" && isGuesser && (
                <p className="text-white font-bold uppercase mb-4">
                    Erreurs : {errors} / {maxErrors}
                </p>
            )}

            {status === "playing" && isGuesser && (
                <div className="flex gap-2 mb-8 w-full max-w-lg">
                    <input
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value.toUpperCase())}
                        className="flex-1 p-4 rounded-2xl text-black font-black border-2 border-white/10 focus:border-blue-500 backdrop-blur-sm placeholder:text-slate-400"
                        placeholder="Deviner le mot entier"
                    />
                    <button
                        onClick={handleGuessWord}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                        Deviner
                    </button>
                </div>
            )}

            {status === "playing" && isGuesser && (
                <div className="mt-auto mb-12 w-full max-w-4xl grid grid-cols-13 gap-2">
                    {alphabet.map((letter) => (
                        <button
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            disabled={lettersGuessed.includes(letter)}
                            className={`p-3 rounded-2xl font-black uppercase transition-all
                ${lettersGuessed.includes(letter) ? "bg-white/20 text-white/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"}
              `}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            )}

            {status === "finished" && (
                <div className="mt-10 text-center space-y-4 animate-in fade-in zoom-in">
                    <h1 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {lastResult === socket.id ? (
                            <span className="text-blue-500">MISSION ACCOMPLIE</span>
                        ) : (
                            <span className="text-rose-600">MISSION ÉCHOUÉE</span>
                        )}
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">
                        Le mot était : {word}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="group relative px-12 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 overflow-hidden shadow-xl uppercase tracking-widest italic"
                    >
                        <span className="relative z-10">Nouvelle Mission</span>
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Hangman;