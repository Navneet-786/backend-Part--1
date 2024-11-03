const { Router } = require("express");
const router = Router();
const { verifyJwt } = require("../middlewares/auth.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
} = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/getUser").get(verifyJwt, getCurrentUser);
router
  .route("/change-avatar")
  .post(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/change-cover-image")
  .post(verifyJwt, upload.single("coverImage"), updateUserCoverImage);
module.exports = router;
