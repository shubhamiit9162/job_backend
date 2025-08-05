export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Important for cross-origin requests
  };

  // Don't send the token in response body for security
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        // Don't send sensitive data like password
      },
      message,
      // token, // Remove this line - don't send token in response body
    });
};
