require("dotenv").config();
const express = require("express");
//const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const fieldLocationsRoute = require("./routes/fieldLocations"); // adjust path if needed
const db = require("./db");


const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

/*const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "attendance_system",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL Database");
});*/

// Multer config

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("✅ Created 'uploads/' directory");
}


// Disk storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
});


// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Admin role verification
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  next();
};

// Distance calculator
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (angle) => (Math.PI / 180) * angle;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// SERVER.JS

// Register
app.post("/register", async (req, res) => {
  const { employee_id, name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    // include employee_id in the INSERT
    "INSERT INTO employees (employee_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
    [employee_id, name, email, hashedPassword, role],
    (err, result) => {
      if (err) {
        console.error("Registration error:", err);
        // if it's a duplicate-key error you can check err.code === 'ER_DUP_ENTRY'
        return res.status(500).json({ message: "Registration failed", error: err.message });
      }
      res.json({ message: "User Registered Successfully" });
    }
  );
});
// Get email by employee ID
app.get("/employee/:id/email", (req, res) => {
  const employeeId = req.params.id;
  db.query(
    "SELECT email FROM employees WHERE employee_id = ?",
    [employeeId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "Employee not found" });
      res.json({ email: results[0].email });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { email, password, employee_id } = req.body;  // 🛠️ Added employee_id
  
  db.query(
    "SELECT * FROM employees WHERE email = ? AND employee_id = ?", 
    [email, employee_id], 
    async (err, users) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (users.length === 0) return res.status(400).json({ message: "User not found or incorrect employee ID" });

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

      res.json({ token, userId: user.id, role: user.role });
    }
  );
});



// Attendance
app.post("/attendance/:type", verifyToken, upload.single("selfie"), async (req, res) => {
  const { type } = req.params;
  const { latitude, longitude } = req.body;
  const selfiePath = req.file ? req.file.path : null;
  const employeeId = req.user.id;

  console.log("Employee ID:", employeeId);
  console.log("Received coordinates:", latitude, longitude);

  if (!latitude || !longitude) {
    if (selfiePath) fs.unlinkSync(selfiePath);
    return res.status(400).json({ message: "Location data missing" });
  }

  // Get user role and name
  db.query("SELECT role, name FROM employees WHERE id = ?", [employeeId], async (err, userResults) => {
    if (err || userResults.length === 0) {
      console.error("User fetch failed", err);
      return res.status(500).json({ message: "User fetch failed" });
    }

    const { role, name } = userResults[0];
    console.log("User role:", role, "| Name:", name);

    let insideZone = false;

    // Helper: Final handler
    async function handleAttendance() {
      // ← here we pull directly from process.env.GOOGLE_MAPS_API_KEY
      let locationName = "";
      try {
        console.log("GOOGLE_MAPS_API_KEY:", process.env.GOOGLE_MAPS_API_KEY);

        const geo = await axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          {
            params: {
              latlng: `${latitude},${longitude}`,
              key: process.env.GOOGLE_MAPS_API_KEY
            },
          }
        );
        if (geo.data.results.length) {
          locationName = geo.data.results[0].formatted_address;
        } else {
          locationName = "Unknown Location";
        }
      } catch (err) {
        console.error("Error fetching location from Google:", err);
        locationName = "Unknown Location";
      }
    
      console.log("Inside Zone:", insideZone, "| Location Name:", locationName);
    
      if (!insideZone) {
        db.query(
          "INSERT INTO geo_alerts (employee_id, lat, lon, alert_time, location_name) VALUES (?, ?, ?, NOW(), ?)",
          [employeeId, latitude, longitude, locationName]
        );
        if (selfiePath) fs.unlinkSync(selfiePath);
        return res.status(403).json({ message: "Outside allowed check‑in area. Alert logged." });
      }
    
      const query =
        type === "checkin"
          ? "INSERT INTO attendance (employee_id, check_in, check_in_location, selfie_check_in, check_in_location_name) VALUES (?, NOW(), ST_GeomFromText(?), ?, ?)"
          : "UPDATE attendance SET check_out = NOW(), check_out_location = ST_GeomFromText(?), selfie_check_out = ?, check_out_location_name = ? WHERE employee_id = ? AND check_out IS NULL";
    
      const params =
        type === "checkin"
          ? [employeeId, `POINT(${latitude} ${longitude})`, selfiePath, locationName]
          : [`POINT(${latitude} ${longitude})`, selfiePath, locationName, employeeId];
    
      db.query(query, params, (err) => {
        if (err) {
          console.error("Attendance DB write error:", err);
          return res.status(500).json({ message: "Attendance write failed", error: err });
        }
        res.json({
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} recorded`,
          location: locationName
        });
      });
    }
    

    // Field Officer: Match against today's field locations
    if (role === "field_staff") {
      const today = new Date().toISOString().split("T")[0];
      db.query(
        "SELECT latitude, longitude FROM field_locations WHERE officer_name = ? AND date = ?",
        [name, today],
        async (err, locations) => {
          if (err) {
            console.error("Field locations fetch failed", err);
            return res.status(500).json({ message: "Field locations fetch failed" });
          }

          console.log("Matching against field locations for", name, "on", today, "=>", locations);

          const userLat = parseFloat(latitude);
          const userLon = parseFloat(longitude);

          for (const loc of locations) {
            const locLat = parseFloat(loc.latitude);
            const locLon = parseFloat(loc.longitude);
            const dist = haversineDistance(userLat, userLon, locLat, locLon);
            console.log(`→ Distance to (${locLat}, ${locLon}): ${dist.toFixed(2)}m`);
            if (dist <= 5000) {
              insideZone = true;
              break;
            }
          }
            //insideZone = true;

          handleAttendance();
        }
      );
    } else {
      // Office-based employee: Match against geofence zones
      db.query("SELECT lat, lon, radius FROM geofence_zones WHERE employee_id = ?", [employeeId], async (err, zones) => {
        if (err) {
          console.error("Geo-fence fetch failed", err);
          return res.status(500).json({ message: "Geo-fence fetch failed" });
        }

        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);

        for (const zone of zones) {
          const dist = haversineDistance(userLat, userLon, parseFloat(zone.lat), parseFloat(zone.lon));
          console.log(`→ Office zone distance: ${dist.toFixed(2)}m (allowed: ${zone.radius}m)`);
          if (dist <= zone.radius) {
            insideZone = true;
            break;
          }
        }
        //insideZone = true;

        handleAttendance();
      });
    }
  });
});



// Submit leave request
app.post("/leave", verifyToken, (req, res) => {
  const { leave_type_id, start_date, end_date } = req.body;
  console.log("Submitting leave request for:", req.user.id, leave_type_id, start_date, end_date);
db.query(
  "INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date) VALUES (?, ?, ?, ?)",
  [req.user.id, leave_type_id, start_date, end_date],
  (err, results) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ message: "Leave request submission failed", error: err });
    }
    console.log("Leave request submitted, ID:", results.insertId);
    res.json({ message: "Leave request submitted successfully", requestId: results.insertId });
  }
);
});

// View attendance history
app.get("/attendance/history", verifyToken, (req, res) => {
  db.query(
    "SELECT check_in, check_out, check_in_location_name, check_out_location_name FROM attendance WHERE employee_id = ? ORDER BY check_in DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch attendance history" });
      res.json(results);
    }
  );
});

// Payroll report
app.get("/attendance/report", verifyToken, (req, res) => {
  const { start_date, end_date } = req.query;
  db.query(
    "SELECT check_in, check_out, TIMESTAMPDIFF(HOUR, check_in, check_out) AS hours_worked, check_in_location_name, check_out_location_name FROM attendance WHERE employee_id = ? AND check_in BETWEEN ? AND ?",
    [req.user.id, start_date, end_date],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to generate report" });
      res.json(results);
    }
  );
});
// Example route in your Express backend
app.get("/leave-types", (req, res) => {
  db.query("SELECT id, name FROM leave_types", (err, results) => {
    if (err) {
      console.error("❌ Error fetching leave types:", err);
      return res.status(500).json({ message: "Failed to fetch leave types" });
    }
    res.json(results);
  });
});


// Admin: All leave requests
app.get("/admin/leave-requests", verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT 
        lr.id, 
        e.name AS employee_name, 
        lt.name AS leave_type, 
        lr.start_date, 
        lr.end_date, 
        lr.status, 
        DATEDIFF(lr.end_date, lr.start_date) + 1 AS days, 
        lr.approved_days 
     FROM leave_requests lr
     JOIN employees e ON lr.employee_id = e.id
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     ORDER BY lr.start_date DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch leave requests" });
      res.json(results);
    }
  );
});




//Admin Leave Approve/Deny/Partially Approve
app.post("/admin/leave-requests/:id", verifyToken, verifyAdmin, (req, res) => {
  const { status, approved_days } = req.body;
  const { id } = req.params;

  if (status === "Partially Approved") {
    if (!approved_days || isNaN(approved_days) || approved_days <= 0) {
      return res.status(400).json({ message: "Invalid number of approved days." });
    }

    db.query(
      "UPDATE leave_requests SET status = ?, approved_days = ? WHERE id = ?",
      [status, approved_days, id],
      (err) => {
        if (err) {
          console.error("Error updating partial approval:", err);
          return res.status(500).json({ message: "Failed to update leave request." });
        }
        res.json({ message: `Leave request partially approved.` });
      }
    );

  } else if (status === "Approved") {
    // Auto-calculate full days
    db.query(
      `UPDATE leave_requests 
       SET status = ?, approved_days = DATEDIFF(end_date, start_date) + 1 
       WHERE id = ?`,
      [status, id],
      (err) => {
        if (err) {
          console.error("Error approving leave request:", err);
          return res.status(500).json({ message: "Failed to update leave request." });
        }
        res.json({ message: `Leave request approved.` });
      }
    );

  } else {
    // Rejected
    db.query(
      "UPDATE leave_requests SET status = ?, approved_days = NULL WHERE id = ?",
      [status, id],
      (err) => {
        if (err) {
          console.error("Error rejecting leave request:", err);
          return res.status(500).json({ message: "Failed to update leave request." });
        }
        res.json({ message: `Leave request ${status.toLowerCase()}.` });
      }
    );
  }
});

app.put("/admin/leave-requests/:id/final-days", verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { final_days_taken } = req.body;

  if (!final_days_taken || isNaN(final_days_taken) || final_days_taken <= 0) {
    return res.status(400).json({ message: "Invalid final days taken." });
  }

  db.query(
    "UPDATE leave_requests SET final_days_taken = ? WHERE id = ?",
    [final_days_taken, id],
    (err, result) => {
      if (err) {
        console.error("Error updating final days taken:", err);
        return res.status(500).json({ message: "Failed to update final days taken." });
      }
      res.json({ message: "Final days taken updated successfully." });
    }
  );
});


// View personal leave status (for logged-in employee)
app.get("/leave/status", verifyToken, (req, res) => {
  db.query(
    `
    SELECT lt.name AS type, lr.start_date, lr.end_date, lr.status 
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = ?
    ORDER BY lr.start_date DESC
    `,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch leave status" });
      res.json({ leaveRequests: results });
    }
  );
});



app.get("/admin/geo-alerts", verifyToken, verifyAdmin, async (req, res) => {
  db.query(
    `SELECT ga.id, ga.employee_id, e.name, ga.lat, ga.lon, ga.alert_time, ga.location_name
     FROM geo_alerts ga
     JOIN employees e ON ga.employee_id = e.id
     ORDER BY ga.alert_time DESC`,
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch geo-fence alerts" });

      // For alerts with missing location_name, fetch from Google Maps
      const updatedResults = await Promise.all(
        results.map(async (alert) => {
          if (!alert.location_name || alert.location_name.trim() === "") {
            try {
              const { lat, lon } = alert;
              const geoRes = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_API_KEY}`
              );
              const location =
                geoRes.data.results[0]?.formatted_address || "Unknown location";

              // Optional: Update in DB for future optimization
              db.query(
                "UPDATE geo_alerts SET location_name = ? WHERE id = ?",
                [location, alert.id],
                (updateErr) => {
                  if (updateErr) console.error("Failed to update location_name", updateErr);
                }
              );

              alert.location_name = location;
            } catch (geoErr) {
              console.error("Error fetching location from Google:", geoErr.message);
              alert.location_name = "Unknown location";
            }
          }

          return alert;
        })
      );

      res.json(updatedResults);
    }
  );
});



app.use("/api/field-locations", fieldLocationsRoute);

// Admin: Get all employees attendance history
app.get("/admin/attendance-history", verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT a.employee_id, e.name, a.check_in, a.check_out, 
           a.check_in_location_name, a.check_out_location_name
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    ORDER BY a.check_in DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching attendance history:", err);
      return res.status(500).json({ message: "Failed to fetch attendance history" });
    }
    res.json(results);
  });
});

// Admin: Get leave requests report for all employees
app.get("/admin/leave-report", verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT 
  lr.id, 
  lr.employee_id, 
  e.name, 
  lt.name AS leave_type, 
  lr.start_date, 
  lr.end_date,
  DATEDIFF(lr.end_date, lr.start_date) + 1 AS total_days,
  lr.approved_days,
  lr.final_days_taken,
  lr.status
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.id
JOIN leave_types lt ON lr.leave_type_id = lt.id
ORDER BY lr.start_date DESC;

`;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching leave report:", err);
      return res.status(500).json({ message: "Failed to fetch leave report" });
    }
    res.json(results);
  });
});





// Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
