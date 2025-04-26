import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [employeeID, setEmployeeID] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false); // for optional loading indicator
  const navigate = useNavigate();

  const handleEmployeeIDChange = async (e) => {
    const id = e.target.value;
    setEmployeeID(id);

    if (id.trim().length > 0) {
      try {
        setLoadingEmail(true);
        const res = await axios.get(`http://localhost:5000/employee/${id}/email`);
        setEmail(res.data.email);
      } catch (err) {
        console.error(err);
        setEmail(""); // Clear email if not found
      } finally {
        setLoadingEmail(false);
      }
    } else {
      setEmail(""); // Clear if EmployeeID is empty
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { employee_id: employeeID, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("employee_id", res.data.employee_id || employeeID);

      setMessage("Login successful!");
      if (onLogin) onLogin(res.data.role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Employee Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Employee ID"
          style={styles.input}
          value={employeeID}
          onChange={handleEmployeeIDChange} // updated this
          required
        />
        <input
          type="email"
          placeholder={loadingEmail ? "Fetching Email..." : "Email"}
          style={styles.input}
          value={email}
          readOnly // now readonly, so user cannot manually type
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            style={{ ...styles.input, paddingRight: "50px" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={styles.toggleBtn}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button type="submit" style={styles.button}>
          Login
        </button>
        {message && (
          <p style={{ color: message.includes("successful") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    margin: "50px auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    color: "#2e7d32",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "100%",
  },
  button: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  toggleBtn: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#2e7d32",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;
