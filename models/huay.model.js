const mongoose = require("mongoose");

const huaySchema = new mongoose.Schema({
  lottery_set_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LotterySets",
    required: true,
  },
  huay_name: { type: String, default: "" },
  huay_number: { type: Array, default: [] },
  reward: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Huay", huaySchema);
