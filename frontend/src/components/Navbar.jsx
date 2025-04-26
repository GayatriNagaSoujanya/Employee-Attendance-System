import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Attendance System</h2>
      <ul style={styles.navList}>
        {role === "employee" && (
          <>
            <li><Link to="/dashboard" style={styles.link}>Mark Attendance</Link></li>
            <li><Link to="/leave-request" style={styles.link}>Leave Request</Link></li>
            <li><Link to="/leave-status" style={styles.link}>Leave Status</Link></li>
            <li><Link to="/employee-history" style={styles.link}>Attendance History</Link></li>
            <li><Link to="/payroll" style={styles.link}>Attendance Report</Link></li>
          </>
        )}

        {role === "admin" && (
          <>
            <li><Link to="/admin/leave-panel" style={styles.link}>Leave Approvals</Link></li>
            <li><Link to="/admin/geo-alerts" style={styles.link}>Geo-Fence Alerts</Link></li>
          </>
        )}

        <li><button onClick={handleLogout} style={styles.logoutBtn}>Logout</button></li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    backgroundColor: "#2e7d32",
    color: "#fff",
    alignItems: "center",
  },
  logo: {
    margin: 0,
  },
  navList: {
    listStyle: "none",
    display: "flex",
    gap: "15px",
    margin: 0,
    padding: 0,
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  logoutBtn: {
    backgroundColor: "#d32f2f",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Navbar;
