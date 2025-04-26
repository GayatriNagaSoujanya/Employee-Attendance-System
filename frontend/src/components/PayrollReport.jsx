import React, { useState } from "react";

const AttendanceReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/attendance/report?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Attendance Report</h2>

      <div style={styles.filterContainer}>
        <label style={styles.label}>From:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />

        <label style={styles.label}>To:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />

        <button onClick={fetchReport} style={styles.button}>Generate Report</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : reportData.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Check-In</th>
              <th style={styles.th}>Check-Out</th>
              <th style={styles.th}>Hours Worked</th>
              <th style={styles.th}>Check-In Location</th>
              <th style={styles.th}>Check-Out Location</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((entry, index) => (
              <tr key={index}>
                <td style={styles.td}>{new Date(entry.check_in).toLocaleString()}</td>
                <td style={styles.td}>{entry.check_out ? new Date(entry.check_out).toLocaleString() : "N/A"}</td>
                <td style={styles.td}>{entry.hours_worked ?? 0}</td>
                <td style={styles.td}>{entry.check_in_location_name || "N/A"}</td>
                <td style={styles.td}>{entry.check_out_location_name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#f4fff8",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "900px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 0 10px #ccc",
  },
  heading: {
    textAlign: "center",
    color: "#2e7d32",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "5px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "6px 12px",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#ccffcc",
    padding: "10px",
    border: "1px solid #aaa",
  },
  td: {
    padding: "10px",
    border: "1px solid #aaa",
    textAlign: "center",
  },
};

export default AttendanceReport;
