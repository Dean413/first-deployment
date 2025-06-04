const express = require("express")
const routes = express.Router()
const {loginUser, registerUser, changePassword} = require("../controller/auth-controller")
const authMiddleware = require("../middleware/middleware")

//all routes are related to authentication & authorization



routes.post("/register", registerUser)
routes.post("/login", loginUser)
routes.post("/change-password", authMiddleware, changePassword)

module.exports = routes