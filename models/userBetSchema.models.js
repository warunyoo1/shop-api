const mongoose = require("mongoose");

const userBetSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  lottery_set_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "LotterySets",
  },
  bet_date: { type: Date, default: Date.now },
  total_bet_amount: { type: Number, default: "" },
  bets: [
    {
      betting_option_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      betting_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BettingTypes",
      },
      numbers: [
        {
          is_won: { type: Boolean, default: null },
          number: { type: String, required: true },
          amount: { type: Number, required: true },
        },
      ],
      bet_amount: { type: Number, required: true },
      payout_rate: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "won", "lost", "cancelled"],
    default: "pending",
  },
  payout_amount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserBet", userBetSchema);
