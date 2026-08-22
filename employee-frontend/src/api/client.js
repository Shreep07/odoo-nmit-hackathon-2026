import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const client = axios.create({ baseURL: BASE_URL });

// attach JWT to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("dayflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auto-logout on 401 (token expired / invalid)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("dayflow_token");
      localStorage.removeItem("dayflow_role");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;