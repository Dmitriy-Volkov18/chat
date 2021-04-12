const express = require("express")
const router = express.Router()

const MessageController = require("../Controllers/MessageController")
const checkAuth = require("../checkAuth/checkAuth")

router.get("/getAllMessages", checkAuth, MessageController.getAllMessages)

module.exports = router