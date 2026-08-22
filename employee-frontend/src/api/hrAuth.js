import hrClient from "./hrClient";

// ASSUMPTION: HR login endpoint is POST /api/auth/login on port 5001,
// returning { token, role, employee } — same shape as the employee backend.
// Confirm with Person 2 and adjust this function if their response differs.
export async function hrLogin(email, password) {
  const res = await hrClient.post("/auth/login", { email, password });
  const { token, role, employee } = res.data;
  localStorage.setItem("dayflow_token", token);
  localStorage.setItem("dayflow_role", role);
  localStorage.setItem("dayflow_backend", "hr"); // remembers which backend issued this session
  return { role, employee };
}
