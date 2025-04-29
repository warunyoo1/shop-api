const User = require("../../models/user.model");

exports.registerUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const user = new User({ username, email, password });
  await user.save();
  return user;
};
