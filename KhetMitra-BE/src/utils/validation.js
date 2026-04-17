const validator = require("validator");

// ✅ Phone number validator (Indian, 10-digit starting with 6–9)
const isValidPhoneNumber = (phone) => /^[6-9]\d{9}$/.test(phone);

// ✅ Email validator (basic RFC 5322 compliant regex)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ✅ Signup validation
const validateSignUpData = (data) => {
  const requiredFields = [
    "fullName",
    "phoneNumber",
    "emailId",
    "state",
    "district",
    "crops",
    "age",
  ];

  // Check missing fields
  for (const field of requiredFields) {
    if (!data[field]) {
      return { error: { message: `${field} is required` } };
    }
  }

  // fullName
  if (
    typeof data.fullName !== "string" ||
    data.fullName.trim().length < 3 ||
    data.fullName.trim().length > 50
  ) {
    return {
      error: {
        message: "Full name must be 3–50 characters long",
      },
    };
  }

  // phoneNumber include validation
  if (!isValidPhoneNumber(data.phoneNumber)) {
    return { error: { message: "Invalid phone number format" } };
  }

  // emailId
  if (!isValidEmail(data.emailId)) {
    return { error: { message: "Invalid email format" } };
  }

  // state
  if (typeof data.state !== "string" || data.state.trim().length < 2) {
    return { error: { message: "State name must be at least 2 characters long" } };
  }

  // district
  if (typeof data.district !== "string" || data.district.trim().length < 2) {
    return { error: { message: "District name must be at least 2 characters long" } };
  }

  // crops (must be array with at least 1 string crop)
  if (!Array.isArray(data.crops) || data.crops.length === 0) {
    return { error: { message: "At least one crop must be provided" } };
  }
  for (const crop of data.crops) {
    if (typeof crop !== "string" || crop.trim().length < 2) {
      return { error: { message: "Each crop must be a valid string (min 2 chars)" } };
    }
  }

  // age
  if (typeof data.age !== "number" || data.age < 18 || data.age > 100) {
    return { error: { message: "Age must be between 18 and 100" } };
  }

  return { error: null }; // ✅ Valid
};


const validateCropData = (crop) => {
  const { name, npk, temperature_c, humidity_percent, soil_moisture_percent, ph, ec_ds_m } = crop;

  if (!name || name.trim().length < 2) {
    throw new Error("कृपया सही फसल का नाम दर्ज करें (कम से कम 2 अक्षर)।");
  }

  if (!npk || !Array.isArray(npk.N) || !Array.isArray(npk.P) || !Array.isArray(npk.K)) {
    throw new Error("कृपया N, P, K की सही मात्रा (न्यूनतम और अधिकतम) दर्ज करें।");
  }

  ["N", "P", "K"].forEach((key) => {
    if (npk[key].length !== 2 || npk[key].some(v => typeof v !== "number")) {
      throw new Error(`कृपया ${key} की मात्रा दो संख्याओं में दर्ज करें (उदाहरण: [80,160])।`);
    }
  });

  const validateRange = (arr, field, min, max, label, unit = "") => {
    if (!Array.isArray(arr) || arr.length !== 2 || arr.some(v => typeof v !== "number")) {
      throw new Error(`${label} की सीमा दो संख्याओं में दर्ज करें (न्यूनतम और अधिकतम)।`);
    }
    if (arr[0] < min || arr[1] > max) {
      throw new Error(`${label} ${min}${unit} से ${max}${unit} के बीच होना चाहिए।`);
    }
  };

  validateRange(temperature_c, "temperature_c", -10, 60, "तापमान", "°C");
  validateRange(humidity_percent, "humidity_percent", 0, 100, "नमी", "%");
  validateRange(soil_moisture_percent, "soil_moisture_percent", 0, 100, "मिट्टी की नमी", "%");
  validateRange(ph, "ph", 0, 14, "pH", "");
  validateRange(ec_ds_m, "ec_ds_m", 0, 20, "EC (लवणता)", " dS/m");

  return true;
};

module.exports = { validateCropData };



const validateHelpData = (help) => {
  const { name, state, district, phoneNo, email, help: helpText } = help;

  if (!name || name.trim().length < 3) {
    throw new Error("Please provide a valid name (min 3 characters).");
  }

  if (!state || state.trim().length < 2) {
    throw new Error("Please provide a valid state name.");
  }

  if (!district || district.trim().length < 2) {
    throw new Error("Please provide a valid district name.");
  }

  if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
    throw new Error("Phone number must be a valid 10-digit number.");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("Please provide a valid email address.");
  }

  if (!helpText || helpText.trim().length < 10) {
    throw new Error("Help description must be at least 10 characters long.");
  }
};


const validateCultivationData = (data) => {
  const {
    name_hi,
    name_en,
    season,
    sowing_window,
    soil,
    seed_nursery,
    fertilizer_NPK_kg_per_ha,
    irrigation_schedule,
    weed_control,
    pest_disease_management,
    harvest_and_postharvest,
    timeline_months,
    detailed_steps_en,
    detailed_steps_hi,
    sources,
  } = data;

  // Basic info
  if (!name_hi || name_hi.trim().length < 1) {
    throw new Error("❌ फसल का हिंदी नाम आवश्यक है | Hindi name is required");
  }

  if (!name_en || name_en.trim().length < 2) {
    throw new Error("❌ Crop English name must be at least 2 characters long");
  }

  if (!season) {
    throw new Error("❌ Season information is required");
  }

  if (!sowing_window) {
    throw new Error("❌ Sowing window is required");
  }

  if (!soil) {
    throw new Error("❌ Soil details are required");
  }

  // Seed & nursery
  if (!seed_nursery || typeof seed_nursery !== "object") {
    throw new Error("❌ seed_nursery object is required");
  }

  if (!("seed_rate_nursery" in seed_nursery)) {
    throw new Error("❌ seed_rate_nursery is required inside seed_nursery");
  }

  if (!("nursery_preparation" in seed_nursery)) {
    throw new Error("❌ nursery_preparation is required inside seed_nursery");
  }

  if (!("seed_rate_field" in seed_nursery)) {
    throw new Error("❌ seed_rate_field is required inside seed_nursery");
  }

  if (!("spacing" in seed_nursery)) {
    throw new Error("❌ spacing is required inside seed_nursery");
  }

  // Fertilizer NPK
  if (fertilizer_NPK_kg_per_ha && fertilizer_NPK_kg_per_ha.recommended_range) {
    ["N", "P2O5", "K2O"].forEach((key) => {
      const val = fertilizer_NPK_kg_per_ha.recommended_range[key];
      if (!Array.isArray(val) || val.length !== 2) {
        throw new Error(`❌ ${key} range must be an array of [min, max]`);
      }
      if (val.some((v) => typeof v !== "number")) {
        throw new Error(`❌ ${key} values must be numbers`);
      }
    });
  }

  // Required string fields
  ["irrigation_schedule", "weed_control", "pest_disease_management", "harvest_and_postharvest"].forEach(
    (field) => {
      if (!data[field] || typeof data[field] !== "string") {
        throw new Error(`❌ ${field} is required and must be a string`);
      }
    }
  );

  // Timeline
  if (!timeline_months || typeof timeline_months !== "object") {
    throw new Error("❌ timeline_months object is required");
  }

  ["nursery", "transplant_or_sowing", "harvest"].forEach((key) => {
    if (!(key in timeline_months)) {
      throw new Error(`❌ timeline_months.${key} is required`);
    }
  });

  // Steps arrays
  if (!Array.isArray(detailed_steps_en) || detailed_steps_en.length === 0) {
    throw new Error("❌ detailed_steps_en must be a non-empty array of strings");
  }

  if (!Array.isArray(detailed_steps_hi) || detailed_steps_hi.length === 0) {
    throw new Error("❌ detailed_steps_hi must be a non-empty array of strings");
  }

  // Sources
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error("❌ sources must be a non-empty array of strings");
  }

  return true;
};


const validateProfileEditData = (data) => {
  const allowedFields = [
    "fullName",
    "phoneNumber",
    "state",
    "district",
    "crops",
    "age",
    "photoUrl",
  ];

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return { error: { message: "At least one field is required" } };
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      return { error: { message: `Invalid field: ${key}` } };
    }

    const value = data[key];

    switch (key) {
      case "fullName":
        if (
          typeof value !== "string" ||
          value.trim().length < 3 ||
          value.trim().length > 50
        ) {
          return { error: { message: "Full name must be 3–50 characters long" } };
        }
        break;

      case "phoneNumber":
        if (!/^[0-9]{10}$/.test(value)) {
          return { error: { message: "Phone number must be a valid 10-digit number" } };
        }
        break;

      case "state":
        if (typeof value !== "string" || value.trim().length < 2) {
          return { error: { message: "State name must be at least 2 characters" } };
        }
        break;

      case "district":
        if (typeof value !== "string" || value.trim().length < 2) {
          return { error: { message: "District name must be at least 2 characters" } };
        }
        break;

      case "crops":
        if (!Array.isArray(value) || value.length === 0) {
          return { error: { message: "At least one crop must be provided" } };
        }
        for (const crop of value) {
          if (typeof crop !== "string" || crop.trim().length < 2) {
            return { error: { message: "Each crop must be a valid string (min 2 chars)" } };
          }
        }
        break;

      case "age":
        const ageNum = Number(value); // ✅ allow string or number
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
          return { error: { message: "Age must be between 18 and 100" } };
        }
        break;

      case "photoUrl":
        if (typeof value !== "string" || !/^https?:\/\/.+/.test(value)) {
          return { error: { message: "photoUrl must be a valid URL" } };
        }
        break;

      default:
        break;
    }
  }

  return { error: null };
};






module.exports = {
    validateSignUpData,
    validateCropData,
    validateHelpData,
    validateCultivationData,
    validateProfileEditData
}