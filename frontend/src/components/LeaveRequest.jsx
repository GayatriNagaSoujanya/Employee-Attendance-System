import React, { useState, useEffect } from "react";

const LeaveRequest = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await fetch("http://localhost:5000/leave-types");
        if (!response.ok) throw new Error("Failed to fetch leave types");

        const data = await response.json();
        if (Array.isArray(data)) {
          setLeaveTypes(data);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching leave types:", err);
        setHasError(true);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const request = {
      leave_type_id: leaveTypeId,  // send ID instead of name
      start_date: fromDate,
      end_date: toDate,
    };

    try {
      const response = await fetch("http://localhost:5000/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Leave request submitted successfully.");
        setFromDate("");
        setToDate("");
        setLeaveTypeId("");
      } else {
        setMessage("Failed to submit leave request: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("An error occurred. Please try again later.");
    }
  };

  if (hasError) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Leave Request Form</h2>
        <p style={{ color: "red", textAlign: "center" }}>
          Failed to load leave types. Please refresh or contact admin.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Leave Request Form</h2>
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>From Date:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>To Date:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Leave Type:</label>
        <select
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(parseInt(e.target.value))}

          required
          style={styles.input}
        >
          <option value="">-- Select Leave Type --</option>
          {leaveTypes.map((leave) => (
            <option key={leave.id} value={leave.id}>
              {leave.name}
            </option>
          ))}
        </select>

        <button type="submit" style={styles.button}>
          Submit Request
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "600px",
    margin: "40px auto",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "20px",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginTop: "15px",
    fontWeight: "bold",
    color: "#333333",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  message: {
    marginTop: "20px",
    color: "#1b5e20",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default LeaveRequest;
