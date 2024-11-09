const express = require("express")
const slangController = require("../controllers/slangController")
const router = express.Router()

router.get("/add", slangController.getAddSlang)
router.post("/add", slangController.postAddSlang)
router.post("/:id/upvote", slangController.upvoteSlang)
router.post("/:id/downvote", slangController.downvoteSlang)
router.post('/:id/delete', slangController.deleteSlang)

module.exports = router;

module.exports = router
