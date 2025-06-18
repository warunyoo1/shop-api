const mongoose = require("mongoose");

const UserPromotionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    promotions: [
      {
        promotion_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Promotion",
          required: true,
        },

        status: {
          type: String,
          enum: ["pending", "completed", "rewarded", "rejected"],
          default: "pending",
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
          givenAt: { type: Date, default: null },
        },

        note: {
          type: String,
          default: "",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },

        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPromotion", UserPromotionSchema);
