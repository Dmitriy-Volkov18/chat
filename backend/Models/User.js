const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        lowercase: true,
        required: [true, "Please enter a username"],
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        required: [true, "Please enter an email"],
        unique: true
    },
    hashedPassword: {
        type: String,
        minlength: 6,
        required: [true, "Please enter a password"],
        select: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    status: {
        isBanned: {
            type: Boolean,
            default: false
        },
        isMuted: {
            type: Boolean,
            default: false
        }
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User