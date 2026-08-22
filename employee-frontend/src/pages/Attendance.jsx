import { useState } from "react";
import client from "../api/client";

export default function Attendance() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (err) => reject(new Error("Could not get location: " + err.message)),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleCheckIn(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { lat, lng } = await getLocation();
      const res = await client.post("/employee/attendance/checkin", { token, lat, lng });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Scan the office QR code to check in</p>

        <form
          onSubmit={handleCheckIn}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6 space-y-4"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">QR Token</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
              placeholder="Paste scanned QR token here"
            />
          </div>

          <p className="text-xs text-gray-400">
            📍 Your browser will ask for location permission when you check in.
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Checking in..." : "Check In"}
          </button>
        </form>

        {result && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4">
            <StatusBanner status={result.status} />
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Check-in time" value={result.check_in} />
              <Row label="Late count this month" value={result.late_count} />
              <Row label="Distance from office" value={`${result.distance_meters} m`} />
              <Row label="Blockchain block #" value={result.block_index} />
            </div>
            {result.warning && (
              <p className="text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2 text-xs mt-3">
                ⚠️ You've reached the maximum allowed late arrivals for this month.
              </p>
            )}
            {result.hr_escalation && (
              <p className="text-red-700 bg-red-50 rounded-lg px-3 py-2 text-xs mt-2">
                🔴 This has been flagged to HR for review.
              </p>
            )}
            <p className="text-gray-400 text-xs mt-3 break-all">
              🔒 Verified hash: {result.block_hash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBanner({ status }) {
  const isLate = status === "LATE";
  return (
    <div className={`text-center py-2 rounded-lg text-sm font-medium ${isLate ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}>
      {isLate ? "🟠 Marked LATE" : "🟢 PRESENT"}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}