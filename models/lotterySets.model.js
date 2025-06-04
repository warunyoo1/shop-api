const mongoose = require("mongoose");

const lotterySetsSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      default: "",
    },
    betting_options: [
      {
        betting_type_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        payout_rate: {
          type: Number,
          required: true,
        },
        min_bet: {
          type: Number,
          required: true,
        },
        max_bet: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("LotterySets", lotterySetsSchema);
