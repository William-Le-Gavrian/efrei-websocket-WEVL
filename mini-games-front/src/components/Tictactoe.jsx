import React from 'react';

function Tictactoe({ gameState, onMove, myPseudo, socketId }) {
  if (!gameState) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse">CHARGEMENT...</div>;

  const { board, players, turn, status } = gameState;
  const currentPlayer = players[turn];
  const isMyTurn = currentPlayer?.id === socketId;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6">
      
      {/* Barre de Status des Joueurs */}
      <div className="w-full max-w-md grid grid-cols-3 items-center bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-2xl mb-10">
        <div className={`text-center transition-all ${turn === 0 ? 'scale-110' : 'opacity-40'}`}>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Joueur X</p>
          <p className="font-black text-blue-500 truncate">{players[0]?.pseudo || '...'}</p>
        </div>
        <div className="text-center font-black text-slate-700 italic text-2xl">VS</div>
        <div className={`text-center transition-all ${turn === 1 ? 'scale-110' : 'opacity-40'}`}>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Joueur O</p>
          <p className="font-black text-red-500 truncate">{players[1]?.pseudo || '...'}</p>
        </div>
      </div>

      {/* Info du tour en cours */}
      <div className="mb-10 text-center">
        {status === 'playing' ? (
          <div className={`px-6 py-2 rounded-full border-2 font-bold transition-all ${isMyTurn ? 'border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse' : 'border-slate-800 text-slate-600'}`}>
            {isMyTurn ? "⭐ C'EST TON TOUR !" : `ATTENTE DE ${currentPlayer?.pseudo}...`}
          </div>
        ) : (
          <div className="text-blue-500 font-black italic animate-bounce">EN ATTENTE D'ADVERSAIRE...</div>
        )}
      </div>

      {/* Grille de Jeu */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-inner">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => onMove(i)}
            disabled={!isMyTurn || cell !== null || status !== 'playing'}
            className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-6xl font-black transition-all transform active:scale-90
              ${!cell && isMyTurn ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer' : 'bg-slate-950'}
              ${cell === 'X' ? 'text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}
              ${!isMyTurn && !cell ? 'opacity-20' : 'opacity-100'}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      <footer className="mt-auto pt-10 text-slate-700 text-xs font-bold tracking-widest">
        LOGGED AS <span className="text-slate-500">{myPseudo.toUpperCase()}</span>
      </footer>
    </div>
  );
}

export default Tictactoe;