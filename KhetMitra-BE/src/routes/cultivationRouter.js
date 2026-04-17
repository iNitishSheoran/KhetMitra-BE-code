const express = require("express");
const cultivationRouter = express.Router();
const Cultivation = require("../models/cultivation");
const { userAuth } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { validateCultivationData } = require("../utils/validation");

// ✅ Bulk Insert Cultivation Data (Admin only)
cultivationRouter.post("/add", userAuth, isAdmin, async (req, res) => {
  try {
    const cultivations = req.body;

    if (!Array.isArray(cultivations)) {
      return res.status(400).json({
        success: false,
        message: "❌ Data must be an array of cultivation entries",
      });
    }

    // Validate each cultivation entry
    cultivations.forEach(validateCultivationData);

    // Insert many documents
    const inserted = await Cultivation.insertMany(cultivations, { ordered: false });

    return res.status(201).json({
      success: true,
      message: "✅ Cultivation data inserted successfully",
      inserted: inserted.length,
      failed: cultivations.length - inserted.length,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "❌ Failed to insert cultivation data",
    });
  }
});

// Get all crop names (for dropdown)
cultivationRouter.get("/names", async (req, res) => {
  try {
    const crops = await Cultivation.find({}, "name_hi name_en").sort({ name_en: 1 });
    return res.json({ success: true, crops });
  } catch (err) {
    return res.status(500).json({ success: false, message: "❌ Failed to fetch crop names" });
  }
});

// Get cultivation details by crop name (Hindi or English)
cultivationRouter.get("/:name", async (req, res) => {
  try {
    const cropName = decodeURIComponent(req.params.name).trim();

    const crop = await Cultivation.findOne({
      $or: [
        { name_hi: new RegExp(`^${cropName}$`, "i") },
        { name_en: new RegExp(`^${cropName}$`, "i") },
      ],
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: "❌ Cultivation data not found for this crop" });
    }

    return res.json({ success: true, crop });
  } catch (err) {
    return res.status(500).json({ success: false, message: "❌ Error fetching cultivation data" });
  }
});

module.exports = cultivationRouter;
