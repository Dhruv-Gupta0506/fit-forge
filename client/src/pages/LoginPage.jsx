import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
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

    const res = await loginUser(form);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // Hard reload to attach cookies properly
    window.location.href = "/dashboard";
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden bg-black">

      <img
        src="/login.png"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.78] pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-purple-900/25"></div>

      <div className="absolute left-0 top-1/3 w-[300px] h-[300px] bg-blue-500/15 blur-[130px]"></div>
      <div className="absolute right-0 bottom-0 w-[280px] h-[280px] bg-purple-600/15 blur-[150px]"></div>

      <div className="relative z-10 w-full max-w-md px-6 sm:px-10 md:mr-24 lg:mr-36 xl:mr-48">

        <form
          onSubmit={handleSubmit}
          className="
            w-full 
            p-10 sm:p-12
            rounded-3xl
            bg-white/10 backdrop-blur-2xl
            border border-blue-400/30
            text-white
            shadow-[0_0_35px_rgba(0,120,255,0.30)]
          "
          style={{ boxShadow: "0 0 30px rgba(0,120,255,0.22)" }}
        >

          <h2
            className="
              whitespace-nowrap
              text-3xl sm:text-4xl md:text-[2.6rem]
              font-extrabold text-center mb-8
            "
            style={{
              textShadow: "0 0 12px rgba(0,180,255,0.45)",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome Back
          </h2>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-4 border border-red-700/40">
              {error}
            </p>
          )}

          <label className="text-gray-300 text-sm">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="
              w-full p-3 mt-1 mb-5 rounded-xl
              bg-black/40 text-white 
              border border-gray-600 
              focus:border-blue-400 focus:ring-2 focus:ring-blue-500
              transition
            "
          />

          <label className="text-gray-300 text-sm">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="
                w-full p-3 mt-1 rounded-xl
                bg-black/40 text-white 
                border border-gray-600 
                focus:border-blue-400 focus:ring-2 focus:ring-blue-500
                transition
              "
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute right-4 top-1/2 -translate-y-1/2 
                cursor-pointer text-gray-400 hover:text-white
              "
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Removed Forgot Password link */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-gradient-to-r from-blue-600 to-purple-700
              hover:from-blue-500 hover:to-purple-600 
              text-white font-semibold
              active:scale-95 transition
              shadow-[0_0_22px_rgba(0,150,255,0.45)]
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-300 mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Register
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
