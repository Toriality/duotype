import "./style.css";
import io from "socket.io-client";

const socket = io();
let me: any;

socket.on("connect", () => {
    let id = localStorage.getItem("id")
    const path = document.location.pathname

    if (!id) {
        id = socket.id
        localStorage.setItem("id", id)
    }

    if (path === '/') {
        document.location.pathname = `/${id}`
    } else {
        socket.emit('join', { id, path })
        console.log(`Trying to join ${path}...`)
    }
})

socket.on('joined', ({ user, users }) => {
    console.log(`Successfully joined room with ${users.length} users`)
    me = user
    updateUsers(users);
})

socket.on('new', ({ user, users }) => {
    console.log(`User ${user.id} joined the room ${user.atRoom}`)
    updateUsers(users);
})

socket.on('left', ({ user, users }) => {
    console.log(`User ${user.id} left the room ${user.atRoom}`)
    updateUsers(users);
})

socket.on('ufocus', (u) => {
    console.log(`User ${u.id} is typing...`)
    input.style.border = `4px solid ${u.color}`
})

socket.on('ublur', (u) => {
    console.log(`User ${u.id} stopped typing...`)
    input.style.border = `2px solid black`
})

socket.on('typing', (i) => {
    input.innerHTML = i
})

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
`;


const usersList = document.createElement("ul");
usersList.id = "users";
document.body.appendChild(usersList);
function updateUsers(users: { id: string, color: string }[]) {
    usersList.innerHTML = "";
    users.forEach((u) => {
        const li = document.createElement("li");
        li.classList.add("user");
        li.style.backgroundColor = u.color;
        usersList.appendChild(li);
    })
}

const input: HTMLDivElement = document.createElement("div");
input.contentEditable = "true";
input.id = "input";

input.addEventListener('focus', () => {
    socket.emit('focus', me);
    input.style.border = `4px solid ${me.color}`
})

input.addEventListener('blur', () => {
    socket.emit('blur', me);
    input.style.border = `2px solid black`
})

input.addEventListener('input', () => {
    socket.emit('typing', { user: me, input: input.innerHTML })
})

document.body.appendChild(input);






