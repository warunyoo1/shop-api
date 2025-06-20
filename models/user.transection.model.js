const mongoose = require("mongoose");

const userTransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["bet", "payout", "deposit", "withdraw", "rebate", "refund"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balance_before: {
    type: Number,
    required: true,
  },
  balance_after: {
    type: Number,
    required: true,
  },
  ref_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserBet", // หรือเปลี่ยนเป็น collection ที่เกี่ยวข้อง
    default: null,
  },
  description: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserTransaction", userTransactionSchema);
