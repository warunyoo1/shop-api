const mongoose = require("mongoose");

const lotteryRatesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rate: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
});

module.exports = mongoose.model("LotteryRates", lotteryRatesSchema);
