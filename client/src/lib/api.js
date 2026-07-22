import axios from "axios";

// Local: Express on :5000
// Production (Vercel): same-site /api serverless function
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const api = axios.create({
  baseURL: API_BASE,
});
