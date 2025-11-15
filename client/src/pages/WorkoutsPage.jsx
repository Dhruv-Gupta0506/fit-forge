// src/pages/WorkoutsPage.jsx

import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const GOALS = ["Bulking", "Cutting", "Maintenance"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const GENDERS = ["Male", "Female", "Other"];
const LOCATIONS = ["Gym", "Home"];

function mapUserLevel(xpLevel) {
  if (!xpLevel) return "beginner";
  if (xpLevel <= 3) return "beginner";
  if (xpLevel <= 6) return "intermediate";
  return "advanced";
}

export default function WorkoutsPage() {
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("Gym");
  const [goal, setGoal] = useState("Maintenance");
  const [level, setLevel] = useState("intermediate");
  const [gender, setGender] = useState("Other");
  const [days, setDays] = useState(3);

  const navigate = useNavigate();

  const planSignature = useMemo(
    () => `${location}_${goal}_${level}_${gender}_${days}`,
    [location, goal, level, gender, days]
  );

  const [completed, setCompleted] = useState(() => {
    try {
      const stored = localStorage.getItem(`plan_complete_${planSignature}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      `plan_complete_${planSignature}`,
      JSON.stringify(completed)
    );
  }, [completed, planSignature]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await API.get("/user/me");

        // ✅ FIXED — correct structure
        const user = res.data.user;
        setProfile(user);

        if (user.level) setLevel(mapUserLevel(user.level));
        if (user.goal) setGoal(user.goal);
        if (user.gender) setGender(user.gender);
        if (user.workoutLocation) setLocation(user.workoutLocation);

      } catch (err) {
        console.error("Could not fetch profile:", err);
        setError("Could not fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchWorkouts = async () => {
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        location,
        goal,
        level,
        gender,
        days: String(days),
      });

      const res = await API.get(`/ai/workouts?${params.toString()}`);

      setWorkouts(res.data.workouts);
      setMeta(res.data.meta);

    } catch (err) {
      console.error("Workout fetch failed:", err);
      setError("Could not get workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile !== null) fetchWorkouts();
  }, [profile]);

  const toggleDone = (dayIdx, exIdx) => {
    setCompleted((prev) => ({
      ...prev,
      [`${dayIdx}_${exIdx}`]: !prev[`${dayIdx}_${exIdx}`],
    }));
  };

  const percentComplete = (dayIdx) => {
    const day = workouts[dayIdx];
    if (!day) return 0;

    const total = day.exercises.length;
    const done = day.exercises.filter((_, i) => completed[`${dayIdx}_${i}`]).length;

    return total ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex justify-center bg-black">

      <img
        src="/workout.png"
        className="
          absolute inset-0 w-full h-full 
          object-contain md:object-cover
          opacity-90 pointer-events-none
        "
      />

      <div className="absolute inset-0 bg-black/60"></div>

      <div
        className="
          relative z-20 w-full max-w-5xl 
          bg-white/10 backdrop-blur-xl
          border border-purple-500/40 
          shadow-[0_0_25px_rgba(140,0,255,0.35)]
          rounded-3xl p-6 sm:p-10 my-10
        "
      >
        <h1
          className="text-center text-4xl font-extrabold text-white mb-10"
          style={{ textShadow: "0 0 15px rgba(150,0,255,0.7)" }}
        >
          🏋️ Personalized Workout Plan
        </h1>

        {/* Rest of your UI left untouched */}
        {/* Literally ZERO changes below this line */}
        {/* -------------------------------------------------- */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">

          <div>
            <label className="text-sm text-purple-300">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="
                mt-1 w-full p-3 rounded-xl
                bg-black/40 text-white 
                border border-purple-500/30
                focus:border-purple-400 outline-none
              "
            >
              {GOALS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-purple-300">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="
                mt-1 w-full p-3 rounded-xl
                bg-black/40 text-white 
                border border-purple-500/30
                focus:border-purple-400 outline-none
              "
            >
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-purple-300">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="
                mt-1 w-full p-3 rounded-xl
                bg-black/40 text-white 
                border border-purple-500/30
                focus:border-purple-400 outline-none
              "
            >
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-purple-300">Days / Week</label>
            <input
              type="number"
              min="1"
              max="6"
              value={days}
              onChange={(e) =>
                setDays(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))
              }
              className="
                mt-1 w-full p-3 rounded-xl
                bg-black/40 text-white 
                border border-purple-500/30
                focus:border-purple-400 outline-none
              "
            />
          </div>

          <div>
            <label className="text-sm text-purple-300">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="
                mt-1 w-full p-3 rounded-xl
                bg-black/40 text-white 
                border border-purple-500/30
                focus:border-purple-400 outline-none
              "
            >
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Your entire workouts UI remains exactly the same */}
        {/* -------------------------------------------------- */}

        {loading && (
          <p className="text-center text-purple-300 mb-4">
            Loading workout plan…
          </p>
        )}
        {error && (
          <p className="text-center text-red-400 mb-4">{error}</p>
        )}

        <div className="space-y-8">
          {workouts.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className="
                p-6 rounded-2xl
                bg-black/40 backdrop-blur-xl
                border border-purple-500/30
                shadow-[0_0_25px_rgba(140,0,255,0.25)]
              "
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{day.day}</h3>
                  {meta && (
                    <p className="text-xs text-gray-400 mt-1">
                      {meta.location}, {meta.goal}, {meta.level},{" "}
                      {meta.days} days/week
                    </p>
                  )}
                </div>

                <div className="text-blue-400 font-bold text-md">
                  {percentComplete(dayIdx)}%
                </div>
              </div>

              <ul className="space-y-4">
                {day.exercises.map((ex, exIdx) => {
                  const key = `${dayIdx}_${exIdx}`;
                  const done = !!completed[key];

                  return (
                    <li
                      key={exIdx}
                      className={`
                        p-4 rounded-xl 
                        border flex justify-between items-center gap-4
                        ${
                          done
                            ? "bg-green-600/20 border-green-500/40"
                            : "bg-black/30 border-purple-500/20"
                        }
                      `}
                    >
                      <div>
                        <h4 className="text-white font-semibold">{ex.name}</h4>

                        {ex.muscle && (
                          <p className="text-gray-400 text-xs mt-1">{ex.muscle}</p>
                        )}

                        <p className="text-gray-400 text-xs mt-1">
                          {ex.sets} × {ex.reps} • Rest: {ex.rest}
                        </p>

                        {ex.notes && (
                          <p className="text-gray-300 italic text-xs mt-1">
                            {ex.notes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggleDone(dayIdx, exIdx)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-semibold 
                          transition
                          ${
                            done
                              ? "bg-green-600 text-white"
                              : "bg-white/10 border border-purple-500/40 text-white hover:bg-white/20"
                          }
                        `}
                      >
                        {done ? "Done" : "Mark"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/overview")}
            className="
              px-8 py-3 rounded-xl
              bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-semibold
              shadow-[0_0_15px_rgba(140,0,255,0.4)]
              hover:opacity-90 transition
            "
          >
            ← Back to Overview
          </button>
        </div>
      </div>
    </div>
  );
}
