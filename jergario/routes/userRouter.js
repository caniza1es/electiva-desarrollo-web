const express = require("express")
const userController = require("../controllers/userController")
const router = express.Router()

router.get("/register", userController.getRegister)
router.get("/login", userController.getLogin)

router.post("/register", userController.postRegister)
router.post("/login", userController.postLogin)

router.get("/profile", userController.getProfile)
router.post("/logout", userController.postLogout)

module.exports = router
