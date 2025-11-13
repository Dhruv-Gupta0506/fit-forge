import { useState, useEffect } from "react";
import API from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetOtp() {
  const { state } = useLocation();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!email)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Error: No email provided.</p>
      </div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/verify-reset-otp", { email, otp });
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;

    try {
      await API.post("/auth/forgot-password", { email });
      alert("OTP resent to your email");

      setTimer(30);
      setCanResend(false);
    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

      {/* BACKGROUND FRAME (VISIBLE) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/reotp.png"
          alt="Reset OTP Frame"
          className="
            w-[90%] 
            md:w-[65%]
            opacity-60
            object-contain
            scale-125
            drop-shadow-[0_0_22px_rgba(80,120,255,0.6)]
          "
          style={{
            transform: "translateY(-25px)", // shift up to show top corners
          }}
        />
      </div>

      {/* LIGHT OVERLAY (NOT TOO DARK NOW) */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* OTP FORM */}
      <form
        onSubmit={handleSubmit}
        className="
          relative z-20
          w-full max-w-sm
          p-10
          rounded-3xl
          bg-[#0b0b10]/85 backdrop-blur-xl
          border border-blue-500/40
          text-white
        "
        style={{
          boxShadow: "0 0 20px rgba(70,120,255,0.35)",
        }}
      >
        {/* Heading */}
        <h2
          className="
            text-3xl font-extrabold text-center mb-4
            bg-gradient-to-r from-blue-300 via-purple-300 to-blue-200
            bg-clip-text text-transparent
          "
          style={{
            textShadow: "0 0 12px rgba(80,120,255,0.5)",
          }}
        >
          Verify OTP
        </h2>

        <p className="text-center text-gray-300 text-sm mb-2">
          OTP sent to <b className="text-blue-400">{email}</b>
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-4 border border-red-700/40">
            {error}
          </p>
        )}

        {/* OTP INPUT */}
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          className="
            w-full p-3 mt-1 mb-5 rounded-xl
            bg-black/40 border border-gray-600
            text-white
            focus:border-blue-400 focus:ring-2 focus:ring-blue-600
            outline-none transition
          "
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {/* VERIFY BUTTON */}
        <button
          className="
            w-full py-3 rounded-xl 
            bg-gradient-to-r from-blue-600 to-purple-700
            hover:from-blue-500 hover:to-purple-600
            text-white font-semibold
            active:scale-95 transition
            mb-4
          "
        >
          Verify OTP
        </button>

        {/* RESEND BUTTON */}
        <button
          type="button"
          onClick={resendOtp}
          disabled={!canResend}
          className={`
            w-full py-3 rounded-xl text-sm transition
            ${
              canResend
                ? "bg-white/10 text-gray-200 border border-gray-500 hover:bg-white/20"
                : "bg-white/5 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
        </button>
      </form>
    </div>
  );
}
