import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminLeaveReport = () => {
  const [leaveReport, setLeaveReport] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/leave-report", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setLeaveReport(res.data))
      .catch((err) =>
        console.error("Error fetching leave report:", err)
      );
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
        Leave Requests Report
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
              <th style={thStyle}>Leave ID</th>
              <th style={thStyle}>Employee ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>From</th>
              <th style={thStyle}>To</th>
              <th style={thStyle}>Total Days</th>
              <th style={thStyle}>Approved Days</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Final Days Taken</th>

            </tr>
          </thead>
          <tbody>
            {leaveReport.map((req) => (
              <tr
                key={req.id}
                style={{ borderBottom: "1px solid #e2e8f0" }}
              >
                <td style={tdStyle}>{req.id}</td>
                <td style={tdStyle}>{req.employee_id}</td>
                <td style={tdStyle}>{req.name}</td>
                <td style={tdStyle}>{req.type}</td>
                <td style={tdStyle}>{req.start_date}</td>
                <td style={tdStyle}>{req.end_date}</td>
                <td style={tdStyle}>{req.total_days}</td>
                <td style={tdStyle}>
                  {req.approved_days !== null &&
                  req.approved_days !== undefined
                    ? req.approved_days
                    : "-"}
                </td>
                <td style={tdStyle}>{req.status}</td>
                <td style={tdStyle}>
  {req.final_days_taken !== null && req.final_days_taken !== undefined
    ? req.final_days_taken
    : "-"}
</td>

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

export default AdminLeaveReport;
