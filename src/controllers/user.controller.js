const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { User } = require("../models/users.models");
const { uploadOnCloudinary } = require("../utils/cloudinary");
//Register
const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  //validation -> not empty
  //check user already exist or not - email,username
  //check for image ,avatar
  //upload them to cloudinary - avatar
  //create user object - create entry in db
  //remove refresh token and password from response
  //return response

  const { username, email, fullname, password } = req.body;

  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fileds are required!");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User already exist! Try some other email or username"
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar uploaded unsuccessfull!");
  }
  const result = new User({
    username: username.toLowerCase(),
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    fullname,
  });
  const newUser = await result.save();

  const createUser = await User.findById({ _id: newUser._id }).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new ApiError(500, "User not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User created successfuly"));
});

module.exports = { registerUser };
