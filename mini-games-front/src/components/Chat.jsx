import { useState } from "react";

function Chat({ messages, socket, socketId }) {
    const [input, setInput] = useState("");

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        socket.emit("message", input);
        setInput("");
    };

    return (
        <div className="w-80 bg-slate-900/40 p-4 rounded-2xl flex flex-col">

            <ul className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages.map((msg, i) => (
                    <li
                        key={i}
                        className={`text-sm ${
                            msg.userId === socketId
                                ? "text-blue-400"
                                : "text-white"
                        }`}
                    >
                      {msg.userId === 'system' ? (
                        <strong>
                          {msg.content}
                        </strong>
                        ) : (
                          <div>
                            <strong>{msg.username}:</strong> {msg.content}
                          </div>
                      )}
                    </li>
                ))}
            </ul>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-800 rounded-xl text-white"
                    placeholder="Message..."
                />
                <button className="px-4 bg-blue-600 rounded-xl">
                    Envoyer
                </button>
            </form>
        </div>
    );
}

export default Chat;
