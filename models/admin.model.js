const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  address: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  role: { type: Array, default: []},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("admin", adminSchema);
