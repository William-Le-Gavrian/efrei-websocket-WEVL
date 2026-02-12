import { useState, useEffect } from 'react';

function Lobby({ onJoin, initialPseudo }) {
  const [room, setRoom] = useState("Mercure"); 
  const [gameType, setGameType] = useState("tictactoe");
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const rooms = [
    "Mercure", "Vénus", "Terre",
    "Mars", "Jupiter", "Saturne",
    "Uranus", "Neptune", "Pluto is a planet !!"
  ];

  useEffect(() => {
    if (initialPseudo) {
      const savedData = localStorage.getItem(`stats_${initialPseudo.toLowerCase()}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setStats({ wins: parsed.wins || 0, losses: parsed.losses || 0 });
      }
    }
  }, [initialPseudo]);

  return (
    <div className="flex items-center justify-center p-4 font-gaming">
      <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
        
        {/* Titre et Stats (inchangés) */}
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                {gameType === "tictactoe" ? "TIC TAC TOE" : "SHI-FU-MI"}
            </h1>
            <p className="text-blue-500 font-bold text-xs mt-2 italic tracking-widest">
                JOUEUR : {initialPseudo.toUpperCase()} | {stats.wins}W - {stats.losses}L
            </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onJoin(initialPseudo, room, gameType); }} className="space-y-6">
          
          {/* SÉLECTEUR DE JEU */}
          <div className="flex p-1 bg-slate-800/50 rounded-2xl gap-1 border border-white/5">
            <button type="button" onClick={() => setGameType("tictactoe")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'tictactoe' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
              TICTACTOE
            </button>
            <button type="button" onClick={() => setGameType("shifumi")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'shifumi' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
              SHIFUMI
            </button>
          </div>

          {/* LISTE DÉROULANTE DES SALLES */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Sélectionner une Planète</label>
            <div className="relative">
              <select 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full p-4 bg-slate-800 text-white rounded-2xl border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer font-bold"
              >
                {rooms.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r.replace('-', ' ')}
                  </option>
                ))}
              </select>
              {/* Petite flèche personnalisée */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                ▼
              </div>
            </div>
          </div>

          <button className="w-full p-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-900/40 uppercase italic tracking-widest">
            Atterissage sur la Planète
          </button>
        </form>
      </div>
    </div>
  );
}

export default Lobby;