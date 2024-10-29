const { asyncHandler } = require("../utils/asyncHandler");

//Register
const registerUser = asyncHandler((req, res) => {
  res.status(200).json({
    message: "working properly",
  });
});

module.exports = { registerUser };
