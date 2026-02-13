import { useState } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

function Lobby({ onJoin, initialPseudo, leaderboard, activeRooms, pendingSession }) {
  const [room, setRoom] = useState("");
  const [gameType, setGameType] = useState("tictactoe");

  const gameLeaderboard = leaderboard.filter(p => p.gameType === gameType);
  const myWins = gameLeaderboard.find(p => p.pseudo === initialPseudo)?.wins || 0;
  const myLosses = gameLeaderboard.find(p => p.pseudo === initialPseudo)?.losses || 0;

  const allRooms = [
    "Mercure", "Vénus", "Terre",
    "Mars", "Jupiter", "Saturne",
    "Uranus", "Neptune", "Pluto is a planet !!"
  ];

  const availableRooms = allRooms.filter(r => !activeRooms.includes(r));

  const canResume = pendingSession && pendingSession.pseudo === initialPseudo;
  console.log("Pending session:", pendingSession);

  const selectedRoom = (room && availableRooms.includes(room)) ? room : (availableRooms[0] || "");
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanRoom = room.trim().toLowerCase().replace(/\s+/g, '-');

    if (selectedRoom) onJoin(initialPseudo, selectedRoom, gameType); }
  };

  return (
    <div className="flex items-center justify-center p-4 font-gaming">
      <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">

        {/* Titre et Stats */}
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
              {{
                tictactoe: "TIC TAC TOE",
                shifumi: "SHI-FU-MI",
                hangman: "HANGMAN"
              }[gameType]}
            </h1>
            <p className="text-blue-500 font-bold text-xs mt-2 italic tracking-widest">
                JOUEUR : {initialPseudo.toUpperCase()} | {myWins}W - {myLosses}L
            </p>
        </div>

        {/* BOUTON REPRENDRE PARTIE EN COURS */}
        {canResume && (
          <button
            type="button"
            onClick={() => onJoin(initialPseudo, pendingSession.room, pendingSession.gameType)}
            className="w-full mb-6 p-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-900/40 uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <RotateCcw size={18} />
            Reprendre — {pendingSession.gameType.toUpperCase()} sur {pendingSession.room}
          </button>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SÉLECTEUR DE JEU */}
          <div className="flex p-1 bg-slate-800/50 rounded-2xl gap-1 border border-white/5">
            <button type="button" onClick={() => setGameType("tictactoe")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'tictactoe' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
              TICTACTOE
            </button>
            <button type="button" onClick={() => setGameType("shifumi")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'shifumi' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
              SHIFUMI
            </button>
            <button type="button" onClick={() => setGameType("hangman")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'hangman' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
              HANGMAN
            </button>
          </div>

          {/* LISTE DÉROULANTE DES SALLES */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Destination orbitale</label>
            <div className="relative">
              {availableRooms.length > 0 ? (
                <select
                  value={selectedRoom}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full p-4 bg-slate-800 text-white rounded-2xl border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer font-bold"
                >
                  {availableRooms.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-4 bg-slate-800/50 text-slate-500 rounded-2xl border-2 border-transparent font-bold text-center">
                  Toutes les planètes sont occupées
                </div>
              )}
              {availableRooms.length > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                  ▼
                </div>
              )}
            </div>
          </div>

          <button
            disabled={availableRooms.length === 0}
            className={`w-full p-5 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg uppercase italic tracking-widest ${
              availableRooms.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
                : 'bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            Atterissage sur la Planète
          </button>
        </form>

        {/* CLASSEMENT PAR JEU */}
        {gameLeaderboard.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-yellow-500">Classement {gameType === 'tictactoe' ? 'Tic Tac Toe' : 'Shifumi'}</h2>
            </div>
            <div className="space-y-2"> 
              {gameLeaderboard.map((player, index) => (
                <div key={player.pseudo}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    player.pseudo === initialPseudo
                      ? 'bg-blue-600/20 border-blue-500/30'
                      : 'bg-slate-800/50 border-white/5'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black w-6 text-center ${
                      index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{player.pseudo}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{player.wins} VICTOIRE{player.wins > 1 ? 'S' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;
