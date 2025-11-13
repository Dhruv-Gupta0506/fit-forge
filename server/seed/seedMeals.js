const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Meal = require("../models/Meal.js");
const fs = require("fs");

dotenv.config();

const baseMeals = JSON.parse(fs.readFileSync("./seed/baseMeals.json", "utf-8"));

async function seedMeals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    await Meal.deleteMany({});
    console.log("Old meals cleared");

    const allMeals = [];

    baseMeals.forEach((m) => {
    allMeals.push(m);
    });


    await Meal.insertMany(allMeals);

    console.log("Meals inserted:", allMeals.length);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMeals();
