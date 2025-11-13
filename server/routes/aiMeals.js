const express = require("express");
const router = express.Router();
const { getMeals } = require("../controllers/aiMealsController");
const auth = require("../middleware/auth");

router.get("/meals", auth, getMeals);

module.exports = router;
