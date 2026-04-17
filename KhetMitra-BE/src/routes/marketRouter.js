// const express = require("express");
// const axios = require("axios");
// const Crop = require("../models/crop");
// const { userAuth } = require("../middlewares/auth");

// const marketRouter = express.Router();

// /**
//  * Get crop details + ENAM market data
//  * Example request: GET /market/Cabbage
//  */
// marketRouter.get("/market/:cropName", userAuth, async (req, res) => {
//   try {
//     const cropName = decodeURIComponent(req.params.cropName).trim();

//     // 1. Get crop from DB
//     const crop = await Crop.findOne({ name: new RegExp(`^${cropName}$`, "i") });
//     if (!crop) {
//       return res.status(404).json({ error: "Crop not found in DB" });
//     }

//     // 2. Call ENAM API for that crop
//     const payload = new URLSearchParams({
//       state: "GUJARAT",     // you can make this dynamic later
//       apmc: "BILIMORA",     // also make dynamic if needed
//       commodity: cropName,  // must match ENAM commodity
//     });

//     const response = await axios.post(
//       "https://enam.gov.in/web/Ajax_ctrl/trade_data_list",
//       payload,
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     // 3. Merge DB + ENAM data
//     return res.status(200).json({
//       message: "Crop + market data fetched successfully",
//       crop,
//       market: response.data,
//     });
//   } catch (err) {
//     console.error("Market API error:", err.message);
//     res.status(500).json({ error: "Failed to fetch market data" });
//   }
// });

// module.exports = marketRouter;
