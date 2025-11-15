require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Required for cookies behind Render (proxy)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

// -------------------------------------------------------------
// ALLOWED ORIGINS (ONLY 1 VERCEL URL + LOCALHOST)
// -------------------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL?.trim(),   // your main Vercel domain
  "http://localhost:5173"           // for development
].filter(Boolean);

console.log("🔵 Allowed Origins:", allowedOrigins);

// -------------------------------------------------------------
// FIXED GLOBAL HEADERS FOR COOKIES
// -------------------------------------------------------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// -------------------------------------------------------------
// FIXED CORS (Safari + iOS compatible)
// -------------------------------------------------------------
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌍 Incoming Origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin.trim())) {
        return callback(null, true);
      }

      console.log("⛔ BLOCKED ORIGIN:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],   // ✅ required for iOS
    allowedHeaders: ["Content-Type"],            // keep simple
    optionsSuccessStatus: 200,
  })
);

// -------------------------------------------------------------
// MongoDB Connection
// -------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// -------------------------------------------------------------
// Default Route
// -------------------------------------------------------------
app.get("/", (req, res) => res.send("🔥 Backend running on Render!"));

// -------------------------------------------------------------
// Routes
// -------------------------------------------------------------
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const progressRoutes = require("./routes/progress");
const tasksRoutes = require("./routes/tasks");
const mealsRoutes = require("./routes/meals.routes");
const aiRoutes = require("./routes/aiRoutes");
const aiSuggestions = require("./routes/aiSuggestions");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai", aiSuggestions);

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
