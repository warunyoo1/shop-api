const { v4: uuid4 } = require("uuid");
const User = require("../models/user.model");
const mongoose = require("mongoose");

exports.normalizeIP = (ip) => {
  if (!ip) return null;
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
};

exports.generateMasterId = function () {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  return `MASTER${dateStr}_${uuid4()}`;
};

exports.generateReferralCode = async function () {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;

  while (true) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existing = await User.findOne({ referral_code: code });
    if (!existing) break;
  }

  return code;
};

exports.filterUserResponse = function (userDoc, originalPayload) {
  const filtered = {};
  for (const key in originalPayload) {
    const value = userDoc[key];

    const isEmptyValue =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    if (!isEmptyValue) {
      filtered[key] = value;
    }
  }

  if (userDoc._id) filtered._id = userDoc._id;
  if (userDoc.referral_code) filtered.referral_code = userDoc.referral_code;

  return filtered;
};

exports.formatCreateUserResponse = (userDoc) => {
  const user = userDoc.toObject();

  const data = {
    _id: user._id,
    full_name: user.full_name,
    username: user.username,
    referral_code: user.referral_code,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.master_id && user.master_id !== "") {
    data.master_id = user.master_id;
  }

  if (user.bank_name) {
    data.bank_name = user.bank_name;
  }

  if (user.bank_number) {
    data.bank_number = user.bank_number;
  }

  if (user.referral_user) {
    data.referral_user = user.referral_user;
  }

  return data;
};

exports.isValidObjectId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};
