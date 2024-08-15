import express from 'express';
import {Server} from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors';

const io = new Server();
const app = express();

app.use(cors());
app.use(bodyParser.json());

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('message', (msg) => {
        console
        .log('message: ' + msg);
        io.emit('message', msg);
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})



app.listen(8000,()=>{
    console.log('Server is running on port 8000');
})

io.listen(8001);