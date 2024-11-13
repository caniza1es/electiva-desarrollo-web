
const express = require("express");
const userController = require("../controllers/userController");
const { isLoggedIn, isNotLoggedIn, isAdmin } = require('../middleware/authHelpers');
const router = express.Router();


router.get("/register", isLoggedIn, userController.getRegister);
router.get("/login", isLoggedIn, userController.getLogin);
router.post("/register", isLoggedIn, userController.postRegister);
router.post("/login", isLoggedIn, userController.postLogin);
router.get("/verify/:token", userController.verifyEmail); 
router.get('/resend-verification', userController.resendVerificationEmail);


router.get("/profile", isNotLoggedIn, userController.getProfile);
router.post("/logout", isNotLoggedIn, userController.postLogout);
router.get("/edit", isNotLoggedIn, userController.getEditProfile);
router.post("/edit", isNotLoggedIn, userController.postEditProfile);
router.post("/delete", isNotLoggedIn, userController.deleteAccount);


router.get("/admin", isNotLoggedIn, isAdmin, userController.getAdminPage);
router.post("/admin/delete-user", isNotLoggedIn, isAdmin, userController.deleteUser);


router.get("/forgot-password", isLoggedIn, userController.getForgotPassword);
router.post("/forgot-password", isLoggedIn, userController.postForgotPassword);
router.get("/reset-password/:token", isLoggedIn, userController.getResetPassword);
router.post("/reset-password/:token", isLoggedIn, userController.postResetPassword);

module.exports = router;
