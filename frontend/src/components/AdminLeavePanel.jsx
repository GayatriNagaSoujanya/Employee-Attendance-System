import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminLeavePanel = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/leave-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleAction = async (id, newStatus) => {
    let approvedDays = null;

    if (newStatus === "Partially Approved") {
      const days = prompt("Enter number of days approved:");
      if (!days || isNaN(days) || days <= 0) {
        alert("Please enter a valid number of approved days.");
        return;
      }
      approvedDays = parseInt(days, 10);
    }

    try {
      await axios.post(`http://localhost:5000/admin/leave-requests/${id}`, {
        status: newStatus,
        approved_days: approvedDays,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchLeaveRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const updateFinalDays = async (id, finalDays, approvedDays) => {
    finalDays = parseInt(finalDays, 10);
    if (isNaN(finalDays) || finalDays <= 0 || finalDays > approvedDays) {
      alert("Invalid final days taken. It must be less than or equal to approved days.");
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/admin/leave-requests/${id}/final-days`, {
        final_days_taken: finalDays,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchLeaveRequests(); // Refresh UI
    } catch (error) {
      console.error("Error updating final days:", error);
      alert("Failed to update final leave days.");
    }
  };
  

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Leave Approval Panel</h2>
      {leaveRequests.length === 0 ? (
        <p style={styles.message}>No leave requests to review.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee ID</th>
              <th style={styles.th}>Employee Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Requested Days</th>
              <th style={styles.th}>Approved Days</th>
              <th style={styles.th}>Final Days Taken</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((req) => (
              <tr key={req.id}>
                <td style={styles.td}>{req.employee_id}</td>
                <td style={styles.td}>{req.employee_name}</td>
                <td style={styles.td}>{req.leave_type}</td>
                <td style={styles.td}>{req.start_date}</td>
                <td style={styles.td}>{req.end_date}</td>
                <td style={styles.td}>{req.days}</td>
                <td style={styles.td}>{req.approved_days ?? "-"}</td>
                <td style={styles.td}>
                  {["Approved", "Partially Approved"].includes(req.status) ? (
                    <>
                      <input
                        type="number"
                        min={1}
                        max={req.approved_days}
                        placeholder="Enter"
                        defaultValue={req.final_days_taken ?? ""}
                        style={{ width: "60px", textAlign: "center" }}
                        onBlur={(e) =>
                          updateFinalDays(req.id, e.target.value, req.approved_days)
                        }
                      />
                    </>
                  ) : (
                    req.final_days_taken ?? "-"
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ color: statusColor(req.status) }}>{req.status}</span>
                </td>
                <td style={styles.td}>
                  {req.status === "Pending" ? (
                    <div style={styles.buttonGroup}>
                      <button style={styles.btnApprove} onClick={() => handleAction(req.id, "Approved")}>Approve</button>
                      <button style={styles.btnPartial} onClick={() => handleAction(req.id, "Partially Approved")}>Partial</button>
                      <button style={styles.btnReject} onClick={() => handleAction(req.id, "Rejected")}>Reject</button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};  

const statusColor = (status) => {
  switch (status) {
    case "Approved":
      return "#2e7d32";
    case "Partially Approved":
      return "#ff9800";
    case "Rejected":
      return "#d32f2f";
    default:
      return "#000";
  }
};

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "1000px",
    margin: "40px auto",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "20px",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "10px",
    border: "1px solid #ccc",
  },
  td: {
    padding: "10px",
    border: "1px solid #ccc",
    textAlign: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
  },
  btnApprove: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnPartial: {
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnReject: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    color: "#666",
  },
};

export default AdminLeavePanel;
