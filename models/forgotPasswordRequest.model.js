const mongoose = require("mongoose");

const forgotPasswordRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: { type: String, required: true },
  requested_at: { type: Date, default: Date.now },
  method: { type: String, default: "by_phone" },
  status: {
    type: String,
    enum: ["pending", "completed", "expired"],
    default: "pending",
  },
});

module.exports = mongoose.model(
  "ForgotPasswordRequest",
  forgotPasswordRequestSchema
);
