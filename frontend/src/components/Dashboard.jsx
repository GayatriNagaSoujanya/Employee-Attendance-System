import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        Welcome to the Attendance Dashboard{" "}
        {role === "admin" && <span style={styles.adminBadge}>Admin</span>}
      </h2>

      <div style={styles.cardContainer}>
        {role !== "admin" && (
          <>
            <div style={styles.card} onClick={() => navigate("/attendance")}>
              📍 Mark Attendance
            </div>
            <div style={styles.card} onClick={() => navigate("/leave")}>
              📝 Leave Request
            </div>
            <div style={styles.card} onClick={() => navigate("/leave/status")}>
              📄 Leave Status
            </div>
            <div style={styles.card} onClick={() => navigate("/attendance/history")}>
              📜 Attendance History
            </div>
          </>
        )}

        {role === "admin" && (
          <>
            <div style={styles.card} onClick={() => navigate("/admin/leave-panel")}>
              🗂️ Admin Leave Panel
            </div>
            <div style={styles.card} onClick={() => navigate("/admin/geo-alerts")}>
              📌 Geo-fence Alerts
            </div>
            <div style={styles.card} onClick={() => navigate("/field-locations")}>
              📝 Field Location Manager
            </div>
            <div style={styles.card} onClick={() => navigate("/admin/attendance-history")}>
              👥 Admin Attendance History
            </div>
            <div style={styles.card} onClick={() => navigate("/admin/leave-report")}>
              📑 Admin Leave Report
            </div>
          </>
        )}

        <div style={styles.card} onClick={handleLogout}>
          🚪 Logout
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    maxWidth: "900px",
    margin: "40px auto",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  adminBadge: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    padding: "20px",
    textAlign: "center",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};

export default Dashboard;
