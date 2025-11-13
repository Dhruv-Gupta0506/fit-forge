import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/auth/forgot-password", { email });
      setSuccess("OTP sent to your email!");
      setTimeout(() => {
        navigate("/reset-otp", { state: { email } });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

      {/* BACKGROUND IMAGE */}
      <img
        src="/forgotpass.png"
        alt="Forgot Password Background"
        className="
          absolute inset-0 w-full h-full 
          object-cover object-center
          pointer-events-none
        "
        style={{ opacity: 0.8 }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/65"></div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="
          relative z-20
          w-full max-w-sm 
          p-10 
          rounded-3xl
          bg-white/10 backdrop-blur-xl
          border border-blue-500/40
          text-white
        "
        style={{
          boxShadow: "0 0 0 1px rgba(59,130,246,0.25)",
        }}
      >
        {/* HEADER */}
        <h2
          className="
            text-3xl font-extrabold text-center mb-6
            bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300
            bg-clip-text text-transparent
          "
          style={{
            textShadow: "0 0 10px rgba(0,150,255,0.25)",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Forgot Password
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-2 border border-red-700/40">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 text-sm text-center bg-green-900/30 p-2 rounded-lg mb-2 border border-green-700/40">
            {success}
          </p>
        )}

        {/* EMAIL INPUT */}
        <label className="text-gray-300 text-sm">Enter your email</label>
        <input
          type="email"
          placeholder="Email"
          className="
            w-full p-3 mt-1 mb-6 rounded-xl
            bg-black/40 text-white 
            border border-gray-600 
            focus:border-blue-400 focus:ring-2 focus:ring-blue-600
            outline-none transition
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* SUBMIT */}
        <button
          className="
            w-full py-3 rounded-xl
            bg-gradient-to-r from-blue-600 to-blue-800
            hover:from-blue-500 hover:to-blue-700
            text-white font-semibold
            active:scale-95 transition
          "
        >
          Send OTP
        </button>

        {/* REDIRECT LINK */}
        <p className="text-center text-sm text-gray-300 mt-5">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
