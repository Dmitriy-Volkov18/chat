const express = require("express")
const router = express.Router()

const ChatRoomController = require("../Controllers/ChatRoomController")
const checkAuth = require("../checkAuth/checkAuth")

router.post("/", checkAuth, ChatRoomController.createChatRoom)


module.exports = router