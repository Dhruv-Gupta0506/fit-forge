import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputsRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // TIMER HANDLER
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No email found. Please try again.</p>
      </div>
    );
  }

  // INPUT CHANGE HANDLER
  function handleOtpChange(value, index) {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next box
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }

    // auto submit if complete
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      handleVerifyAuto(fullOtp);
    }
  }

  // AUTO VERIFY
  async function handleVerifyAuto(fullOtp) {
    setLoading(true);
    setMessage("");

    try {
      await API.post("/auth/verify-otp", { email, otp: fullOtp });

      // SUCCESS ANIMATION
      setSuccess(true);

      // go to reset-password page with otp + email
      setTimeout(() => {
        navigate("/reset-password", {
          state: { email, otp: fullOtp },
        });
      }, 500);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);

      setMessage(err.response?.data?.message || "Invalid OTP");
    }

    setLoading(false);
  }

  // MANUAL SUBMIT
  async function handleVerify(e) {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      setMessage("Enter all 6 digits");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await API.post("/auth/verify-otp", { email, otp: fullOtp });

      setSuccess(true);

      setTimeout(() => {
        navigate("/reset-password", {
          state: { email, otp: fullOtp },
        });
      }, 500);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);

      setMessage(err.response?.data?.message || "Invalid OTP");
    }

    setLoading(false);
  }

  // BACKSPACE HANDLING
  function handleBackspace(e, index) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  }

  // RESEND OTP
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
        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* GLOWS */}
      <div className="absolute top-10 left-10 w-[280px] h-[280px] bg-blue-600/25 blur-[150px]"></div>
      <div className="absolute bottom-10 right-10 w-[260px] h-[260px] bg-purple-600/25 blur-[150px]"></div>

      {/* OTP CARD */}
      <form
        onSubmit={handleVerify}
        className={`
          relative z-20 w-full max-w-sm
          p-10 sm:p-12 rounded-3xl
          bg-white/10 backdrop-blur-2xl
          border border-blue-500/40
          shadow-[0_0_30px_rgba(0,150,255,0.45)]
          transition-all
          ${shake ? "animate-[shake_0.3s_ease-in-out]" : ""}
          ${success ? "shadow-[0_0_40px_rgba(0,255,160,0.65)] border-green-400" : ""}
        `}
      >

        {/* SHAKE ANIMATION */}
        <style>
          {`
            @keyframes shake {
              0% { transform: translateX(0); }
              25% { transform: translateX(-6px); }
              50% { transform: translateX(6px); }
              75% { transform: translateX(-6px); }
              100% { transform: translateX(0); }
            }
          `}
        </style>

        {/* HEADING */}
        <h2
          className="
            text-3xl sm:text-4xl font-extrabold text-center mb-3
            bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300
            bg-clip-text text-transparent
          "
          style={{ textShadow: "0 0 18px rgba(90,140,255,0.55)" }}
        >
          Verify OTP
        </h2>

        <p className="text-center text-gray-300 text-sm mb-4">
          OTP sent to <span className="text-blue-400">{email}</span>
        </p>

        {message && (
          <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-4 border border-red-700/40">
            {message}
          </p>
        )}

        {/* OTP INPUT BOXES */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              maxLength={1}
              value={digit}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="
                w-10 h-12 sm:w-12 sm:h-14
                text-center text-xl font-semibold
                rounded-xl
                bg-black/40 border border-gray-600
                text-white
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                transition
                shadow-[0_0_12px_rgba(0,120,255,0.35)]
              "
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 mb-4 rounded-xl 
            bg-gradient-to-r from-blue-600 to-purple-700
            hover:from-blue-500 hover:to-purple-600
            text-white font-semibold
            active:scale-95 transition
            shadow-[0_0_22px_rgba(0,150,255,0.45)]
          "
        >
          {loading ? "Verifying..." : "Verify OTP"}
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
                ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
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
