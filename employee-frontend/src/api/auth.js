import client from "./client";

export async function login(email, password) {
  const res = await client.post("/auth/login", { email, password });
  const { token, role, employee } = res.data;
  localStorage.setItem("dayflow_token", token);
  localStorage.setItem("dayflow_role", role);
  return { role, employee };
}

export function logout() {
  localStorage.removeItem("dayflow_token");
  localStorage.removeItem("dayflow_role");
}

export function getRole() {
  return localStorage.getItem("dayflow_role");
}

export function isAuthenticated() {
  return !!localStorage.getItem("dayflow_token");
}