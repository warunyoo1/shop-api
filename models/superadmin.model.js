const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const passwordHistorySchema = new mongoose.Schema({
  password: { type: String, required: true },
  changed_at: { type: Date, default: Date.now },
  changed_by: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    full_name: { type: String }
  }
});

const superadminSchema = new mongoose.Schema(
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
    role: { type: String, default:'superadmin'},
    active: {
      type: Boolean,
      default: true,
    },
    password_history: [passwordHistorySchema],
    last_password_change: {
      date: { type: Date },
      changed_by: {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        full_name: { type: String }
      }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
superadminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

superadminSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
  next();
});

module.exports = mongoose.model("superadmin", superadminSchema);
 