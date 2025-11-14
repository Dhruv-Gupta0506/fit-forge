const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    // OTP
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

    // Profile
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    goal: {
      type: String,
      enum: ["Maintenance", "Cutting", "Bulking"],
      default: null,
    },

    // Game System
    points: { type: Number, default: 0 },
    title: { type: String, default: "Rookie" },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },

    // DEFAULT STATIC TASKS
    dailyTasks: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 10 },
        },
      ],
      default: [
        { name: "Workout", done: false, points: 10 },
        { name: "Meal Logging", done: false, points: 5 },
        { name: "Meditation", done: false, points: 5 },
      ],
    },

    // User-added categories
    workouts: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 10 },
        },
      ],
      default: [],
    },

    meals: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 5 },
        },
      ],
      default: [],
    },

    meditations: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 5 },
        },
      ],
      default: [],
    },

    // Daily random tasks
    todayTasks: {
      type: [
        {
          name: String,
          done: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    lastTaskRefresh: { type: Date, default: null },
  },
  { timestamps: true }
);

// --------------------------------------
// HASH PASSWORD
// --------------------------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
