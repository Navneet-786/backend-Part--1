const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { User } = require("../models/users.models");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
//function to generate accesstoken and refresh token
const generateAccesstokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //-->imp

    return { refreshToken, accessToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong during generating accesstoken and refresh token"
    );
  }
};

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
  let coverLocalPath;

  //check for coverLocalPath
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverLocalPath = req.files?.coverImage[0]?.path;
  }
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

const loginUser = asyncHandler(async (req, res) => {
  //req.body ->data
  //username and email
  //find the user
  //password verify
  //acess token and refresh token
  //send cookies

  const { email, username, password } = req.body;
  if (!(email || username)) {
    throw new ApiError(400, "Email or username are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Password is not correct");
  }

  const { refreshToken, accessToken } =
    await generateAccesstokenAndRefreshToken(user._id);

  // remove the unwanted fields before sending respopnse
  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loginUser, accessToken, refreshToken },
        "User login successfuly"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user Logout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //fetch the refresh token from body or cookie it depends
  //decode that refresh token
  //find the user acc to that token
  //if user is not found it means token is invalid or expired
  //check comming refresh token and stored refresh token is same
  //if they same then generate new refresh token and access token
  //send response
  const incommingRefreshToken =
    req.body.refreshToken || req.cookies.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?.id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is not valid or may be expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { newrefreshToken, accessToken } =
      await generateAccesstokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "accessToken is refreshed successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err?.message || "Invalid refresh token");
  }
});
module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken };
