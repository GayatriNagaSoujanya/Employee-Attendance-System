# 🕒 Employee Attendance System

A full-stack web application for managing employee attendance with selfie verification, GPS tracking, geo-fencing, leave management, and payroll reporting. Built using **React** for frontend, **Express.js + MySQL** for backend, and supports **field staff location handling** with **admin approval flow**.

---

## 🚀 Features

- 📍 **GPS-based Attendance Check-In/Out**
- 📸 **Selfie Capture for Verification**
- 🧭 **Geo-fencing Alerts for Admins**
- 🗓️ **Leave Requests with Admin Approval Panel**
- 🧾 **Payroll Report Generation**
- 🔍 **Employee Attendance History Viewer**
- 🗂️ **Role-based Views (Admin & Employee)**
- 📌 **Field Officer Location Management**

---

## 📁 Tech Stack

| Tech         | Description                   |
|--------------|-------------------------------|
| React        | Frontend UI (Mobile-first)    |
| Node.js      | Backend runtime               |
| Express.js   | Backend server framework      |
| MySQL        | Relational Database           |
| Multer       | File uploads (selfie images)  |
| JWT          | Authentication (token-based)  |
| Google Maps API | Reverse geocoding         |

---

## 📸 Screenshots

> *(Add screenshots or a short video demo here)*

---

## ⚙️ Installation

### Prerequisites

- Node.js (v16+)
- MySQL Server
- Git

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/GayatriNagaSoujanya/employee-attendance-system.git
cd employee-attendance-system
```

### 2️⃣ Backend Setup (/server)

```bash
cd server
npm install
```

##  ⚙️ Environment Variables
Create a .env file inside /server and add:
```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=attendance_system
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

##  🔧 Database Setup
Run the SQL file to create the database and tables.
```bash
-- Run this in your MySQL client
CREATE DATABASE attendance_system;
-- Import your schema and seed data if available
```
## 🚀 Start the Backend Server
```bash
node server.js
```
