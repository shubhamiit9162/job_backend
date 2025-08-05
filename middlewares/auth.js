import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401)); // Changed to 401
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user by ID from token
    const user = await User.findById(decoded.id);

    // Check if user still exists
    if (!user) {
      return next(new ErrorHandler("User not found. Please login again.", 401));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired. Please login again.", 401));
    } else if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token. Please login again.", 401));
    } else {
      return next(new ErrorHandler("Authentication failed.", 401));
    }
  }
});
