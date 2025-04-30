const User = require("../../models/user.model");

exports.registerUser = async ({ username, email, password, phone }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return { error: "Email already exists" };
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return { error: "Username already exists" };
  }

  const user = new User({ username, email, password, phone });
  await user.save();

  return { user };
};
