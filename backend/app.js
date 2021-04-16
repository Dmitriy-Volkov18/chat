const express = require("express")
const app = express()
const userRoute = require("./Routes/UserRoute")
const messageRoute = require("./Routes/MessageRoute")
const authRoute = require("./Routes/AuthRoute")
const chatRoomRoute = require("./Routes/ChatRoom")
const jwt = require("jsonwebtoken")
const Message = require("./Models/Message")
const User = require("./Models/User")

const mongoose = require("mongoose")
require("dotenv").config()
// mongo pass iiaw85lpMmxQHrYb

const mongooseConnection = async() => {
    try{
        await mongoose.connect(process.env.MONGODBURL, {
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

let onlineSet = new Set()

io.on("connection", async socket => {
    socket.on("joinRoom", (chatRoom) => {
        socket.join(chatRoom);

        socket.emit("message", "Welcome to the chat")
        socket.broadcast.to("chatRoom").emit("message", socket.currUser.username + " has connected to the chat");


        onlineSet.add(socket.currUser.username)
        io.emit("fetchOnlineUsers", [...onlineSet]);
        
        console.log(onlineSet)
        console.log(Object.values([...onlineSet]))
        console.log(socket.currUser.username + " joined the room: " + chatRoom)
    })

    socket.on("leaveRoom", (chatRoom) => {
        socket.leave(chatRoom);

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

    socket.on("fetchAllUsers", async () => {
        const users = await User.find({})
        io.emit("fetchAllUsers", users)
    })
    
    socket.on("muteUserUsername", async (username) => {
        if(onlineSet.has(username)){
            Object.values([...onlineSet]).forEach(async onlineUser => {
                if(onlineUser === username){
                    const userExist = await User.findOne({username})

                    if(userExist){
                        await User.updateOne({username}, { '$set': {"status.isMuted" : true} })
                    }
                }
            })
        }

        const usr = await User.find({username})
        io.emit("muteUserUsername", usr[0].status.isMuted)
    })

    socket.on("unMuteUserUsername", async (username) => {
        if(onlineSet.has(username)){
            Object.values([...onlineSet]).forEach(async onlineUser => {
                if(onlineUser === username){
                    const userExist = await User.find({username})

                    if(userExist){
                        await User.updateOne({username}, { '$set': {"status.isMuted" : false} })
                    }
                }
            })
        }

        const usr = await User.find({username})
        io.emit("unMuteUserUsername", usr[0].status.isMuted)
    })

    socket.on("banUser", async (username) => {
        const clients = await io.fetchSockets();

        for(let client of clients){
            if(client.currUser.username === username){
                if(onlineSet.has(username)){
                    Object.values([...onlineSet]).forEach(async onlineUser => {
                        const userExist = await User.find({username})

                        if(userExist){
                            console.log(userExist)
                            
                            await User.updateOne({username}, { '$set': {"status.isBanned" : true} })

                            const userExist2 = await User.find({username})

                            io.emit("banUser", userExist2[0].status.isBanned)
                            console.log(userExist2[0].status.isBanned)

                            onlineSet.delete(client.currUser.username)
                            client.disconnect(true)
                            io.emit("fetchOnlineUsers", [...onlineSet]);

                            console.log(onlineSet)
                            console.log(Object.values([...onlineSet]))
                        }
                    })
                }
            }else{
                console.log("Not that user")
            }
        }
    })

    socket.on("unBanUser", async (username) => {
        const userExist = await User.find({username})

        if(userExist){
            console.log(userExist)
            
            await User.updateOne({username}, { '$set': {"status.isBanned" : false} })

            const userExist2 = await User.find({username})

            io.emit("unBanUser", userExist2[0].status.isBanned)
            console.log(userExist2[0].status.isBanned)

            console.log(onlineSet)
            console.log(Object.values([...onlineSet]))
        }
    })

    socket.on("disconnect", () => {
        socket.leave("chatRoom");
        
        onlineSet.delete(socket.currUser.username)
        io.emit("fetchOnlineUsers", [...onlineSet]);
        io.to("chatRoom").emit("message", socket.currUser.username + " has disconnected")
    })
 });

module.exports = httpServer