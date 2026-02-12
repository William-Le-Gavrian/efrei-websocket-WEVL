import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

function Chat({ messages, socket, socketId }) {
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    // Scroll automatique vers le bas à chaque nouveau message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        socket.emit("message", input);
        setInput("");
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/20 backdrop-blur-md border-l border-white/5">
            {/* Header du Chat */}
            <div className="p-4 border-b border-white/5 bg-slate-900/40">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Canal de communication</h3>
            </div>

            {/* Zone des messages avec scrollbar personnalisée */}
            <ul 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth
                           [&::-webkit-scrollbar]:w-1.5
                           [&::-webkit-scrollbar-track]:bg-transparent
                           [&::-webkit-scrollbar-thumb]:bg-white/10
                           [&::-webkit-scrollbar-thumb]:rounded-full
                           hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50"
            >
                {messages.map((msg, i) => (
                    <li
                        key={i}
                        className={`flex flex-col animate-in fade-in slide-in-from-right-2 duration-300 ${
                            msg.userId === socketId ? "items-end" : "items-start"
                        }`}
                    >
                        {msg.userId === 'system' ? (
                            <div className="w-full text-center py-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/30 px-3 py-1 rounded-full border border-white/5">
                                    {msg.content}
                                </span>
                            </div>
                        ) : (
                            <div className={`max-w-[85%] group`}>
                                <div className={`text-[10px] font-bold mb-1 uppercase tracking-tighter opacity-50 ${
                                    msg.userId === socketId ? "text-right" : "text-left"
                                }`}>
                                    {msg.username}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm break-words shadow-sm ${
                                    msg.userId === socketId
                                        ? "bg-blue-600 text-white rounded-tr-none shadow-blue-900/20"
                                        : "bg-slate-800 text-slate-200 rounded-tl-none shadow-black/40"
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {/* Input fixé en bas */}
            <div className="p-4 bg-slate-900/60 border-t border-white/5">
                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full p-3 pr-12 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        placeholder="Écrire un message..."
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 p-2 text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chat;