const User = require("../../models/user.model");
const RefreshToken = require("../../models/refreshToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ms = require("ms");
require("dotenv").config();

exports.loginUser = async (username, password, ip, userAgent) => {
  const user = await User.findOne({ username });
  if (!user) return { success: false, message: "User not found" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { success: false, message: "Invalid credentials" };

  const existingRefreshToken = await RefreshToken.findOne({ userId: user._id });
  if (existingRefreshToken) {
    throw new Error(
      "You are already logged in. Please logout or refresh your token."
    );
  }

  const token = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION,
    }
  );

  const refreshToken = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );

  const expiresAt = new Date(
    Date.now() + ms(process.env.JWT_REFRESH_EXPIRATION)
  );
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    ip,
    userAgent,
    expiresAt,
  });

  return { success: true, user, token, refreshToken };
};

exports.handleRefreshToken = async (refreshToken) => {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const existing = await RefreshToken.findOne({
    token: refreshToken,
    userId: payload._id,
  });

  if (!existing) throw new Error("Invalid token");

  const newAccessToken = jwt.sign(
    {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "1h" }
  );

  return newAccessToken;
};

exports.handleLogout = async (refreshToken) => {
  const existingToken = await RefreshToken.findOne({ token: refreshToken });
  if (!existingToken) {
    console.log("No matching refresh token found");
    throw new Error("Invalid refresh token");
  }

  await RefreshToken.deleteOne({ token: refreshToken });
  console.log("Refresh token successfully deleted");
};

exports.checkExistingRefreshToken = async (userId) => {
  try {
    const existingRefreshToken = await RefreshToken.findOne({ userId });

    if (existingRefreshToken) {
      const currentTime = Date.now();

      if (existingRefreshToken.expiresAt <= currentTime) {
        await RefreshToken.deleteOne({ userId });
        return { success: true };
      }

      return {
        success: false,
        message:
          "You are already logged in. Please logout or refresh your token.",
      };
    }

    console.log("No existing refresh token found for userId:", userId);
    return { success: true };
  } catch (err) {
    console.error("Error checking refresh token:", err);
    return { success: false, message: err.message };
  }
};
