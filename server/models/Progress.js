const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true },
  points: { type: Number, required: true },
});

module.exports = mongoose.model("Progress", ProgressSchema);
