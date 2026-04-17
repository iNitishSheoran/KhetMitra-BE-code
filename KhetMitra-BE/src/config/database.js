// const mongoose = require("mongoose");
// require('dotenv').config();

// const connectDB= async() => {
//     await mongoose.connect(process.env.MONGO_URI);
// }

// module.exports = connectDB;


const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🚀 MongoDB connected");
  } catch (err) {
    console.error("❌ Database error:", err);
    process.exit(1);
  }
};

module.exports = connectDB; // CommonJS export

