// src/config/mongoose-seed.js
// Run this script to seed the database using Mongoose models

require("dotenv").config();
const mongoose = require("mongoose");
const Resource = require("../models/Resource");
const Category = require("../models/Category");
const SearchLog = require("../models/SearchLog");
const Feedback = require("../models/Feedback");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Could not connect to MongoDB Atlas", err);
    process.exit(1);
  });

// Sample data
const categories = [
  {
    name: "food",
    displayName: "Food Assistance",
    subcategories: [
      "groceries",
      "meals",
      "nutrition assistance",
      "food pantry",
    ],
    keywords: [
      "hungry",
      "food",
      "eat",
      "meal",
      "groceries",
      "pantry",
      "SNAP",
      "EBT",
      "WIC",
    ],
  },
  {
    name: "housing",
    displayName: "Housing & Shelter",
    subcategories: [
      "emergency shelter",
      "transitional housing",
      "rental assistance",
      "housing programs",
    ],
    keywords: [
      "homeless",
      "shelter",
      "housing",
      "rent",
      "apartment",
      "living",
      "sleep",
      "eviction",
    ],
  },
  {
    name: "healthcare",
    displayName: "Healthcare Services",
    subcategories: ["medical", "dental", "mental health", "prescriptions"],
    keywords: [
      "sick",
      "doctor",
      "medical",
      "health",
      "medicine",
      "prescription",
      "therapy",
      "counseling",
      "dental",
    ],
  },
  {
    name: "employment",
    displayName: "Employment Resources",
    subcategories: [
      "job training",
      "job search",
      "resume help",
      "career counseling",
    ],
    keywords: [
      "job",
      "work",
      "employment",
      "career",
      "resume",
      "hiring",
      "training",
      "unemployment",
    ],
  },
];

const resources = [
  {
    name: "Mission Food Bank",
    category: "food",
    subcategories: ["groceries", "meals"],
    description:
      "Provides groceries and prepared meals to individuals and families in need.",
    location: {
      type: "Point",
      coordinates: [-122.419416, 37.77542],
    },
    address: "123 Mission St, San Francisco, CA 94103",
    contact: {
      phone: "415-555-0123",
      email: "info@missionfoodbank.org",
      website: "https://missionfoodbank.org",
    },
    hours: [
      { day: 0, open: "9:00", close: "17:00" }, // Sunday
      { day: 1, open: "9:00", close: "17:00" }, // Monday
      { day: 2, open: "9:00", close: "17:00" }, // Tuesday
      { day: 3, open: "9:00", close: "17:00" }, // Wednesday
      { day: 4, open: "9:00", close: "17:00" }, // Thursday
      { day: 5, open: "10:00", close: "14:00" }, // Friday
      { day: 6, open: "", close: "" }, // Saturday
    ],
    eligibility: "Open to all San Francisco residents",
    documentation_required: ["ID", "Proof of address"],
    languages: ["English", "Spanish", "Chinese"],
    accessibility: ["wheelchair", "transit"],
    services: ["Food pantry", "Grocery distribution", "Meal service"],
    lastUpdated: new Date("2025-01-15"),
    capacity: "Serves up to 200 families daily",
  },
  {
    name: "Sunset Community Shelter",
    category: "housing",
    subcategories: ["emergency shelter"],
    description:
      "Emergency overnight shelter with basic necessities and support services.",
    location: {
      type: "Point",
      coordinates: [-122.494283, 37.750369],
    },
    address: "456 Sunset Blvd, San Francisco, CA 94122",
    contact: {
      phone: "415-555-0456",
      email: "help@sunsetcommunityshelter.org",
      website: "https://sunsetcommunityshelter.org",
    },
    hours: [
      { day: 0, open: "18:00", close: "9:00" }, // Sunday
      { day: 1, open: "18:00", close: "9:00" }, // Monday
      { day: 2, open: "18:00", close: "9:00" }, // Tuesday
      { day: 3, open: "18:00", close: "9:00" }, // Wednesday
      { day: 4, open: "18:00", close: "9:00" }, // Thursday
      { day: 5, open: "18:00", close: "9:00" }, // Friday
      { day: 6, open: "18:00", close: "9:00" }, // Saturday
    ],
    eligibility: "Priority to families with children and seniors",
    documentation_required: [],
    languages: ["English", "Spanish"],
    accessibility: ["transit"],
    services: ["Emergency shelter", "Case management", "Housing navigation"],
    lastUpdated: new Date("2025-02-10"),
    capacity: "50 beds available nightly",
  },
  {
    name: "Tenderloin Health Clinic",
    category: "healthcare",
    subcategories: ["medical", "mental health"],
    description:
      "Free and low-cost healthcare services for underserved populations.",
    location: {
      type: "Point",
      coordinates: [-122.419345, 37.78414],
    },
    address: "789 Ellis St, San Francisco, CA 94109",
    contact: {
      phone: "415-555-0789",
      email: "appointments@tenderloinhealth.org",
      website: "https://tenderloinhealth.org",
    },
    hours: [
      { day: 0, open: "", close: "" }, // Sunday
      { day: 1, open: "8:00", close: "18:00" }, // Monday
      { day: 2, open: "8:00", close: "18:00" }, // Tuesday
      { day: 3, open: "8:00", close: "18:00" }, // Wednesday
      { day: 4, open: "8:00", close: "18:00" }, // Thursday
      { day: 5, open: "8:00", close: "18:00" }, // Friday
      { day: 6, open: "9:00", close: "13:00" }, // Saturday
    ],
    eligibility: "Uninsured and low-income individuals",
    documentation_required: ["ID", "Proof of income (if available)"],
    languages: ["English", "Spanish", "Cantonese", "Russian"],
    accessibility: ["wheelchair", "transit"],
    services: [
      "Primary care",
      "Mental health counseling",
      "Dental care",
      "Prescription assistance",
    ],
    lastUpdated: new Date("2025-03-01"),
    capacity: "Can see approximately 100 patients daily",
  },
  {
    name: "Bayview Employment Center",
    category: "employment",
    subcategories: ["job training", "resume help"],
    description:
      "Employment assistance, job training, and career development services.",
    location: {
      type: "Point",
      coordinates: [-122.376828, 37.731158],
    },
    address: "1010 Innes Ave, San Francisco, CA 94124",
    contact: {
      phone: "415-555-1010",
      email: "careers@bayviewemployment.org",
      website: "https://bayviewemployment.org",
    },
    hours: [
      { day: 0, open: "", close: "" }, // Sunday
      { day: 1, open: "9:00", close: "17:00" }, // Monday
      { day: 2, open: "9:00", close: "17:00" }, // Tuesday
      { day: 3, open: "9:00", close: "19:00" }, // Wednesday
      { day: 4, open: "9:00", close: "17:00" }, // Thursday
      { day: 5, open: "9:00", close: "17:00" }, // Friday
      { day: 6, open: "", close: "" }, // Saturday
    ],
    eligibility:
      "San Francisco residents, priority to Bayview-Hunters Point residents",
    documentation_required: ["ID", "Proof of address", "Work authorization"],
    languages: ["English", "Spanish", "Cantonese"],
    accessibility: ["wheelchair", "transit"],
    services: [
      "Job search assistance",
      "Resume writing",
      "Interview preparation",
      "Computer skills training",
    ],
    lastUpdated: new Date("2025-02-20"),
    capacity: "Serves approximately 50 clients daily",
  },
];

async function seedDatabase() {
  try {
    // Clear existing data
    await Promise.all([
      Resource.deleteMany({}),
      Category.deleteMany({}),
      SearchLog.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Insert categories
    await Category.insertMany(categories);
    console.log("Inserted categories");

    // Insert resources
    await Resource.insertMany(resources);
    console.log("Inserted resources");

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
