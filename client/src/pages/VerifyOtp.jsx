import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No email found. Please register again.</p>
      </div>
    );
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 🔥 CALL BACKEND
      const res = await API.post("/auth/verify-otp", { email, otp });

      // 🔥 SAVE TOKEN + USER FOR AUTO LOGIN
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // 🔥 GO DIRECTLY TO DASHBOARD
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP");
    }

    setLoading(false);
  }

  async function resendOtp() {
    if (!canResend) return;

    try {
      await API.post("/auth/resend-otp", { email });
      alert("OTP resent to your email");

      setTimer(30);
      setCanResend(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

      {/* BACKGROUND IMAGE */}
      <img
        src="/otp.png"
        alt="OTP Background"
        className="
          absolute inset-0 w-full h-full 
          object-cover object-center
          opacity-70
          pointer-events-none
        "
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/65"></div>

      {/* OTP FORM */}
      <form
        onSubmit={handleVerify}
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
        <h2
          className="
            text-3xl font-extrabold text-center mb-4
          "
          style={{
            textShadow: "0 0 6px rgba(0,150,255,0.3)",
          }}
        >
          Verify OTP
        </h2>

        <p className="text-center text-gray-300 text-sm mb-2">
          OTP sent to <b className="text-blue-400">{email}</b>
        </p>

        {message && (
          <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-4 border border-red-700/40">
            {message}
          </p>
        )}

        {/* OTP INPUT */}
        <input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="
            w-full p-3 mt-1 mb-5 rounded-xl
            bg-black/40 border border-gray-600
            text-white
            focus:border-blue-400 focus:ring-2 focus:ring-blue-600
            outline-none transition
          "
        />

        {/* VERIFY BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl 
            bg-gradient-to-r from-blue-600 to-blue-800
            hover:from-blue-500 hover:to-blue-700
            text-white font-semibold
            active:scale-95 transition
            mb-4
          "
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* RESEND OTP */}
        <button
          type="button"
          onClick={resendOtp}
          disabled={!canResend}
          className={`
            w-full py-3 rounded-xl text-sm
            transition
            ${
              canResend
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
        </button>
      </form>
    </div>
  );
}
