const express = require("express");
const cropRouter = express.Router();
const Crop = require("../models/crop");
const Cultivation = require("../models/cultivation.js");
const { userAuth } = require("../middlewares/auth.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
const { validateCropData } = require("../utils/validation.js");

// Escape special characters in regex
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}



// ✅ Bulk Insert Crops (Admin only)
cropRouter.post("/add", userAuth, isAdmin, async (req, res) => {
  try {
    const crops = req.body;
    if (!Array.isArray(crops)) {
      return res.status(400).json({
        success: false,
        message: "डेटा ऐरे (array) में होना चाहिए | Data must be an array of crops",
      });
    }

    // Validate each crop
    crops.forEach(validateCropData);

    const inserted = await Crop.insertMany(crops, { ordered: false });
    return res.status(201).json({
      success: true,
      message: "✅ फसलें सफलतापूर्वक जोड़ी गईं | Crops added successfully",
      inserted: inserted.length,
      failed: crops.length - inserted.length,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "❌ फसल जोड़ने में असफल | Failed to insert crops",
    });
  }
});


// ✅ Get All Crops (names only) → for dropdown, only logged in users
cropRouter.get("/all", async (req, res) => {
  try {
    const crops = await Crop.find({}, "name").sort({ name: 1 });
    return res.json({
      success: true,
      crops,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "❌ फसलें लाने में त्रुटि | Failed to fetch crops",
    });
  }
});


// ✅ Get Crop + Cultivation details together
cropRouter.get("/details", async (req, res) => {
  try {
    const cropName = req.query.name?.trim();
    if (!cropName) {
      return res.status(400).json({ success: false, message: "❌ Crop name required" });
    }

    console.log("Searching crop for:", cropName);

    const escapedName = escapeRegex(cropName);

    // Find crop
    const crop = await Crop.findOne({ name: new RegExp(`^${escapedName}$`, "i") });
    if (!crop) {
      return res.status(404).json({ success: false, message: `Crop not found for ${cropName}` });
    }

    // Find cultivation data
    let cultivation = null;
    try {
      cultivation = await Cultivation.findOne({
        $or: [
          { name_hi: new RegExp(escapedName, "i") },
          { name_en: new RegExp(escapedName, "i") },
        ],
      });
    } catch (err) {
      console.warn("Cultivation search failed:", err.message);
      cultivation = null;
    }

    // Merge safely
    const merged = {
      ...crop.toObject(),
      ...(cultivation && typeof cultivation.toObject === "function"
        ? cultivation.toObject()
        : cultivation || {}),
    };

    return res.json({ success: true, crop: merged });
  } catch (err) {
    console.error("Crop + Cultivation route error:", err);
    return res.status(500).json({ success: false, message: "❌ Error fetching crop + cultivation data" });
  }
});






// ✅ Get Crop by Name → only logged in users
cropRouter.get("/:name", async (req, res) => {
  try {
    const cropName = req.params.name.trim();
    const escapedName = escapeRegex(cropName);
    const crop = await Crop.findOne({ name: new RegExp(`^${escapedName}$`, "i") });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "❌ यह फसल उपलब्ध नहीं है | Crop not found",
      });
    }

    return res.json({
      success: true,
      crop,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "❌ फसल डेटा लाने में त्रुटि | Error fetching crop data",
    });
  }
});




// ✅ Update Crop (Admin only, name in body → for dropdown use)
cropRouter.patch("/update", userAuth, isAdmin, async (req, res) => {
  try {
    const { name, ...updates } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "❌ फसल का नाम देना ज़रूरी है | Crop name required",
      });
    }

    validateCropData({ name, ...updates });

    const updated = await Crop.findOneAndUpdate(
      { name: new RegExp(`^${name.trim()}$`, "i") },
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "❌ यह फसल उपलब्ध नहीं है | Crop not found",
      });
    }

    return res.json({
      success: true,
      message: "✅ फसल अपडेट हो गई | Crop updated successfully",
      updated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "❌ फसल अपडेट करने में असफल | Failed to update crop",
    });
  }
});


// ✅ Delete Crop (Admin only, name in body → for dropdown use)
cropRouter.delete("/delete", userAuth, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "❌ फसल का नाम देना ज़रूरी है | Crop name required",
      });
    }

    const deleted = await Crop.findOneAndDelete({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "❌ यह फसल उपलब्ध नहीं है | Crop not found",
      });
    }

    return res.json({
      success: true,
      message: "✅ फसल हटा दी गई | Crop deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "❌ फसल हटाने में त्रुटि | Failed to delete crop",
    });
  }
});

module.exports = cropRouter;
