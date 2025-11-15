const express = require("express");
const router = express.Router();
const User = require("../models/User");
const taskPool = require("../utils/dailyTaskPool");
const verifyToken = require("../middleware/authMiddleware");

// -----------------------------------------------------
// GET USER + AUTO REFRESH DAILY TASKS
// -----------------------------------------------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();

    const shouldRefresh =
      !user.lastTaskRefresh ||
      !user.todayTasks.length ||
      now - new Date(user.lastTaskRefresh) >= 24 * 60 * 60 * 1000;

    if (shouldRefresh) {
      const shuffled = taskPool.sort(() => 0.5 - Math.random());
      user.todayTasks = shuffled.slice(0, 5).map((name) => ({
        name,
        done: false,
      }));

      user.lastTaskRefresh = now;
      await user.save();
    }

    res.status(200).json({ user }); // ✅ FIXED
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------------------
// UPDATE PROFILE
// -----------------------------------------------------
router.post("/me", verifyToken, async (req, res) => {
  try {
    const { age, gender, height, weight, goal } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (age < 5 || age > 120)
      return res.status(400).json({ message: "Invalid age" });

    if (height < 50 || height > 250)
      return res.status(400).json({ message: "Invalid height" });

    if (weight < 20 || weight > 300)
      return res.status(400).json({ message: "Invalid weight" });

    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender))
      return res.status(400).json({ message: "Invalid gender" });

    const validGoals = ["Maintenance", "Cutting", "Bulking"];
    if (!validGoals.includes(goal))
      return res.status(400).json({ message: "Invalid goal" });

    user.age = age;
    user.gender = gender;
    user.height = height;
    user.weight = weight;
    user.goal = goal;

    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("❌ Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------------------
// ADD USER CUSTOM TASK (workouts, meals, meditations)
// -----------------------------------------------------
router.post("/tasks/add/:type", verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { name, points } = req.body;

    const valid = ["workouts", "meals", "meditations"];
    if (!valid.includes(type))
      return res.status(400).json({ message: "Invalid type" });

    const user = await User.findById(req.user.id);

    user[type].push({
      name,
      points: points || 5,
      done: false,
    });

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Add Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------------------
// TOGGLE TODAY TASK
// -----------------------------------------------------
router.put("/tasks/today/:index", verifyToken, async (req, res) => {
  try {
    const index = req.params.index;

    const user = await User.findById(req.user.id);
    if (!user.todayTasks[index])
      return res.status(400).json({ message: "Task not found" });

    const task = user.todayTasks[index];

    task.done = !task.done;

    if (task.done) {
      user.points += 10;
      user.streak += 1;
    } else {
      user.points -= 10;
      user.streak = Math.max(0, user.streak - 1);
    }

    // Titles
    if (user.points >= 1000) user.title = "Elite";
    else if (user.points >= 700) user.title = "Pro";
    else if (user.points >= 400) user.title = "Advanced";
    else if (user.points >= 200) user.title = "Intermediate";
    else if (user.points >= 100) user.title = "Novice";
    else user.title = "Rookie";

    // Levels
    user.level = Math.floor(user.points / 100) + 1;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Toggle Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
