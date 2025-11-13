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
    "Bulking": "Bulking"
  };

  // fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

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
      const token = localStorage.getItem("token");

      const res = await API.get(`/meals?diet=${diet}&phase=${phase}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      <p className="text-center mt-10 text-gray-500">Loading meals...</p>
    );

  const grouped = {
    Breakfast: meals.filter((m) => m.meal === "Breakfast").slice(0, 4),
    Lunch: meals.filter((m) => m.meal === "Lunch").slice(0, 4),
    Snacks: meals.filter((m) => m.meal === "Snacks").slice(0, 4),
    Dinner: meals.filter((m) => m.meal === "Dinner").slice(0, 4)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        🥗 Your Meal Options
      </h1>

      <p className="text-gray-600 mb-6 text-center">
        Goal: <span className="font-semibold">{profile.goal}</span> <br />
        Phase: <span className="font-semibold">{phase}</span> <br />
        <span className="text-sm text-gray-500">
          (Choose 1 meal from each category)
        </span>
      </p>

      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            diet === "Veg" ? "bg-green-600 text-white" : "bg-white border"
          }`}
          onClick={() => setDiet("Veg")}
        >
          Veg
        </button>

        <button
          className={`px-4 py-2 rounded-lg ${
            diet === "Non-Veg" ? "bg-green-600 text-white" : "bg-white border"
          }`}
          onClick={() => setDiet("Non-Veg")}
        >
          Non-Veg
        </button>
      </div>

      <div className="w-full max-w-3xl">
        {Object.keys(grouped).map((mealType) => (
          <div key={mealType} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {mealType} – Choose 1
            </h2>

            {grouped[mealType].length === 0 && (
              <p className="text-gray-500">
                No {mealType} meals available.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grouped[mealType].map((m, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md hover:bg-green-50 transition"
                >
                  <h3 className="font-semibold text-gray-800">{m.name}</h3>

                  <p className="text-sm text-gray-600 mt-1">
                    🔥 {m.calories} kcal
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    🥚 {m.protein}g protein | 🍚 {m.carbs}g carbs | 🥜{" "}
                    {m.fats}g fats
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/overview")}
        className="mt-8 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
      >
        ← Back to Overview
      </button>
    </div>
  );
}
