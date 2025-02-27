const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION}m`,
  });
};

const verifyToken = async (token, secret) => {
  return await promisify(jwt.verify)(token, secret);
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    // secure: true, // Uncomment this line in production
    maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION) * 60 * 1000,
  });
};

const createSendToken = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt:
      Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION) * 60 * 1000,
  });
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: user,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  setRefreshTokenCookie,
  createSendToken,
};
