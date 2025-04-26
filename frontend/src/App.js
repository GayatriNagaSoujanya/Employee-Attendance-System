import React from "react";
import {  Routes, Route, Navigate } from "react-router-dom";
// Auth Components
import Register from "./components/Register";
import Login from "./components/Login";

// User Components
//import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import LeaveRequest from "./components/LeaveRequest";
import LeaveStatusViewer from "./components/LeaveStatusViewer";
import Attendance from "./components/Attendance";
import AttendanceReport from "./components/PayrollReport";
import EmployeeHistoryView from "./components/EmployeeHistoryView";

// Admin Components
import AdminLeavePanel from "./components/AdminLeavePanel";
import GeoFenceAlerts from "./components/GeoFenceAlerts";
import FieldLocationManager from './components/FieldLocationManager';
import AdminAttendanceHistory from "./components/AdminAttendanceHistory";
import AdminLeaveReport from "./components/AdminLeaveReport";





/* Middleware components
const AdminOnlyRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/login" />;
};

const EmployeeOnlyRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  return role === "employee" ? children : <Navigate to="/login" />;
};*/

// Private route wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/register" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <Attendance />
          </PrivateRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <PrivateRoute>
            <LeaveRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/leave/status"
        element={
          <PrivateRoute>
            <LeaveStatusViewer />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance/report"
        element={
          <PrivateRoute>
            <AttendanceReport />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/leave-panel"
        element={
          <PrivateRoute>
            <AdminLeavePanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance/history"
        element={
          <PrivateRoute>
            <EmployeeHistoryView />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/geo-alerts"
        element={
          <PrivateRoute>
            <GeoFenceAlerts />
          </PrivateRoute>
        }
      />
      <Route
        path="/field-locations"
        element={
          <PrivateRoute>
            <FieldLocationManager />
          </PrivateRoute>
        }
      />
      <Route
          path="/admin/attendance-history"
          element={
            <PrivateRoute>
                <AdminAttendanceHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/leave-report"
          element={
            <PrivateRoute>
                <AdminLeaveReport />
            </PrivateRoute>
          }
        />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;






