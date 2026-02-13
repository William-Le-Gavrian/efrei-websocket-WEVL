import React from "react";

function Loader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-500 font-black tracking-widest animate-pulse font-gaming uppercase">Initialisation du Nexus...</p>
            </div>
        </div>
    );
}

export default Loader;