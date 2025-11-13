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
      if (res.error === "Please verify your email first") {
        return navigate("/verify-otp", { state: { email: form.email } });
      }
      setError(res.error);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-black overflow-hidden">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 items-center justify-center px-8">
        <img
          src="/login.png"
          alt="FitForge"
          className="w-full h-auto object-contain select-none"
        />
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex-1 flex items-center justify-center px-6">

        <form
          onSubmit={handleSubmit}
          className="
            w-full max-w-sm
            p-10
            rounded-3xl
            bg-white/10 backdrop-blur-xl
            border border-blue-500/40
            text-white
            shadow-[0_0_0_rgba(0,0,0,0)]
          "
          style={{
            boxShadow: "0 0 0 1px rgba(59,130,246,0.2)",
          }}
        >
          {/* Header */}
          <h2
            className="
              text-4xl font-extrabold text-center mb-8
              text-white tracking-wide
            "
            style={{
              textShadow: "0 0 6px rgba(0,150,255,0.3)",
            }}
          >
            Welcome Back
          </h2>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/40 p-2 rounded-lg mb-4 border border-red-700/40">
              {error}
            </p>
          )}

          {/* EMAIL */}
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

          {/* PASSWORD */}
          <label className="text-gray-300 text-sm">Password</label>
          <div className="relative mb-5">
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

          {/* FORGOT PASSWORD LINK */}
          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-blue-400 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-gradient-to-r from-blue-600 to-blue-800
              hover:from-blue-500 hover:to-blue-700
              text-white font-semibold
              active:scale-95 transition
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
