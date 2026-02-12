import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { roomHandlers } from "./websocket/handlers/rooms.handler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// On ne crée pas le "new Server" tout de suite !
let io;

console.log("⏳ Tentative de connexion à MongoDB Atlas...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✨ BASE DE DONNÉES : Connecté avec succès !");
    
    // ON DÉMARRE SOCKET.IO UNIQUEMENT ICI
    io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on("connection", (socket) => {
      console.log(`📡 Nouveau pilote connecté : ${socket.id}`);
      roomHandlers(io, socket);
      socket.on("disconnect", () => console.log(`❌ Pilote déconnecté : ${socket.id}`));
    });

    const PORT = 3001; 
    server.listen(PORT, () => {
      console.log(`
      🚀 ARÈNE WEVL DÉMARRÉE
      🛰️  Adresse : http://localhost:${PORT}
      ----------------------------------
      `);
    });
  })
  .catch(err => {
    console.error("❌ ERREUR CRITIQUE BDD : Impossible de se connecter.");
    console.error("Détails :", err.message);
    process.exit(1); // On arrête tout si la BDD n'est pas là
  });