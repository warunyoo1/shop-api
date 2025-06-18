const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["daily-deposit", "instant-bonus", "referral", "rebate"],
      required: true,
    },
    target: {
      type: String,
      enum: ["master", "referrer", "normal", "specific", "all"],
      required: true,
    },
    specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    active: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    conditions: {
      depositAmount: { type: Number, default: null },
      depositDays: { type: Number, default: null },
      turnOverTimes: { type: Number, default: null },
      maxBonus: { type: Number, default: null },
      percentage: { type: Number, default: null },
      every: {
        type: String,
        enum: ["daily", "weekly", "monthly", null],
        default: null,
      },
      dayOfWeek: { type: Number, min: 0, max: 6, default: null },
      fromFriendBet: { type: Boolean, default: false },
      requireLinkSignup: { type: Boolean, default: false },
      maxDepositCountPerDay: { type: Number, default: null },
    },
    rewards: {
      credit: { type: Number, default: null },
      withdrawable: { type: Boolean, required: true },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);
PromotionSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    if (ret.startDate) {
      ret.startDate = new Date(ret.startDate).toISOString();
    }
    return removeNullValues(ret);
  },
});

module.exports = mongoose.model("Promotion", PromotionSchema);
