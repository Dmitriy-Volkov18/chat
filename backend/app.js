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

let onlineUsers = []

function containsObject(arr, obj){
    const userExists = arr.some(user => user.id === obj.id)

    if(userExists) {
        console.log(userExists)
        return true
    }

    return false
}

function removeItem(arr, obj){
    const newArr = arr.filter(user => user.id !== obj.id)

    console.log(newArr)
}

let onlineSet = new Set()


io.on("connection", async socket => {
    socket.to("chatRoom").emit("message", "Welcome to the chat")
    socket.broadcast.emit("message", socket.currUser.username + " has connected to the chat");

    socket.on("joinRoom", (chatRoom) => {
        socket.join(chatRoom);
        // const newOnlineUser = {
        //     id: socket.currUser.id,
        //     username: socket.currUser.username
        // }
        // if(containsObject(onlineUsers, newOnlineUser)){
        //     io.emit("fetchOnlineUsers", onlineUsers);
        // }else{
        //     onlineUsers.push(newOnlineUser)
        //     onlineUsers.map(onlineUser => onlineUser.id !== newOnlineUser.id)
        //     io.emit("fetchOnlineUsers", onlineUsers);
        // }
        
        // console.log(onlineUsers)

        onlineSet.add(socket.currUser.username)
        
        io.emit("fetchOnlineUsers", [...onlineSet]);
        
        console.log(onlineSet)
        console.log(Object.values([...onlineSet]))
        console.log(socket.currUser.username + " joined the room: " + chatRoom)
    })

    socket.on("leaveRoom", (chatRoom) => {
        socket.leave(chatRoom);
        // removeItem(onlineUsers, socket.currUser)
        // io.emit("fetchOnlineUsers", onlineUsers);
        // console.log(onlineUsers)

        onlineSet.delete(socket.currUser.username)
        io.emit("fetchOnlineUsers", [...onlineSet]);
        console.log(socket.currUser.username + " leave the room: " + chatRoom)
    })


    socket.on("chatRoomMessage", async ({chatRoom, message}) => {
        const newMessage = new Message({
            message: message,
            userCreated: socket.currUser.id,
            username: socket.currUser.username
        })

        io.to(chatRoom).emit("newMessage", {
            message,
            date: newMessage.date,
            username: socket.currUser.username,
            userId: socket.currUser.id
        })

        await newMessage.save()
    })

    socket.on("fetchAllUsers", (allUsers) => {
        io.emit("fetchAllUsers", allUsers)
    })
    

    socket.on("muteUserUsername", async (username) => {
        console.log(username);
        const clients = await io.fetchSockets();

        for(let client of clients){
            console.log('clients ', client.currUser.username );
            
        }
        

        if(onlineSet.has(username)){
            Object.values([...onlineSet]).forEach(user => {
                if(user === username){
                    io.emit("muteUser", true)
                }
            })
        }
    })

    socket.on("unMuteUserUsername", (username) => {
        if(onlineSet.has(username)){
            Object.values([...onlineSet]).forEach(user => {
                if(user === username){
                    io.emit("unmuteUser", false)
                }
            })
        }
    })

    
    socket.on("disconnect", () => {
        socket.leave("chatRoom");
        // onlineUsers.map(onlineUser => onlineUser.id === socket.currUser.id)

        // for(let i = 0; i <= onlineUsers.length; i++){
        //     console.log(onlineUsers[i])
        // }
        // io.emit("fetchOnlineUsers", onlineUsers);
        // console.log(onlineUsers)
        onlineSet.delete(socket.currUser.username)
        io.emit("fetchOnlineUsers", [...onlineSet]);
        socket.emit("message", socket.currUser.username + " has disconnected")
    })
 });

module.exports = httpServer