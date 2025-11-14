import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // DO NOT append /api here
  withCredentials: true,
});

export default API;
