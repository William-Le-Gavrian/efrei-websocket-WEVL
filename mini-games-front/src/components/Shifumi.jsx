import React from 'react';

function Shifumi({ gameState, onMove, myPseudo, socketId }) {
  if (!gameState) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse">
      CONNEXION À L'ARÈNE...
    </div>
  );

  const { players, status, lastResult, choices } = gameState;
  const myChoice = choices?.[socketId];
  const hasPlayed = !!myChoice;
  
  const opponent = players.find(p => p.id !== socketId);
  const me = players.find(p => p.id === socketId);

  const moves = [
    { id: 'pierre', icon: '✊', color: 'from-blue-600 to-blue-800 shadow-blue-900/50' },
    { id: 'feuille', icon: '✋', color: 'from-green-600 to-green-800 shadow-green-900/50' },
    { id: 'ciseaux', icon: '✌️', color: 'from-red-600 to-red-800 shadow-red-900/50' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 font-sans">
      
      {/* Header : Score ou VS */}
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl mb-10 flex justify-between items-center">
        <div className="text-center">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Toi</p>
          <p className="font-black text-xl truncate">{me?.pseudo || '...'}</p>
        </div>
        <div className="px-4 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-500 font-black italic">VS</div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Adversaire</p>
          <p className="font-black text-xl truncate">{opponent?.pseudo || 'En attente...'}</p>
        </div>
      </div>

      {/* Zone de combat / Résultat */}
      <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center space-y-12">
        
        {status === 'waiting' && (
          <div className="text-center space-y-4">
            <div className="text-5xl animate-bounce">⏳</div>
            <p className="text-slate-500 font-bold tracking-tighter">EN ATTENTE D'UN ADVERSAIRE...</p>
          </div>
        )}

        {status === 'playing' && (
          <div className="w-full space-y-10">
            <h2 className="text-center text-2xl font-black italic text-slate-400 uppercase">
              {hasPlayed ? "Coup enregistré ! Attente de l'autre..." : "Choisis ton arme !"}
            </h2>
            
            <div className="flex justify-center gap-6">
              {moves.map((move) => (
                <button
                  key={move.id}
                  onClick={() => onMove(move.id)}
                  disabled={hasPlayed}
                  className={`
                    relative group w-24 h-24 sm:w-32 sm:h-32 rounded-full text-4xl sm:text-5xl 
                    flex items-center justify-center transition-all duration-300 border-4
                    ${myChoice === move.id ? 'border-yellow-400 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}
                    ${hasPlayed && myChoice !== move.id ? 'opacity-20 grayscale' : 'opacity-100'}
                    bg-gradient-to-br ${move.color} shadow-xl active:scale-90
                  `}
                >
                  {move.icon}
                  {myChoice === move.id && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded-full uppercase">OK</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'finished' && (
          <div className="text-center space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-center gap-12 text-7xl">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase">Toi</span>
                    <span>{moves.find(m => m.id === choices[socketId])?.icon}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase tracking-tighter">Lui</span>
                    <span>{moves.find(m => m.id === choices[opponent.id])?.icon}</span>
                </div>
             </div>
             
             <h1 className="text-6xl font-black italic uppercase tracking-tighter drop-shadow-2xl">
                {lastResult === 'draw' ? "ÉGALITÉ !" : 
                 lastResult === socketId ? "VICTOIRE !" : "DÉFAITE..."}
             </h1>

             <button 
               onClick={() => window.location.reload()}
               className="px-10 py-4 bg-white text-slate-950 font-black rounded-full hover:bg-yellow-400 transition-colors shadow-xl"
             >
               REJOUER
             </button>
          </div>
        )}
      </div>

      <footer className="mt-10 text-slate-700 text-xs font-bold tracking-widest uppercase">
        Arena ID: <span className="text-slate-500">{gameState.roomName}</span>
      </footer>
    </div>
  );
}

export default Shifumi;