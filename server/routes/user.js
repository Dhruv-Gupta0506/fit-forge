const express = require("express");
const router = express.Router();
const User = require("../models/User");
const taskPool = require("../utils/dailyTaskPool");
const verifyToken = require("../middleware/authMiddleware");

// -----------------------------------------------------
// GET /user/me (AUTO REFRESH DAILY TASKS)
// -----------------------------------------------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();

    // No tasks? generate
    if (!user.lastTaskRefresh || !user.todayTasks.length) {
      user.todayTasks = taskPool
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(t => ({ name: t, done: false }));

      user.lastTaskRefresh = now;
      await user.save();
      return res.status(200).json(user);
    }

    // Check 24 hours
    const hoursPassed = (now - new Date(user.lastTaskRefresh)) / (1000 * 60 * 60);

    if (hoursPassed >= 24) {
      user.todayTasks = taskPool
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(t => ({ name: t, done: false }));

      user.lastTaskRefresh = now;
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------------------------------
// UPDATE PROFILE
// -----------------------------------------------------
router.post("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { age, gender, height, weight, goal } = req.body;

    if (!age || age < 5 || age > 120)
      return res.status(400).json({ message: "Invalid age." });

    if (!height || height < 50 || height > 250)
      return res.status(400).json({ message: "Invalid height." });

    if (!weight || weight < 20 || weight > 300)
      return res.status(400).json({ message: "Invalid weight." });

    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender))
      return res.status(400).json({ message: "Invalid gender." });

    const validGoals = ["Maintenance", "Cutting", "Bulking"];
    if (!validGoals.includes(goal))
      return res.status(400).json({ message: "Invalid fitness goal." });

    user.age = age;
    user.gender = gender;
    user.height = height;
    user.weight = weight;
    user.goal = goal;

    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------------------------------
// OLD SYSTEM: TOGGLE (dailyTasks, workouts, meals...)
// -----------------------------------------------------
router.put("/tasks/toggle/:type/:index", verifyToken, async (req, res) => {
  const { type, index } = req.params;
  const validTypes = ["dailyTasks", "workouts", "meals", "meditations"];

  if (!validTypes.includes(type))
    return res.status(400).json({ message: "Invalid task type" });

  try {
    const user = await User.findById(req.user.id);
    if (!user[type] || !user[type][index])
      return res.status(400).json({ message: "Task not found" });

    user[type][index].done = !user[type][index].done;

    const points = user[type][index].points;

    if (user[type][index].done) user.points += points;
    else user.points -= points;

    if (!user.streak) user.streak = 0;
    if (user[type][index].done) user.streak += 1;
    else user.streak = Math.max(0, user.streak - 1);

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

// -----------------------------------------------------
// OLD SYSTEM: ADD TASK
// -----------------------------------------------------
router.post("/tasks/add/:type", verifyToken, async (req, res) => {
  const { type } = req.params;
  const { name, points } = req.body;
  const validTypes = ["workouts", "meals", "meditations"];

  if (!validTypes.includes(type))
    return res.status(400).json({ message: "Invalid task type" });

  if (!name || name.trim().length < 2)
    return res.status(400).json({ message: "Task name too short" });

  try {
    const user = await User.findById(req.user.id);

    user[type].push({ name, points: points || 5 });

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error adding task:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------------------------------
// NEW: TOGGLE TODAY TASK
// -----------------------------------------------------
router.put("/tasks/today/:index", verifyToken, async (req, res) => {
  const { index } = req.params;

  try {
    const user = await User.findById(req.user.id);

    if (!user.todayTasks || !user.todayTasks[index])
      return res.status(400).json({ message: "Task not found" });

    const task = user.todayTasks[index];
    task.done = !task.done;

    const taskPoints = 10;

    if (task.done) {
      user.points += taskPoints;
      user.streak += 1;
    } else {
      user.points -= taskPoints;
      user.streak = Math.max(0, user.streak - 1);
    }

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
    console.error("❌ Error toggling daily task:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
