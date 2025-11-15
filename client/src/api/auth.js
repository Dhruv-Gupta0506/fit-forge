// src/api/auth.js
import API from "./axios";

// Register user
export const registerUser = async (data) => {
  try {
    const res = await API.post(
      "/auth/register",
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      { withCredentials: true }
    );

    return res.data;
  } catch (err) {
    return { error: err.response?.data?.message || "Registration failed" };
  }
};

// Login user
export const loginUser = async (data) => {
  try {
    const res = await API.post(
      "/auth/login",
      {
        email: data.email,
        password: data.password,
      },
      { withCredentials: true }
    );

    return res.data;
  } catch (err) {
    return { error: err.response?.data?.message || "Login failed" };
  }
};
