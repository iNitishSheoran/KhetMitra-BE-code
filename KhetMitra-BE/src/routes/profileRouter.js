const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
require('dotenv').config();
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");

// Multer + Cloudinary config
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

const adminEmail = process.env.ADMIN_EMAIL;

// =======================
// ✅ Get profile API
// =======================
profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = user.emailId === adminEmail;

    res.status(200).json({
      ...user.toObject(),
      isAdmin
    });
  } catch (err) {
    console.error("❌ View Profile Error:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// =======================
// ✅ Edit profile API (with optional profile photo upload)
// =======================
profileRouter.patch(
  "/edit",
  userAuth,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const updates = { ...req.body };

      // ✅ If file uploaded → update photoUrl
      if (req.file && req.file.path) {
        updates.photoUrl = req.file.path;
      }

      // ✅ Convert age to number if provided
      if (updates.age) {
        updates.age = Number(updates.age);
      }

      // ✅ Convert crops to array if string
      if (updates.crops && typeof updates.crops === "string") {
        updates.crops = updates.crops
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }

      // ✅ Convert cropHistory to array if string
      if (updates.cropHistory && typeof updates.cropHistory === "string") {
        updates.cropHistory = updates.cropHistory
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }

      // ✅ Validate input
      const { error } = validateProfileEditData(updates);
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // ✅ Apply updates safely
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-__v");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("❌ Edit Profile Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// =======================
// ✅ Delete profile API
// =======================
profileRouter.delete("/delete", userAuth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Profile Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = profileRouter;
