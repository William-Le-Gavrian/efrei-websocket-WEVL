import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/lobby/Lobby';
import Morpion from './components/morpion/Morpion';

// Connexion au back-end
const socket = io("http://localhost:3000");

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [myPseudo, setMyPseudo] = useState("");

  useEffect(() => {
    socket.on("update_ui", (state) => {
      setGameState(state);
    });

    socket.on("security_error", (msg) => alert(msg));

    return () => {
      socket.off("update_ui");
      socket.off("security_error");
    };
  }, []);

  const handleJoin = (pseudo, room) => {
    if (!pseudo || !room) return alert("Remplis tous les champs !");
    setMyPseudo(pseudo);
    socket.emit("join_game", { room, pseudo });
    setIsJoined(true);
  };

  const handleMove = (index) => {
    socket.emit("make_move", index);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {!isJoined ? (
        <Lobby onJoin={handleJoin} />
      ) : (
        <Morpion 
          gameState={gameState} 
          onMove={handleMove}
          myPseudo={myPseudo}
          socketId={socket.id}
        />
      )}
    </div>
  );
}

export default App;