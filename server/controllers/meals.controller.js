const Meal = require("../models/Meal.js");

const getMeals = async (req, res) => {
  try {
    const { diet, phase } = req.query;

    const query = {};
    if (diet) query.diet = diet;
    if (phase) query.phase = phase;

    const meals = await Meal.find(query).lean();

    res.json({ meals });
  } catch (err) {
    console.error("Error fetching meals:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getMeals };
