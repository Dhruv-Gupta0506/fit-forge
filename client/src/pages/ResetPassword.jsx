import { useState } from "react";
import API from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
  const { state } = useLocation();
  const email = state?.email;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/auth/reset-password", { email, newPassword: password });
      setSuccess("Password reset successful!");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
  };

  if (!email)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Error: No email provided.</p>
      </div>
    );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

      {/* BACKGROUND IMAGE — SHIFTED UPWARD */}
      <img
        src="/resetpass.png"
        alt="Reset Password Background"
        className="
          absolute inset-0 w-full h-full
          object-cover
          opacity-90
          pointer-events-none
        "
        style={{
          objectPosition: "center -420px", // 🔥 moves image slightly upward
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* GLOWS */}
      <div className="absolute top-12 left-12 w-[280px] h-[280px] bg-blue-600/25 blur-[150px]"></div>
      <div className="absolute bottom-12 right-12 w-[260px] h-[260px] bg-purple-600/25 blur-[150px]"></div>

      {/* RESET CARD */}
      <form
        onSubmit={handleSubmit}
        className="
          relative z-20 w-[90%] max-w-md
          p-10 sm:p-12
          rounded-3xl
          bg-white/10 backdrop-blur-2xl
          border border-blue-500/40
          text-white
          shadow-[0_0_30px_rgba(0,150,255,0.35)]
        "
      >
        {/* TITLE */}
        <h2
          className="
            text-3xl sm:text-4xl font-extrabold text-center mb-6
            bg-gradient-to-r from-blue-300 via-purple-300 to-blue-200
            bg-clip-text text-transparent
          "
          style={{
            textShadow: "0 0 14px rgba(90,140,255,0.6)",
            letterSpacing: "-0.5px",
          }}
        >
          Reset Password
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-4 border border-red-700/40">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 text-sm text-center bg-green-900/30 p-2 rounded-lg mb-4 border border-green-700/40">
            {success}
          </p>
        )}

        {/* PASSWORD INPUT */}
        <label className="text-gray-300 text-sm">New Password</label>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="
              w-full p-3 mt-1 rounded-xl
              bg-black/40 border border-gray-600
              text-white
              focus:border-blue-400 focus:ring-2 focus:ring-blue-500
              outline-none transition
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              cursor-pointer text-gray-400 hover:text-white
              text-lg select-none
            "
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* SAVE BUTTON */}
        <button
          className="
            w-full py-3 rounded-xl 
            bg-gradient-to-r from-blue-600 to-purple-700
            hover:from-blue-500 hover:to-purple-600
            text-white font-semibold
            active:scale-95 transition
            shadow-[0_0_25px_rgba(0,150,255,0.45)]
          "
        >
          Save Password
        </button>
      </form>
    </div>
  );
}
