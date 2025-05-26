const mongoose = require("mongoose");

const lotterySetsSchema = new mongoose.Schema({
  lottery_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LotteryType",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  openTime: {
    type: Date,
    required: true,
  },
  closeTime: {
    type: Date,
    required: true,
  },
  result_time: {
    type: Date,
    default: true,
  },
});

module.exports = mongoose.model("LotterySets", lotterySetsSchema);
