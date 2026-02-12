import React from 'react';
import Loader from "./Loader.jsx";

function Tictactoe({ gameState, onMove, myPseudo, socketId }) {
  if (!gameState) return (
    <Loader/>
  );

  const { board, players, turn, status, lastResult, scores } = gameState;
  const currentPlayer = players[turn];
  const isMyTurn = currentPlayer?.id === socketId;

  const myIndex = players.findIndex(p => p.id === socketId);
  const mySymbol = myIndex === 0 ? 'X' : 'O';

  return (
    <div className="min-h-[80vh] text-white flex flex-col items-center p-4 sm:p-6 font-gaming bg-transparent">
      
      {/* Barre de Status et SCORES - Style Glassmorphism */}
      <div className="w-full max-w-md grid grid-cols-3 items-center bg-slate-900/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-rose-500/5 pointer-events-none"></div>
        
        {/* Joueur X */}
        <div className={`text-center z-10 transition-all duration-500 ${status === 'playing' && turn === 0 ? 'scale-110' : 'opacity-30'}`}>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Pilote X</p>
          <p className="font-black text-xl text-blue-500 truncate drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{players[0]?.pseudo || '...'}</p>
          
          {/* LEDs de score X */}
          <div className="flex justify-center gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${i < (scores?.X || 0) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
        
        {/* VS / Score central */}
        <div className="text-center z-10">
            <div className="font-black text-white/20 italic text-2xl tracking-tighter">VS</div>
            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Best of 5</div>
        </div>
        
        {/* Joueur O */}
        <div className={`text-center z-10 transition-all duration-500 ${status === 'playing' && turn === 1 ? 'scale-110' : 'opacity-30'}`}>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Pilote O</p>
          <p className="font-black text-xl text-rose-500 truncate drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">{players[1]?.pseudo || '...'}</p>
          
          {/* LEDs de score O */}
          <div className="flex justify-center gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${i < (scores?.O || 0) ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info du tour OU Fin de Match */}
      <div className="mb-10 text-center animate-in fade-in zoom-in duration-700">
        {status === 'playing' ? (
          <div className={`px-8 py-2.5 rounded-full border-2 font-black transition-all tracking-[0.2em] text-xs uppercase shadow-lg
            ${isMyTurn 
              ? 'border-blue-500 text-white bg-blue-600/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse' 
              : 'border-white/5 text-white/20 bg-white/5'}`}>
            {isMyTurn ? "⭐ À TOI DE FRAPPER !" : `ATTENTE DE ${currentPlayer?.pseudo}...`}
          </div>
        ) : status === 'finished' ? (
          <div className="flex flex-col items-center gap-6">
             <h1 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] text-center">
                {lastResult === 'draw' ? (
                  <span className="text-slate-400">ÉGALITÉ FINALE</span>
                ) : lastResult === mySymbol ? (
                  <span className="text-blue-500 animate-bounce inline-block">MISSION ACCOMPLIE</span>
                ) : (
                  <span className="text-rose-600">MISSION ÉCHOUÉE</span>
                )}
             </h1>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">Victoire finale après 3 manches</p>
             
             <button 
               onClick={() => window.location.reload()}
               className="group relative px-10 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 overflow-hidden shadow-xl"
             >
               <span className="relative z-10 uppercase tracking-widest italic">Nouvelle Campagne</span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
             </button>
          </div>
        ) : (
          <div className="text-blue-500 font-black italic tracking-widest animate-bounce uppercase">En attente d'un second pilote...</div>
        )}
      </div>

      {/* Grille de Jeu */}
      <div className={`relative group transition-all duration-500 ${status === 'finished' ? 'opacity-20 scale-90' : 'opacity-100'}`}>
        <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => onMove(i)}
              disabled={!isMyTurn || cell !== null || status !== 'playing'}
              className={`
                w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-6xl font-black transition-all transform active:scale-90 relative overflow-hidden border
                ${!cell && isMyTurn && status === 'playing' ? 'bg-white/5 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 cursor-pointer' : 'bg-slate-950/40 border-transparent cursor-default'}
                ${cell === 'X' ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]'}
                ${!isMyTurn && !cell ? 'opacity-10' : 'opacity-100'}
              `}
            >
              {cell && (
                <span className="animate-in zoom-in duration-300">
                  {cell === 'X' ? '✕' : '◯'}
                </span>
              )}
              {!cell && isMyTurn && status === 'playing' && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent -translate-y-full hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <footer className="mt-auto py-8 text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase opacity-50 italic">
        Arena Network System // Pilot: {myPseudo} // Series: Best of 5
      </footer>
    </div>
  );
}

export default Tictactoe;