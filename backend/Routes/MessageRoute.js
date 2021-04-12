const express = require("express")
const router = express.Router()

const MessageController = require("../Controllers/MessageController")
const checkAuth = require("../checkAuth/checkAuth")

router.get("/getAllMessages", checkAuth, MessageController.getAllMessages)
router.delete("/deleteAllMessages", checkAuth, MessageController.deleteAllMessages)

module.exports = router