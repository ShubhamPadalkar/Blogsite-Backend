const express = require("express");
const {
  userRegister,
  loginuserCtrl,
  fetchUserCtrl,
  deleteUsersCtrl,
  fetchUserDetails,
  userProfile,
  updateUserCtrl,
  updateUserPasswordCtrl,
  followingUserCtrl,
  unfollowUserCtrl,
  blockuserCtrl,
  unblockuserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  forgetPasswordTokenCtrl,
  passwordResetCtrl,
  profilePhotoUploadCtrl,
} = require("../../controllers/users/userCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  PhotoUpload,
  profilePhotoResize
} = require("../../middlewares/upload/photoupload");
const userrouter = express.Router();

userrouter.post("/register", userRegister);
userrouter.post("/login", loginuserCtrl);
userrouter.put(
  "/profile-photo-upload",
  authMiddleware,
  PhotoUpload.single('image'),
  profilePhotoResize,
  profilePhotoUploadCtrl
);
userrouter.get("/", authMiddleware, fetchUserCtrl);
userrouter.get("/profile/:id", authMiddleware, userProfile);
userrouter.put("/password", authMiddleware, updateUserPasswordCtrl);
userrouter.post("/forget-password-token", forgetPasswordTokenCtrl);
userrouter.post("/reset-password", passwordResetCtrl);
userrouter.put("/follow", authMiddleware, followingUserCtrl);
userrouter.post(
  "/generate-verify-email-token",
  authMiddleware,
  generateVerificationTokenCtrl
);

userrouter.get("/verify-account/:token", accountVerificationCtrl);

userrouter.put("/unfollow", authMiddleware, unfollowUserCtrl);
userrouter.put("/block-user/:id", authMiddleware, blockuserCtrl);
userrouter.put("/unblock-user/:id", authMiddleware, unblockuserCtrl);
userrouter.put("/:id", authMiddleware, updateUserCtrl);
userrouter.get("/:id", fetchUserDetails);

userrouter.delete("/:id", deleteUsersCtrl);

module.exports = userrouter;
