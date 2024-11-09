const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/register", userController.getRegister);
router.get("/login", userController.getLogin);
router.post("/register", userController.postRegister);
router.post("/login", userController.postLogin);

router.get("/profile", userController.getProfile);
router.post("/logout", userController.postLogout);
router.get("/edit", userController.getEditProfile);
router.post("/edit", userController.postEditProfile);

router.get("/admin", userController.getAdminPage);
router.post("/admin/delete-user", userController.deleteUser);

module.exports = router;
