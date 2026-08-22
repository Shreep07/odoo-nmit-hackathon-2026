import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Profile from "./pages/Profile";
import Leave from "./pages/Leave";
import Attendance from "./pages/Attendance";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Payroll from "./pages/Payroll";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <Layout>
                <Leave />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute>
               <Layout>
                 <Payroll />
               </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}