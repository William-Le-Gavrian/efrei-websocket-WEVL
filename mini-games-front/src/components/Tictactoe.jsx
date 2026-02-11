import React from 'react';

function Tictactoe({ gameState, onMove, myPseudo, socketId }) {
  if (!gameState) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-500 font-black tracking-widest animate-pulse font-gaming uppercase">Initialisation du Nexus...</p>
      </div>
    </div>
  );

  const { board, players, turn, status } = gameState;
  const currentPlayer = players[turn];
  const isMyTurn = currentPlayer?.id === socketId;

  // On identifie si je suis X ou O pour le style
  const myIndex = players.findIndex(p => p.id === socketId);

  return (
    <div className="min-h-[80vh] text-white flex flex-col items-center p-4 sm:p-6 font-gaming bg-transparent">
      
      {/* Barre de Status des Joueurs - Style Glassmorphism */}
      <div className="w-full max-w-md grid grid-cols-3 items-center bg-slate-900/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-rose-500/5 pointer-events-none"></div>
        
        <div className={`text-center z-10 transition-all duration-500 ${turn === 0 ? 'scale-110' : 'opacity-30'}`}>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">cosmonaute X</p>
          <p className="font-black text-xl text-blue-500 truncate drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{players[0]?.pseudo || '...'}</p>
        </div>
        
        <div className="text-center font-black text-white/20 italic text-2xl z-10">VS</div>
        
        <div className={`text-center z-10 transition-all duration-500 ${turn === 1 ? 'scale-110' : 'opacity-30'}`}>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">cosmonaute O</p>
          <p className="font-black text-xl text-rose-500 truncate drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">{players[1]?.pseudo || '...'}</p>
        </div>
      </div>

      {/* Info du tour en cours */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        {status === 'playing' ? (
          <div className={`px-8 py-2.5 rounded-full border-2 font-black transition-all tracking-[0.2em] text-xs uppercase shadow-lg
            ${isMyTurn 
              ? 'border-blue-500 text-white bg-blue-600/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse' 
              : 'border-white/5 text-white/20 bg-white/5'}`}>
            {isMyTurn ? "⭐ À TOI DE FRAPPER !" : `ATTENTE DE ${currentPlayer?.pseudo}...`}
          </div>
        ) : (
          <div className="text-blue-500 font-black italic tracking-widest animate-bounce uppercase">En attente d'un second pilote...</div>
        )}
      </div>

      {/* Grille de Jeu - Style Cybernetic */}
      <div className="relative group">
        {/* Halo lumineux derrière la grille */}
        <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => onMove(i)}
              disabled={!isMyTurn || cell !== null || status !== 'playing'}
              className={`
                w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-6xl font-black transition-all transform active:scale-90 relative overflow-hidden border
                ${!cell && isMyTurn ? 'bg-white/5 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 cursor-pointer' : 'bg-slate-950/40 border-transparent'}
                ${cell === 'X' ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]'}
                ${!isMyTurn && !cell ? 'opacity-10' : 'opacity-100'}
              `}
            >
              {cell && (
                <span className="animate-in zoom-in duration-300">
                  {cell === 'X' ? '✕' : '◯'}
                </span>
              )}
              {/* Effet de scan au survol sur les cases vides */}
              {!cell && isMyTurn && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent -translate-y-full hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <footer className="mt-auto py-8 text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase opacity-50 italic">
        Arena Network System // Pilot: {myPseudo}
      </footer>
    </div>
  );
}

export default Tictactoe;