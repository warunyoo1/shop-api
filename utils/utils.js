const { v4: uuid4 } = require("uuid");
const User = require("../models/user.model");

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
