import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await API.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          age: res.data.age || "",
          gender: res.data.gender || "",
          height: res.data.height || "",
          weight: res.data.weight || "",
          goal: res.data.goal || "",
        });
        if (res.data.age && res.data.goal) setSaved(true); // marks as saved if profile exists
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to load profile. Please try again.");
      }
    };
    fetchProfile();
  }, []);

  // Auto-redirect if profile is already saved
  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => navigate("/overview"), 1500);
      return () => clearTimeout(timer);
    }
  }, [saved, navigate]);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await API.post("/user/me", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to save profile. Please try again.");
    }
    setLoading(false);
  };

  // BMI calculation
  const bmi = useMemo(() => {
    if (!profile.height || !profile.weight) return null;
    const heightM = profile.height / 100;
    return (profile.weight / (heightM * heightM)).toFixed(1);
  }, [profile.height, profile.weight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return { label: "", color: "text-gray-500" };
    if (bmi < 18.5) return { label: "Underweight 🩻", color: "text-blue-600" };
    if (bmi < 24.9) return { label: "Normal 💪", color: "text-green-600" };
    if (bmi < 29.9) return { label: "Overweight ⚠️", color: "text-orange-600" };
    return { label: "Obese 🚨", color: "text-red-600" };
  }, [bmi]);

  return (
    <div className="p-8 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-6">
        🏋️‍♂️ Your Fitness Dashboard
      </h1>

      {saved && !error && (
        <p className="text-green-600 font-semibold mb-4 animate-bounce">
          ✅ Profile saved successfully! Redirecting...
        </p>
      )}

      {!saved && (
        <form
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5 border border-gray-100"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-center mb-4">
            💡 Complete Your Fitness Profile
          </h2>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1">🧓 Age</label>
            <input
              name="age"
              type="number"
              placeholder="Age (years)"
              value={profile.age}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">🚻 Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">♂️ Male</option>
              <option value="Female">♀️ Female</option>
              <option value="Other">⚧️ Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">📏 Height</label>
            <input
              name="height"
              type="number"
              placeholder="Height (cm)"
              value={profile.height}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">⚖️ Weight</label>
            <input
              name="weight"
              type="number"
              placeholder="Weight (kg)"
              value={profile.weight}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">🎯 Fitness Goal</label>
            <select
              name="goal"
              value={profile.goal}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Fitness Goal</option>
              <option value="Maintenance">⚖️ Maintenance</option>
              <option value="Cutting">🔥 Cutting (Weight Loss)</option>
              <option value="Bulking">💪 Bulking (Weight Gain)</option>
            </select>
          </div>

          {bmi && (
            <p className={`text-center font-semibold ${bmiCategory.color}`}>
              🧮 Live BMI: {bmi} — {bmiCategory.label}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "💾 Saving..." : "✅ Save Profile"}
          </button>
        </form>
      )}
    </div>
  );
}
