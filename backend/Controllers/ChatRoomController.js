const mongoose = require("mongoose")
const ChatRoom = require("../Models/ChatRoom")

exports.createChatRoom = async (req, res, next) => {
    const {name} = req.body

    const nameRegex = /^[A-Za-z\s]+$/

    if(!nameRegex.test(name)) return res.status(400).json({
        error: "Name may only contain a letters"
    })

    const chatRoomExists = await ChatRoom.findOne({name})

    if(chatRoomExists) return res.status(400).json({
        error: "Chat room already exists"
    })

    const chatRoom = new ChatRoom({
        name
    })

    await chatRoom.save()

    res.status(201).json({
        message: "ChatRoom created"
    })
    
}