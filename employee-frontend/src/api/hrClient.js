import axios from "axios";

// Person 2's HR backend — runs on a separate port from the employee backend.
// ASSUMPTION (unconfirmed with Person 2): HR backend exposes POST /api/auth/login
// and returns { token, role, employee } in the same shape as the employee backend.
// If their actual response differs, update only the .then() in hrAuth.js — no other
// files need to change.
const HR_BASE_URL = "http://localhost:5001/api";

const hrClient = axios.create({ baseURL: HR_BASE_URL });

hrClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("dayflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default hrClient;