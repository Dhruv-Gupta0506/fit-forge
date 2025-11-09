const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.userId = decoded.id;
    next();
  });
};

// GET user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Populate defaults based on goal
    if (!user.workouts.length) {
      if (user.goal === "Bulking") user.workouts = [{ name: "Heavy Lifting", points: 15 }];
      if (user.goal === "Cutting") user.workouts = [{ name: "Cardio", points: 10 }];
      if (user.goal === "Maintenance") user.workouts = [{ name: "Mixed Routine", points: 10 }];
    }

    if (!user.meals.length) {
      if (user.goal === "Bulking") user.meals = [{ name: "High Protein Meal", points: 10 }];
      if (user.goal === "Cutting") user.meals = [{ name: "Low Calorie Meal", points: 10 }];
      if (user.goal === "Maintenance") user.meals = [{ name: "Balanced Meal", points: 5 }];
    }

    if (!user.meditations.length) {
      user.meditations = [{ name: "Mindfulness Meditation", points: 5 }];
    }

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// TOGGLE a task done/undone
router.put("/tasks/toggle/:type/:index", verifyToken, async (req, res) => {
  const { type, index } = req.params;
  const validTypes = ["dailyTasks", "workouts", "meals", "meditations"];

  if (!validTypes.includes(type)) return res.status(400).json({ message: "Invalid task type" });

  try {
    const user = await User.findById(req.userId);
    if (!user[type][index]) return res.status(400).json({ message: "Task not found" });

    user[type][index].done = !user[type][index].done;

    const points = user[type][index].points;
    if (user[type][index].done) user.points += points;
    else user.points -= points;

    // Update streak
    user.streak = user.streak || 0;
    if (user[type][index].done) user.streak += 1;
    else user.streak = Math.max(0, user.streak - 1);

    // Update title & level
    if (user.points >= 1000) user.title = "Elite";
    else if (user.points >= 700) user.title = "Pro";
    else if (user.points >= 400) user.title = "Advanced";
    else if (user.points >= 200) user.title = "Intermediate";
    else if (user.points >= 100) user.title = "Novice";
    else user.title = "Rookie";

    user.level = Math.floor(user.points / 100) + 1;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error toggling task:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADD a new task
router.post("/tasks/add/:type", verifyToken, async (req, res) => {
  const { type } = req.params;
  const { name, points } = req.body;
  const validTypes = ["workouts", "meals", "meditations"];

  if (!validTypes.includes(type)) return res.status(400).json({ message: "Invalid task type" });
  if (!name) return res.status(400).json({ message: "Task name required" });

  try {
    const user = await User.findById(req.userId);
    if (!user[type]) user[type] = [];
    user[type].push({ name, points: points || 5 });
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error adding task:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
