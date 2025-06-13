const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const masterSchema = new mongoose.Schema({
  masterId: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profileUrl: { type: String, default: "" },
  slug: { type: String, unique: true }, // จะใช้ _id
  commission_percentage: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

masterSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isNew || this.isModified("username")) {
    this.slug = this._id.toString();
    this.profileUrl = `${process.env.APP_BASE_URL}/master/${slugify(
      this.username,
      { lower: true, strict: true }
    )}`;
  }
  next();
});

masterSchema.pre("save", function (next) {
  if (this.isModified("username") && this.username) {
    this.profileUrl = `${process.env.APP_BASE_URL}/master/${slugify(
      this.username,
      { lower: true, strict: true }
    )}`;
  }
  next();
});



masterSchema.statics.findBySlug = async function (slug) {
  try {
    const master = await this.findOne({ slug });
    if (!master) throw new Error("Master not found");
    return master;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Master", masterSchema);
