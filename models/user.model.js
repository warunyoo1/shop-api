const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const slugify = require("slugify");

const userSchema = new mongoose.Schema({
  full_name: { type: String, default: "" },
  username: { type: String },
  password: { type: String },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  profile_picture: { type: String, default: "" },
  role: { type: String, default: "user" },
  credit: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  bank_name: { type: String, default: "" },
  bank_number: { type: String, default: "" },
  referral_link: { type: String, default: "" },
  referral_code: { type: String, default: "" },
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

userSchema.pre("save", function (next) {
  if (this.isModified("referral_code") && this.referral_code) {
    const slug = slugify(this.referral_code);
    this.referral_link = `${process.env.APP_BASE_URL}/user/${slug}`;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
