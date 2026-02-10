import { useState } from 'react';

function Lobby({ onJoin }) {
  const [pseudo, setPseudo] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pseudo && room) {
      onJoin(pseudo, room);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-4xl font-black text-center text-white mb-8 tracking-tight">
          MORPION <span className="text-blue-500">I/O</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">TON PSEUDO</label>
            <input 
              type="text" 
              placeholder="Ex: Ryu_94" 
              className="w-full p-4 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setPseudo(e.target.value)} 
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">NOM DU DOJO (ROOM)</label>
            <input 
              type="text" 
              placeholder="Ex: Final_Fight" 
              className="w-full p-4 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setRoom(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transform active:scale-95 transition-all"
          >
            REJOINDRE LE COMBAT
          </button>
        </form>
      </div>
    </div>
  );
}

export default Lobby;