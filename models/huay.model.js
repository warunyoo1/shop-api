const mongoose = require("mongoose");

const huaySchema = new mongoose.Schema({
  lottery_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LotteryCategory",
    required: true,
  },
  huay_name: { type: String, default: "" },
  huay_number: { type: Array, default: [] },
  reward: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Huay", huaySchema);
