const superadmin = require("../../models/superadmin.model");
const admin = require("../../models/admin.model");
const RefreshToken = require("../../models/refreshToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ms = require("ms");
require("dotenv").config();

//ล็อคอิน
exports.loginadmin = async (username, password, ip, userAgent) => {
  // เช็คว่ามีการกรอก username และ password หรือไม่
  if (!username || !password) {
    return { error: "กรุณากรอก username และ password" };
  }
  // เช็คว่า username และ password ถูกต้องหรือไม่
  // เริ่มจากเช็ค super admin ก่อน
  const superadminUser = await superadmin.findOne({
    $or: [{ username }, { email }],
  });
  const adminUser = await admin.findOne({ $or: [{ username }, { email }] });
  if (superadminUser) {
    // เช็ค password ว่าตรงกันหรือไม่
    const isMatchpassword = await bcrypt.compare(
      password,
      superadminUser.password
    );
    if (!isMatchpassword) {
      return { error: "รหัสผ่านไม่ถูกต้อง" };
    }

    const checkResult = await exports.checkExistingRefreshToken(
      superadminUser._id
    );
    if (!checkResult.success) {
      return { error: checkResult.message };
    }
    // สร้าง token และ refresh token
    const refreshToken = jwt.sign(
      {
        _id: superadminUser._id,
        username: superadminUser.username,
        email: superadminUser.email,
        phone: superadminUser.phone,
        role: 'superadmin'
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

    return { success: true, superadminUser, token, refreshToken };
  } else if (adminUser) {
    // เช็ค password ว่าตรงกันหรือไม่
    const isMatchpassword = await bcrypt.compare(password, adminUser.password);
    if (!isMatchpassword) {
      return { error: "รหัสผ่านไม่ถูกต้อง" };
    }
    const checkResult = await exports.checkExistingRefreshToken(adminUser._id);
    if (!checkResult.success) {
      return { error: checkResult.message };
    }

    // สร้าง token และ refresh token
    const refreshToken = jwt.sign(
      {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin',
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

    return { success: true, adminUser, token, refreshToken };
  } else {
    return { error: "ไม่พบผู้ใช้" };
  }
};

//รีเฟรช token
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
        role: payload.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );
  
    return newAccessToken;
};
// logout
exports.logout = async (refreshToken) => {
    const existingToken = await RefreshToken.findOne({ token: refreshToken });
    if (!existingToken) {
      console.log("No matching refresh token found");
      throw new Error("Invalid refresh token");
    }
  
    await RefreshToken.deleteOne({ token: refreshToken });
    console.log("Refresh token successfully deleted");
};

//checkExistingRefreshToken
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

      return {
        success: false,
        message:
          "You are already logged in. Please logout or refresh your token.",
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
