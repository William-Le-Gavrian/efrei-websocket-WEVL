import {useEffect, useState} from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Room() {
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const handleJoin = () => {
        if(username.trim() && roomId.trim()) {
            socket.emit('room:join', { username, roomId });
            setJoined(true);
        }
    }

    const handleLeave = () => {
        socket.emit('room:leave');
        setJoined(false);
        setMessages([]);
    }

    useEffect(() => {
        socket.on('room:message', (msg) => {
            setMessages((prev) => [
                ...prev,
                { type: "chat", username: msg.username, content: msg.content, timestamp: Date.now(), self: true }
            ]);
        })
        return () => socket.off("room:message");
    }, []);

    const handleMessage = (e) => {
        e.preventDefault();
        if(message.trim() !== "") {
            socket.emit("room:message", {msg: message});
            setMessage("");
        }
    }

    console.log(messages);

    return (
        <div>
            {!joined ? (
                <div>
                    <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
                    <button onClick={handleJoin}>Rejoindre</button>
                </div>
            ) : (
                <div>
                    <button onClick={handleLeave}>Quitter la room</button>
                    <ul>
                        {messages.map((msg, idx) => (
                            <li key={idx} style={{ fontStyle: msg.type === 'system' ? 'italic' : 'normal' }}>
                                {msg.type === 'chat' ? `${msg.username} : ${msg.content.msg}` : msg.content.msg}
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleMessage}>
                        <input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Écris un message..."
                        />
                        <button type="submit">Envoyer</button>
                    </form>
                </div>
            )}
        </div>
    );
}
