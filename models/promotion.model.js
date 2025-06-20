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
    startDate: { type: Date, required: true, default: null },
    endDate: { type: Date, default: null },
    conditions: {
      depositAmount: { type: Number, default: null },
      depositDays: { type: Number, default: null },
      turnOverTimes: { type: Number, default: null },
      maxBonusAmount: { type: Number, default: null },
      maxBonus: { type: Number, default: null },
      percentage: { type: Number, default: null },
      every: {
        type: String,
        enum: ["daily", "weekly", "monthly", null],
        default: null,
      },
      dayOfWeek: { type: Number, default: null },
      fromFriendBet: { type: Boolean, default: null },
      requireLinkSignup: { type: Boolean, default: null },
      maxDepositCountPerDay: { type: Number, default: null },
    },
    rewards: {
      type: { type: String, enum: ["fixed", "percentage"], default: null },
      amount: { type: Number, default: null },
      basedOn: { type: String, enum: ["deposit", "bet", "loss"], default: null },
      withdrawable: { type: Boolean, default: null },
      description: { type: String, default: null },

    },
  },
  { timestamps: true }
);

PromotionSchema.virtual("images", {
  ref: "Image",
  localField: "_id",
  foreignField: "promotion_id",
  justOne: false,
});

PromotionSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    if (ret.startDate) {
      ret.startDate = new Date(ret.startDate).toISOString();
    }
    return ret;
  },
});

module.exports = mongoose.model("Promotion", PromotionSchema);
