const mongoose = require("mongoose");

const passwordHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  password: { type: String, required: true },
  changed_by: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: { type: String, required: true },
      full_name: { type: String, required: true },
      changed_at: { type: Date, default: Date.now },
    },
  ],
  last_password_change: [
    {
      date: { type: Date, required: true },
      password: { type: String, required: true },
      changed_by: {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: { type: String, required: true },
        full_name: { type: String, required: true },
      },
    },
  ],
  changed_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PasswordHistory", passwordHistorySchema);
