// src/pages/MealsPage.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function MealsPage() {
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [diet, setDiet] = useState("Veg");
  const [phase, setPhase] = useState("Cutting");

  const navigate = useNavigate();

  const goalToPhase = {
    "Weight Loss": "Cutting",
    "Fat Loss": "Cutting",
    "Cutting": "Cutting",
    "Lose Fat": "Cutting",
    "Maintenance": "Maintenance",
    "Muscle Gain": "Bulking",
    "Build Muscle": "Bulking",
    "Gain Weight": "Bulking",
    "Bulking": "Bulking",
  };

  // fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 🔥 FIXED — no Authorization header, cookie is enough
        const res = await API.get("/user/me");

        setProfile(res.data);

        const mappedPhase = goalToPhase[res.data.goal] || "Maintenance";
        setPhase(mappedPhase);
        setDiet(res.data.dietPreference || "Veg");
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // fetch meals
  const fetchMeals = async () => {
    if (!profile) return;

    setLoading(true);

    try {
      // 🔥 FIXED — no headers
      const res = await API.get(`/meals?diet=${diet}&phase=${phase}`);

      setMeals(res.data.meals || []);
    } catch (err) {
      console.error("Error fetching meals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) fetchMeals();
  }, [diet, phase, profile]);

  if (!profile || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-300">
        Loading meals...
      </div>
    );

  const grouped = {
    Breakfast: meals.filter((m) => m.meal === "Breakfast").slice(0, 4),
    Lunch: meals.filter((m) => m.meal === "Lunch").slice(0, 4),
    Snacks: meals.filter((m) => m.meal === "Snacks").slice(0, 4),
    Dinner: meals.filter((m) => m.meal === "Dinner").slice(0, 4),
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden">

      {/* BACKGROUND IMAGE */}
      <img
        src="/food.png"
        alt="Meals Background"
        className="
          absolute inset-0 w-full h-full 
          object-cover 
          pointer-events-none
          opacity-80
        "
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* CONTENT */}
      <div className="relative z-20 w-full max-w-4xl px-6 pt-10 pb-20">

        {/* HEADER */}
        <h1
          className="
            text-center text-4xl md:text-5xl font-extrabold 
            mb-6 tracking-wide
            bg-gradient-to-r from-green-400 via-lime-300 to-green-400
            bg-clip-text text-transparent
          "
          style={{ textShadow: "0 0 10px rgba(0,255,120,0.2)" }}
        >
          🥗 Your Meal Options
        </h1>

        {/* PROFILE INFO */}
        <div className="text-center text-gray-300 mb-8">
          <p>
            Goal: <span className="font-semibold text-green-400">{profile.goal}</span>
          </p>
          <p>
            Phase: <span className="font-semibold text-green-400">{phase}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">(Choose 1 meal from each category)</p>
        </div>

        {/* DIET SWITCH */}
        <div className="mb-10 flex gap-4 justify-center">
          <button
            className={`
              px-6 py-2 rounded-xl font-semibold transition
              ${
                diet === "Veg"
                  ? "bg-green-600 text-white shadow-[0_0_10px_rgba(0,255,120,0.4)]"
                  : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
              }
            `}
            onClick={() => setDiet("Veg")}
          >
            Veg
          </button>

          <button
            className={`
              px-6 py-2 rounded-xl font-semibold transition
              ${
                diet === "Non-Veg"
                  ? "bg-green-600 text-white shadow-[0_0_10px_rgba(0,255,120,0.4)]"
                  : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
              }
            `}
            onClick={() => setDiet("Non-Veg")}
          >
            Non-Veg
          </button>
        </div>

        {/* MEAL SECTIONS */}
        <div className="w-full">
          {Object.keys(grouped).map((mealType) => (
            <div key={mealType} className="mb-14">
              <h2
                className="
                  text-2xl font-bold mb-4 text-green-400
                  drop-shadow-[0_0_10px_rgba(0,255,120,0.3)]
                "
              >
                {mealType} – Choose 1
              </h2>

              {grouped[mealType].length === 0 && (
                <p className="text-gray-400">No {mealType} meals available.</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {grouped[mealType].map((m, i) => (
                  <div
                    key={i}
                    className="
                      p-5 rounded-2xl border border-white/10
                      bg-black/40 backdrop-blur-xl
                      shadow-lg 
                      hover:bg-black/50
                      hover:shadow-[0_0_15px_rgba(0,255,120,0.2)]
                      transition
                    "
                  >
                    <h3 className="font-semibold text-white text-lg">{m.name}</h3>

                    <p className="text-sm text-green-400 mt-1">
                      🔥 {m.calories} kcal
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      🥚 {m.protein}g protein | 🍚 {m.carbs}g carbs | 🥜 {m.fats}g fats
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BACK BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/overview")}
            className="
              mt-10 px-8 py-3 rounded-xl
              bg-gradient-to-r from-green-600 to-lime-500
              text-white font-semibold
              hover:from-green-500 hover:to-lime-400
              active:scale-95 transition
              shadow-[0_0_10px_rgba(0,255,120,0.3)]
            "
          >
            ← Back to Overview
          </button>
        </div>

      </div>
    </div>
  );
}
