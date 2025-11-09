const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
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

// GET user tasks
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("workouts meals meditation dailyTasks goal");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a task (workout, meal, meditation)
router.put("/:type/:index/toggle", verifyToken, async (req, res) => {
  try {
    const { type, index } = req.params; // type = "workouts" | "meals" | "meditation"
    if (!["workouts", "meals", "meditation"].includes(type)) return res.status(400).json({ message: "Invalid task type" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user[type][index].done = !user[type][index].done;

    // Update points for gamification
    if (user[type][index].done) user.points += user[type][index].points;
    else user.points -= user[type][index].points;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize tasks based on goal
router.post("/initialize", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Simple example: different tasks based on goal
    if (user.goal === "Bulking") {
      user.workouts = [{ name: "Weight Training", done: false, points: 10 }];
      user.meals = [{ name: "High Protein Meal", done: false, points: 5 }];
    } else if (user.goal === "Cutting") {
      user.workouts = [{ name: "Cardio", done: false, points: 10 }];
      user.meals = [{ name: "Low Calorie Meal", done: false, points: 5 }];
    } else { // Maintenance
      user.workouts = [{ name: "Moderate Training", done: false, points: 10 }];
      user.meals = [{ name: "Balanced Meal", done: false, points: 5 }];
    }

    user.meditation = [{ name: "10 min Meditation", done: false, points: 5 }];
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
