import React from 'react';
import Loader from "./Loader.jsx";

function Shifumi({ gameState, onMove, socketId, onLeave }) {
  if (!gameState) return (
      <Loader/>
  );

  const { players, status, lastResult, choices, scores } = gameState;

  const safeChoices = choices || {};
  const myChoice = safeChoices[socketId] || null;
  const hasPlayed = myChoice !== null;
  
  const me = players.find(p => p.id === socketId);
  const opponent = players.find(p => p.id !== socketId);

  const opponentChoice = opponent ? safeChoices[opponent.id] : null;

  const moves = [
    { id: 'pierre', icon: '✊', label: 'PIERRE', color: 'from-blue-500 to-blue-700 shadow-blue-500/20' },
    { id: 'feuille', icon: '✋', label: 'FEUILLE', color: 'from-emerald-500 to-emerald-700 shadow-emerald-500/20' },
    { id: 'ciseaux', icon: '✌️', label: 'CISEAUX', color: 'from-rose-500 to-rose-700 shadow-rose-500/20' }
  ];

  return (
    <div className="min-h-[80vh] text-white flex flex-col items-center p-4 sm:p-6 font-gaming bg-transparent">
      
      {/* Header : SCORES & VS - Style Glassmorphism */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl mb-10 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
        
        {/* Ton Score */}
        <div className="text-center z-10 flex flex-col items-center flex-1">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Toi</p>
          <p className="font-black text-lg sm:text-xl truncate w-full px-2 tracking-tight">{me?.pseudo || '...'}</p>
          <div className="flex gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < (scores?.[socketId] || 0) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        
        <div className="px-5 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/30 font-black italic text-sm">VS</div>
        
        {/* Score Adversaire */}
        <div className="text-center z-10 flex flex-col items-center flex-1">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">Adversaire</p>
          <p className="font-black text-lg sm:text-xl truncate w-full px-2 tracking-tight">{opponent?.pseudo || 'En attente...'}</p>
          <div className="flex gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < (scores?.[opponent?.id] || 0) ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center">
        {status === 'playing' && (
          <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                {hasPlayed ? "Arme verrouillée !" : "Choisis ton arme"}
              </h2>
            </div>
            
            <div className="flex justify-center gap-4 sm:gap-8">
              {moves.map((move) => (
                <div key={move.id} className="flex flex-col items-center gap-4">
                  <button
                    onClick={() => onMove(move.id)}
                    disabled={hasPlayed}
                    className={`
                      relative group w-24 h-24 sm:w-36 sm:h-36 rounded-3xl text-5xl sm:text-6xl 
                      flex items-center justify-center transition-all duration-500 border-2
                      ${myChoice === move.id ? 'border-blue-400 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30'}
                      ${hasPlayed && myChoice !== move.id ? 'opacity-20 grayscale scale-90' : 'opacity-100'}
                      bg-gradient-to-br ${move.color}
                    `}
                  >
                    <span>{move.icon}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'finished' && (
          <div className="text-center space-y-10 animate-in zoom-in duration-500 w-full">
             <div className="flex items-center justify-center gap-8 sm:gap-20">
                {/* Révélation Ton Choix */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] text-blue-400 font-black">Toi</span>
                    <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-6xl shadow-2xl">
                      {moves.find(m => m.id === myChoice)?.icon || "❓"}
                    </div>
                </div>

                <div className="text-4xl font-black italic text-white/20">VS</div>

                {/* Révélation Choix Adversaire (Fini le bug du ?) */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] text-rose-400 font-black">Lui</span>
                    <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-6xl shadow-2xl">
                      {moves.find(m => m.id === opponentChoice)?.icon || "❓"}
                    </div>
                </div>
             </div>
             
             <div className="space-y-4">
               <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter">
                  {lastResult === 'draw' ? <span className="text-slate-400">ÉGALITÉ</span> : 
                   lastResult === socketId ? <span className="text-blue-500 animate-pulse">MISSION RÉUSSIE</span> : <span className="text-rose-600">DÉFAITE SPATIALE</span>}
               </h1>
               <p className="text-slate-500 font-bold tracking-[0.5em] text-xs uppercase">Duel spatial terminé en 3 manches</p>
             </div>

             <button 
                onClick={onLeave}
                className="group relative px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl active:scale-95"
             >
               Quitter le Duel
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shifumi;