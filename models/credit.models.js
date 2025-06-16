// models/credit.model.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const CreditSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    promotion_id: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      default: null, 
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Credit = mongoose.model("Credit", CreditSchema);

module.exports = Credit;
