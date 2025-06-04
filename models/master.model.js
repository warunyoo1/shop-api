const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const masterSchema = new mongoose.Schema({
  masterId: { type: String },
  username: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  profileUrl: { type: String, default: "" },
  commission_percentage: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

masterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

masterSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
  next();
});

module.exports = mongoose.model("Master", masterSchema);
