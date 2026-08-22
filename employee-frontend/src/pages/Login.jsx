import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { hrLogin } from "../api/hrAuth";

export default function Login() {
  const [loginAs, setLoginAs] = useState("employee"); // "employee" | "hr"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (loginAs === "hr") {
        await hrLogin(email, password);
        navigate("/hr");
      } else {
        const { role } = await login(email, password);
        navigate(role === "hr" ? "/hr" : "/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dayflow</h1>
          <p className="text-sm text-gray-500 mt-1">Human Resource Management</p>
        </div>

        {/* Employee / HR toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setLoginAs("employee")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              loginAs === "employee" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => setLoginAs("hr")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              loginAs === "hr" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            HR
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder={loginAs === "hr" ? "hr@dayflow.com" : "you@dayflow.com"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : `Sign in as ${loginAs === "hr" ? "HR" : "Employee"}`}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          {loginAs === "hr"
            ? "HR login connects to the HR system (port 5001)"
            : "Demo: employee@dayflow.com — password123"}
        </p>
      </div>
    </div>
  );
}