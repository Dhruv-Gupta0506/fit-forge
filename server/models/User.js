const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    },

    // OTP Fields
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },

    // User profile fields
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    goal: {
      type: String,
      enum: ["Maintenance", "Cutting", "Bulking"],
      default: null
    },

    points: { type: Number, default: 0 },
    title: { type: String, default: "Rookie" },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },

    // ------------------------------
    // DAILY TASKS (BACKWARD SAFE)
    // ------------------------------
    dailyTasks: {
      type: [
        {
          name: { type: String },     // new format
          task: { type: String },     // old format
          done: { type: Boolean, default: false },
          points: { type: Number, default: 10 }
        }
      ],
      default: [
        { name: "Workout", done: false, points: 10 },
        { name: "Meal Logging", done: false, points: 5 },
        { name: "Meditation", done: false, points: 5 }
      ]
    },

    workouts: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 10 }
        }
      ],
      default: []
    },

    meals: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 5 }
        }
      ],
      default: []
    },

    meditations: {
      type: [
        {
          name: { type: String, required: true },
          done: { type: Boolean, default: false },
          points: { type: Number, default: 5 }
        }
      ],
      default: []
    },

    todayTasks: {
      type: [
        {
          name: String,
          done: { type: Boolean, default: false }
        }
      ],
      default: []
    },

    lastTaskRefresh: { type: Date },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// ------------------------------------------------------
// FIX OLD USERS (task → name)
// ------------------------------------------------------
userSchema.pre("validate", function (next) {
  if (Array.isArray(this.dailyTasks)) {
    this.dailyTasks = this.dailyTasks.map((d) => ({
      name: d.name || d.task,           // convert old → new
      done: d.done ?? false,
      points: d.points ?? 10
    }));
  }
  next();
});

// ------------------------------------------------------
// PASSWORD HASHING (NO DOUBLE HASHING)
// ------------------------------------------------------
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

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
