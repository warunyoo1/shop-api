const mongoose = require("mongoose");

const bettingTypesSchema = new mongoose.Schema(
  {
    lottery_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LotteryType",
      required: true,
    },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    code: { type: String, default: "" },
    createdAt: {
      type: Date,
      default: Date.now,
    },
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

module.exports = mongoose.model("BettingTypes", bettingTypesSchema);
