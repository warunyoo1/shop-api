const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, default: "" },
  password: { type: String },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  role: { type: String, default: "user" },
  credit: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  master_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Master",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
