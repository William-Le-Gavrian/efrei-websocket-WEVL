import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Trophy, User, Gamepad2, LogOut } from 'lucide-react';
import Lobby from './components/Lobby';
import Tictactoe from './components/Tictactoe';
import Shifumi from './components/Shifumi';
import PseudoEntry from './components/PseudoEntry';

const socket = io("http://localhost:3000");

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [myPseudo, setMyPseudo] = useState("");
  const [currentGame, setCurrentGame] = useState("");
  const [stats, setStats] = useState({ wins: 0 });

  useEffect(() => {
    const savedPseudo = localStorage.getItem("player_pseudo");
    if (savedPseudo) {
      setMyPseudo(savedPseudo);
      const savedStats = localStorage.getItem(`stats_${savedPseudo.toLowerCase()}`);
      if (savedStats) setStats(JSON.parse(savedStats));
    }

    socket.on("update_ui", (state) => {
      setGameState(state);
    });

    socket.on("security_error", (msg) => alert(msg));

    return () => {
      socket.off("update_ui");
      socket.off("security_error");
    };
  }, []);

  const savePseudo = (pseudo) => {
    localStorage.setItem("player_pseudo", pseudo);
    setMyPseudo(pseudo);
  };

  const handleJoin = (pseudo, room, gameType) => {
    setCurrentGame(gameType);
    socket.emit("join_game", { room, pseudo, gameType });
    setIsJoined(true);
  };

  const handleMove = (index) => {
    socket.emit("make_move", index);
  };

  const handleLogout = () => {
    localStorage.removeItem("player_pseudo");
    window.location.reload();
  };

  if (!myPseudo) {
    return <PseudoEntry onSave={savePseudo} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] font-gaming text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* BACKGROUND SPACE SYSTEM - VERSION AMÉLIORÉE */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
        {/* Étoiles (Augmentées pour plus de clarté) */}
        <div 
          className="absolute inset-0 opacity-60" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
            backgroundSize: '50px 50px' 
          }}
        />

        {/* Le Soleil (Orange/Jaune bien plus présent) */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-orange-500/30 blur-[100px] animate-pulse" />
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400/20 blur-[50px]" />

        {/* Planète Bleue (Plus lumineuse) */}
        <div className="absolute top-[20%] right-[15%] w-72 h-72 rounded-full bg-blue-500/30 blur-[80px]" />

        {/* Planète Rouge (Maintenant bien visible en bas à gauche) */}
        <div className="absolute bottom-[20%] left-[10%] w-64 h-64 rounded-full bg-red-500/30 blur-[70px]" />

        {/* Anneaux d'orbites (Légèrement plus blancs pour le contraste) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-white/10 rounded-full opacity-50" />
      </div>

      {/* HEADER GAMING PERMANENT */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40 group-hover:rotate-12 transition-transform">
              <Gamepad2 size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase">WEVL</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
              <User size={14} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">{myPseudo}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
              <Trophy size={14} className="text-yellow-500" />
              <span className="text-xs font-bold text-yellow-500">{stats.wins} WINS</span>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Changer de compte"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="relative z-10 py-10 px-4">
        {!isJoined ? (
          <Lobby onJoin={handleJoin} initialPseudo={myPseudo} />
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            {currentGame === "morpion" ? (
              <Tictactoe gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
            ) : (
              <Shifumi gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;