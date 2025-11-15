const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const generateWorkoutPlan = require("../utils/generateWorkoutPlan");

router.get("/workouts", auth, async (req, res) => {
  try {
    const {
      location = "Gym",
      goal = "Maintenance",
      level = "intermediate",
      days = 3,
      regen = 0  // 🔥 IMPORTANT — capture regen
    } = req.query;

    const plan = await generateWorkoutPlan({
      days: Number(days),
      location,
      goal,
      level,
      regen: Number(regen)  // 🔥 pass regen to generator
    });

    res.json({
      workouts: plan,
      meta: { location, goal, level, days: String(days) },
    });
  } catch (err) {
    console.error("GET /api/ai/workouts failed:", err);
    res.status(500).json({ message: "Failed to generate plan" });
  }
});

module.exports = router;
