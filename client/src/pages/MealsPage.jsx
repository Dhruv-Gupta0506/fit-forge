// src/pages/MealsPage.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function MealsPage() {
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diet, setDiet] = useState("Veg");
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/user/me", { headers: { Authorization: `Bearer ${token}` } });
        setProfile(res.data);
        setDiet(res.data.dietPreference || "Veg");
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch meals
  const fetchMeals = async (dietType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/ai/meals", { headers: { Authorization: `Bearer ${token}` } });
      setMeals(res.data.meals);
    } catch (err) {
      console.error("Error fetching meals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    fetchMeals(diet);
  }, [profile, diet]);

  if (loading || !profile)
    return <p className="text-center mt-10 text-gray-500">Loading meals...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-green-700 mb-4 text-center">🥗 Meals</h1>
      <p className="text-gray-600 mb-6 text-center">
        Based on your goal: <span className="font-semibold">{profile.goal}</span>
      </p>

      {/* Veg/Non-Veg selector */}
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg ${diet === "Veg" ? "bg-green-600 text-white" : "bg-white border"}`}
          onClick={() => setDiet("Veg")}
        >
          Veg
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${diet === "Non-Veg" ? "bg-green-600 text-white" : "bg-white border"}`}
          onClick={() => setDiet("Non-Veg")}
        >
          Non-Veg
        </button>
      </div>

      {/* Meals list */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl">
        {meals.map((m, i) => (
          <div key={i} className="mb-4 p-4 border rounded-lg hover:bg-green-50">
            <h2 className="font-semibold text-gray-700">{m.meal}</h2>
            <p className="text-gray-600">{m.name}</p>
            <p className="text-sm text-gray-500">
              Calories: {m.calories} kcal | Protein: {m.protein}g | Carbs: {m.carbs}g | Fats: {m.fats}g
            </p>
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
