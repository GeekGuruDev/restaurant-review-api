const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../errors/customeErrors");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  setRefreshTokenCookie,
  createSendToken,
} = require("../utils/authUtils");

exports.register = asyncHandler(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role === "admin" ? "user" : req.body.role,
  });

  await createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new UnauthorizedError("Please provide an email and password"));
  }

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user || !(await user.comparePassword(password))) {
    return next(new UnauthorizedError("Incorrect email or password"));
  }

  await createSendToken(user, 200, res);
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new UnauthorizedError("Refresh token missing"));
  }

  const decoded = await verifyToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decoded.userId).select(
    "+password +refreshTokens"
  );

  if (!user) {
    return next(new UnauthorizedError("User not found"));
  }

  const tokenIndex = user.refreshTokens.findIndex(
    (t) => t.token === refreshToken
  );

  if (tokenIndex === -1) {
    res.clearCookie("refreshToken");
    return next(new UnauthorizedError("Invalid refresh token"));
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens[tokenIndex] = {
    token: newRefreshToken,
    expiresAt:
      Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION) * 60 * 1000,
  };
  await user.save();

  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    status: "success",
    accessToken,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken || !req.headers.authorization.startsWith("Bearer")) {
    return next(new UnauthorizedError("You are not logged in"));
  }

  const decoded = await verifyToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new UnauthorizedError(
        "The user belonging to this accessToken does no longer exist"
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You are not authorized to access this route")
      );
    }
    next();
  };
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new NotFoundError("Email not found"));
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); // Hash the token

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min from now
  await user.save();

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/reset/${resetToken}`;

  const resetEmailHtml = `
    <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
    <a href="${resetURL}">${resetURL}</a>
    <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>`;

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_FROM,
    subject: "Password Reset Request",
    html: resetEmailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      status: "success",
      message: "Password reset email sent",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return next(err);
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex"); // Hash the token

  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
  });

  if (!user) {
    return next(new UnauthorizedError("Invalid or expired reset token"));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = [];
  await user.save();
  await createSendToken(user, 200, res);
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user);
  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new UnauthorizedError("Invalid current password"));
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
  createSendToken(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  // Check if it exists
  if (refreshToken) {
    const decoded = await verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.userId).select(
      "+password +refreshTokens"
    );

    if (user) {
      // Remove the refresh token:
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token.token !== refreshToken
      );
      await user.save();
    }
  }
  res.clearCookie("refreshToken");
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
