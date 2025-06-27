const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    profilePicture: { type: String, default: "" },
    role: { type: Array, default: [] },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ถ้ามีการ update ถ้ามีการเปลี่ยน password ก็ต้อง hash password ใหม่
adminSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
