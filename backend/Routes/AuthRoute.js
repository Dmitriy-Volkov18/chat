const express = require("express")
const router = express.Router()

const AuthController = require("../Controllers/AuthController")
const checkAuth = require("../checkAuth/checkAuth")

router.get("/user", checkAuth, AuthController.getUser)

module.exports = router