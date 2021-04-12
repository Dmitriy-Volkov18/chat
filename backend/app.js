const express = require("express")
const app = express()
const userRoute = require("./Routes/UserRoute")
const messageRoute = require("./Routes/MessageRoute")
const authRoute = require("./Routes/AuthRoute")
const chatRoomRoute = require("./Routes/ChatRoom")
const jwt = require("jsonwebtoken")
const Message = require("./Models/Message")

const mongoose = require("mongoose")
require("dotenv").config()
// mongo pass iiaw85lpMmxQHrYb

const mongooseConnection = async() => {
    try{
        await mongoose.connect(`mongodb+srv://dima:iiaw85lpMmxQHrYb@cluster0.tx7h4.mongodb.net/testChat?retryWrites=true&w=majority`, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log("Connected to database")
    }catch(err){
        console.log("Connection failed" + err)
    }
}

mongooseConnection()

app.use(express.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    next()
})

app.use("/api/users", userRoute)
app.use("/api/messages", messageRoute)
app.use("/api/auth", authRoute)
app.use("/api/chatRoom", chatRoomRoute)

const httpServer = require("http").createServer(app);
const options = { 
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
  } 
};
const io = require("socket.io")(httpServer, options);

io.use(async(socket, next) => {
    try{
        const token = socket.handshake.auth.token;

        if(!token){
            return next(new Error("No token"))
        }

        const decodedUser = await jwt.verify(token, process.env.TOKENKEY)
        socket.currUser = decodedUser

        next()
    }catch(err){
        next(new Error("invalid"));
    }
});

const chatRoomName = "chatRoom"

let allSockets = []

io.on("connection", async socket => {
    socket.emit("message", "Welcome to the chat")
    socket.broadcast.emit("message", socket.currUser.username + " has connected to the chat");

    socket.on("joinRoom", (chatRoom) => {
        socket.join(chatRoom);
        console.log(socket.currUser.username + " joined the room: " + chatRoom)
    })

    socket.on("leaveRoom", (chatRoom) => {
        socket.leave(chatRoom);
        console.log(socket.currUser.username + " leave the room: " + chatRoom)
    })

    socket.on("chatRoomMessage", async ({chatRoom, message}) => {
        const newMessage = new Message({
            message: message,
            userCreated: socket.currUser.id
        })

        io.to(chatRoom).emit("newMessage", {
            message,
            date: newMessage.date,
            username: socket.currUser.username,
            userId: socket.currUser.id
        })

        await newMessage.save()
    })



    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
        if(allSockets.includes(socket.currUser.username))
            continue
        console.log(socket.currUser.username)
        allSockets = [...allSockets, socket.currUser.username]
    }

    io.emit("fetchOnlineUsers", allSockets);

    // socket.on("fetchAllUsers", (allSockets) => {
    //     socket.in(chatRoomName).emit("fetchAllUsers", allSockets)
    // });
    
    socket.on("disconnect", () => {
        socket.leave(chatRoomName);
        socket.to(chatRoomName).emit("message", socket.currUser.username + " has disconnected")
    })
 });

module.exports = httpServer