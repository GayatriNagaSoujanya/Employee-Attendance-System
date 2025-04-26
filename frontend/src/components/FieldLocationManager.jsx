import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const FieldLocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newLocation, setNewLocation] = useState({
    officer_name: "",
    location_name: "",
    latitude: "",
    longitude: "",
  });

  // Fetch locations for selected date
  const fetchLocations = useCallback(() => {
    axios
      .get(`http://localhost:5000/api/field-locations?date=${date}`)
      .then((res) => setLocations(res.data))
      .catch((err) => console.error("Error fetching locations", err));
  }, [date]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Fetch officer name when officer_name changes
  useEffect(() => {
    if (newLocation.officer_name.trim()) {
      // Use officer_name directly, assuming officer name is provided
    } else {
      setNewLocation((prev) => ({ ...prev, officer_name: "" }));
    }
  }, [newLocation.officer_name]);

  const handleAddLocation = () => {
    axios
      .post("http://localhost:5000/api/field-locations", {
        officer_name: newLocation.officer_name,
        location_name: newLocation.location_name,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        date,
      })
      .then(() => {
        fetchLocations();
        setNewLocation({
          officer_name: "",
          location_name: "",
          latitude: "",
          longitude: "",
        });
      })
      .catch((err) => console.error("Error adding location", err));
  };

  const handleDeleteLocation = (id) => {
    axios
      .delete(`http://localhost:5000/api/field-locations/${id}`)
      .then(() => fetchLocations())
      .catch((err) => console.error("Error deleting location", err));
  };

  const styles = {
    container: {
      backgroundColor: "#ffffff",
      color: "#1b5e20",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      maxWidth: "800px",
      margin: "auto",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    heading: {
      color: "#2e7d32",
    },
    input: {
      margin: "5px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      width: "calc(100% - 20px)",
    },
    button: {
      marginTop: "10px",
      padding: "10px 20px",
      backgroundColor: "#2e7d32",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    card: {
      backgroundColor: "#f1f8e9",
      border: "1px solid #c8e6c9",
      borderRadius: "10px",
      padding: "10px",
      margin: "10px 0",
    },
    label: {
      display: "block",
      margin: "10px 0 5px",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Manage Field Officer Locations</h2>

      <label style={styles.label}>
        Date:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
        />
      </label>

      <h3 style={styles.heading}>Add New Location</h3>
      <input
        style={styles.input}
        placeholder="Officer Name"
        value={newLocation.officer_name}
        onChange={(e) => setNewLocation({ ...newLocation, officer_name: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Location Name"
        value={newLocation.location_name}
        onChange={(e) => setNewLocation({ ...newLocation, location_name: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Latitude"
        value={newLocation.latitude}
        onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Longitude"
        value={newLocation.longitude}
        onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
      />
      <button style={styles.button} onClick={handleAddLocation}>
        Add Location
      </button>

      <h3 style={styles.heading}>Existing Locations</h3>
      {locations.map((loc) => (
        <div key={loc.id} style={styles.card}>
          <div><strong>Officer Name:</strong> {loc.officer_name}</div>
          <div><strong>Location Name:</strong> {loc.location_name}</div>
          <div><strong>Latitude:</strong> {loc.latitude}</div>
          <div><strong>Longitude:</strong> {loc.longitude}</div>
          <div><strong>Date:</strong> {loc.date}</div>
          <button
            style={{ ...styles.button, backgroundColor: "#c62828", marginTop: "10px" }}
            onClick={() => handleDeleteLocation(loc.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default FieldLocationManager;
