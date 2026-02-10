import { useState } from 'react';

function PseudoEntry({ onSave }) {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl text-center">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Bienvenue Guerrier</h2>
        <p className="text-slate-400 text-sm mb-6">Entre ton pseudo pour enregistrer tes futures victoires.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(input); }}>
          <input 
            type="text" 
            placeholder="Ton pseudo..."
            className="w-full p-4 bg-slate-800 text-white rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none mb-4"
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-900/40">
            COMMENCER
          </button>
        </form>
      </div>
    </div>
  );
}

export default PseudoEntry;