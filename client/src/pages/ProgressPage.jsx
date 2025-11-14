import { useState, useEffect, useMemo } from "react";
import API from "../api/axios";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

export default function ProgressPage() {
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState("");
  const [points, setPoints] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [badgeMessage, setBadgeMessage] = useState("");

  // Fetch progress logs — cookie handles auth automatically
  const fetchLogs = async () => {
    try {
      const res = await API.get("/progress"); // 🔥 no headers, cookie used
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Calculate stats
  const totalPoints = useMemo(() => logs.reduce((acc, log) => acc + Number(log.points), 0), [logs]);

  const weightChange = useMemo(() => {
    if (!logs.length) return 0;
    return (logs[logs.length - 1].weight - logs[0].weight).toFixed(1);
  }, [logs]);

  const streak = useMemo(() => {
    if (!logs.length) return 0;
    let count = 1;
    for (let i = logs.length - 1; i > 0; i--) {
      const prev = new Date(logs[i - 1].date);
      const curr = new Date(logs[i].date);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) count++;
      else break;
    }
    return count;
  }, [logs]);

  // Leveling system
  const level = useMemo(() => Math.floor(totalPoints / 100) + 1, [totalPoints]);
  const nextLevelPoints = useMemo(() => level * 100, [level]);
  const progressPercent = useMemo(
    () => Math.min((totalPoints / nextLevelPoints) * 100, 100),
    [totalPoints, nextLevelPoints]
  );

  // Badges
  const badges = useMemo(() => {
    const achieved = [];
    if (totalPoints >= 50) achieved.push({ name: "Novice", icon: "⭐" });
    if (totalPoints >= 200) achieved.push({ name: "Intermediate", icon: "🔥" });
    if (totalPoints >= 500) achieved.push({ name: "Pro", icon: "💪" });
    if (totalPoints >= 1000) achieved.push({ name: "Legend", icon: "🏆" });
    return achieved;
  }, [totalPoints]);

  // Add progress entry
  const handleSubmit = async () => {
    if (!weight || !points) return alert("Enter weight and points!");
    if (weight <= 0 || weight > 300) return alert("Enter a realistic weight!");
    if (points < 0 || points > 100) return alert("Points must be 0-100!");

    // Badge unlock detection
    const milestones = [50, 200, 500, 1000];
    const nextBadge = milestones.find(
      (m) => totalPoints < m && totalPoints + Number(points) >= m
    );

    try {
      await API.post("/progress/add", { weight, points }); // 🔥 cookie-based

      setWeight("");
      setPoints("");
      await fetchLogs();

      if (nextBadge) {
        setBadgeMessage(`🎉 New badge unlocked!`);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        setTimeout(() => setBadgeMessage(""), 4000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add progress.");
    }
  };

  const weightArrow = weightChange > 0 ? "⬆️" : weightChange < 0 ? "⬇️" : "➡️";

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center space-y-6">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <h2 className="text-4xl font-bold text-purple-700">📈 Fitness RPG Dashboard</h2>
      <p className="text-gray-600 text-center">
        Track progress, earn XP, unlock badges, maintain streaks!
      </p>

      {badgeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded shadow-lg"
        >
          {badgeMessage}
        </motion.div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl">
        <motion.div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
          <h3 className="text-xl font-semibold text-purple-600">🏅 Level</h3>
          <p className="text-gray-700 mt-2 text-lg">{level}</p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
          <h3 className="text-xl font-semibold text-purple-600">🎯 Total Points</h3>
          <p className="text-gray-700 mt-2 text-lg">{totalPoints}</p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
          <h3 className="text-xl font-semibold text-purple-600">⚖️ Weight Change</h3>
          <p className="text-gray-700 mt-2 text-lg">
            {weightChange} kg {weightArrow}
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
          <h3 className="text-xl font-semibold text-purple-600">🔥 Streak</h3>
          <p className="text-gray-700 mt-2 text-lg">{streak} day(s)</p>
        </motion.div>
      </div>

      {/* Level progress bar */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-6 mt-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-purple-600 mb-2">
          Progress to next level
        </h3>
        <div className="w-full bg-gray-200 h-6 rounded-full overflow-hidden">
          <motion.div
            className="bg-purple-600 h-6"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-right mt-1 text-gray-500">
          {progressPercent.toFixed(1)}%
        </p>
      </div>

      {/* Add progress entry */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg flex flex-col space-y-4 mt-6 border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-xl font-semibold text-purple-600 text-center">
          Add Progress Entry
        </h3>

        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="number"
            placeholder="Points"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Add Entry
        </button>
      </motion.div>

      {/* Trend chart */}
      <div className="w-full max-w-6xl mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-purple-600 mb-2 text-center">
          📊 Trend
        </h3>

        {logs.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
              <Line type="monotone" dataKey="points" stroke="#82ca9d" name="Points" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">
            No progress yet. Add your first entry!
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="bg-white w-full max-w-6xl mt-6 rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-purple-600 mb-2 text-center">
          🏅 Achievements
        </h3>

        <div className="flex flex-wrap gap-3 justify-center">
          {badges.length > 0 ? (
            badges.map((badge, index) => (
              <motion.div
                key={index}
                className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
                title={badge.name}
              >
                {badge.icon} {badge.name}
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">No badges yet. Keep going!</p>
          )}
        </div>
      </div>
    </div>
  );
}
