const mongoose = require("mongoose");

const MealSchema = new mongoose.Schema({
  name: String,
  meal: String,
  diet: String,
  phase: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  ingredients: [String],
  recipe: String,
});

module.exports = mongoose.model("Meal", MealSchema);
