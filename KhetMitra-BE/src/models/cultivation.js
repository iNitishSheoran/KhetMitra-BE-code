const mongoose = require("mongoose");

const cultivationSchema = new mongoose.Schema(
  {
    name_hi: {
      type: String,
      required: [true, "फसल का हिंदी नाम ज़रूरी है | Hindi name is required"],
      trim: true,
      minlength: [1, "फसल का नाम कम से कम 1 अक्षर का होना चाहिए | Name must be at least 1 character"],
    },
    name_en: {
      type: String,
      required: [true, "Crop English name is required"],
      trim: true,
      minlength: [2, "Crop English name must be at least 2 characters"],
    },
    season: { type: String, required: true, trim: true },
    sowing_window: { type: String, required: true },
    soil: { type: String, required: true },

    seed_nursery: {
      seed_rate_nursery: { type: String },
      nursery_preparation: { type: String },
      seed_rate_field: { type: String },
      spacing: { type: String },
    },

    fertilizer_NPK_kg_per_ha: {
      recommended_range: {
        N: {
          type: [Number],
          validate: {
            validator: arr => arr.length === 2,
            message: "N array must have 2 numbers",
          },
        },
        P2O5: {
          type: [Number],
          validate: {
            validator: arr => arr.length === 2,
            message: "P2O5 array must have 2 numbers",
          },
        },
        K2O: {
          type: [Number],
          validate: {
            validator: arr => arr.length === 2,
            message: "K2O array must have 2 numbers",
          },
        },
      },
      notes: { type: String },
    },

    irrigation_schedule: { type: String },
    weed_control: { type: String },
    pest_disease_management: { type: String },
    harvest_and_postharvest: { type: String },

    timeline_months: {
      nursery: { type: String },
      transplant_or_sowing: { type: String },
      harvest: { type: String },
    },

    detailed_steps_en: [{ type: String }],
    detailed_steps_hi: [{ type: String }],
    sources: [{ type: String }],
  },
  { timestamps: true }
);

const Cultivation = mongoose.model("Cultivation", cultivationSchema);

module.exports = Cultivation;
