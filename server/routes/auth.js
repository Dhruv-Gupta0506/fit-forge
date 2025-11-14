require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const authMiddleware = require("../middleware/authMiddleware");

const JWT_EXPIRES = 7 * 24 * 60 * 60 * 1000; // 7 days

// -------------------- OTP HELPERS --------------------
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// -------------------- SEND EMAIL --------------------
async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
  });

  await transporter.sendMail({
    from: `"FitForge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your FitForge OTP",
    html: `<h2>Your OTP is <b>${otp}</b></h2><p>Expires in 10 minutes.</p>`
  });

  console.log("📨 OTP SENT TO:", email);
}

// -------------------- REGISTER --------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      isVerified: false
    });

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'User registered. OTP sent.',
      userId: user._id,
      email
    });

  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- VERIFY OTP --------------------
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (hashOtp(otp) !== user.otpHash)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.otpExpiresAt)
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---------------------------
    // ✅ Correct cookie for localhost
    // ---------------------------
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,     // MUST be false on localhost
      sameSite: "Lax",   // MUST be Lax on localhost
      maxAge: JWT_EXPIRES,
      path: "/",
    });

    res.json({
      message: "OTP verified successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---------------------------
    // ✅ Correct cookie for localhost
    // ---------------------------
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,     // localhost
      sameSite: "Lax",   // localhost
      maxAge: JWT_EXPIRES,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- AUTO LOGIN --------------------
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error("❌ Auto-login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
