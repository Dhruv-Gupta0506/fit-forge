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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/me");
        setProfile({
          age: res.data.age || "",
          gender: res.data.gender || "",
          height: res.data.height || "",
          weight: res.data.weight || "",
          goal: res.data.goal || "",
        });
        if (res.data.age && res.data.goal) setSaved(true);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to load profile. Please try again.");
      }
    };
    fetchProfile();
  }, []);

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
      await API.post("/user/me", profile);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to save profile. Please try again.");
    }
    setLoading(false);
  };

  const bmi = useMemo(() => {
    if (!profile.height || !profile.weight) return null;
    const heightM = profile.height / 100;
    return (profile.weight / (heightM * heightM)).toFixed(1);
  }, [profile.height, profile.weight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return { label: "", color: "text-gray-400" };
    if (bmi < 18.5) return { label: "Underweight 🩻", color: "text-blue-400" };
    if (bmi < 24.9) return { label: "Normal 💪", color: "text-green-400" };
    if (bmi < 29.9) return { label: "Overweight ⚠️", color: "text-orange-400" };
    return { label: "Obese 🚨", color: "text-red-400" };
  }, [bmi]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

      <img
        src="/dashboard.png"
        alt="Dashboard Background"
        className="
          absolute inset-0 w-full h-full
          object-cover md:object-fill lg:object-cover
          pointer-events-none
        "
        style={{ opacity: 0.85 }}
      />

      <div className="absolute inset-0 bg-black/60"></div>

      {/* MOBILE FRIENDLY CONTAINER */}
      <div className="relative z-20 w-full max-w-4xl px-6 sm:px-10 md:px-6">

        {/* RESPONSIVE HEADING */}
        <h1
          className="
            text-center 
            text-2xl sm:text-3xl md:text-5xl 
            font-extrabold 
            mb-10 
            tracking-wide 
            whitespace-normal md:whitespace-nowrap
            bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300
            bg-clip-text text-transparent
          "
          style={{
            fontFamily: "Poppins, sans-serif",
            textShadow: "0 0 10px rgba(80,120,255,0.28)",
            overflow: "visible",
            paddingInline: "8px",
          }}
        >
          Your Fitness Dashboard
        </h1>

        {saved && !error && (
          <p className="text-green-400 font-semibold mb-4 text-center animate-pulse">
            ✅ Profile saved successfully! Redirecting...
          </p>
        )}

        {!saved && (
          <form
            onSubmit={handleSubmit}
            className="
              bg-white/10 backdrop-blur-xl
              border border-blue-500/40
              rounded-3xl shadow-xl
              p-6 sm:p-8
              space-y-6 text-white
            "
            style={{
              boxShadow: "0 0 16px rgba(0,150,255,0.25)",
            }}
          >
            <h2
              className="
                text-xl sm:text-2xl 
                font-bold 
                text-center 
                mb-2 
                whitespace-normal sm:whitespace-nowrap
              "
              style={{ textShadow: "0 0 4px rgba(0,150,255,0.3)" }}
            >
              Complete Your Fitness Profile
            </h2>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg border border-red-700/40">
                {error}
              </p>
            )}

            {/* AGE */}
            <div>
              <label className="block text-gray-300 font-medium mb-1">🧓 Age</label>
              <input
                name="age"
                type="number"
                required
                placeholder="Age (years)"
                value={profile.age}
                onChange={handleChange}
                className="
                  w-full p-3 rounded-xl
                  bg-black/40 border border-gray-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  outline-none transition
                "
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="block text-gray-300 font-medium mb-1">🚻 Gender</label>

              <div className="relative">
                <select
                  name="gender"
                  required
                  value={profile.gender}
                  onChange={handleChange}
                  className="
                    w-full p-3 rounded-xl appearance-none
                    bg-black/40 border border-gray-600 text-white
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                    outline-none transition
                    cursor-pointer
                  "
                >
                  <option value="">Select Gender</option>
                  <option value="Male">♂️ Male</option>
                  <option value="Female">♀️ Female</option>
                  <option value="Other">⚧️ Other</option>
                </select>

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>

            {/* HEIGHT */}
            <div>
              <label className="block text-gray-300 font-medium mb-1">📏 Height</label>
              <input
                name="height"
                type="number"
                required
                placeholder="Height (cm)"
                value={profile.height}
                onChange={handleChange}
                className="
                  w-full p-3 rounded-xl
                  bg-black/40 border border-gray-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  outline-none transition
                "
              />
            </div>

            {/* WEIGHT */}
            <div>
              <label className="block text-gray-300 font-medium mb-1">⚖️ Weight</label>
              <input
                name="weight"
                type="number"
                required
                placeholder="Weight (kg)"
                value={profile.weight}
                onChange={handleChange}
                className="
                  w-full p-3 rounded-xl
                  bg-black/40 border border-gray-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  outline-none transition
                "
              />
            </div>

            {/* GOAL */}
            <div>
              <label className="block text-gray-300 font-medium mb-1">🎯 Fitness Goal</label>

              <div className="relative">
                <select
                  name="goal"
                  required
                  value={profile.goal}
                  onChange={handleChange}
                  className="
                    w-full p-3 rounded-xl appearance-none
                    bg-black/40 border border-gray-600 text-white
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                    outline-none transition
                    cursor-pointer
                  "
                >
                  <option value="">Select Fitness Goal</option>
                  <option value="Maintenance">⚖️ Maintenance</option>
                  <option value="Cutting">🔥 Cutting</option>
                  <option value="Bulking">💪 Bulking</option>
                </select>

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>

            {bmi && (
              <p className={`text-center font-semibold ${bmiCategory.color}`}>
                🧮 BMI: {bmi} — {bmiCategory.label}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-gradient-to-r from-blue-600 to-blue-800
                hover:from-blue-500 hover:to-blue-700
                text-white font-semibold
                active:scale-95 transition
              "
            >
              {loading ? "💾 Saving..." : "✅ Save Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
