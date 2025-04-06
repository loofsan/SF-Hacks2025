// src/models/SearchLog.js

const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
    },
    processed_query: {
      categories: [String],
      subcategories: [String],
      keywords: [String],
      location: String,
    },
    results_count: {
      type: Number,
      default: 0,
    },
    user_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    session_id: {
      type: String,
      index: true,
    },
    // No personal identifying information stored
    device_type: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "unknown"],
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for geospatial queries
searchLogSchema.index({ user_location: "2dsphere" });

const SearchLog = mongoose.model("SearchLog", searchLogSchema);

module.exports = SearchLog;
