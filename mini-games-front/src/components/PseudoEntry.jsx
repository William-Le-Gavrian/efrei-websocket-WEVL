import { useState } from 'react';

function PseudoEntry({ onSave }) {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-gaming bg-[#020617] relative overflow-hidden">
      
      {/* FOND SPATIAL HAUTE INTENSITÉ */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Étoiles plus brillantes */}
        <div 
          className="absolute inset-0 opacity-50" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', 
            backgroundSize: '40px 40px' 
          }}
        />

        {/* Le Soleil - Orange Éclatant (Haut Gauche) */}
        <div className="absolute -top-10 -left-10 w-[500px] h-[500px] rounded-full bg-orange-500/50 blur-[80px] saturate-200 animate-pulse" />
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-300/40 blur-[40px]" />

        {/* Planète Bleue Électrique (Milieu Droite) */}
        <div className="absolute top-[15%] right-[-5%] w-[450px] h-[450px] rounded-full bg-blue-600/50 blur-[90px] saturate-200" />

        {/* Planète Rouge Intense (Bas Gauche) */}
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-red-600/50 blur-[80px] saturate-200" />
      </div>

      {/* La carte (Glassmorphism) - On augmente le flou de la carte pour qu'elle ressorte sur les couleurs */}
      <div className="relative z-10 w-full max-w-sm p-8 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center animate-in fade-in zoom-in duration-500">
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Bienvenue <span className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span>
          </h2>
          <div className="h-1 w-12 bg-blue-500 mx-auto mt-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
        </div>

        <p className="text-slate-200 text-sm mb-8 font-bold uppercase tracking-wider leading-tight drop-shadow-md">
          Entre ton identifiant pour marquer <br /> 
          l'histoire de la galaxie.
        </p>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(input); }} className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ton pseudo..."
              className="w-full p-4 bg-slate-950/80 text-white rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-500 font-bold shadow-inner"
              onChange={(e) => setInput(e.target.value)}
              required
            />
          </div>

          <button className="group relative w-full p-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden flex justify-center items-center">
            <span className="relative z-10 uppercase italic tracking-[0.2em]">Initialiser le combat</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Efrei Websocket Project
        </p>
      </div>
    </div>
  );
}

export default PseudoEntry;