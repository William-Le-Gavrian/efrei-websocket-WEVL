import { useState, useEffect, useRef } from "react";

function Chat({ messages, socket, socketId }) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        socket.emit("message", input);
        setInput("");
    };

    return (
        <div className="w-full h-full bg-slate-900/60 flex flex-col border-l border-white/5">
            
            {/* Header du Chat */}
            <div className="p-4 border-b border-white/5 shrink-0">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-blue-400 uppercase">
                    Communication Link
                </h3>
            </div>

            {/* Liste des messages : flex-1 prend tout l'espace et pousse l'input en bas */}
            <ul className="flex-1 overflow-y-auto p-4 space-y-3 
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-blue-600/30
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50">
                
                {messages.map((msg, i) => (
                    <li
                        key={i}
                        className={`flex flex-col ${
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
                                <div className={`px-3 py-2 rounded-2xl max-w-[90%] break-words text-sm shadow-sm ${
                                    msg.userId === socketId 
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-900/20" 
                                    : "bg-slate-800 text-slate-200 rounded-tl-none"
                                }`}>
                                    {msg.content}
                                </div>
                            </>
                        )}
                    </li>
                ))}
                {/* Élément invisible pour forcer le scroll en bas */}
                <div ref={messagesEndRef} />
            </ul>

            {/* Formulaire d'envoi : Toujours en bas grâce au flex-col du parent */}
            <form 
                onSubmit={sendMessage} 
                className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-2 shrink-0"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-3 bg-slate-800/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="Message..."
                />
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-blue-900/40 shrink-0"
                >
                    ENVOYER
                </button>
            </form>
        </div>
    );
}

export default Chat;