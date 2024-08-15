import express from 'express';
import { Server } from "socket.io";
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow any origin
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(bodyParser.json());

const nameToSocketMap = new Map();
const socketToNameMap = new Map();

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('join-room', (data) => {
        console.log("User => ", data.name, "joined room => ", data.roomId);
        const { roomId, name } = data;
        nameToSocketMap.set(name, socket.id);
        socketToNameMap.set(socket.id, name);
        socket.join(roomId);
        socket.emit("joined-room",{roomId, name});
        socket.broadcast.to(roomId).emit('user-joined', { name });
    });

    socket.on('call-user', (data) => {
        const { name, offer } = data;
        const fromName = socketToNameMap.get(socket.id);
        const socketId = nameToSocketMap.get(name);
        socket.to(socketId).emit('incomming-call', { offer, from: fromName });
    });

    socket.on('call-accepted', (data) => {
        const { name, answer } = data;
        const socketId = nameToSocketMap.get(name);
        socket.to(socketId).emit('call-accepted', { answer });
    });
});

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
