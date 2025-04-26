import React, { useEffect, useState } from "react";

const LeaveStatusViewer = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveStatus = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/leave/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
  
      const data = await response.json();
      setLeaveRequests(data.leaveRequests || []);  // ✅ CORRECTED LINE
    } catch (error) {
      console.error("Failed to fetch leave status:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchLeaveStatus();
  }, []);
  

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Leave Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : leaveRequests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave, index) => (
              <tr key={index}>
                <td style={styles.td}>{leave.type}</td>
                <td style={styles.td}>{leave.start_date}</td>
                <td style={styles.td}>{leave.end_date}</td>
                <td style={{ ...styles.td, color: getStatusColor(leave.status) }}>
                  {leave.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "green";
    case "denied":
      return "red";
    case "pending":
      return "orange";
    default:
      return "black";
  }
};

const styles = {
  container: {
    backgroundColor: "#e6ffee",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 10px #ccc",
    maxWidth: "800px",
    margin: "20px auto",
    fontFamily: "sans-serif",
  },
  heading: {
    textAlign: "center",
    color: "#006600",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#ccffcc",
    padding: "10px",
    border: "1px solid #999",
  },
  td: {
    padding: "10px",
    border: "1px solid #999",
    textAlign: "center",
  },
};

export default LeaveStatusViewer;
