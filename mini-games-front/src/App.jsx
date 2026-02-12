import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Trophy, User, Gamepad2, LogOut, Medal, Skull } from 'lucide-react';
import Lobby from './components/Lobby';
import Tictactoe from './components/Tictactoe';
import Shifumi from './components/Shifumi';
import Chat from "./components/Chat";
import PseudoEntry from './components/PseudoEntry';
import Classement from './components/Classement';

const socket = io("http://localhost:3001");

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [myPseudo, setMyPseudo] = useState("");
  const [currentGame, setCurrentGame] = useState("");
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [showClassement, setShowClassement] = useState(false);
  const [messages, setMessages] = useState([]);
  const processedGameRef = useRef(null);

  useEffect(() => {
    const savedPseudo = localStorage.getItem("player_pseudo");
    if (savedPseudo) {
      setMyPseudo(savedPseudo);
      const savedStats = localStorage.getItem(`stats_${savedPseudo.toLowerCase()}`);
      if (savedStats) {
        const s = JSON.parse(savedStats);
        setStats(s);
        socket.emit('sync_stats', { pseudo: savedPseudo, ...s });
      }
    }

    socket.on("update_ui", (state) => {
      setGameState((prevState) => {
        const gameId = `${state.roomName}_${state.status}`;

        if (state.status === 'finished' && prevState?.status !== 'finished' && state.lastResult !== 'draw' && processedGameRef.current !== gameId) {
          processedGameRef.current = gameId;
          
          let iWon = false;
          if (state.gameType === 'tictactoe') {
            const myIndex = state.players.findIndex(p => p.id === socket.id);
            const mySymbol = myIndex === 0 ? 'X' : 'O';
            iWon = state.lastResult === mySymbol;
          } else {
            iWon = state.lastResult === socket.id;
          }

          setStats(prev => {
            const newStats = iWon
              ? { wins: prev.wins + 1, losses: prev.losses }
              : { wins: prev.wins, losses: prev.losses + 1 };
            
            const currentP = localStorage.getItem("player_pseudo");
            if (currentP) {
              localStorage.setItem(`stats_${currentP.toLowerCase()}`, JSON.stringify(newStats));
            }
            return newStats;
          });
        }

        if (state.status === 'waiting') {
          processedGameRef.current = null;
        }

        return state;
      });
    });

    socket.on("security_error", (msg) => {
      alert(msg);
      setIsJoined(false);
      setGameState(null);
      setCurrentGame("");
    });

    return () => {
      socket.off("update_ui");
      socket.off("security_error");
    };
  }, []);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.off("message");
  }, []);

  const savePseudo = (pseudo) => {
    localStorage.setItem("player_pseudo", pseudo);
    setMyPseudo(pseudo);
    const savedStats = localStorage.getItem(`stats_${pseudo.toLowerCase()}`);
    const s = savedStats ? JSON.parse(savedStats) : { wins: 0, losses: 0 };
    setStats(s);
    socket.emit('sync_stats', { pseudo, ...s });
  };

  const handleJoin = (pseudo, room, gameType) => {
    setCurrentGame(gameType);
    socket.emit("join_game", { room, pseudo, gameType });
    setIsJoined(true);
    setMessages([]);
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
    <div className="flex flex-col h-screen bg-[#020617] font-gaming text-slate-200 overflow-hidden">
      
      {/* BACKGROUND DECORATIF */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
        <div className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-white/10 rounded-full opacity-50" />
      </div>

      {/* HEADER FIXE */}
      <header className="z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl p-4 h-20 shrink-0">
        <div className="max-w-full mx-auto flex justify-between items-center">
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
              <Trophy size={14} className="text-yellow-500" />
              <span className="text-xs font-bold text-yellow-500">{stats.wins}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
              <Skull size={14} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">{stats.losses}</span>
            </div>
            <button onClick={() => { setShowClassement(prev => !prev); setIsJoined(false); }} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-all cursor-pointer">
              <Medal size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-400 hidden sm:inline uppercase">Classement</span>
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ZONE PRINCIPALE SPLIT : JEU + CHAT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* COLONNE GAUCHE : LOBBY OU JEU */}
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="p-6 h-full">
            {showClassement ? (
              <div className="max-w-4xl mx-auto"><Classement currentPseudo={myPseudo} socket={socket} /></div>
            ) : !isJoined ? (
              <div className="max-w-4xl mx-auto"><Lobby onJoin={handleJoin} initialPseudo={myPseudo} /></div>
            ) : (
              <div className="w-full h-full max-w-5xl mx-auto">
                {gameState ? (
                  <div className="animate-in fade-in zoom-in duration-300">
                    {currentGame === "tictactoe" ? (
                      <Tictactoe gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
                    ) : (
                      <Shifumi gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 italic">
                    Synchronisation orbitale en cours...
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* COLONNE DROITE : CHAT (Prend toute la hauteur restante sous le header) */}
        {isJoined && !showClassement && (
          <aside className="w-80 border-l border-white/5 bg-slate-950/40 backdrop-blur-md hidden lg:flex flex-col shrink-0 animate-in slide-in-from-right duration-500">
            <Chat 
              messages={messages} 
              socket={socket} 
              socketId={socket.id} 
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;