function Morpion({ gameState, onMove, myPseudo, socketId }) {
  if (!gameState) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      Chargement de l'arène...
    </div>
  );

  const { board, players, turn, status } = gameState;
  
  const currentPlayer = players[turn];
  const isMyTurn = currentPlayer?.id === socketId;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      {/* Header : Infos des joueurs */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
          <div className={`text-center p-2 rounded-lg transition-all ${turn === 0 ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'opacity-50'}`}>
            <p className="text-xs text-slate-400 font-bold uppercase">Joueur X</p>
            <p className="font-black text-blue-400">{players[0]?.pseudo || 'En attente...'}</p>
          </div>
          
          <div className="text-2xl font-black text-slate-600 italic">VS</div>
          
          <div className={`text-center p-2 rounded-lg transition-all ${turn === 1 ? 'ring-2 ring-red-500 bg-red-500/10' : 'opacity-50'}`}>
            <p className="text-xs text-slate-400 font-bold uppercase">Joueur O</p>
            <p className="font-black text-red-400">{players[1]?.pseudo || 'En attente...'}</p>
          </div>
        </div>
      </div>

      {/* État de la partie */}
      <div className="mb-8 text-center h-12">
        {status === 'playing' ? (
          <div className={`text-xl font-bold px-6 py-2 rounded-full border-2 ${isMyTurn ? 'border-yellow-500 text-yellow-500 animate-pulse' : 'border-slate-700 text-slate-500'}`}>
            {isMyTurn ? "🔥 C'EST TON TOUR !" : `Attente de ${currentPlayer?.pseudo}...`}
          </div>
        ) : (
          <div className="text-blue-400 font-bold italic animate-bounce">
            En attente d'un adversaire...
          </div>
        )}
      </div>

      {/* Le Plateau (Grille) */}
      <div className="grid grid-cols-3 gap-4 bg-slate-800 p-4 rounded-3xl shadow-2xl border border-slate-700">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => onMove(i)}
            disabled={!isMyTurn || cell !== null || status !== 'playing'}
            className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-6xl font-black transition-all transform active:scale-90
              ${!cell && isMyTurn && status === 'playing' ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' : 'bg-slate-900 cursor-default'}
              ${cell === 'X' ? 'text-blue-500' : 'text-red-500'}
              ${!isMyTurn && !cell ? 'opacity-40' : 'opacity-100'}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Pied de page */}
      <div className="mt-12 text-slate-500 text-sm font-medium">
        Connecté en tant que <span className="text-slate-300">{myPseudo}</span>
      </div>
    </div>
  );
}

export default Morpion;