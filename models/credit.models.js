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
    netAmount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    credit_promotion:{
      type: Number,
      default: 0,
    },
    channel: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    

  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Credit = mongoose.model("Credit", CreditSchema);

module.exports = Credit;
