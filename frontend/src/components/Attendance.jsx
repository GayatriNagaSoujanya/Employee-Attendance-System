import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Attendance = () => {
  const [location, setLocation] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const getLocation = () => {
    setLocation(null); // reset previous location
    if (!navigator.geolocation) {
      setModalOpen(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setModalOpen(false);
      },
      () => {
        setModalOpen(true);
      }
    );
  };

  useEffect(() => {
    getLocation();
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const captureSelfie = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      setCaptured(true);
    }
  };

  const handleAttendance = async (type) => {
    if (!location) {
      setStatus("📍 Location not available. Please enable location services.");
      return;
    }
    if (!captured) {
      setStatus("📸 Please capture a selfie to continue.");
      return;
    }

    const canvas = canvasRef.current;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));

    const formData = new FormData();
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("selfie", blob, "selfie.jpg");

    try {
      const res = await axios.post(
        `http://localhost:5000/attendance/${type}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStatus(res.data.message + (res.data.location ? ` (${res.data.location})` : ""));
      setCaptured(false);
    } catch (err) {
      setStatus(err.response?.data?.message || "❌ Error marking attendance.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📍 Attendance</h2>

      <video ref={videoRef} autoPlay style={styles.video} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={styles.buttonRow}>
        <button style={styles.button} onClick={captureSelfie}>
          📸 Capture Selfie
        </button>
      </div>

      {captured && (
        <div style={styles.previewContainer}>
          <img src={canvasRef.current?.toDataURL()} alt="Captured Selfie" style={styles.previewImage} />
        </div>
      )}

      <div style={styles.buttonRow}>
        <button style={styles.button} onClick={() => handleAttendance("checkin")}>
          ✅ Check-In
        </button>
        <button style={styles.button} onClick={() => handleAttendance("checkout")}>
          🔁 Check-Out
        </button>
      </div>

      {status && <p style={styles.status}>{status}</p>}

      {modalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>⚠ Location Access Needed</h3>
            <p>You need to enable location services to mark your attendance.</p>
            <p>Please check your browser settings and allow location access.</p>
            <button style={styles.modalButton} onClick={getLocation}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#f9fdf9",
    boxShadow: "0 4px 10px rgba(0, 128, 0, 0.1)",
    fontFamily: "sans-serif",
    marginTop: "30px",
  },
  heading: {
    textAlign: "center",
    color: "#2e7d32",
    marginBottom: "20px",
  },
  video: {
    width: "100%",
    borderRadius: "12px",
    marginBottom: "10px",
  },
  previewContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
  },
  previewImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid #4caf50",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#4caf50",
    border: "none",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1,
  },
  status: {
    marginTop: "20px",
    color: "#1b5e20",
    fontWeight: "bold",
    textAlign: "center",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "300px",
  },
  modalButton: {
    marginTop: "15px",
    backgroundColor: "#388e3c",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Attendance;
