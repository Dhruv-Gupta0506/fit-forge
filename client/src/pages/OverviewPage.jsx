import { useState, useEffect, useMemo } from "react";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

export default function OverviewPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const navigate = useNavigate();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await API.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const bmi = useMemo(() => {
    if (!profile?.height || !profile?.weight) return null;
    const h = profile.height / 100;
    return (profile.weight / (h * h)).toFixed(1);
  }, [profile]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return { label: "", color: "text-gray-400" };
    if (bmi < 18.5) return { label: "Underweight 🩻", color: "text-blue-400" };
    if (bmi < 24.9) return { label: "Normal 💪", color: "text-green-400" };
    if (bmi < 29.9) return { label: "Overweight ⚠️", color: "text-orange-400" };
    return { label: "Obese 🚨", color: "text-red-400" };
  }, [bmi]);

  const tasksCompleted = profile?.todayTasks?.filter(t => t.done).length || 0;
  const totalTasks = profile?.todayTasks?.length || 0;
  const completionPercent =
    totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  const circleRadius = 75;
  const circumference = 2 * Math.PI * circleRadius;
  const completionOffset =
    circumference - (completionPercent / 100) * circumference;

  const toggleTodayTask = async (index) => {
    try {
      setLoading(true);

      await API.put(
        `/user/tasks/today/${index}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      await fetchProfile();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile)
    return (
      <div className="text-center mt-12 text-gray-300">Loading profile...</div>
    );

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-black">

      {/* BACKGROUND */}
      <img
        src="/overview.png"
        className="
          absolute inset-0 w-full h-full
          object-contain md:object-cover
          pointer-events-none opacity-80
        "
        alt="Overview Background"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      <div className="relative z-20 w-full flex flex-col items-center p-6 md:p-10 space-y-10">

        {/* HEADING */}
        <h1
          className="
            text-4xl md:text-5xl font-extrabold text-center
            bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400
            bg-clip-text text-transparent
          "
          style={{ textShadow: "0 0 18px rgba(150,100,255,0.4)" }}
        >
          🏆 Fitness Overview
        </h1>

        {/* ADMIN BUTTON */}
        {profile.email === adminEmail && (
          <button
            onClick={() => navigate("/admin")}
            className="
              px-6 py-2 bg-red-600 text-white rounded-xl 
              hover:bg-red-700 transition font-semibold
            "
          >
            Admin Panel
          </button>
        )}

        {/* USER CARD */}
        <div
          className="
            w-full max-w-4xl
            bg-white/10 backdrop-blur-xl
            border border-purple-500/40
            rounded-3xl shadow-xl 
            p-8 flex flex-col md:flex-row items-center justify-around gap-10
            text-white
          "
          style={{ boxShadow: "0 0 20px rgba(120,50,255,0.25)" }}
        >
          <div className="flex flex-col items-center space-y-3">
            <h2 className="text-3xl font-bold text-purple-300">{profile.name}</h2>

            <p className="text-center text-gray-300 text-lg">
              {profile.goal} | Level {profile.level} | {profile.points} XP | Streak:{" "}
              {profile.streak} 🔥
            </p>
          </div>

          <div className="flex gap-10">
            {/* BMI Circle */}
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
              <svg width={160} height={160} className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="15"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="#a855f7"
                  strokeWidth="15"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  animate={{
                    strokeDashoffset:
                      circumference - (bmi / 40) * circumference,
                  }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <div className="absolute text-center">
                <p className={`font-bold text-xl ${bmiCategory.color}`}>{bmi}</p>
                <p className="text-gray-300 text-sm">{bmiCategory.label}</p>
              </div>
            </div>

            {/* Tasks Progress Circle */}
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
              <svg width={160} height={160} className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="15"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="#22c55e"
                  strokeWidth="15"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={completionOffset}
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: completionOffset }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-bold text-xl text-green-400">
                  {completionPercent}%
                </p>
                <p className="text-gray-300 text-sm">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-6 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/suggest-meals")}
            className="
              px-10 py-4 
              bg-gradient-to-r from-purple-500 to-purple-600
              text-white rounded-3xl shadow-lg
              hover:shadow-purple-500/40 transition-all
              text-lg font-semibold
            "
          >
            🍽️ Meals
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/suggest-workouts")}
            className="
              px-10 py-4 
              bg-gradient-to-r from-blue-500 to-blue-700
              text-white rounded-3xl shadow-lg
              hover:shadow-blue-500/40 transition-all
              text-lg font-semibold
            "
          >
            🏋️ Workouts
          </motion.button>
        </div>

        {/* DAILY TASKS */}
        <div
          className="
            w-full max-w-3xl 
            bg-white/10 backdrop-blur-xl
            border border-purple-400/30
            rounded-3xl shadow-xl p-6
            text-white
          "
          style={{ boxShadow: "0 0 14px rgba(150,80,255,0.25)" }}
        >
          <h3 className="text-2xl font-bold text-purple-300 mb-4 text-center">
            ✅ Today's Daily Tasks
          </h3>

          <ul className="space-y-3">
            <AnimatePresence>
              {profile.todayTasks?.map((task, index) => (
                <motion.li
                  key={index}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="
                    flex items-center justify-between 
                    p-3 rounded-xl border border-gray-700/40
                    hover:bg-purple-900/10 transition
                  "
                >
                  <span
                    className={
                      task.done
                        ? "line-through text-gray-400 font-medium"
                        : "text-gray-200 font-medium"
                    }
                  >
                    {task.name}
                  </span>

                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTodayTask(index)}
                    disabled={loading}
                    className="w-5 h-5 accent-purple-500"
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <p className="text-xs text-center text-gray-400 mt-3">
            Tasks refresh every 24 hours automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
