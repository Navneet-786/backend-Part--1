const { Router } = require("express");
const router = Router();
const { registerUser } = require("../controllers/user.controller");

router.route("/register").post(registerUser);

module.exports = router;
