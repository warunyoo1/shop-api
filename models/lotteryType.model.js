const mongoose = require("mongoose");

const lotteryTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("LotteryType", lotteryTypeSchema);
