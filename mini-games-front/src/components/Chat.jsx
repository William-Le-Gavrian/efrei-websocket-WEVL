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
        <div className="w-full h-full bg-slate-900/40 flex flex-col border-l border-white/5">
            
            <div className="p-4 border-b border-white/5">
                <h3 className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Canal de communication</h3>
            </div>

            {/* Scrollbar stylisée en Tailwind pur */}
            <ul className="flex-1 overflow-y-auto p-4 space-y-4 
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-blue-600/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-blue-500">
                
                {messages.map((msg, i) => (
                    <li
                        key={i}
                        className={`text-sm flex flex-col ${
                            msg.userId === socketId ? "items-end" : "items-start"
                        }`}
                    >
                        {msg.userId === 'system' ? (
                            <div className="w-full text-center py-2">
                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase font-bold italic">
                                    {msg.content}
                                </span>
                            </div>
                        ) : (
                            <>
                                <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">
                                    {msg.username}
                                </span>
                                <div className={`px-3 py-2 rounded-2xl max-w-[90%] break-words ${
                                    msg.userId === socketId 
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20" 
                                    : "bg-slate-800 text-white rounded-tl-none"
                                }`}>
                                    {msg.content}
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <form onSubmit={sendMessage} className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-3 bg-slate-800/30 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="Message..."
                />
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                >
                    ENVOYER
                </button>
            </form>
        </div>
    );
}

export default Chat;