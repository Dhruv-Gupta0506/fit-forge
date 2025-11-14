require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Required for cookies to work properly behind reverse proxies (Render)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

// ------------------------------------------------------------------------------------
// ✔ FIXED: CLEAN CORS SETUP — NO INVALID HEADER CHARACTERS ANYMORE
// ------------------------------------------------------------------------------------
const CLIENT_URL = (process.env.CLIENT_URL || "").trim();

const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow tools/curl/postman

      const cleanOrigin = origin.trim();

      if (allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        console.log("❌ BLOCKED ORIGIN:", cleanOrigin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ------------------------------------------------------------------------------------
// MongoDB Connection
// ------------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------------
// Default Test Route
// ------------------------------------------------------------------------------------
app.get("/", (req, res) => res.send("🔥 Backend running on Render!"));

// ------------------------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------------------------
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const progressRoutes = require("./routes/progress");
const tasksRoutes = require("./routes/tasks");
const mealsRoutes = require("./routes/meals.routes");

// AI Routes
const aiRoutes = require("./routes/aiRoutes");
const aiSuggestions = require("./routes/aiSuggestions");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai", aiSuggestions);

// ------------------------------------------------------------------------------------
// Start Server
// ------------------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
