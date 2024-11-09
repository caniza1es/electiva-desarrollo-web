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

router.get("/verify/:token", userController.verifyEmail); 

router.get("/admin", userController.getAdminPage);
router.post("/admin/delete-user", userController.deleteUser);

router.get("/forgot-password", userController.getForgotPassword);
router.post("/forgot-password", userController.postForgotPassword);
router.get("/reset-password/:token", userController.getResetPassword);
router.post("/reset-password/:token", userController.postResetPassword);

module.exports = router;
