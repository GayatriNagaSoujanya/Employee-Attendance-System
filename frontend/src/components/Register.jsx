import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    password: "",
    role: "office_staff",
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 added state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", formData);
      alert(response.data.message || "Registered successfully");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      alert(msg);
      if (msg.toLowerCase().includes("already registered")) {
        navigate("/login");
      }
    }
  };

  const handleAdminCode = () => {
    const code = prompt("Enter admin access code:");
    if (code === "ADMIN2025") {
      setShowAdmin(true);
      alert("Admin role unlocked.");
    } else {
      alert("Invalid code.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="employee_id"
          placeholder="Employee ID"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={styles.input}
          required
        />

        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            style={{ ...styles.input, marginBottom: 0 }}
            required
          />
          <span
            style={styles.toggleButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <select name="role" onChange={handleChange} style={styles.input} required>
          <option value="office_staff">Office Staff</option>
          <option value="field_staff">Field Staff</option>
          {showAdmin && <option value="admin">Admin</option>}
        </select>

        {!showAdmin && (
          <button type="button" onClick={handleAdminCode} style={styles.codeButton}>
            I have an admin code
          </button>
        )}

        <button type="submit" style={styles.button}>Register</button>
      </form>
      <p style={styles.loginText}>
        Already registered? <Link to="/login" style={styles.link}>Login here</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    marginTop: "60px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    color: "green",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "100%",
  },
  passwordWrapper: {
    position: "relative",
    marginBottom: "15px",
  },
  toggleButton: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
  codeButton: {
    padding: "8px",
    fontSize: "14px",
    backgroundColor: "#eee",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  loginText: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  },
  link: {
    color: "green",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default Register;
