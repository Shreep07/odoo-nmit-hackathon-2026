import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/attendance", label: "Attendance" },
  { to: "/leave", label: "Leave" },
  { to: "/payroll", label: "Payroll" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
          <div className="px-5 py-6">
            <h1 className="text-lg font-semibold text-gray-900">Dayflow</h1>
            <p className="text-xs text-gray-400">Employee</p>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 pb-6">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Page content */}
        
        <main className="flex-1">
          <div className="flex justify-end items-center px-6 py-4 border-b border-gray-100 bg-white">
            <NotificationBell />
          </div>
          {children}
        </main>

      </div>
    </div>
  );
}