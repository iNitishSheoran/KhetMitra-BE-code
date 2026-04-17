// routes/authRouter.js
const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth.js");

// Cookie options helper (dev vs prod)
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

// SIGNUP
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { fullName, phoneNumber, emailId, password, state, district, crops, age } = req.body;

    // ✅ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      phoneNumber,
      emailId,
      password: passwordHash,
      state,
      district,
      crops,
      age,
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        phoneNumber: savedUser.phoneNumber,
        emailId: savedUser.emailId,
        state: savedUser.state,
        district: savedUser.district,
        crops: savedUser.crops,
        age: savedUser.age,
      },
    });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(400).json({ success: false, message: err.message || "Error signing up" });
  }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Incorrect password");

    const token = await user.getJWT();
    res.cookie("token", token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        emailId: user.emailId,
        state: user.state,
        district: user.district,
        crops: user.crops,
        age: user.age,
        cropHistory: user.cropHistory
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(400).json({ success: false, message: err.message || "Error logging in" });
  }
});

// GET CURRENT USER (protected)
authRouter.get("/user", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isAdmin = user.emailId === process.env.ADMIN_EMAIL;

    res.json({
      success: true,
      user,
      isAdmin,
    });
  } catch (err) {
    console.error("❌ Fetch User Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// LOGOUT
authRouter.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
  });

  res.json({ success: true, message: "Logout successful" });
});

module.exports = authRouter;
