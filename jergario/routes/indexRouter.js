const express = require("express")
const indexController = require("../controllers/indexController")
const router = express.Router()

router.get("/dictionary",indexController.getIndex)
router.get("/error",indexController.getError)
router.get("/", indexController.getHomepage);

module.exports = router