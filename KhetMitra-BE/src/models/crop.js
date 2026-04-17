const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // each crop should be unique
      trim: true,
    },
    npk: {
      N: { type: [Number], required: true }, // e.g. [80,160]
      P: { type: [Number], required: true },
      K: { type: [Number], required: true },
    },
    temperature_c: { type: [Number], required: true },
    humidity_percent: { type: [Number], required: true },
    soil_moisture_percent: { type: [Number], required: true },
    ph: { type: [Number], required: true },
    ec_ds_m: { type: [Number], required: true },
    notes: { type: String, trim: true },
    sources: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const Crop = mongoose.model("Crop", cropSchema);

module.exports = Crop;
