import React, { useState, useEffect, useCallback } from "react";

const EmployeeHistoryView = () => {
  const [historyData, setHistoryData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:5000/attendance/history`;
      if (startDate && endDate) {
        url += `?start=${startDate}&end=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance history");
      }

      const data = await response.json();

      const formatted = data.map((record, idx) => ({
        id: idx + 1,
        date: record.check_in.split("T")[0],
        employeeId: `EMP${String(record.employee_id).padStart(3, "0")}`,
        checkIn: new Date(record.check_in).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        checkOut: record.check_out
          ? new Date(record.check_out).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        location:
          record.check_in_location_name ||
          record.check_out_location_name ||
          "N/A",
      }));

      setHistoryData(formatted);
    } catch (err) {
      setError(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ... (rest of the code is unchanged)


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Attendance History</h2>

      <div style={styles.filterRow}>
        <div>
          <label>Start Date: </label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date: </label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={fetchHistory} style={styles.filterButton}>Filter</button>
      </div>

      {loading ? (
        <p style={styles.message}>Loading...</p>
      ) : error ? (
        <p style={styles.message}>{error}</p>
      ) : historyData.length === 0 ? (
        <p style={styles.message}>No attendance records found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Employee ID</th>
              <th style={styles.th}>Check-In</th>
              <th style={styles.th}>Check-Out</th>
              <th style={styles.th}>Location</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((record) => (
              <tr key={record.id}>
                <td style={styles.td}>{record.date}</td>
                <td style={styles.td}>{record.employeeId}</td>
                <td style={styles.td}>{record.checkIn}</td>
                <td style={styles.td}>{record.checkOut}</td>
                <td style={styles.td}>{record.location}</td>
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
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "900px",
    margin: "40px auto",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "20px",
    textAlign: "center",
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  filterButton: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
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
  message: {
    textAlign: "center",
    color: "#666",
  },
};

export default EmployeeHistoryView;
