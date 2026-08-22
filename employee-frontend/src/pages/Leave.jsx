import { useEffect, useState } from "react";
import client from "../api/client";

export default function Leave() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [leaveType, setLeaveType] = useState("sick");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  function loadHistory() {
    client
      .get("/employee/leave/history")
      .then((res) => setHistory(res.data.requests))
      .catch(() => setError("Could not load leave history"));
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function calculateDays(start, end) {
    if (!start || !end) return 1;
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? diff + 1 : 1;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await client.post("/employee/leave/apply", {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days: calculateDays(startDate, endDate),
        reason,
      });
      setSuccess("Leave request submitted");
      setStartDate("");
      setEndDate("");
      setReason("");
      loadHistory();
    } catch {
      setError("Could not submit leave request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Leave</h1>

        {/* Apply form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
        >
          <h2 className="text-sm font-medium text-gray-900">New Leave Request</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="sick">Sick Leave</option>
              <option value="paid">Paid Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Feeling unwell"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          <h2 className="text-sm font-medium text-gray-900 px-5 py-4">Leave History</h2>
          {history.length === 0 && (
            <p className="text-sm text-gray-400 px-5 py-4">No leave requests yet.</p>
          )}
          {history.map((r) => (
            <div key={r.id} className="flex justify-between items-center px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">{r.leave_type} Leave</p>
                <p className="text-xs text-gray-500">
                  {r.start_date} → {r.end_date} • {r.days} day{r.days > 1 ? "s" : ""}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${styles[status] || "bg-gray-50 text-gray-700"}`}>
      {status}
    </span>
  );
}