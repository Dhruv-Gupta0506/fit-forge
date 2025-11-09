import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // make sure your backend runs on port 5000
  withCredentials: true, // allows cookies if your backend sets them
});

export default API;
