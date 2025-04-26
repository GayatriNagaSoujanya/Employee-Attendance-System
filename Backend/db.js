// Backend/db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "attendance_system"
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅Connected to MySQL Database.");
});

module.exports = db;
