const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ----------------------------
// ✅ JWT AUTH MIDDLEWARE
// ----------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.userId = decoded.id;
    next();
  });
};

// ----------------------------
// ✅ GET ALL USER TASKS (OLD SYSTEM)
// ----------------------------
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "workouts meals meditations dailyTasks todayTasks goal points level streak"
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------
// ✅ TOGGLE OLD SYSTEM TASK (workouts / meals / meditations)
// ----------------------------
router.put("/:type/:index/toggle", verifyToken, async (req, res) => {
  try {
    const { type, index } = req.params;

    if (!["workouts", "meals", "meditations"].includes(type)) {
      return res.status(400).json({ message: "Invalid task type" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user[type][index])
      return res.status(400).json({ message: "Task not found" });

    // Toggle
    user[type][index].done = !user[type][index].done;

    // POINTS
    const pts = user[type][index].points;
    if (user[type][index].done) {
      user.points += pts;
      user.streak += 1;
    } else {
      user.points -= pts;
      user.streak = Math.max(0, user.streak - 1);
    }

    // Update TITLE
    if (user.points >= 1000) user.title = "Elite";
    else if (user.points >= 700) user.title = "Pro";
    else if (user.points >= 400) user.title = "Advanced";
    else if (user.points >= 200) user.title = "Intermediate";
    else if (user.points >= 100) user.title = "Novice";
    else user.title = "Rookie";

    // LEVEL
    user.level = Math.floor(user.points / 100) + 1;

    await user.save();
    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------
// ✅ ✅ NEW SYSTEM – TOGGLE TODAY TASK
// ----------------------------
router.put("/today/toggle/:index", verifyToken, async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.todayTasks[index])
      return res.status(400).json({ message: "Task not found" });

    // Toggle
    user.todayTasks[index].done = !user.todayTasks[index].done;

    // Flat reward for daily tasks
    const pts = 10;

    if (user.todayTasks[index].done) {
      user.points += pts;
      user.streak += 1;
    } else {
      user.points -= pts;
      user.streak = Math.max(0, user.streak - 1);
    }

    // Title update
    if (user.points >= 1000) user.title = "Elite";
    else if (user.points >= 700) user.title = "Pro";
    else if (user.points >= 400) user.title = "Advanced";
    else if (user.points >= 200) user.title = "Intermediate";
    else if (user.points >= 100) user.title = "Novice";
    else user.title = "Rookie";

    // Level update
    user.level = Math.floor(user.points / 100) + 1;

    await user.save();
    res.status(200).json(user);

  } catch (err) {
    console.error("❌ Error toggling today task:", err);
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------
// ✅ INITIALIZE TASKS BASED ON GOAL (optional)
// ----------------------------
router.post("/initialize", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.goal === "Bulking") {
      user.workouts = [{ name: "Weight Training", done: false, points: 10 }];
      user.meals = [{ name: "High Protein Meal", done: false, points: 5 }];
    } else if (user.goal === "Cutting") {
      user.workouts = [{ name: "Cardio", done: false, points: 10 }];
      user.meals = [{ name: "Low Calorie Meal", done: false, points: 5 }];
    } else {
      user.workouts = [{ name: "Moderate Training", done: false, points: 10 }];
      user.meals = [{ name: "Balanced Meal", done: false, points: 5 }];
    }

    user.meditations = [{ name: "10 min Meditation", done: false, points: 5 }];

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
