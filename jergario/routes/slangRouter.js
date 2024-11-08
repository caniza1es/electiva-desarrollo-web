const express = require("express")
const slangController = require("../controllers/slangController")
const router = express.Router()

router.get("/add", slangController.getAddSlang)
router.post("/add", slangController.postAddSlang)

module.exports = router
