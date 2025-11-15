import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  // detect if user came to edit
  const isEditing =
    new URLSearchParams(window.location.search).get("edit") === "true";

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

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/me");

        const user = res.data.user; // 🔥 FIXED

        setProfile({
          age: user.age || "",
          gender: user.gender || "",
          height: user.height || "",
          weight: user.weight || "",
          goal: user.goal || "",
        });

        // if user is not editing & data already exists → saved mode (auto redirect)
        if (user.age && user.goal && !isEditing) {
          setSaved(true);
        }
      } catch (err) {
        setError("⚠️ Failed to load profile.");
      }
    };

    fetchProfile();
  }, [isEditing]);

  // AUTO REDIRECT ONLY WHEN NOT EDITING
  useEffect(() => {
    if (saved && !isEditing) {
      const t = setTimeout(() => navigate("/overview"), 1500);
      return () => clearTimeout(t);
    }
  }, [saved, navigate, isEditing]);

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
      setError("❌ Failed to save profile.");
    }

    setLoading(false);
  };

  const bmi = useMemo(() => {
    if (!profile.height || !profile.weight) return null;
    const h = profile.height / 100;
    return (profile.weight / (h * h)).toFixed(1);
  }, [profile.height, profile.weight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return { label: "", color: "text-gray-400" };
    if (bmi < 18.5) return { label: "Underweight 🩻", color: "text-blue-400" };
    if (bmi < 24.9) return { label: "Normal 💪", color: "text-green-400" };
    if (bmi < 29.9) return { label: "Overweight ⚠️", color: "text-orange-400" };
    return { label: "Obese 🚨", color: "text-red-400" };
  }, [bmi]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-black">

      <img
        src="/dashboard.png"
        className="
          absolute inset-0 w-full h-full
          object-cover pointer-events-none opacity-90
        "
      />

      <div className="absolute inset-0 bg-black/60"></div>
      <div className="absolute top-0 w-full h-[200px] bg-blue-500/10 blur-[140px]"></div>
      <div className="absolute bottom-0 w-full h-[200px] bg-purple-600/10 blur-[140px]"></div>

      <h1
        className="
          relative z-20 text-center text-4xl sm:text-5xl font-extrabold 
          mt-14 mb-10 tracking-wide
          bg-gradient-to-r from-blue-400 via-purple-300 to-blue-400
          bg-clip-text text-transparent
        "
        style={{ textShadow: "0 0 16px rgba(150,100,255,0.45)" }}
      >
        Your Fitness Dashboard
      </h1>

      <div className="relative z-20 w-full max-w-3xl px-6 sm:px-8">

        {/* Success message */}
        {saved && (
          <p className="text-green-400 text-center font-medium mb-4 animate-pulse">
            ✅ Profile saved {isEditing ? "" : "— redirecting..."}
          </p>
        )}

        {/* FORM */}
        {!saved || isEditing ? (
          <form
            onSubmit={handleSubmit}
            className="
              bg-white/10 backdrop-blur-2xl
              border border-blue-400/40 rounded-3xl 
              shadow-[0_0_28px_rgba(100,140,255,0.35)]
              p-6 sm:p-10 space-y-6 text-white
            "
          >
            <h2
              className="
                text-xl sm:text-2xl font-semibold text-center mb-3
              "
              style={{ textShadow: "0 0 6px rgba(100,150,255,0.35)" }}
            >
              {isEditing ? "Edit Your Profile" : "Complete Your Fitness Profile"}
            </h2>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/40 p-2 rounded-xl text-center border border-red-700/40">
                {error}
              </p>
            )}

            {/* AGE */}
            <div>
              <label className="block text-gray-300 mb-1">🧓 Age (years)</label>
              <input
                name="age"
                type="number"
                required
                placeholder="Enter age in years"
                value={profile.age}
                onChange={handleChange}
                className="
                  w-full p-3 rounded-xl bg-black/50 border border-gray-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                "
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="block text-gray-300 mb-1">🚻 Gender</label>
              <select
                name="gender"
                required
                value={profile.gender}
                onChange={handleChange}
                className="
                  w-full p-3 rounded-xl bg-black/50 border border-gray-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  appearance-none
                "
              >
                <option value="">Select Gender</option>
                <option value="Male">♂️ Male</option>
                <option value="Female">♀️ Female</option>
                <option value="Other">⚧️ Other</option>
              </select>
            </div>

            {/* HEIGHT */}
            <div>
              <label className="block text-gray-300 mb-1">📏 Height</label>
              <div className="relative">
                <input
                  name="height"
                  type="number"
                  required
                  placeholder="Enter height"
                  value={profile.height}
                  onChange={handleChange}
                  className="
                    w-full p-3 pr-14 rounded-xl bg-black/50 border border-gray-600
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  "
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 font-semibold text-sm">
                  cm
                </span>
              </div>
            </div>

            {/* WEIGHT */}
            <div>
              <label className="block text-gray-300 mb-1">⚖️ Weight</label>
              <div className="relative">
                <input
                  name="weight"
                  type="number"
                  required
                  placeholder="Enter weight"
                  value={profile.weight}
                  onChange={handleChange}
                  className="
                    w-full p-3 pr-14 rounded-xl bg-black/50 border border-gray-600
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  "
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 font-semibold text-sm">
                  kg
                </span>
              </div>
            </div>

            {/* GOAL */}
            <div>
              <label className="block text-gray-300 mb-1">🎯 Fitness Goal</label>
              <select
                name="goal"
                required
                value={profile.goal}
                onChange={handleChange}
                className="
                  w-full p-3 rounded-xl bg-black/50 border border-gray-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                  appearance-none
                "
              >
                <option value="">Select Fitness Goal</option>
                <option value="Maintenance">⚖️ Maintenance</option>
                <option value="Cutting">🔥 Cutting</option>
                <option value="Bulking">💪 Bulking</option>
              </select>
            </div>

            {/* BMI */}
            {bmi && (
              <p className={`text-center font-semibold ${bmiCategory.color}`}>
                🧮 BMI: {bmi} — {bmiCategory.label}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-gradient-to-r from-blue-600 to-purple-700
                hover:from-blue-500 hover:to-purple-600
                text-white font-semibold
                active:scale-95 transition
                shadow-[0_0_18px_rgba(0,150,255,0.45)]
              "
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
