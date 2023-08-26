import express from "express";
import ViteExpress from "vite-express";
import { Server } from "socket.io";

const app = express();

const server = ViteExpress.listen(app, 3000, () =>
    console.log("Server is listening on port 3000...")
);

const io = new Server(server);
interface user {
    id: string;
    socketId: string;
    color: string;
    atRoom: string;
}
let users: user[] = [];
const colors = ['hotpink', 'blue', 'red', 'orange']

io.on("connection", (socket) => {
    socket.on('join', ({ id, path }) => {
        const u: user = {
            id,
            socketId: socket.id,
            color: colors[Math.floor(Math.random() * colors.length)],
            atRoom: path
        }
        socket.join(path)
        users.push(u)
        socket.emit('joined', { user: u, users })
        socket.to(path).emit('new', { user: u, users })
        console.log(u);
    })

    socket.on('focus', (u) => {
        console.log(u)
        socket.to(u.atRoom).emit('ufocus', u)
    })
    socket.on('blur', (u) => {
        socket.to(u.atRoom).emit('ublur', u)
    })

    socket.on('typing', ({user,input}) => {
        socket.to(user.atRoom).emit('typing', input)
    })

    socket.on('disconnect', () => {
        const u = users.find(u => u.socketId === socket.id)
        if (u) {
            users = users.filter(u => u.socketId !== socket.id)
            socket.to(u.atRoom).emit('left', { user: u, users })
            console.log(`User ${u.id} left the room ${u.atRoom}`)
        }
    })
})
