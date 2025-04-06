// MongoDB Atlas Setup Script
// Run this with Node.js to initialize your database with sample data

const { MongoClient } = require("mongodb");
require("dotenv").config();

// Replace with your MongoDB connection string
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const database = client.db("community_resources");

    // Create collections
    await database.createCollection("resources");
    await database.createCollection("categories");
    await database.createCollection("searchLogs");
    await database.createCollection("feedback");

    // Insert sample categories
    const categoriesCollection = database.collection("categories");
    await categoriesCollection.insertMany([
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
    ]);

    // Insert sample resources
    const resourcesCollection = database.collection("resources");
    await resourcesCollection.insertMany([
      {
        name: "Mission Food Bank",
        category: "food",
        subcategories: ["groceries", "meals"],
        description:
          "Provides groceries and prepared meals to individuals and families in need.",
        location: {
          address: "123 Mission St, San Francisco, CA 94103",
          coordinates: [-122.419416, 37.77542],
        },
        contact: {
          phone: "415-555-0123",
          email: "info@missionfoodbank.org",
          website: "https://missionfoodbank.org",
        },
        hours: [
          { day: "Monday", open: "9:00", close: "17:00" },
          { day: "Tuesday", open: "9:00", close: "17:00" },
          { day: "Wednesday", open: "9:00", close: "17:00" },
          { day: "Thursday", open: "9:00", close: "17:00" },
          { day: "Friday", open: "9:00", close: "17:00" },
          { day: "Saturday", open: "10:00", close: "14:00" },
          { day: "Sunday", open: "", close: "" },
        ],
        eligibility: "Open to all San Francisco residents",
        documentation_required: ["ID", "Proof of address"],
        languages: ["English", "Spanish", "Chinese"],
        accessibility: ["wheelchair", "transit"],
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
          address: "456 Sunset Blvd, San Francisco, CA 94122",
          coordinates: [-122.494283, 37.750369],
        },
        contact: {
          phone: "415-555-0456",
          email: "help@sunsetcommunityshelter.org",
          website: "https://sunsetcommunityshelter.org",
        },
        hours: [
          { day: "Monday", open: "18:00", close: "9:00" },
          { day: "Tuesday", open: "18:00", close: "9:00" },
          { day: "Wednesday", open: "18:00", close: "9:00" },
          { day: "Thursday", open: "18:00", close: "9:00" },
          { day: "Friday", open: "18:00", close: "9:00" },
          { day: "Saturday", open: "18:00", close: "9:00" },
          { day: "Sunday", open: "18:00", close: "9:00" },
        ],
        eligibility: "Priority to families with children and seniors",
        documentation_required: [],
        languages: ["English", "Spanish"],
        accessibility: ["transit"],
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
          address: "789 Ellis St, San Francisco, CA 94109",
          coordinates: [-122.419345, 37.78414],
        },
        contact: {
          phone: "415-555-0789",
          email: "appointments@tenderloinhealth.org",
          website: "https://tenderloinhealth.org",
        },
        hours: [
          { day: "Monday", open: "8:00", close: "18:00" },
          { day: "Tuesday", open: "8:00", close: "18:00" },
          { day: "Wednesday", open: "8:00", close: "18:00" },
          { day: "Thursday", open: "8:00", close: "18:00" },
          { day: "Friday", open: "8:00", close: "18:00" },
          { day: "Saturday", open: "9:00", close: "13:00" },
          { day: "Sunday", open: "", close: "" },
        ],
        eligibility: "Uninsured and low-income individuals",
        documentation_required: ["ID", "Proof of income (if available)"],
        languages: ["English", "Spanish", "Cantonese", "Russian"],
        accessibility: ["wheelchair", "transit"],
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
          address: "1010 Innes Ave, San Francisco, CA 94124",
          coordinates: [-122.376828, 37.731158],
        },
        contact: {
          phone: "415-555-1010",
          email: "careers@bayviewemployment.org",
          website: "https://bayviewemployment.org",
        },
        hours: [
          { day: "Monday", open: "9:00", close: "17:00" },
          { day: "Tuesday", open: "9:00", close: "17:00" },
          { day: "Wednesday", open: "9:00", close: "19:00" },
          { day: "Thursday", open: "9:00", close: "17:00" },
          { day: "Friday", open: "9:00", close: "17:00" },
          { day: "Saturday", open: "", close: "" },
          { day: "Sunday", open: "", close: "" },
        ],
        eligibility:
          "San Francisco residents, priority to Bayview-Hunters Point residents",
        documentation_required: [
          "ID",
          "Proof of address",
          "Work authorization",
        ],
        languages: ["English", "Spanish", "Cantonese"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-02-20"),
        capacity: "Serves approximately 50 clients daily",
      },
    ]);

    console.log("Database initialized with sample data!");
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
