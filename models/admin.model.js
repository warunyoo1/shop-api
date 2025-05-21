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
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ถ้ามีการ update ถ้ามีการเปลี่ยน password ก็ต้อง hash password ใหม่
adminSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
  next();
}); 

module.exports = mongoose.model("admin", adminSchema);
