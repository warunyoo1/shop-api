const mongoose = require("mongoose");

const lotteryCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("LotteryCategory", lotteryCategorySchema);
