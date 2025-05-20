const mongoose = require("mongoose");

const lotteryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  openTime: {
    type: String,
    required: true,
  },
  closeTime: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LotteryCategory",
    required: true,
  },
});

module.exports = mongoose.model("LotteryItem", lotteryItemSchema);
