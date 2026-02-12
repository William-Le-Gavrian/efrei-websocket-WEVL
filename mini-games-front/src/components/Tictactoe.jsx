import React from 'react';

function Tictactoe({ gameState, onMove, myPseudo, socketId, onLeave }) {
  if (!gameState) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-500 font-black tracking-widest animate-pulse font-gaming uppercase text-center">Initialisation du Nexus...</p>
      </div>
    </div>
  );

  const { board, players, turn, status, lastResult, scores } = gameState;
  
  const myIndex = players.findIndex(p => p.id === socketId);
  const isMyTurn = turn === myIndex;
  const mySymbol = myIndex === 0 ? 'X' : 'O';
  const currentPlayerPseudo = players[turn]?.pseudo || "Adversaire";

  return (
    <div className="min-h-[80vh] text-white flex flex-col items-center p-4 sm:p-6 font-gaming bg-transparent w-full max-w-2xl mx-auto">
      
      {/* Barre de Status et SCORES */}
      <div className="w-full max-w-md grid grid-cols-3 items-center bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl mb-8 relative">
        {/* Joueur X */}
        <div className={`text-center transition-all duration-300 ${turn === 0 ? 'scale-105 opacity-100' : 'opacity-40'}`}>
          <p className="text-[10px] font-bold text-blue-400 uppercase">Pilote X</p>
          <p className="font-black text-lg text-blue-500 truncate">{players[0]?.pseudo || '...'}</p>
          <div className="flex justify-center gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < (scores?.X || 0) ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        
        <div className="text-center">
            <div className="font-black text-white/20 italic text-xl">VS</div>
        </div>
        
        {/* Joueur O */}
        <div className={`text-center transition-all duration-300 ${turn === 1 ? 'scale-105 opacity-100' : 'opacity-40'}`}>
          <p className="text-[10px] font-bold text-rose-400 uppercase">Pilote O</p>
          <p className="font-black text-lg text-rose-500 truncate">{players[1]?.pseudo || '...'}</p>
          <div className="flex justify-center gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < (scores?.O || 0) ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Message de Tour / Fin */}
      <div className="mb-8 w-full flex justify-center">
        {status === 'playing' ? (
          <div className={`px-6 py-2 rounded-full border-2 font-black tracking-widest text-xs uppercase transition-all
            ${isMyTurn ? 'border-blue-500 text-white bg-blue-500/20 animate-pulse' : 'border-white/10 text-white/30'}`}>
            {isMyTurn ? "⭐ À TOI DE FRAPPER !" : `ATTENTE DE ${currentPlayerPseudo}...`}
          </div>
        ) : status === 'finished' ? (
          <div className="flex flex-col items-center gap-4 scale-in-center">
             <h1 className="text-4xl sm:text-6xl font-black italic uppercase text-center">
                {lastResult === 'draw' ? <span className="text-slate-400">ÉGALITÉ</span> : 
                 lastResult === mySymbol ? <span className="text-blue-500">VICTOIRE</span> : <span className="text-rose-600">DÉFAITE</span>}
             </h1>
             
             {/* Utilisation de onLeave au lieu du reload */}
             <button 
               onClick={onLeave} 
               className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all active:scale-95 uppercase text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)]"
             >
               Retour au menu
             </button>
          </div>
        ) : (
          <div className="text-blue-500 font-black tracking-widest animate-bounce uppercase text-sm">Attente du second pilote...</div>
        )}
      </div>

      {/* Grille de Jeu */}
      <div className={`grid grid-cols-3 gap-3 p-4 bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl transition-all ${status === 'finished' ? 'opacity-20 scale-95' : 'opacity-100'}`}>
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => onMove(i)}
            disabled={!isMyTurn || cell !== null || status !== 'playing'}
            className={`
              w-20 h-20 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center text-5xl font-black transition-all transform active:scale-90 border
              ${!cell && isMyTurn && status === 'playing' ? 'bg-blue-500/5 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer' : 'bg-slate-950/20 border-white/5 cursor-default'}
              ${cell === 'X' ? 'text-blue-500 shadow-blue-500' : 'text-rose-500 shadow-rose-500'}
            `}
          >
            {cell && (
              <span className="animate-in zoom-in duration-200">
                {cell === 'X' ? '✕' : '◯'}
              </span>
            )}
          </button>
        ))}
      </div>

      <footer className="mt-8 text-slate-600 text-[9px] font-bold tracking-[0.3em] uppercase opacity-40 italic">
        Arena System // Pilot: {myPseudo}
      </footer>
    </div>
  );
}

export default Tictactoe;