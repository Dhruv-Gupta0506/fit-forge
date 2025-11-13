require("dotenv").config();
const mongoose = require("mongoose");
const Exercise = require("../models/exercise");

// ------------------ IMPORT GROUPS ------------------
const Chest = require("./exercises/chest");
const Back = require("./exercises/back");
const Legs = require("./exercises/legs");
const Shoulders = require("./exercises/shoulders");
const Arms = require("./exercises/arms");
const Core = require("./exercises/core");
const Cardio = require("./exercises/cardio");

// ------------------ SEED FUNCTION ------------------
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const allExercises = [
      ...Chest,
      ...Back,
      ...Legs,
      ...Shoulders,
      ...Arms,
      ...Core,
      ...Cardio,
    ];

    console.log("Total exercises:", allExercises.length);

    await Exercise.deleteMany({});
    await Exercise.insertMany(allExercises);

    console.log("✅ Exercise database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
