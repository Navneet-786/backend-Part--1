const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const Jwt = require("jsonwebtoken");
const { User } = require("../models/users.models");

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "Invalid User");
    }

    const decodedToken = await Jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Inavlid request ");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "token verification proble");
  }
});

module.exports = { verifyJwt };
