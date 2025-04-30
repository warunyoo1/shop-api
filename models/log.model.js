const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  tag: { type: String },
  action: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  endpoint: String,
  data: Object,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", logSchema);
