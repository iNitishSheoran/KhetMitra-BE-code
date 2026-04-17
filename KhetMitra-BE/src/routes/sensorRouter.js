const express = require("express");
// const Sensor = require("../models/sensor");
const Sensor = require("../models/Sensor");


const router = express.Router();

/**
 * 🔐 API KEY MIDDLEWARE (ONLY FOR ESP)
 */
const verifySensorApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.SENSOR_API_KEY) {
    return res.status(401).json({ error: "Unauthorized device" });
  }

  next();
};

/**
 * 📥 Save sensor data (ESP → Backend)
 * 🔐 Protected by API key
 */
router.post("/", verifySensorApiKey, async (req, res) => {
  try {
    if (!req.body.deviceId) {
      return res.status(400).json({ error: "deviceId is required" });
    }

    const data = {
      deviceId: req.body.deviceId,
      soilTemp: req.body.soilTemp,
      soilMoist: req.body.soilMoist,
      soilPH: req.body.soilPH,
      nitrogen: req.body.nitrogen,
      phosphorus: req.body.phosphorus,
      potassium: req.body.potassium,
      bmpTemp: req.body.bmpTemp,
      pressure: req.body.pressure,
      altitude: req.body.altitude,
      ds18b20Temp: req.body.ds18b20Temp,
      rain: req.body.rain,
      ldr: req.body.ldr,
      button: req.body.button,
      voltage: req.body.voltage,
    };

    await Sensor.create(data);

    console.log("📥 Sensor Data Saved for device:", req.body.deviceId);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving sensor data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 📤 Get latest sensor data for a specific device
 * ❌ NO API KEY REQUIRED
 */
router.get("/latest/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    const latest = await Sensor.findOne({ deviceId }).sort({ createdAt: -1 });

    if (!latest) {
      return res.json({ success: false, message: `No data found for device: ${deviceId}`, data: null });
    }

    const now = new Date();
    const lastUpdate = new Date(latest.createdAt);
    const diffSec = (now - lastUpdate) / 1000; // seconds

    const isDisconnected = diffSec > 10; // e.g., if last data older than 10s, consider disconnected

    res.json({
      success: true,
      data: latest,
      disconnected: isDisconnected
    });
  } catch (err) {
    console.error("❌ Error fetching latest sensor data:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
