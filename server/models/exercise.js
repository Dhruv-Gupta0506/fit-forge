const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  muscleGroup: { 
    type: String, 
    required: true,
    enum: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"]
  },

  equipment: {
    type: String,
    enum: ["Gym", "Home", "Both"],
    required: true
  },

  minLevel: { 
    type: Number, 
    enum: [1, 2, 3], // 1 Beginner, 2 Intermediate, 3 Advanced
    default: 1 
  },

  maxLevel: { 
    type: Number, 
    enum: [1, 2, 3],
    default: 3 
  },

  isCompound: { type: Boolean, default: false },

  gifUrl: { type: String, default: "" },

  defaultSets: { type: Number, default: 3 },
  defaultReps: { type: String, default: "10-12" },
  defaultRest: { type: String, default: "60s" },

}, { timestamps: true });

module.exports = mongoose.model("Exercise", exerciseSchema);
