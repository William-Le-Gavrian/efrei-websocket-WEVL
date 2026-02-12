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
      setGameState(state);
      
      if (state.status === 'finished' && state.lastResult !== 'draw') {
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
          const currentPseudo = localStorage.getItem("player_pseudo");
          if (currentPseudo) {
            localStorage.setItem(`stats_${currentPseudo.toLowerCase()}`, JSON.stringify(newStats));
          }
          return newStats;
        });
      }
      setGameState((prevState) => {
        if (state.status === 'finished' && prevState?.status !== 'finished') {
          let iWon = false;

          if (state.gameType === 'shifumi' && state.lastResult === socket.id) {
            iWon = true;
          }

          if (state.gameType === 'tictactoe') {
            const myIndex = state.players.findIndex(p => p.id === socket.id);
            const mySymbol = myIndex === 0 ? 'X' : 'O';

            if (state.lastResult === mySymbol) {
              iWon = true;
            }
          }

          if (iWon) {
            setStats(prev => {
              const newStats = { wins: prev.wins + 1 };
              const currentPseudo = localStorage.getItem("player_pseudo");
              if (currentPseudo) {
                localStorage.setItem(`stats_${currentPseudo.toLowerCase()}`, JSON.stringify(newStats));
              }
              return newStats;
            });
          }
        }
        return state;
      });
    });

    socket.on("security_error", (msg) => alert(msg));

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
  }, [])

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

      {/* BACKGROUND SPACE SYSTEM */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
        <div className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-orange-500/30 blur-[100px] animate-pulse" />
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400/20 blur-[50px]" />
        <div className="absolute top-[20%] right-[15%] w-72 h-72 rounded-full bg-blue-500/30 blur-[80px]" />
        <div className="absolute bottom-[20%] left-[10%] w-64 h-64 rounded-full bg-red-500/30 blur-[70px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-white/10 rounded-full opacity-50" />
      </div>

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
              <span className="text-xs font-bold text-purple-400 hidden sm:inline">CLASSEMENT</span>
            </button>

            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 py-10 px-4">
        {showClassement ? (
          <Classement currentPseudo={myPseudo} socket={socket} />
        ) : !isJoined ? (
          <Lobby onJoin={handleJoin} initialPseudo={myPseudo} />
        ) : (
          <div className="flex">
            <div className="animate-in fade-in zoom-in duration-300 flex-2">
              {/* CORRECTION ICI : "tictactoe" au lieu de "Tictactoe" pour matcher ton Lobby */}
              {currentGame === "tictactoe" ? (
                <Tictactoe gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
              ) : (
                <Shifumi gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
              )}
            </div>
            <Chat
              messages={messages}
              socket={socket}
              socketId={socket.id}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;