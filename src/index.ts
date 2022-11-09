import { Socket } from "socket.io";

const io = require("socket.io")(3002, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let users : Array<any> = [];

const addUser = (userId : String, socketId : String, roomId: String) => {
   !users.some(user=> user.userId === userId && user.roomdId === roomId) && 
        users.push({userId, socketId, roomId});
}

const removeUser = (socketId: String) => {
    users = users.filter(user => user.socketId !== socketId)
}

io.on("connection", (socket : Socket) => {
    //when connect
    console.log("a user connected");

    //take userId and socketId from user and join roomId room
    socket.on("sendUser", ({userId, conversationId}) => {
        addUser(userId, socket.id, conversationId);
        socket.join(conversationId);
        console.log(userId + " joined " + conversationId);
        io.emit("getUsers", users);
    })

    //send and get message
    socket.on("sendMessage", ({senderId, conversationId, text}) => {
        io.to(conversationId).emit("getMessage", {
            senderId,
            conversationId,
            text
        });
    })
    
    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })

    socket.on("leaveRoom",({userId, conversationId}) => { 
        socket.leave(conversationId);
        removeUser(socket.id);
        console.log(userId + " left " + conversationId);
    })
})