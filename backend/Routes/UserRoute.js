const express = require("express")
const router = express.Router()

const UserController = require("../Controllers/UserController")
const checkAuth = require("../checkAuth/checkAuth")

router.get("/getAllUsers", checkAuth, UserController.getAllUsers)
router.post("/createMessage", checkAuth, UserController.createMessage)
router.post("/signup", UserController.signup)

module.exports = router