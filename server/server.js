require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// 🔥 REQUIRED FOR COOKIES TO WORK PROPERLY (Chrome + secure/sameSite=None)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Mongo Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// --- Default Route ---
app.get("/", (req, res) => res.send("🔥 Backend running!"));

// --- ROUTES ---
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const progressRoutes = require("./routes/progress");
const tasksRoutes = require("./routes/tasks");
const mealsRoutes = require("./routes/meals.routes");

// 🔥 These two are IMPORTANT
const aiRoutes = require("./routes/aiRoutes");
const aiSuggestions = require("./routes/aiSuggestions");

// --- USE ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/meals", mealsRoutes);

// 🔥 MOUNT BOTH AI ROUTES UNDER /api/ai
app.use("/api/ai", aiRoutes);
app.use("/api/ai", aiSuggestions);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
