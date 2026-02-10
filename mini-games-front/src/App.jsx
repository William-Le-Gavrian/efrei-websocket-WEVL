import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Tictactoe from './components/Tictactoe';
import Shifumi from './components/Shifumi';

const socket = io("http://localhost:3000");

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [myPseudo, setMyPseudo] = useState("");
  const [currentGame, setCurrentGame] = useState("");

  useEffect(() => {
    socket.on("update_ui", (state) => {
      setGameState(state);
    });
    socket.on("security_error", (msg) => alert(msg));
    return () => socket.off();
  }, []);

  const handleJoin = (pseudo, room, gameType) => {
    setMyPseudo(pseudo);
    setCurrentGame(gameType);
    socket.emit("join_game", { room, pseudo, gameType });
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
        <>
          {/* On affiche l'un ou l'autre selon le choix du lobby */}
          {currentGame === "morpion" ? (
            <Tictactoe 
              gameState={gameState} 
              onMove={handleMove}
              myPseudo={myPseudo}
              socketId={socket.id}
            />
          ) : (
            <Shifumi 
              gameState={gameState} 
              onMove={handleMove}
              myPseudo={myPseudo}
              socketId={socket.id}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;