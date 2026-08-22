import { useEffect, useState } from "react";
import client from "../api/client";

export default function Payroll() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/employee/payroll")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load payroll"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Payroll</h1>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {data && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6 divide-y divide-gray-100">
            <Row label="Basic" value={data.basic} />
            <Row label="HRA" value={data.hra} />
            <Row label="Allowances" value={data.allowances} />
            <Row label="Deductions" value={-data.deductions} negative />
            <div className="flex justify-between px-5 py-4 bg-gray-50 rounded-b-xl">
              <span className="text-sm font-semibold text-gray-900">Net Salary</span>
              <span className="text-sm font-semibold text-gray-900">
                ₹{data.net?.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex justify-between px-5 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${negative ? "text-red-500" : "text-gray-900"}`}>
        {negative ? "-" : ""}₹{Math.abs(value).toLocaleString()}
      </span>
    </div>
  );
}