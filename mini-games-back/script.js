import express from "express";
import http from "http";
import { Server } from "socket.io";
import {roomHandlers} from "./websocket/handlers/rooms.handler.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log("New connection", socket.id);
    roomHandlers(io, socket);
})

server.listen(3000, () => {
    console.log("Server running");
});