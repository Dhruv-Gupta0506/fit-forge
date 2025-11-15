import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await registerUser(form);

    if (res.error) {
      setError(res.error);
    } else {
      // ✔️ New user goes directly to dashboard now
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center">

      {/* BACKGROUND IMAGE */}
      <img
        src="/register.png"
        alt="Register Background"
        className="
          absolute inset-0 w-full h-full 
          object-cover 
          opacity-85
          pointer-events-none
        "
      />

      {/* Lighter overlay to reveal FITFORGE logo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Ambient Glows */}
      <div className="absolute left-[8%] bottom-[10%] w-[280px] h-[280px] bg-blue-500/25 blur-[130px]"></div>
      <div className="absolute right-[8%] bottom-[5%] w-[250px] h-[250px] bg-purple-600/25 blur-[140px]"></div>

      {/* REGISTER FORM */}
      <form
        onSubmit={handleSubmit}
        className="
          relative z-20 
          w-full max-w-sm 
          p-8 sm:p-10
          rounded-3xl
          bg-white/10 backdrop-blur-2xl
          border border-blue-500/40
          shadow-[0_0_25px_rgba(0,120,255,0.4)]
        "
        style={{ marginTop: "-40px" }}
      >
        {/* Header */}
        <h2
          className="
            text-3xl sm:text-4xl font-extrabold 
            text-center mb-8
          "
          style={{
            color: "white",
            textShadow: "0 0 15px rgba(0,180,255,0.55)",
            letterSpacing: "-0.5px"
          }}
        >
          Create Account
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-5 border border-red-700/40">
            {error}
          </p>
        )}

        {/* NAME */}
        <label className="text-gray-300 text-sm">Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          className="
            w-full p-3 mt-1 mb-5 rounded-xl
            bg-black/40 border border-gray-600
            text-white 
            focus:border-blue-400 focus:ring-2 focus:ring-blue-500
            transition
          "
        />

        {/* EMAIL */}
        <label className="text-gray-300 text-sm">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          className="
            w-full p-3 mt-1 mb-5 rounded-xl
            bg-black/40 border border-gray-600
            text-white 
            focus:border-blue-400 focus:ring-2 focus:ring-blue-500
            transition
          "
        />

        {/* PASSWORD */}
        <label className="text-gray-300 text-sm">Password</label>
        <div className="relative mb-6">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            className="
              w-full p-3 mt-1 rounded-xl
              bg-black/40 border border-gray-600
              text-white 
              focus:border-blue-400 focus:ring-2 focus:ring-blue-500
              transition
            "
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl 
            bg-gradient-to-r from-blue-600 to-purple-700 
            hover:from-blue-500 hover:to-purple-600
            text-white font-semibold
            active:scale-95 transition
            shadow-[0_0_20px_rgba(0,150,255,0.45)]
          "
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-300 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
