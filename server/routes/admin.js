const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ✅ Middleware to verify admin (cookie-based now)
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken; // 🔥 read JWT from cookie
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.userId = user._id;
    next();
  } catch (err) {
    console.error("❌ Admin auth error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ GET all users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE user points, streak, title
router.put("/users/:id", verifyAdmin, async (req, res) => {
  const { points, streak, title } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { points, streak, title },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
