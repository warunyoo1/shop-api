const mongoose = require("mongoose");
const { Schema } = mongoose;

const WithdrawalSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      default: 0,
    },
    bank_name: { type: String, default: "" },
    bank_number: { type: String, default: "" },
    account_name: { type: String, default: "" },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      default: null,
    },
    addcredit_admin_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    addcredit_admin_name: {
      type: String,
      required: false,
    },
    addcredit_admin_role:{
      type: String,
      enum: ["admin", "superadmin",""],
    } 
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);

module.exports = Withdrawal; 