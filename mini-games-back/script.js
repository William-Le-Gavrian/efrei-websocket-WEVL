import express from "express";
import http from "http";
import { Server } from "socket.io";
import { roomHandlers } from "./websocket/handlers/rooms.handler.js";
import { connectDB } from "./services/mongodb.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Nouveau pilote connecté : ${socket.id}`);

  roomHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`Pilote déconnecté : ${socket.id}`);
  });
});

const PORT = 3001;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
  🚀 ARÈNE WEVL DÉMARRÉE
  🛰️  Adresse : http://localhost:${PORT}
  ----------------------------------
    `);
  });
}).catch((err) => {
  console.error("❌ Erreur connexion MongoDB :", err);
  process.exit(1);
});