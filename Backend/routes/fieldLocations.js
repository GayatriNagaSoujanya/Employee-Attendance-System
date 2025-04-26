// routes/fieldLocations.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const axios = require("axios");

/**
 * GET /
 *   ?date=YYYY-MM-DD
 * List all field_locations for a given date
 */
router.get("/", (req, res) => {
  const { date } = req.query;
  const sql = "SELECT * FROM field_locations WHERE date = ?";
  db.query(sql, [date], (err, results) => {
    if (err) {
      console.error("DB Error fetching locations:", err);
      return res.status(500).json({ message: "DB Error" });
    }
    res.json(results);
  });
});

/**
 * POST /
 * { officer_name, location_name, date }
 * Geocode the submitted location_name, store lat/lng + date
 */
router.post("/", async (req, res) => {
  const { officer_name, location_name, date } = req.body;
  try {
    const geoRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: location_name,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (geoRes.data.status !== "OK" || !geoRes.data.results.length) {
      return res.status(400).json({ message: "Invalid location name" });
    }

    const { lat, lng } = geoRes.data.results[0].geometry.location;

    const sql =
      "INSERT INTO field_locations (officer_name, location_name, latitude, longitude, date) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [officer_name, location_name, lat, lng, date], (err) => {
      if (err) {
        console.error("DB Insert Failed:", err);
        return res.status(500).json({ message: "Insert Failed" });
      }
      res.json({ message: "Location added", lat, lng });
    });
  } catch (err) {
    console.error("Geocoding failed:", err);
    res.status(500).json({ message: "Geocoding failed" });
  }
});

/**
 * PUT /:id
 * { location_name }
 * Re-geocode a changed location_name and update lat/lng
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { location_name } = req.body;

  try {
    const geoRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: location_name,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (geoRes.data.status !== "OK" || !geoRes.data.results.length) {
      return res.status(400).json({ message: "Invalid location name" });
    }

    const { lat, lng } = geoRes.data.results[0].geometry.location;

    const sql =
      "UPDATE field_locations SET location_name = ?, latitude = ?, longitude = ? WHERE id = ?";
    db.query(sql, [location_name, lat, lng, id], (err) => {
      if (err) {
        console.error("DB Update Failed:", err);
        return res.status(500).json({ message: "Update Failed" });
      }
      res.json({ message: "Location updated", lat, lng });
    });
  } catch (err) {
    console.error("Geocoding failed:", err);
    res.status(500).json({ message: "Geocoding failed" });
  }
});

/**
 * DELETE /:id
 * Remove a field_locations entry by its PK
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM field_locations WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("DB Delete Failed:", err);
      return res.status(500).json({ message: "Delete Failed" });
    }
    res.json({ message: "Location deleted" });
  });
});

module.exports = router;
