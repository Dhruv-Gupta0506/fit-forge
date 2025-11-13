import axios from "axios";

let base = import.meta.env.VITE_API_BASE_URL;

// Ensure base URL always ends with "/api"
if (!base.endsWith("/api")) {
  base = base.replace(/\/+$/, "") + "/api";
}

const API = axios.create({
  baseURL: base,
  withCredentials: true, // required for cookies/JWT
});

export default API;
