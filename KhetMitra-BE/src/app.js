const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.khetmitra.live",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

/* -------------------- DATABASE -------------------- */
connectDB()
  .then(() => console.log("✅ Atlas DB connected"))
  .catch((err) => console.error("❌ Atlas DB connection failed:", err));

/* -------------------- ROUTES -------------------- */
app.use("/", require("./routes/authRouter"));
app.use("/auth", require("./routes/authCheckRouter"));
app.use("/help", require("./routes/helpRouter"));
app.use("/crop", require("./routes/cropRouter"));
app.use("/cultivation", require("./routes/cultivationRouter"));
app.use("/profile", require("./routes/profileRouter"));
app.use("/sensor", require("./routes/sensorRouter"));

/* -------------------- GROQ AI SETUP -------------------- */
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* -------------------- AI CROP RECOMMEND API -------------------- */
app.post("/ai/crop-recommend", async (req, res) => {
  try {
    const d = req.body;

    const prompt = `
You are an expert Indian agriculture advisor.

Recommend exactly 3 crops based on soil & environment.
Language: Hinglish
Tone: Farmer-friendly, short

Data:
Soil pH: ${d.soilPH}
Nitrogen: ${d.nitrogen}
Phosphorus: ${d.phosphorus}
Potassium: ${d.potassium}
Soil Moisture: ${d.soilMoist}
Soil Temp: ${d.soilTemp}
Rain: ${d.rain}
Light: ${d.ldr}
Wind: ${d.voltage}

Format:
🌾 Crop – short reason
🌾 Crop – short reason
🌾 Crop – short reason
👉 Soil Tip: one line
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    res.json({
      success: true,
      text: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("❌ Groq API Error:", err);
    res.status(500).json({
      success: false,
      message: "AI recommendation failed",
    });
  }
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 2713;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;