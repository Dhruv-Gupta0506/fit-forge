const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// ✅ BMI calculation
function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

// ✅ BMR calculation
function calculateBMR(user) {
  if (!user.gender || !user.weight || !user.height || !user.age) return null;
  if (user.gender === 'Male') {
    return Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5);
  } else {
    return Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age - 161);
  }
}

// ✅ Get user metrics (BMI & BMR)
router.get('/me/metrics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const metrics = {
      bmi: calculateBMI(user.height, user.weight),
      bmr: calculateBMR(user),
    };
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
