const express = require("express")
const indexController = require("../controllers/indexController")
const router = express.Router()

router.get("/",indexController.getIndex)
router.get("/error",indexController.testError);


module.exports = router