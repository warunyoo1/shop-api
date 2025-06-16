const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const masterSchema = new mongoose.Schema({
  masterId: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  share_url_master: { type: String, default: "" },
  slug: { type: String }, // จะใช้ _id
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

masterSchema.pre("save", function (next) {
  if (this.isModified("username") && this.username) {
    const slug = slugify(this.username, { lower: true, strict: true });
    this.slug = slug;
    this.share_url_master = `${process.env.APP_BASE_URL}/master/${slug}`;
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
