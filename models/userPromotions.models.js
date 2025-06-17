const mongoose = require("mongoose");

const UserPromotionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected", "rewarded"],
      default: "pending",
      required: true,
    },

    progress: {
      depositCount: { type: Number, default: 0 },
      depositTotal: { type: Number, default: 0 },
      betTotal: { type: Number, default: 0 },
      lossTotal: { type: Number, default: 0 },
      lastDepositDate: { type: Date, default: null },
      consecutiveDays: { type: Number, default: 0 },
    },

    reward: {
      amount: { type: Number, default: 0 },
      withdrawable: { type: Boolean, default: false },
      givenAt: { type: Date },
    },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPromotion", UserPromotionSchema);
