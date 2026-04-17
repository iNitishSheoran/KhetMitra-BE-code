const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  soilTemp: Number,
  soilMoist: Number,
  soilPH: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  bmpTemp: Number,
  pressure: Number,
  altitude: Number,
  ds18b20Temp: Number,
  rain: Number,
  ldr: Number,
  button: Number,
  voltage: Number,
  createdAt: { type: Date, default: Date.now },
});

const Sensor = mongoose.model("Sensor", sensorSchema);

module.exports = Sensor;
