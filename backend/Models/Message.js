const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        minlength: 1,
        maxlength: 200,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    userCreated: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId
    },
    // chatRoom: {
    //     ref: "ChatRoom",
    //     type: mongoose.Schema.Types.ObjectId
    // }
})

const Message = mongoose.model("Message", messageSchema)

module.exports = Message