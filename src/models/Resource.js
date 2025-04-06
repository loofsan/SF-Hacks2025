const mongoose = require("mongoose");

const hourSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // Days as numbers
  open: { type: String, default: "" },
  close: { type: String, default: "" },
});

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    subcategories: [
      {
        type: String,
        index: true,
      },
    ],
    description: {
      type: String,
    },
    // GeoJSON format for location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    // Separate address field
    address: {
      type: String,
    },
    contact: {
      phone: { type: String },
      email: { type: String },
      website: { type: String },
    },
    // Support direct contactPhone field
    contactPhone: { type: String },
    // Hours of operation
    hours: [hourSchema],
    // Support various additional fields
    requirements: [{ type: String }],
    eligibility: { type: String },
    documentation_required: [{ type: String }],
    languages: [{ type: String }],
    accessibility: [{ type: String }],
    services: [{ type: String }],
    restrictions: [{ type: String }],
    currentCapacity: { type: Number },
    totalCapacity: { type: Number },
    capacity: { type: String },
    lastUpdated: { type: Date, default: Date.now },
    website: { type: String },
    // Fields for user submissions
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    submittedAt: { type: Date },
    submittedBy: { type: String }, // Could store email or session ID
  },
  {
    timestamps: true,
    // Allow fields that aren't defined in the schema
    strict: false,
  }
);

// Create text index for natural language search
resourceSchema.index({
  name: "text",
  description: "text",
  address: "text",
  eligibility: "text",
  services: "text",
});

// Create 2dsphere index for geospatial queries
resourceSchema.index({ location: "2dsphere" });

// Helper method to get category from type if needed
resourceSchema.virtual("categoryFromType").get(function () {
  // Map resource types to categories
  const typeToCategory = {
    shelter: "housing",
    "food bank": "food",
    "medical clinic": "healthcare",
    "employment center": "employment",
  };

  return this.category || typeToCategory[this.type] || "other";
});

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;
