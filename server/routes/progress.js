const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// Add progress
router.post("/add", verifyToken, async (req, res) => {
  const { weight, points } = req.body;
  if (!weight || !points) return res.status(400).json({ message: "Weight and points required" });

  try {
    const progress = new Progress({
      userId: req.userId,
      weight,
      points,
    });
    await progress.save();
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all progress logs for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const logs = await Progress.find({ userId: req.userId }).sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
