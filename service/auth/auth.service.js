const User = require("../../models/user.model");
const Master = require("../../models/master.model");
const Admin = require("../../models/admin.model");
const Superadmin = require("../../models/superadmin.model");
const RefreshToken = require("../../models/refreshToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ms = require("ms");
require("dotenv").config();
const {
  handleAuthSuccess,
  handleAuthError,
  handleSuccess,
  handleError,
} = require("../../utils/responseHandler");

exports.loginUser = async (username, password, ip, userAgent) => {
  const user = await User.findOne({ username });
  if (!user) return handleAuthError(null, "User not found", 400);

  if (!user.active) return handleAuthError(null, "User is not active", 400);
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return handleAuthError(null, "Invalid credentials", 400);

  const checkResult = await exports.checkExistingRefreshToken(user._id);
  if (!checkResult.success) {
    return handleAuthSuccess(
      checkResult.token,
      checkResult.refreshToken,
      user,
      "เข้าสู่ระบบสำเร็จ",
      200
    );
  }

  const token = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      phone: user.phone,
      role: user.role,
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
      phone: user.phone,
      role: user.role,
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

  return handleAuthSuccess(token, refreshToken, user, "เข้าสู่ระบบสำเร็จ", 200);
};

exports.handleRefreshToken = async (refreshToken) => {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const existing = await RefreshToken.findOne({
    token: refreshToken,
    userId: payload._id,
  });

  if (!existing) return handleAuthError(null, "Invalid token", 400);

  const newAccessToken = jwt.sign(
    {
      _id: payload._id,
      username: payload.username,
      phone: payload.phone,
      role: payload.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "1h" }
  );

  return newAccessToken;
};

exports.handleLogout = async (refreshToken) => {
  const existingToken = await RefreshToken.findOne({ token: refreshToken });
  if (!existingToken) {
    // console.log("No matching refresh token found");
    // throw new Error("Invalid refresh token");
    return handleAuthError(null, "Invalid refresh token", 400);
  }

  await RefreshToken.deleteOne({ token: refreshToken });
  // console.log("Refresh token successfully deleted");
  return handleSuccess(null, "ออกจากระบบสำเร็จ", 200);
};

exports.checkExistingRefreshToken = async (userId) => {
  try {
    const existingRefreshToken = await RefreshToken.findOne({ userId });

    if (existingRefreshToken) {
      const currentTime = Date.now();
      const expiresAtTime = new Date(existingRefreshToken.expiresAt).getTime();

      if (expiresAtTime <= currentTime) {
        await RefreshToken.deleteOne({ userId });
        return { success: true };
      }

      // ใช้ handleRefreshToken เพื่อสร้าง token ใหม่
      const newAccessToken = await exports.handleRefreshToken(
        existingRefreshToken.token
      );

      return {
        success: false,
        message: "Using existing valid token",
        token: newAccessToken,
        refreshToken: existingRefreshToken.token,
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

exports.findUserById = async (userId) => {
  const [user, admin, master, superadmin] = await Promise.all([
    findInUser(userId),
    findInAdmin(userId),
    findInMaster(userId),
    findInSuperAdmin(userId),
  ]);

  return user || admin || master || superadmin || null;
};

async function findInUser(userId) {
  try {
    return await User.findById(userId);
  } catch (e) {
    console.error("Error finding user in User model:", e);
    return null;
  }
}

async function findInAdmin(userId) {
  try {
    return await Admin.findById(userId);
  } catch (e) {
    console.error("Error finding user in Admin model:", e);
    return null;
  }
}

async function findInMaster(userId) {
  try {
    return await Master.findById(userId);
  } catch (e) {
    console.error("Error finding user in Master model:", e);
    return null;
  }
}

async function findInSuperAdmin(userId) {
  try {
    return await Superadmin.findById(userId);
  } catch (e) {
    console.error("Error finding user in SuperAdmin model:", e);
    return null;
  }
}
