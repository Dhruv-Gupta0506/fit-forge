// src/api/auth.js
import API from "./axios";

// Register user
export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    console.log("✅ Register response:", res.data);

    // res.data includes: { message, email, userId }
    return res.data;
  } catch (err) {
    console.error("❌ Register error:", err.response?.data || err.message);
    return { error: err.response?.data?.message || "Registration failed" };
  }
};

// Login user
export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", {
      email: data.email,
      password: data.password,
    });

    console.log("✅ Login response:", res.data);
    return res.data; // { message, user, token }
  } catch (err) {
    console.error("❌ Login error:", err.response?.data || err.message);

    // return exact backend message (important for OTP redirect)
    return { error: err.response?.data?.message || "Login failed" };
  }
};
