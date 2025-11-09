require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const aiRoutes = require('./routes/aiSuggestions');



const app = express();

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // allow cookies to be sent
}));

// ------------------- MONGO CONNECTION -------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1); // stop server if DB fails
});

// ------------------- TEST ROUTE -------------------
app.get('/', (req, res) => res.send('🔥 Backend running!'));

// ------------------- ROUTES -------------------
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const progressRoutes = require('./routes/progress'); // optional
const tasksRoutes = require('./routes/tasks'); // new tasks route

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes); // optional
app.use('/api/tasks', tasksRoutes); // added tasks route

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
