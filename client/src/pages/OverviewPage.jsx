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
    try {
      setLoading(true); // 🔥 FIX
      const res = await API.get("/user/me");

      if (res.data?.user) {
        setProfile(res.data.user);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setProfile(null);
    } finally {
      setLoading(false); // 🔥 FIX
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

  const radius = 65;
  const stroke = 12;
  const size = radius * 2 + stroke * 2;
  const circumference = 2 * Math.PI * radius;

  const toggleTodayTask = async (index) => {
    try {
      setLoading(true);

      await API.put(`/user/tasks/today/${index}`);

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

      <img
        src="/overview.png"
        className="
          absolute inset-0 w-full h-full
          object-contain md:object-cover
          pointer-events-none opacity-80
        "
        alt="Overview Background"
      />

      <div className="absolute inset-0 bg-black/60"></div>

      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
      )}

      <div className="relative z-20 w-full flex flex-col items-center px-4 sm:px-6 md:px-10 py-6 md:py-10 space-y-10">

        <h1
          className="
            text-3xl sm:text-4xl md:text-5xl font-extrabold text-center
            bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400
            bg-clip-text text-transparent px-2
          "
          style={{ textShadow: "0 0 18px rgba(150,100,255,0.4)" }}
        >
          🏆 Fitness Overview
        </h1>

        {profile.email === adminEmail && (
          <button
            onClick={() => navigate("/admin")}
            className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
          >
            Admin Panel
          </button>
        )}

        {/* USER CARD */}
        <div
          className="
            w-full max-w-5xl bg-white/10 backdrop-blur-xl
            border border-purple-500/40 rounded-3xl shadow-xl 
            p-6 sm:p-8 md:p-10
            flex flex-col md:flex-row items-center justify-around gap-10 md:gap-14
            text-white
          "
          style={{ boxShadow: "0 0 24px rgba(120,50,255,0.25)" }}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-300">
              {profile.name}
            </h2>
            <p className="text-gray-300 text-base sm:text-lg">
              {profile.goal} | Level {profile.level} | {profile.points} XP | Streak: {profile.streak} 🔥
            </p>
          </div>

          {/* CIRCLES */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-14">

            {/* BMI CIRCLE */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <div className="absolute w-full h-full rounded-full blur-2xl bg-purple-500/20 animate-pulse"></div>

              <div className="absolute w-[115%] h-[115%] rounded-full animate-spin-slow bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 opacity-30"></div>

              <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#a855f7"
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  animate={{
                    strokeDashoffset:
                      circumference - (bmi / 40) * circumference,
                  }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                />
              </svg>

              <motion.div
                className="absolute text-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.p
                  className={`font-bold text-xl ${bmiCategory.color}`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {bmi}
                </motion.p>
                <p className="text-gray-300 text-sm">{bmiCategory.label}</p>
              </motion.div>
            </motion.div>

            {/* TASKS CIRCLE */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <div className="absolute w-full h-full rounded-full blur-2xl bg-green-500/20 animate-pulse"></div>

              <div className="absolute w-[115%] h-[115%] rounded-full animate-spin-slow bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 opacity-30"></div>

              <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  animate={{
                    strokeDashoffset:
                      circumference - (completionPercent / 100) * circumference,
                  }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                />
              </svg>

              <motion.div
                className="absolute text-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.p
                  className="font-bold text-xl text-green-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {completionPercent}%
                </motion.p>
                <p className="text-gray-300 text-sm">Tasks Done</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/suggest-meals")}
            className="
              px-10 py-4 bg-gradient-to-r from-purple-500 to-purple-600
              text-white rounded-3xl shadow-lg
              hover:shadow-purple-500/40 transition-all text-lg font-semibold
            "
          >
            🍽️ Meals
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/suggest-workouts")}
            className="
              px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-700
              text-white rounded-3xl shadow-lg
              hover:shadow-blue-500/40 transition-all text-lg font-semibold
            "
          >
            🏋️ Workouts
          </motion.button>
        </div>

        {/* TASKS LIST */}
        <div
          className="
            w-full max-w-3xl bg-white/10 backdrop-blur-xl 
            border border-purple-400/30 rounded-3xl shadow-xl 
            p-6 sm:p-8 text-white
          "
          style={{ boxShadow: "0 0 14px rgba(150,80,255,0.25)" }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-4 text-center">
            ✅ Today&apos;s Daily Tasks
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
                    p-3 sm:p-4 rounded-xl border border-gray-700/40
                    hover:bg-purple-900/10 transition
                  "
                >
                  <span
                    className={
                      task.done
                        ? "line-through text-gray-400 font-medium text-sm sm:text-base"
                        : "text-gray-200 font-medium text-sm sm:text-base"
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

      <style>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
