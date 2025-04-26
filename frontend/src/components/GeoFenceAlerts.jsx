import React, { useEffect, useState } from "react";
import axios from "axios";

const GeoFenceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/admin/geo-alerts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAlerts(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch geo-fence alerts");
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "#2e7d32",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        maxWidth: "800px",
        margin: "30px auto",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Geo-Fence Alerts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : alerts.length === 0 ? (
        <p>No geo-fence alerts found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#e8f5e9" }}>
              <th style={thStyle}>Employee ID</th>
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Date & Time</th>
              <th style={thStyle}>Latitude</th>
              <th style={thStyle}>Longitude</th>
              <th style={thStyle}>Location</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={index} style={{ textAlign: "center" }}>
                <td style={tdStyle}>{alert.employee_id || "N/A"}</td>
                <td style={tdStyle}>{alert.name || "N/A"}</td>
                <td style={tdStyle}>{new Date(alert.alert_time).toLocaleString()}</td>
                <td style={tdStyle}>{alert.lat}</td>
                <td style={tdStyle}>{alert.lon}</td>
                <td style={tdStyle}>
  {alert.location_name ? (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        alert.location_name
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#2e7d32", textDecoration: "underline" }}
    >
      {alert.location_name}
    </a>
  ) : (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lon}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#2e7d32", textDecoration: "underline" }}
    >
      View on Map
    </a>
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

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

export default GeoFenceAlerts;
