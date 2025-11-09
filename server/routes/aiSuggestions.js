// server/routes/aiSuggestions.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// In-memory plan cache to avoid regenerating too often
const planCache = new Map();

// Sample exercise library — you can add more entries / real URLs
const EXERCISES = [
  { name: "Barbell Bench Press", muscle: "Chest", equipment: "Gym", gifUrl: "" },
  { name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Gym", gifUrl: "" },
  { name: "Cable Fly", muscle: "Chest", equipment: "Gym", gifUrl: "" },
  { name: "Push-ups", muscle: "Chest", equipment: "Both", gifUrl: "" },
  { name: "Incline Push-ups", muscle: "Chest", equipment: "Home", gifUrl: "" },

  { name: "Deadlift", muscle: "Back", equipment: "Gym", gifUrl: "" },
  { name: "Bent Over Row", muscle: "Back", equipment: "Gym", gifUrl: "" },
  { name: "Lat Pulldown", muscle: "Back", equipment: "Gym", gifUrl: "" },
  { name: "Inverted Row", muscle: "Back", equipment: "Home", gifUrl: "" },

  { name: "Barbell Squat", muscle: "Legs", equipment: "Gym", gifUrl: "" },
  { name: "Leg Press", muscle: "Legs", equipment: "Gym", gifUrl: "" },
  { name: "Lunges", muscle: "Legs", equipment: "Both", gifUrl: "" },
  { name: "Bodyweight Squats", muscle: "Legs", equipment: "Home", gifUrl: "" },

  { name: "Overhead Press", muscle: "Shoulders", equipment: "Gym", gifUrl: "" },
  { name: "Lateral Raise", muscle: "Shoulders", equipment: "Gym", gifUrl: "" },
  { name: "Pike Push-ups", muscle: "Shoulders", equipment: "Home", gifUrl: "" },

  { name: "Dumbbell Curl", muscle: "Arms", equipment: "Gym", gifUrl: "" },
  { name: "Tricep Rope Pushdown", muscle: "Arms", equipment: "Gym", gifUrl: "" },
  { name: "Chair Dips", muscle: "Arms", equipment: "Home", gifUrl: "" },

  { name: "Plank", muscle: "Core", equipment: "Both", gifUrl: "" },
  { name: "Hanging Leg Raises", muscle: "Core", equipment: "Gym", gifUrl: "" },
  { name: "Jump Rope", muscle: "Cardio", equipment: "Both", gifUrl: "" },
  { name: "Treadmill Run", muscle: "Cardio", equipment: "Gym", gifUrl: "" },
  { name: "Burpees", muscle: "Cardio", equipment: "Home", gifUrl: "" },
];

function nowPlusMinutes(minutes) {
  return Date.now() + minutes * 60 * 1000;
}

function sampleArray(arr, n) {
  const copy = arr.slice();
  const result = [];
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function adaptLoad(goal, level, exerciseName) {
  const levelTemplates = {
    beginner: { sets: 3, restBase: 60 },
    intermediate: { sets: 4, restBase: 75 },
    advanced: { sets: 5, restBase: 90 },
  };

  const goalTemplates = {
    Bulking: { repMin: 6, repMax: 12 },
    Cutting: { repMin: 12, repMax: 20 },
    Maintenance: { repMin: 8, repMax: 15 },
  };

  const lvl = levelTemplates[level] || levelTemplates.intermediate;
  const gt = goalTemplates[goal] || goalTemplates.Maintenance;

  const isCompound = /deadlift|squat|bench|press/i.test(exerciseName);

  const sets = lvl.sets;
  const minRep = gt.repMin;
  const maxRep = isCompound ? Math.min(gt.repMax, 10) : gt.repMax;
  const reps = `${minRep}-${maxRep}`;
  const rest = `${lvl.restBase + (isCompound ? 30 : 0)}s`;

  return { sets, reps, rest };
}

function buildSplit(days) {
  if (days >= 5) {
    return ["Push", "Pull", "Legs", "Upper", "Full Body"];
  } else if (days === 4) {
    return ["Upper", "Lower", "Push", "Pull"];
  } else if (days === 3) {
    return ["Push", "Pull", "Legs"];
  } else {
    return ["Full Body"];
  }
}

/**
 * Generates a workout plan (array of day objects)
 * Each day object: { day: String, exercises: [ { name, muscle, sets, reps, rest, equipment, notes, gifUrl } ] }
 */
function generatePlan({ location, goal, level, gender, days }) {
  const pool = EXERCISES.filter((ex) => {
    if (ex.equipment === "Both") return true;
    if (location === "Gym") return ex.equipment === "Gym";
    if (location === "Home") return ex.equipment === "Home";
    return true;
  });

  const split = buildSplit(days);
  const plan = [];

  split.forEach((splitName, idx) => {
    if (idx >= days) return;
    // select random exercises (4-6) for this split/day
    const candidates = pool.filter((ex) => {
      const m = ex.muscle.toLowerCase();
      if (splitName === "Push") return ["chest", "shoulders", "arms"].includes(m);
      if (splitName === "Pull") return ["back", "arms"].includes(m);
      if (splitName === "Legs") return ["legs"].includes(m);
      if (splitName === "Upper") return ["chest", "back", "shoulders", "arms"].includes(m);
      if (splitName.includes("Full")) return true;
      return false;
    });

    const numExercises = Math.min(6, Math.max(3, Math.floor(candidates.length / 2)));
    const selected = sampleArray(candidates, numExercises);

    const exercises = selected.map((ex) => {
      const load = adaptLoad(goal, level, ex.name);
      return {
        name: ex.name,
        muscle: ex.muscle,
        equipment: ex.equipment,
        gifUrl: ex.gifUrl,
        sets: load.sets,
        reps: load.reps,
        rest: load.rest,
        notes: "Try to increase reps or weight next session if possible",
      };
    });

    plan.push({
      day: `Day ${idx + 1} — ${splitName}`,
      exercises,
    });
  });

  return plan;
}

router.get("/workouts", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("goal workoutLocation gender level");
    const query = req.query;

    const location = (query.location || user?.workoutLocation || "Gym").trim();
    const goal = (query.goal || user?.goal || "Maintenance").trim();
    const level = (query.level || user?.level || "intermediate").toLowerCase();
    const gender = (query.gender || user?.gender || "Other").trim();
    const days = parseInt(query.days, 10) || 3;

    const cacheKey = `${req.userId || "anon"}_${location}_${goal}_${level}_${gender}_${days}`;
    const cached = planCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ workouts: cached.plan, cached: true });
    }

    const plan = generatePlan({ location, goal, level, gender, days });

    // cache for 20 minutes
    planCache.set(cacheKey, { plan, expiresAt: nowPlusMinutes(20) });

    return res.json({
      workouts: plan,
      cached: false,
      meta: { location, goal, level, gender, days },
    });
  } catch (err) {
    console.error("Error in aiSuggestions /workouts:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
