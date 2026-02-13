import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Trophy, User, Gamepad2, LogOut, Medal, Skull } from 'lucide-react';
import Lobby from './components/Lobby';
import Tictactoe from './components/Tictactoe';
import Shifumi from './components/Shifumi';
import Chat from "./components/Chat";
import PseudoEntry from './components/PseudoEntry';
import Classement from './components/Classement';
import Hangman from "./components/Hangman.jsx";

const socket = io("http://localhost:3001");

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [myPseudo, setMyPseudo] = useState("");
  const [currentGame, setCurrentGame] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [pendingSession, setPendingSession] = useState(() => {
    const saved = localStorage.getItem("pendingSession");
    return saved ? JSON.parse(saved) : null;
  });
  const [showClassement, setShowClassement] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const savedPseudo = localStorage.getItem("player_pseudo");
    if (savedPseudo) {
      setMyPseudo(savedPseudo);
    }

    const onConnect = () => {
      socket.emit("get_leaderboard");
      socket.emit("get_active_rooms");

      if (savedPseudo) {
        socket.emit("check_session", savedPseudo);
      }
    };

    socket.on("connect", onConnect);

    if (socket.connected) {
      onConnect();
    }

    socket.on("update_ui", (state) => {
      setGameState(state);
      if (state.status === 'finished') {
        localStorage.removeItem("pendingSession");
        setPendingSession(null);
      }
    });

    socket.on("leaderboard_update", (data) => {
      setLeaderboard(data);
    });

    socket.on("active_rooms_update", (rooms) => {
      setActiveRooms(rooms);
    });

    socket.on("session_found", ({ room, gameType }) => {
      const pseudo = localStorage.getItem("player_pseudo") || "";
      const session = { room, gameType, pseudo };
      localStorage.setItem("pendingSession", JSON.stringify(session));
      setPendingSession(session);
    });

    socket.on("no_session_found", () => {
      localStorage.removeItem("pendingSession");
      setPendingSession(null);
    });

    socket.on("security_error", (msg) => {
      alert(msg);
      setIsJoined(false);
      setGameState(null);
      setCurrentGame("");
      localStorage.removeItem("pendingSession");
      setPendingSession(null);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("update_ui");
      socket.off("leaderboard_update");
      socket.off("active_rooms_update");
      socket.off("session_found");
      socket.off("no_session_found");
      socket.off("security_error");
    };
  }, []);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.off("message");
  }, []);

  const myWins = leaderboard.filter(p => p.pseudo === myPseudo).reduce((sum, p) => sum + p.wins, 0);
  const myLosses = leaderboard.filter(p => p.pseudo === myPseudo).reduce((sum, p) => sum + p.losses, 0);

  const savePseudo = (pseudo) => {
    localStorage.setItem("player_pseudo", pseudo);
    setMyPseudo(pseudo);
  };

  const handleJoin = (pseudo, room, gameType) => {
    setCurrentGame(gameType);
    socket.emit("join_game", { room, pseudo, gameType });
    setIsJoined(true);
    setMessages([]);
    const session = { room, gameType, pseudo };
    localStorage.setItem("pendingSession", JSON.stringify(session));
    setPendingSession(session);
  };

  const handleMove = (index) => {
    socket.emit("make_move", index);
  };

  const handleLogout = () => {
    localStorage.removeItem("player_pseudo");
    setPendingSession(null);
    window.location.reload();
  };

  if (!myPseudo) return <PseudoEntry onSave={savePseudo} />;

  return (
    <div className="flex flex-col h-screen bg-[#020617] font-gaming text-slate-200 overflow-hidden">

      {/* BACKGROUND DECORATIF */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
        <div className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-white/10 rounded-full opacity-50" />
      </div>

      <header className="z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl p-4 h-20 shrink-0">
        <div className="max-w-full mx-auto flex justify-between items-center px-4">
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
              <span className="text-xs font-bold text-yellow-500">{myWins}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
              <Skull size={14} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">{myLosses}</span>
            </div>
            <button onClick={() => { setShowClassement(prev => !prev); setIsJoined(false); }} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-all cursor-pointer">
              <Medal size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-400 hidden sm:inline uppercase">CLASSEMENT</span>
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 py-10 px-4">
        {showClassement ? (
          <Classement leaderboard={leaderboard} currentPseudo={myPseudo} socket={socket} />
        ) : !isJoined ? (
          <Lobby onJoin={handleJoin} initialPseudo={myPseudo} leaderboard={leaderboard} activeRooms={activeRooms} pendingSession={pendingSession} />
        ) : (
          <div className="flex">
            <div className="animate-in fade-in zoom-in duration-300 flex-2">
              {currentGame === "tictactoe" && (
                  <Tictactoe gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
              )}
              {currentGame === "shifumi" && (
                  <Shifumi gameState={gameState} onMove={handleMove} myPseudo={myPseudo} socketId={socket.id} />
              )}
              {currentGame === "hangman" && (
                  <Hangman gameState={gameState} socket={socket} />
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
