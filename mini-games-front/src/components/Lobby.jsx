import { useState } from 'react';

function Lobby({ onJoin }) {
  const [pseudo, setPseudo] = useState("");
  const [room, setRoom] = useState("");
  const [gameType, setGameType] = useState("morpion");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase transition-all duration-300">
            {gameType === "morpion" ? "TIC TAC TOE" : "SHI-FU-MI"}{' '}
            <span className="text-blue-500 text-2xl italic">
              {gameType === "morpion" ? "I/O" : "S/F/M"}
            </span>
          </h1>
          
          {/* Optionnel : Un petit rappel visuel sous le titre */}
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] mt-2">
            {gameType === "morpion" ? "ALIGNER TROIS SYMBOLES" : "PIERRE FEUILLE CISEAUX"}
          </p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onJoin(pseudo, room, gameType); }} className="space-y-6">
          {/* SÉLECTEUR DE JEU */}
          <div className="flex p-1 bg-slate-800 rounded-2xl gap-1">
            <button 
              type="button"
              onClick={() => setGameType("morpion")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'morpion' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              ⭕ MORPION
            </button>
            <button 
              type="button"
              onClick={() => setGameType("shifumi")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gameType === 'shifumi' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              ✊ SHIFUMI
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Combattant</label>
            <input 
              type="text" 
              placeholder="Pseudo..."
              className="w-full p-4 bg-slate-800 text-white rounded-2xl border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all"
              onChange={(e) => setPseudo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Nom de la salle</label>
            <input 
              type="text" 
              placeholder="Ex: Arena-75"
              className="w-full p-4 bg-slate-800 text-white rounded-2xl border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all"
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </div>

          <button className="group relative w-full p-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-900/40 overflow-hidden">
            <span className="relative z-10 tracking-widest uppercase italic">Lancer le duel</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Lobby;