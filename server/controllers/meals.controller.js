const Meal = require("../models/Meal.js");

// Utility: shuffle array
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

const getMeals = async (req, res) => {
  try {
    const { diet, phase, regen } = req.query;

    // DAILY SEED so meals change every day automatically
    const today = new Date().toISOString().split("T")[0];
    const seed = regen ? Math.random() : today.length; // regenerate if regen changes

    // FILTER meals by diet + phase
    const query = {};
    if (diet) query.diet = diet;
    if (phase) query.phase = phase;

    let meals = await Meal.find(query).lean();

    if (!meals.length) {
      return res.json({ meals: [] });
    }

    // Group meals by Meal Type
    const grouped = {
      Breakfast: meals.filter(m => m.meal === "Breakfast"),
      Lunch: meals.filter(m => m.meal === "Lunch"),
      Snacks: meals.filter(m => m.meal === "Snacks"),
      Dinner: meals.filter(m => m.meal === "Dinner"),
    };

    const finalMeals = [];

    // For each meal type: shuffle + pick 4
    Object.keys(grouped).forEach(type => {
      const list = grouped[type];

      if (list.length > 0) {
        const shuffled = shuffle([...list, seed]);
        finalMeals.push(...shuffled.slice(0, 4));
      }
    });

    res.json({ meals: finalMeals });

  } catch (err) {
    console.error("Error fetching meals:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getMeals };
