import { useState, useEffect, useMemo } from "react";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

export default function OverviewPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newTask, setNewTask] = useState({});
  const navigate = useNavigate();

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  // ✅ Fetch user profile
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

  // ✅ BMI & BMR
  const bmi = useMemo(() => {
    if (!profile?.height || !profile?.weight) return null;
    const h = profile.height / 100;
    return (profile.weight / (h * h)).toFixed(1);
  }, [profile]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return { label: "", color: "text-gray-500" };
    if (bmi < 18.5) return { label: "Underweight 🩻", color: "text-blue-600" };
    if (bmi < 24.9) return { label: "Normal 💪", color: "text-green-600" };
    if (bmi < 29.9) return { label: "Overweight ⚠️", color: "text-orange-600" };
    return { label: "Obese 🚨", color: "text-red-600" };
  }, [bmi]);

  const bmr = useMemo(() => {
    if (!profile?.height || !profile?.weight || !profile?.age || !profile?.gender)
      return null;
    const { weight: w, height: h, age: a, gender } = profile;
    return gender === "Male"
      ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
      : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
  }, [profile]);

  // ✅ Calories burned (simulated)
  const caloriesBurned = useMemo(() => {
    if (!profile?.workouts) return 0;
    return profile.workouts.reduce(
      (acc, workout) => acc + (workout.done ? (workout.points * 10) : 0),
      0
    );
  }, [profile]);

  // ✅ Toggle task done
  const handleTaskToggle = async (type, index) => {
    if (!profile) return;
    try {
      setLoading(true);
      await API.put(
        `/user/tasks/toggle/${type}/${index}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      await fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new task
  const handleAddTask = async (type) => {
    if (!newTask[type]?.trim()) return;
    try {
      setLoading(true);
      await API.post(
        `/user/tasks/add/${type}`,
        { name: newTask[type] },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewTask((prev) => ({ ...prev, [type]: "" }));
      await fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile)
    return <p className="text-center mt-12 text-gray-600">Loading profile...</p>;

  // ✅ Circle progress
  const circleRadius = 75;
  const circumference = 2 * Math.PI * circleRadius;
  const bmiProgress = bmi ? Math.min((bmi / 40) * 100, 100) : 0;
  const bmiOffset = circumference - (bmiProgress / 100) * circumference;
  const calProgress = bmr ? Math.min((caloriesBurned / bmr) * 100, 100) : 0;
  const calOffset = circumference - (calProgress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 md:p-10 flex flex-col items-center space-y-10">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 text-center">
        🏆 Fitness Overview
      </h1>

      {profile.email === adminEmail && (
        <button
          onClick={() => navigate("/admin")}
          className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
        >
          Admin Panel
        </button>
      )}

      {/* ✅ Profile Card */}
      <div className="bg-white w-full max-w-3xl p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-around gap-6">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-3xl font-semibold text-purple-600">
            {profile.name}
          </h2>
          <p className="text-center text-gray-500 text-lg">
            {profile.goal} | Level {profile.level || 1} | {profile.points} XP | Streak:{" "}
            {profile.streak || 0} 🔥
          </p>
          {bmr && (
            <p className="text-center text-gray-600 font-medium">
              🔥 BMR: {bmr.toFixed(0)} kcal/day
            </p>
          )}

          {/* ✅ Buttons */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => navigate("/suggest-workouts")}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              💪 Suggested Workouts
            </button>
            <button
              onClick={() => navigate("/suggest-meals")}
              className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              🍽️ Suggested Meals
            </button>
          </div>
        </div>

        {/* ✅ Circles */}
        <div className="flex gap-8">
          {bmi && (
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
              <svg width={160} height={160} className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="#e5e7eb"
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
                  animate={{ strokeDashoffset: bmiOffset }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <div className="absolute text-center">
                <p className={`font-bold text-lg ${bmiCategory.color}`}>{bmi}</p>
                <p className="text-sm text-gray-500">{bmiCategory.label}</p>
              </div>
            </div>
          )}

          {bmr && (
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
              <svg width={160} height={160} className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="#e5e7eb"
                  strokeWidth="15"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="#f59e0b"
                  strokeWidth="15"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: calOffset }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-bold text-lg text-yellow-600">
                  {caloriesBurned}
                </p>
                <p className="text-sm text-gray-500">Calories Burned</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {["dailyTasks", "workouts", "meals", "meditations"].map((type) => (
          <div
            key={type}
            className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex flex-col"
          >
            <h3 className="text-xl font-semibold text-purple-600 mb-3 text-center capitalize">
              {type.replace(/([A-Z])/g, " $1")}
            </h3>

            <ul className="space-y-3 flex-1 overflow-y-auto max-h-64">
              <AnimatePresence>
                {profile[type]?.map((task, index) => (
                  <motion.li
                    key={index}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <span
                      className={
                        task.done
                          ? "line-through text-gray-400 font-medium"
                          : "text-gray-700 font-medium"
                      }
                    >
                      {task.name || task.task}
                    </span>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleTaskToggle(type, index)}
                      disabled={loading}
                      className="w-5 h-5 accent-purple-600"
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Add new task */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder={`Add new ${type.slice(0, -1)}`}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={newTask[type] || ""}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, [type]: e.target.value }))
                }
              />
              <button
                onClick={() => handleAddTask(type)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
