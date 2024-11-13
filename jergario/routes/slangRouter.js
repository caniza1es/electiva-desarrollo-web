const express = require("express");
const slangController = require("../controllers/slangController");
const { isNotLoggedIn, isAdmin } = require("../middleware/authHelpers");

const router = express.Router();

router.get("/add", isNotLoggedIn, slangController.getAddSlang);
router.post("/add", isNotLoggedIn, slangController.postAddSlang);
router.post("/:id/upvote", isNotLoggedIn, slangController.upvoteSlang);
router.post("/:id/downvote", isNotLoggedIn, slangController.downvoteSlang);
router.post("/:id/delete", isNotLoggedIn, isAdmin, slangController.deleteSlang);

module.exports = router;
