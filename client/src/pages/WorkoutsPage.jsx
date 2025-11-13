// src/pages/WorkoutsPage.jsx

import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const GOALS = ["Bulking", "Cutting", "Maintenance"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const GENDERS = ["Male", "Female", "Other"];
const LOCATIONS = ["Gym", "Home"];

// Map XP level → beginner/intermediate/advanced
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

  // Save completion state
  useEffect(() => {
    localStorage.setItem(
      `plan_complete_${planSignature}`,
      JSON.stringify(completed)
    );
  }, [completed, planSignature]);

  // Load Profile + Fix Level Mapping
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await API.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);

        // Fix level mapping here
        if (res.data.level) {
          const mapped = mapUserLevel(res.data.level);
          setLevel(mapped);
        }

        if (res.data.goal) setGoal(res.data.goal);
        if (res.data.gender) setGender(res.data.gender);
        if (res.data.workoutLocation) setLocation(res.data.workoutLocation);

      } catch (err) {
        console.error("Could not fetch profile:", err);
        setError("Could not fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch workouts
  const fetchWorkouts = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        location,
        goal,
        level,
        gender,
        days: String(days),
      });

      const res = await API.get(`/ai/workouts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkouts(res.data.workouts);
      setMeta(res.data.meta);

    } catch (err) {
      console.error("Workout fetch failed:", err);
      setError("Could not get workouts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch workouts once profile loads
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
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Advanced Workout Planner</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          {/* GOAL */}
          <div>
            <label className="text-sm text-gray-600">Goal</label>
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* LEVEL */}
          <div>
            <label className="text-sm text-gray-600">Level</label>
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* GENDER */}
          <div>
            <label className="text-sm text-gray-600">Gender</label>
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* DAYS */}
          <div>
            <label className="text-sm text-gray-600">Days / Week</label>
            <input
              type="number"
              min="1"
              max="6"
              className="mt-1 w-full border rounded px-2 py-1"
              value={days}
              onChange={(e) =>
                setDays(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))
              }
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="text-sm text-gray-600">Location</label>
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-full flex gap-4 mt-3">
            <button
              onClick={fetchWorkouts}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Generate Plan
            </button>

            <button
              onClick={() => {
                setCompleted({});
                localStorage.removeItem(`plan_complete_${planSignature}`);
              }}
              className="px-4 py-2 border rounded-lg"
            >
              Reset Progress
            </button>
          </div>

        </div>

        {/* Loading/Error */}
        {loading && <p>Loading workout plan…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Workout days */}
        <div className="space-y-6">
          {workouts.map((day, dayIdx) => (
            <div key={dayIdx} className="border rounded-xl shadow-sm p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{day.day}</h3>
                  {meta && (
                    <p className="text-xs text-gray-500">
                      {meta.location}, {meta.goal}, {meta.level}, {meta.days} days/week
                    </p>
                  )}
                </div>
                <div className="text-sm font-medium">{percentComplete(dayIdx)}%</div>
              </div>

              <ul className="space-y-2">
                {day.exercises.map((ex, exIdx) => {
                  const key = `${dayIdx}_${exIdx}`;
                  const done = !!completed[key];

                  return (
                    <li
                      key={exIdx}
                      className={`flex justify-between items-center p-3 rounded ${
                        done ? "bg-green-50" : "bg-white"
                      } border`}
                    >
                      <div>
                        <div className="font-medium">{ex.name}</div>

                        <div className="text-[11px] text-gray-500">
                          {ex.muscle && <span>{ex.muscle} • </span>}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {ex.sets} × {ex.reps} • Rest: {ex.rest}
                        </div>

                        {ex.notes && (
                          <div className="text-xs text-gray-600 italic mt-1">
                            {ex.notes}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleDone(dayIdx, exIdx)}
                        className={`px-3 py-1 rounded-lg ${
                          done ? "bg-green-600 text-white" : "bg-white border"
                        }`}
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

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/overview")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
}
