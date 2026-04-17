const express = require("express");
const helpRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
const Help = require("../models/help");
const { validateHelpData } = require("../utils/validation");

// ✅ Submit Help Request (only logged-in farmers)
helpRouter.post("/submit", userAuth, async (req, res) => {
  try {
      console.log("helpData received:", req.body);
    console.log("req.user:", req.user);
    const helpData = req.body;


    validateHelpData(helpData);

    const help = new Help({
      userId: req.user._id,
      name: helpData.name,
      state: helpData.state,
      district: helpData.district,
      phoneNo: helpData.phoneNo,
      email: helpData.email,
      help: helpData.help,
      imageUrl: helpData.imageUrl || null,
    });

    await help.save();
    res.status(201).json({ message: "✅ Help request submitted successfully" });
  } catch (err) {
    console.error("Error submitting help:", err);
    res.status(500).json({ error: "❌ Failed to submit help request" });
  }
});

// ✅ Get User's Own Help Requests
helpRouter.get("/myRequests", userAuth, async (req, res) => {
  try {
    const myRequests = await Help.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(myRequests);
  } catch (err) {
    console.error("Error fetching help requests:", err);
    res.status(500).json({ error: "❌ Error fetching your help requests" });
  }
});

// ✅ Delete Own Help Request (within 1 hour)
helpRouter.delete("/delete/:id", userAuth, async (req, res) => {
  try {
    const help = await Help.findOne({ _id: req.params.id, userId: req.user._id });

    if (!help) return res.status(403).send("❌ Unauthorized or help request not found");

    const now = new Date();
    const oneHour = 60 * 60 * 1000; // 1 hour
    const timeSinceCreation = now - help.createdAt;

    if (timeSinceCreation > oneHour) {
      return res.status(403).send("⏳ Help request can only be deleted within 1 hour of creation");
    }

    await help.deleteOne();
    res.json({ message: "✅ Help request deleted successfully" });
  } catch (err) {
    console.error("Error deleting help request:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// ✅ Admin: Get All Help Requests
helpRouter.get("/all", userAuth, isAdmin, async (req, res) => {
  try {
    const allRequests = await Help.find()
      .populate("userId", "firstName lastName emailId")
      .sort({ createdAt: -1 });

    res.json(allRequests);
  } catch (err) {
    console.error("Error fetching all help requests:", err);
    res.status(500).json({ error: "❌ Error fetching all help requests" });
  }
});

// ✅ Admin: Update Help Request Status
helpRouter.patch("/status/:id", userAuth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // expected: "pending" | "in-progress" | "resolved"

    const updatedHelp = await Help.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedHelp) {
      return res.status(404).json({ error: "❌ Help request not found" });
    }

    res.json({ message: "✅ Help request status updated", updatedHelp });
  } catch (err) {
    console.error("Error updating help status:", err);
    res.status(500).json({ error: "❌ Failed to update help request status" });
  }
});


// routes/helpRouter.js

// ✅ Admin: Answer Help Request
helpRouter.patch("/answer/:id", userAuth, isAdmin, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || answer.trim().length < 5) {
      return res.status(400).json({ error: "❌ Answer must be at least 5 characters long" });
    }

    const updatedHelp = await Help.findByIdAndUpdate(
      req.params.id,
      { answer, status: "resolved" }, // auto mark resolved
      { new: true }
    );

    if (!updatedHelp) {
      return res.status(404).json({ error: "❌ Help request not found" });
    }

    res.json({ message: "✅ Answer submitted and status updated", updatedHelp });
  } catch (err) {
    console.error("Error submitting answer:", err);
    res.status(500).json({ error: "❌ Failed to submit answer" });
  }
});


module.exports = helpRouter;
