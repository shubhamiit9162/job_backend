import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

// Register User
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, role, password } = req.body;

  if (!name || !email || !phone || !role || !password) {
    return next(new ErrorHandler("Please fill full registration form!"));
  }

  // Check if email is already registered
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }

  // Create a new user
  const user = await User.create({
    name,
    email,
    phone,
    role,
    password,
  });

  // Send token and response using sendToken function
  sendToken(user, 201, res, "User Registered!");
});

// Login User
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role."));
  }

  // Check if user exists and get password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password.", 400));
  }

  // Verify password
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password.", 400));
  }

  // Verify role
  if (user.role !== role) {
    return next(
      new ErrorHandler(
        `User with provided email and role ${role} not found!`,
        404
      )
    );
  }

  // Send token and response using sendToken function
  sendToken(user, 200, res, "User Logged In!");
});

// Logout User
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

// Get User Details
export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});
