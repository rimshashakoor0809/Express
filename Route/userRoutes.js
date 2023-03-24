const express = require("express");
const authController = require('./../Controllers/authController');
const userController = require('./../Controllers/userController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/updatePassword',authController.protect ,authController.updatePassword);
router.delete('/deactivateAccount', authController.protect, userController.deactivateUser);

router.route("/").get(userController.getAllUser);
router.route("/:id").delete(userController.deleteUser);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateUserProfile', authController.protect, userController.updateUserProfile);
module.exports = router;