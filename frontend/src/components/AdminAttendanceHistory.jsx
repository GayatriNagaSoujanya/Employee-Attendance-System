import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAttendanceHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/attendance-history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Error fetching attendance history:", err));
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0fff4",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#2f855a", marginBottom: "20px", fontSize: "24px" }}>
        All Employees Attendance History
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead style={{ backgroundColor: "#38a169", color: "white" }}>
            <tr>
              <th style={thStyle}>Employee ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Check-In</th>
              <th style={thStyle}>Check-Out</th>
              <th style={thStyle}>Check-In Location</th>
              <th style={thStyle}>Check-Out Location</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr
                key={record.employee_id + record.check_in}
                style={{ borderBottom: "1px solid #e2e8f0" }}
              >
                <td style={tdStyle}>{record.employee_id}</td>
                <td style={tdStyle}>{record.name}</td>
                <td style={tdStyle}>{record.check_in}</td>
                <td style={tdStyle}>{record.check_out}</td>
                <td style={tdStyle}>{record.check_in_location_name}</td>
                <td style={tdStyle}>{record.check_out_location_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: "bold",
  fontSize: "14px",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  color: "#2d3748",
};

export default AdminAttendanceHistory;
