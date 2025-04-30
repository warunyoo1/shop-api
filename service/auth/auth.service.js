const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) return { success: false, message: "User not found" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { success: false, message: "Invalid credentials" };

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION, 
  });

  return { success: true, user, token };
};
