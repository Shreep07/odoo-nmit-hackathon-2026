import { useEffect, useState, useRef } from "react";
import client from "../api/client";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    loadNotifications();
    // close dropdown when clicking outside it
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const res = await client.get("/employee/leave/history");
      const items = res.data.requests
        .filter((r) => r.status === "approved" || r.status === "rejected")
        .map((r) => ({
          id: `leave-${r.id}`,
          text:
            r.status === "approved"
              ? `Your ${r.leave_type} leave (${r.start_date} → ${r.end_date}) was approved`
              : `Your ${r.leave_type} leave (${r.start_date} → ${r.end_date}) was rejected`,
          type: r.status === "approved" ? "success" : "error",
        }));
      setNotifications(items);
    } catch {
      setNotifications([]);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <span className="text-lg">🔔</span>
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Notifications</p>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-400 px-4 py-6 text-center">No new notifications</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 flex gap-2 items-start">
                <span className="mt-0.5">{n.type === "success" ? "🟢" : "🔴"}</span>
                <p className="text-sm text-gray-700">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}