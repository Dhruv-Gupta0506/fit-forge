const Exercise = require("../models/exercise");

// ---- Split maps (Gym vs Home) ----
const BEGINNER_SPLIT = {
  Gym:   ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
  Home:  ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
};

const INTERMEDIATE_BRO = {
  Gym:   [["Chest","Arms"], ["Back","Arms"], ["Legs","Shoulders"],
          ["Chest","Arms"], ["Back","Arms"], ["Legs","Shoulders"]],
  Home:  [["Chest","Arms"], ["Back","Arms"], ["Legs","Shoulders"],
          ["Chest","Arms"], ["Back","Arms"], ["Legs","Shoulders"]],
};

const ADVANCED_PPL = {
  Gym:   [["Push"], ["Pull"], ["Legs"], ["Push"], ["Pull"], ["Legs"]],
  Home:  [["Push"], ["Pull"], ["Legs"], ["Push"], ["Pull"], ["Legs"]],
};

const PPL_TO_MUSCLES = {
  Push: ["Chest","Shoulders","Arms"],
  Pull: ["Back","Arms"],
  Legs: ["Legs","Core"],
};

// volume presets by level
const VOLUME = {
  beginner:     { compounds: 1, isolations: 2, sets: 3, rest: "60s" },
  intermediate: { compounds: 2, isolations: 3, sets: 4, rest: "75s" },
  advanced:     { compounds: 3, isolations: 3, sets: 5, rest: "90s" },
};

// rep targets by goal
const GOAL_REPS = {
  Bulking:      (isCompound) => isCompound ? "6-10" : "8-12",
  Cutting:      () => "12-20",
  Maintenance:  (isCompound) => isCompound ? "6-10" : "8-15",
};

// normalize level str
function normalizeLevel(level) {
  const l = String(level || "").toLowerCase();
  if (l.startsWith("beg")) return "beginner";
  if (l.startsWith("inter")) return "intermediate";
  if (l.startsWith("adv")) return "advanced";
  return "intermediate";
}

// Build daily target muscles per level/days/location
function buildSplit({ days, location, level }) {
  const lvl = normalizeLevel(level);
  const loc = location === "Home" ? "Home" : "Gym";

  // cap days to 6
  const d = Math.max(1, Math.min(6, days || 3));

  if (lvl === "beginner") {
    const muscles = BEGINNER_SPLIT[loc];
    return Array.from({ length: d }).map((_, i) => [muscles[i % muscles.length]]);
  }

  if (lvl === "intermediate") {
    const pairs = INTERMEDIATE_BRO[loc];
    return Array.from({ length: d }).map((_, i) => pairs[i % pairs.length]);
  }

  // advanced
  if (d === 4) {
    const pairs = INTERMEDIATE_BRO[loc];
    return Array.from({ length: d }).map((_, i) => pairs[i % pairs.length]);
  }

  const ppl = ADVANCED_PPL[loc];
  return Array.from({ length: d }).map((_, i) => {
    const group = ppl[i % ppl.length][0];
    return PPL_TO_MUSCLES[group];
  });
}

function pickReps(goal, isCompound) {
  const fn = GOAL_REPS[goal] || GOAL_REPS.Maintenance;
  return fn(!!isCompound);
}

function seededShuffle(arr, seedStr) {
  const seed = [...seedStr].reduce((a,c)=> (a + c.charCodeAt(0))|0, 0) || 1;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (seed * 9301 + 49297 * i) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Core generator
async function generateWorkoutPlan({ days, location, level, goal }) {
  const lvl = normalizeLevel(level);
  const loc = location === "Home" ? "Home" : "Gym";
  const split = buildSplit({ days, location: loc, level: lvl });
  const vol = VOLUME[lvl];

  const plan = [];

  for (let dayIdx = 0; dayIdx < split.length; dayIdx++) {
    const targetMuscles = split[dayIdx];

    // ✅ FIXED: Query by muscleGroup
    const exercises = await Exercise.find({
      muscleGroup: { $in: targetMuscles },
      $or: [{ equipment: loc }, { equipment: "Both" }],
    }).lean();

    if (!exercises.length) {
      plan.push({ day: `Day ${dayIdx + 1} — ${targetMuscles.join(" / ")}`, exercises: [] });
      continue;
    }

    // group by muscleGroup
    const byMuscle = new Map();
    for (const ex of exercises) {
      const key = ex.muscleGroup;
      if (!byMuscle.has(key)) byMuscle.set(key, { compounds: [], isolations: [] });
      (ex.isCompound ? byMuscle.get(key).compounds : byMuscle.get(key).isolations).push(ex);
    }

    const dayWork = [];

    for (const m of targetMuscles) {
      const bucket = byMuscle.get(m) || { compounds: [], isolations: [] };

      const cList = seededShuffle(bucket.compounds, `${m}-c-${lvl}-${goal}-${loc}-${days}`);
      const iList = seededShuffle(bucket.isolations, `${m}-i-${lvl}-${goal}-${loc}-${days}`);

      const muscleFactor = targetMuscles.length >= 2 ? 0.7 : 1;
      const nComp = Math.max(1, Math.round(vol.compounds * muscleFactor));
      const nIso  = Math.max(1, Math.round(vol.isolations * muscleFactor));

      const chosen = [
        ...cList.slice(0, nComp),
        ...iList.slice(0, nIso),
      ];

      for (const ex of chosen) {
        dayWork.push({
          name: ex.name,
          muscle: ex.muscleGroup, // ✅ FIXED OUTPUT FIELD
          equipment: ex.equipment,
          sets: vol.sets,
          reps: pickReps(goal, ex.isCompound),
          rest: ex.isCompound
            ? (lvl === "advanced" ? "120s" : vol.rest)
            : vol.rest,
          notes: "Progressive overload. Keep 1–3 reps in reserve.",
        });
      }
    }

    const maxPerDay = lvl === "advanced" ? 8 : lvl === "intermediate" ? 7 : 6;
    const trimmed = dayWork.slice(0, maxPerDay);

    plan.push({
      day: `Day ${dayIdx + 1} — ${targetMuscles.join(" / ")}`,
      exercises: trimmed,
    });
  }

  return plan;
}

module.exports = generateWorkoutPlan;
