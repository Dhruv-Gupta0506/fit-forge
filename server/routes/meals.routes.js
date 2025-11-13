const express = require("express");
const { getMeals } = require("../controllers/meals.controller.js");

const router = express.Router();

router.get("/", getMeals);

module.exports = router;
