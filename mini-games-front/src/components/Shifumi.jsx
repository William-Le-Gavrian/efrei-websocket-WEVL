import React from 'react';

function Shifumi({ gameState, onMove, myPseudo, socketId }) {
  if (!gameState) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-500 font-black tracking-widest animate-pulse font-gaming uppercase">Initialisation du Duel...</p>
      </div>
    </div>
  );

  const { players, status, lastResult, choices, scores } = gameState;
  const myChoice = choices?.[socketId];
  const hasPlayed = !!myChoice;
  
  const me = players.find(p => p.id === socketId);
  const opponent = players.find(p => p.id !== socketId);

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
        
        {/* Mon Score */}
        <div className="text-center z-10 flex flex-col items-center">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Toi</p>
          <p className="font-black text-xl truncate tracking-tight">{me?.pseudo || '...'}</p>
          <div className="flex gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${i < (scores?.[socketId] || 0) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
        
        <div className="px-5 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/30 font-black italic text-sm">VS</div>
        
        {/* Score Adversaire */}
        <div className="text-center z-10 flex flex-col items-center">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">Adversaire</p>
          <p className="font-black text-xl truncate tracking-tight">{opponent?.pseudo || '???'}</p>
          <div className="flex gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${i < (scores?.[opponent?.id] || 0) ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Zone de combat / Résultat */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center">
        
        {status === 'waiting' && (
          <div className="text-center space-y-6 animate-pulse">
            <div className="text-7xl">⏳</div>
            <p className="text-slate-400 font-bold tracking-[0.3em] text-sm uppercase italic">En attente d'un joueur...</p>
          </div>
        )}

        {status === 'waiting_reconnect' && (
          <div className="text-center space-y-6 animate-pulse">
            <div className="text-7xl">📡</div>
            <p className="text-rose-500 font-bold tracking-[0.3em] text-sm uppercase italic">Le pilote adverse est déconnecté...</p>
          </div>
        )}

        {status === 'playing' && (
          <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                {hasPlayed ? "Arme verrouillée !" : "Choisis ton arme"}
              </h2>
              <p className="text-blue-500 text-xs font-bold tracking-[0.3em] uppercase mt-2">
                {hasPlayed ? "Attente de la réponse adverse..." : "Premier à 3 victoires"}
              </p>
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
                      ${myChoice === move.id ? 'border-blue-400 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30 hover:scale-105'}
                      ${hasPlayed && myChoice !== move.id ? 'opacity-20 grayscale scale-90' : 'opacity-100'}
                      bg-gradient-to-br ${move.color} shadow-2xl active:scale-95
                    `}
                  >
                    <span className="group-hover:rotate-12 transition-transform">{move.icon}</span>
                    {myChoice === move.id && (
                      <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 animate-bounce">
                        OK
                      </div>
                    )}
                  </button>
                  <span className={`text-[10px] font-black tracking-[0.2em] ${myChoice === move.id ? 'text-blue-400' : 'text-slate-500'}`}>
                    {move.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'finished' && (
          <div className="text-center space-y-10 animate-in zoom-in duration-500">
             <div className="flex items-center justify-center gap-8 sm:gap-20">
                {/* TON CHOIX FINAL */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">Toi</span>
                    <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl backdrop-blur-md">
                      {moves.find(m => m.id === choices?.[socketId])?.icon}
                    </div>
                </div>

                <div className="text-4xl font-black italic text-white/20 tracking-tighter">VS</div>

                {/* SON CHOIX FINAL */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">Lui</span>
                    <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl backdrop-blur-md">
                      {opponent ? moves.find(m => m.id === choices?.[opponent.id])?.icon : "❓"}
                    </div>
                </div>
             </div>
             
             <div className="space-y-4">
               <h1 className="text-7xl sm:text-8xl font-black italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  {lastResult === 'draw' ? <span className="text-slate-400">ÉGALITÉ</span> : 
                   lastResult === socketId ? <span className="text-blue-500 animate-pulse inline-block">MISSION RÉUSSIE</span> : <span className="text-rose-600">DÉFAITE</span>}
               </h1>
               <p className="text-slate-500 font-bold tracking-[0.5em] text-xs uppercase">Duel spatial terminé en 3 manches</p>
             </div>

             <button 
               onClick={() => window.location.reload()}
               className="group relative px-12 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 overflow-hidden"
             >
               <span className="relative z-10 uppercase tracking-widest italic text-sm">Nouvelle Mission</span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
             </button>
          </div>
        )}
      </div>

      <footer className="mt-auto py-8 text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase opacity-50 italic">
        Arena Network System // Room: {gameState.roomName} // Series: Best of 5
      </footer>
    </div>
  );
}

export default Shifumi;