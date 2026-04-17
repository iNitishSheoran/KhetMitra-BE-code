const mongoose = require("mongoose");

const helpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true, minlength: 3 },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    phoneNo: {
      type: String,
      required: true,
      validate(value) {
        if (!/^\d{10}$/.test(value)) {
          throw new Error("Phone number must be a valid 10-digit number");
        }
      },
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    help: { type: String, required: true, minlength: 10, maxlength: 1000 },
    imageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    answer: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// ✅ Create model
const Help = mongoose.model("Help", helpSchema);

// ✅ Export the model
module.exports = Help;
