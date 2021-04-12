const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        lowercase: true, 
        required: true,
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    hashedPassword: {
        type: String,
        minlength: 6,
        required: true,
        select: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User