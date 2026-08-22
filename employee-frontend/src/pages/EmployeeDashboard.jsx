import { useEffect, useState } from "react";
import client from "../api/client";

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/employee/me")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load dashboard"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">
          Good morning{data ? `, ${data.name}` : ""} 👋
        </h1>
        {data && (
          <p className="text-sm text-gray-500 mt-1">
            {data.department} • {data.emp_id}
          </p>
        )}

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Card label="Attendance" value={`${data.attendance_pct}%`} />
            <Card label="Paid Leave Left" value={data.leave_balance?.paid ?? "—"} />
            <Card label="Net Salary" value={`₹${data.salary?.net?.toLocaleString() ?? "—"}`} />
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}