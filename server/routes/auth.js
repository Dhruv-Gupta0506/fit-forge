require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const resend = new Resend(process.env.RESEND_API_KEY);

const JWT_EXPIRES = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

// -------------------- OTP HELPERS --------------------
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

// -------------------- SEND EMAIL USING RESEND --------------------
async function sendOtpEmail(email, otp) {
  try {
    await resend.emails.send({
      from: `FitForge <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your FitForge OTP",
      html: `
        <h2>Your OTP is <b>${otp}</b></h2>
        <p>This OTP expires in <b>10 minutes</b>.</p>
      `,
    });

    console.log("📨 OTP SENT TO:", email);
  } catch (err) {
    console.error("❌ Resend Error:", err);
    throw new Error("Email sending failed");
  }
}

// =========================================================
// REGISTER
// =========================================================
router.post("/register", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name: req.body.name,
      email,
      password: req.body.password,
      isVerified: false,
    });

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;

    await user.save();
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent", email });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// VERIFY OTP (REGISTER)
// =========================================================
router.post("/verify-otp", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const otp = String(req.body.otp).trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (hashOtp(otp) !== user.otpHash)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.otpExpiresAt)
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: JWT_EXPIRES,
    });

    res.json({ message: "OTP verified", user });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// LOGIN
// =========================================================
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email first" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: JWT_EXPIRES,
    });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// FORGOT PASSWORD
// =========================================================
router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent", email });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// VERIFY RESET OTP
// =========================================================
router.post("/reset-otp", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const otp = String(req.body.otp).trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (hashOtp(otp) !== user.otpHash)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.otpExpiresAt)
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("❌ Reset OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// RESET PASSWORD (NO DOUBLE HASHING)
// =========================================================
router.post("/reset-password", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const newPassword = req.body.newPassword;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // DO NOT HASH HERE (schema handles hashing)
    user.password = newPassword;
    user.otpHash = null;
    user.otpExpiresAt = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
