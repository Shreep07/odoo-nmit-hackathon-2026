import { useEffect, useState } from "react";
import client from "../api/client";

export default function Profile() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/employee/profile")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load profile"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {data && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6 divide-y divide-gray-100">
            <Row label="Employee ID" value={data.emp_id} />
            <Row label="Name" value={data.name} />
            <Row label="Email" value={data.email} />
            <Row label="Department" value={data.department} />
            <Row label="Designation" value={data.designation} />
            <Row label="Role" value={data.role} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between px-5 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}