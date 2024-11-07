const express = require("express")
const userController = require("../controllers/userController")
const router = express.Router()

router.get("/login",userController.getLogin)
router.get("/register",userController.getRegister)

module.exports = router