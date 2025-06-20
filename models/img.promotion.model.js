const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  promotion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
  },
  name: String,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", imageSchema);
