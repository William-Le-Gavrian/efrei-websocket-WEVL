import {useEffect, useState} from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Room() {
    // const [socket, setSocket] = useState(null);
    // const [connected, setConnected] = useState(false);
    //
    // const [username, setUsername] = useState("");
    // const [roomId, setRoomId] = useState("");
    // const [joined, setJoined] = useState(false);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    // const handleJoin = () => {
    //     socket.emit('room:join', {username, roomId});
    // }

    // const handleLeave = () => {
    //     socket.emit('room:leave', {username, roomId})
    // }

    useEffect(() => {
        socket.on('room:message', (msg) => {
            setMessages((prev) => [
                ...prev,
                { type: "chat", username: "bonjour", content: msg, timestamp: Date.now(), self: true }
            ]);
        })
        return () => socket.off("room:message");
    }, []);

    const handleMessage = (e) => {
        e.preventDefault();
        if(message.trim() !== "") {
            socket.emit("room:message", message);
            setMessage("");
        }
    }

    console.log(messages);

    return (
        <div>
            <h1>Chat Instantané</h1>
            <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{`${msg.username} : ${msg.content}`}</li>
                ))}
            </ul>
            <form onSubmit={handleMessage}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écris un message..."
                />
                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
}
