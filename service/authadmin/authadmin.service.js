const superadmin = require("../../models/superadmin.model");
const admin = require("../../models/admin.model");
const master = require("../../models/master.model");
const RefreshToken = require("../../models/refreshToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ms = require("ms");
require("dotenv").config();
const { handleAuthSuccess, handleAuthError, handleSuccess } = require("../../utils/responseHandler");
  
//ล็อคอิน
exports.loginadmin = async (username, password, ip, userAgent) => {
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!username || !password) {
    return handleAuthError(null, "กรุณากรอก username และ password", 400);
  }

  // ค้นหาผู้ใช้
  const superadminUser = await superadmin.findOne({
    $or: [{ username }, { email: username }],
  });
  const adminUser = await admin.findOne({
    $or: [{ username }, { email: username }],
  });

  // ตรวจสอบและยืนยันตัวตนผู้ใช้
  let user;
  if (superadminUser) {
    const isMatchPassword = await bcrypt.compare(password, superadminUser.password);
    if (!isMatchPassword) {
      return handleAuthError(null, "รหัสผ่านไม่ถูกต้อง", 400);
    }

    // เช็คว่า active เป็น true หรือ false
    if (!superadminUser.active) {
      return handleAuthError(null, "ผู้ใช้งานถูกปิดการใช้งาน", 400);
    }
    user = superadminUser;
  } else if (adminUser) {
    const isMatchPassword = await bcrypt.compare(password, adminUser.password);
    if (!isMatchPassword) {
      return handleAuthError(null, "รหัสผ่านไม่ถูกต้อง", 400);
    }
    // เช็คว่า active เป็น true หรือ false
    if (!adminUser.active) {
      return handleAuthError(null, "ผู้ใช้งานถูกปิดการใช้งาน", 400);
    }
    user = adminUser;
  } else {
    return handleAuthError(null, "ไม่พบผู้ใช้", 400);
  }

  // ตรวจสอบ refresh token ที่มีอยู่
  const checkResult = await exports.checkExistingRefreshToken(user._id);
  if (!checkResult.success) {
    return handleAuthSuccess(checkResult.token, checkResult.refreshToken, user, "เข้าสู่ระบบสำเร็จ", 200);
  }

  // สร้าง token และ refresh token
  let token, refreshToken;
  if (superadminUser) {
    token = jwt.sign(
      {
        _id: superadminUser._id,
        username: superadminUser.username,
        email: superadminUser.email,
        phone: superadminUser.phone,
        role: 'superadmin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    refreshToken = jwt.sign(
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
  } else if (adminUser) {
    token = jwt.sign(
      {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin',
        premission: adminUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    refreshToken = jwt.sign(
      {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin',
        premission: adminUser.role
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
  }

  // บันทึก refresh token
  const expiresAt = new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRATION));
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    ip,
    userAgent,
    expiresAt
  });

  return handleAuthSuccess(token, refreshToken, user, "เข้าสู่ระบบสำเร็จ", 200);
};

//รีเฟรช token
exports.handleRefreshToken = async (refreshToken) => {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const existing = await RefreshToken.findOne({
      token: refreshToken,
      userId: payload._id,
    });
  
    if (!existing) throw new Error("Invalid token");
    if(payload.role === 'admin'){
      const adminUser = await admin.findOne({_id: payload._id});
      if(!adminUser){
        throw new Error("Invalid token");
      }
      payload.premission = adminUser.role;
    }
  
    const newAccessToken = jwt.sign(
      {
        _id: payload._id,
        username: payload.username,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        role: payload.role,
        // ถ้าrole เป็น admin ก็ต้องมี premission
        premission: payload.role === 'admin' ? payload.premission : null
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
    // console.log("No matching refresh token found");
    // throw new Error("Invalid refresh token");
    return handleAuthError(null, "Invalid refresh token", 400);
  }

  await RefreshToken.deleteOne({ token: refreshToken });
  // console.log("Refresh token successfully deleted");
  return handleSuccess(null, "ออกจากระบบสำเร็จ", 200);
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
      // ใช้ handleRefreshToken เพื่อสร้าง token ใหม่
      const newAccessToken = await exports.handleRefreshToken(existingRefreshToken.token);

      return {
        success: false,
        message: "Using existing valid token",
        token: newAccessToken,
        refreshToken: existingRefreshToken.token
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};




// ล็อคอิน master
exports.loginMaster = async (username, password, ip, userAgent) => {
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!username || !password) {
    return handleAuthError(null, "กรุณากรอก username และ password", 400);
  }

  // ค้นหาผู้ใช้
  const masterUser = await master.findOne({
    $or: [{ username }, { email: username }],
  });

  if(masterUser){
    const isMatchPassword = await bcrypt.compare(password, masterUser.password);
    if(!isMatchPassword){
      return handleAuthError(null, "รหัสผ่านไม่ถูกต้อง", 400);
    }
    if(!masterUser.active){
      return handleAuthError(null, "ผู้ใช้งานถูกปิดการใช้งาน", 400);
    }
    
    // ตรวจสอบ refresh token ที่มีอยู่
    const checkResult = await exports.checkExistingRefreshToken(masterUser._id);
    if(!checkResult.success){
      return handleAuthSuccess(checkResult.token, checkResult.refreshToken, masterUser, "เข้าสู่ระบบสำเร็จ", 200);
    }

    // สร้าง token และ refresh token
    let token, refreshToken;
    token = jwt.sign(
      {
        _id: masterUser._id,
        username: masterUser.username,
        email: masterUser.email,
        phone: masterUser.phone,
        role: 'master',
        commission_percentage: masterUser.commission_percentage
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    refreshToken = jwt.sign(
      {
        _id: masterUser._id,
        username: masterUser.username,
        email: masterUser.email,
        phone: masterUser.phone,
        role: 'master',
        commission_percentage: masterUser.commission_percentage
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    // บันทึก refresh token
    const expiresAt = new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRATION));
    await RefreshToken.create({
      userId: masterUser._id,
      token: refreshToken,
      ip,
      userAgent,
      expiresAt
    });

    return handleAuthSuccess(token, refreshToken, masterUser, "เข้าสู่ระบบสำเร็จ", 200);
  } else {
    return handleAuthError(null, "ไม่พบผู้ใช้", 400);
  }
};


