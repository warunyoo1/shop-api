const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  code: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: true,
  },
  condition_type: { type: String, default: "" },
  condition_value: {
    type: Number,
  },
  bonus_amount: {
    type: Number,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  start_date: {
    type: Date,
    default: null,
  },
  end_date: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

PromotionSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Promotion", PromotionSchema);
