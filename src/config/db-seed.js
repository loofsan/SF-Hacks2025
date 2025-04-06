const { MongoClient } = require("mongodb");
require("dotenv").config();

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
      {
        name: "Golden Gate Senior Center",
        category: "housing",
        subcategories: ["senior housing", "meal services"],
        description:
          "Provides housing and meal services for low-income seniors.",
        location: {
          address: "Point",
          coordinates: [-122.421778, 37.781478],
        },
        contact: {
          phone: "415-555-1234",
          email: "info@goldengatesenior.org",
          website: "https://goldengatesenior.org",
        },
        hours: [
          { day: 1, open: "8:00", close: "16:00" },
          { day: 2, open: "8:00", close: "16:00" },
          { day: 3, open: "8:00", close: "16:00" },
          { day: 4, open: "8:00", close: "16:00" },
          { day: 5, open: "8:00", close: "16:00" },
          { day: 6, open: "9:00", close: "12:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to low-income seniors 60+",
        documentation_required: ["ID", "Proof of income"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-25"),
        capacity: "50 seniors served daily",
      },
      {
        name: "Chinatown Food Pantry",
        category: "food",
        subcategories: ["groceries", "hot meals"],
        description:
          "Provides groceries and hot meals for low-income Chinatown residents.",
        location: {
          address: "Point",
          coordinates: [-122.406417, 37.794368],
        },
        contact: {
          phone: "415-555-2345",
          email: "contact@chinatownfoodpantry.org",
          website: "https://chinatownfoodpantry.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "16:00" },
          { day: 2, open: "9:00", close: "16:00" },
          { day: 3, open: "9:00", close: "16:00" },
          { day: 4, open: "9:00", close: "16:00" },
          { day: 5, open: "9:00", close: "16:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to Chinatown residents",
        documentation_required: ["ID", "Proof of address"],
        languages: ["English", "Chinese"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-18"),
        capacity: "Serves up to 100 families daily",
      },
      {
        name: "Bay Area Youth Jobs",
        category: "employment",
        subcategories: ["youth employment", "job training"],
        description:
          "Helps youth aged 16-24 find part-time jobs and internships.",
        location: {
          address: "Point",
          coordinates: [-122.419531, 37.766197],
        },
        contact: {
          phone: "415-555-3456",
          email: "youthjobs@bayareayouth.org",
          website: "https://bayareayouthjobs.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "", close: "" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Youth aged 16-24",
        documentation_required: ["ID", "Proof of age"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-10"),
        capacity: "Supports up to 50 youth weekly",
      },
      {
        name: "South of Market Health Center",
        category: "healthcare",
        subcategories: ["medical", "dental"],
        description:
          "Provides affordable healthcare services including medical and dental care.",
        location: {
          address: "Point",
          coordinates: [-122.399118, 37.781839],
        },
        contact: {
          phone: "415-555-4567",
          email: "appointments@southofmarkethealth.org",
          website: "https://southofmarkethealth.org",
        },
        hours: [
          { day: 1, open: "8:00", close: "18:00" },
          { day: 2, open: "8:00", close: "18:00" },
          { day: 3, open: "8:00", close: "18:00" },
          { day: 4, open: "8:00", close: "18:00" },
          { day: 5, open: "8:00", close: "18:00" },
          { day: 6, open: "9:00", close: "13:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to all, priority to uninsured individuals",
        documentation_required: ["ID", "Proof of income (if available)"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-12"),
        capacity: "Can see approximately 120 patients daily",
      },
      {
        name: "Mission District Employment Services",
        category: "employment",
        subcategories: ["resume help", "job referrals"],
        description:
          "Provides job search assistance, resume building, and interview preparation.",
        location: {
          address: "Point",
          coordinates: [-122.417473, 37.759377],
        },
        contact: {
          phone: "415-555-6789",
          email: "info@missiondistrictjobs.org",
          website: "https://missiondistrictjobs.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "", close: "" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to all San Francisco residents",
        documentation_required: ["ID"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-05"),
        capacity: "Assists up to 30 clients daily",
      },
      {
        name: "Tenderloin Community Legal Services",
        category: "legal",
        subcategories: ["free legal aid"],
        description:
          "Provides free legal aid to low-income individuals in the Tenderloin district.",
        location: {
          address: "Point",
          coordinates: [-122.415212, 37.782307],
        },
        contact: {
          phone: "415-555-7890",
          email: "help@tenderloinlegal.org",
          website: "https://tenderloinlegal.org",
        },
        hours: [
          { day: 1, open: "10:00", close: "18:00" },
          { day: 2, open: "10:00", close: "18:00" },
          { day: 3, open: "10:00", close: "18:00" },
          { day: 4, open: "10:00", close: "18:00" },
          { day: 5, open: "10:00", close: "18:00" },
          { day: 6, open: "", close: "" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Low-income individuals in the Tenderloin district",
        documentation_required: ["ID", "Proof of income (if applicable)"],
        languages: ["English", "Spanish", "Cantonese"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-20"),
        capacity: "Can handle up to 20 cases daily",
      },
      {
        name: "The Bridge Housing Initiative",
        category: "housing",
        subcategories: ["temporary housing", "rehabilitation"],
        description:
          "Provides temporary housing and rehabilitation services for homeless individuals.",
        location: {
          address: "Point",
          coordinates: [-122.411488, 37.773177],
        },
        contact: {
          phone: "415-555-8901",
          email: "support@thebridgehousing.org",
          website: "https://thebridgehousing.org",
        },
        hours: [
          { day: 1, open: "8:00", close: "18:00" },
          { day: 2, open: "8:00", close: "18:00" },
          { day: 3, open: "8:00", close: "18:00" },
          { day: 4, open: "8:00", close: "18:00" },
          { day: 5, open: "8:00", close: "18:00" },
          { day: 6, open: "9:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility:
          "Open to homeless individuals in need of rehabilitation services",
        documentation_required: ["ID", "Proof of homelessness"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-22"),
        capacity: "Houses up to 100 individuals nightly",
      },
      {
        name: "North Beach Youth Center",
        category: "youth",
        subcategories: ["after-school programs", "tutoring"],
        description:
          "Offers after-school programs and tutoring for youth in the North Beach area.",
        location: {
          address: "Point",
          coordinates: [-122.410685, 37.806465],
        },
        contact: {
          phone: "415-555-9012",
          email: "youthcenter@northbeach.org",
          website: "https://northbeachyouthcenter.org",
        },
        hours: [
          { day: 1, open: "12:00", close: "18:00" },
          { day: 2, open: "12:00", close: "18:00" },
          { day: 3, open: "12:00", close: "18:00" },
          { day: 4, open: "12:00", close: "18:00" },
          { day: 5, open: "12:00", close: "18:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Youth aged 12-18 in the North Beach area",
        documentation_required: ["ID", "Proof of address"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: new Date("2025-03-27"),
        capacity: "Supports up to 50 youth daily",
      },
      {
        name: "Harmony Senior Center",
        category: "housing",
        subcategories: ["senior housing", "support services"],
        description: "Affordable housing and support services for seniors.",
        location: {
          address: "Point",
          coordinates: [-122.4, 37.788],
        },
        contact: {
          phone: "415-555-0112",
          email: "contact@harmonyseniorcenter.org",
          website: "https://harmonyseniorcenter.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Seniors 65+ and disabled individuals",
        documentation_required: ["ID", "Proof of age"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-01",
        capacity: "100 units available",
      },
      {
        name: "Hope Medical Clinic",
        category: "healthcare",
        subcategories: ["medical", "dental"],
        description:
          "Free medical and dental services for uninsured individuals.",
        location: {
          address: "Point",
          coordinates: [-122.412, 37.777],
        },
        contact: {
          phone: "415-555-0321",
          email: "info@hopemedicalclinic.org",
          website: "https://hopemedicalclinic.org",
        },
        hours: [
          { day: 1, open: "8:00", close: "17:00" },
          { day: 2, open: "8:00", close: "17:00" },
          { day: 3, open: "8:00", close: "17:00" },
          { day: 4, open: "8:00", close: "17:00" },
          { day: 5, open: "8:00", close: "17:00" },
          { day: 6, open: "9:00", close: "13:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Uninsured individuals, low-income",
        documentation_required: ["ID"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-05",
        capacity: "Can see approximately 50 patients daily",
      },
      {
        name: "Civic Center Job Hub",
        category: "employment",
        subcategories: ["job placement", "career counseling"],
        description:
          "Job placement assistance, career counseling, and resume workshops.",
        location: {
          address: "Point",
          coordinates: [-122.4195, 37.779],
        },
        contact: {
          phone: "415-555-0152",
          email: "jobs@civiccenterjobhub.org",
          website: "https://civiccenterjobhub.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "18:00" },
          { day: 2, open: "9:00", close: "18:00" },
          { day: 3, open: "9:00", close: "18:00" },
          { day: 4, open: "9:00", close: "18:00" },
          { day: 5, open: "9:00", close: "18:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to all San Francisco residents",
        documentation_required: ["ID", "Proof of address"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-10",
        capacity: "Serves up to 30 clients daily",
      },
      {
        name: "Greenway Housing Initiative",
        category: "housing",
        subcategories: ["affordable housing"],
        description:
          "Affordable housing for low-income families and individuals.",
        location: {
          address: "Point",
          coordinates: [-122.389, 37.771],
        },
        contact: {
          phone: "415-555-0278",
          email: "contact@greenwayhousing.org",
          website: "https://greenwayhousing.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Low-income families and individuals",
        documentation_required: ["ID", "Proof of income"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-15",
        capacity: "300 units available",
      },
      {
        name: "Rainbow Mental Health Services",
        category: "healthcare",
        subcategories: ["mental health", "therapy"],
        description:
          "Therapy and mental health services for LGBTQIA+ individuals.",
        location: {
          address: "Point",
          coordinates: [-122.4207, 37.7777],
        },
        contact: {
          phone: "415-555-0163",
          email: "help@rainbowmentalhealth.org",
          website: "https://rainbowmentalhealth.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "LGBTQIA+ individuals, all ages",
        documentation_required: ["ID"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-20",
        capacity: "Can see up to 25 clients daily",
      },
      {
        name: "Pathway Food Pantry",
        category: "food",
        subcategories: ["groceries", "meals"],
        description:
          "Provides free groceries and hot meals to individuals and families.",
        location: {
          address: "Point",
          coordinates: [-122.4375, 37.774],
        },
        contact: {
          phone: "415-555-0194",
          email: "contact@pathwayfoodpantry.org",
          website: "https://pathwayfoodpantry.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to all San Francisco residents",
        documentation_required: ["ID"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-25",
        capacity: "Serves up to 100 families daily",
      },
      {
        name: "South Bay Job Fair",
        category: "employment",
        subcategories: ["job fairs", "networking"],
        description: "Job fairs and career networking events for job seekers.",
        location: {
          address: "Point",
          coordinates: [-122.3895, 37.7765],
        },
        contact: {
          phone: "415-555-0224",
          email: "info@southbayjobfair.org",
          website: "https://southbayjobfair.org",
        },
        hours: [
          { day: 1, open: "9:00", close: "17:00" },
          { day: 2, open: "9:00", close: "17:00" },
          { day: 3, open: "9:00", close: "17:00" },
          { day: 4, open: "9:00", close: "17:00" },
          { day: 5, open: "9:00", close: "17:00" },
          { day: 6, open: "10:00", close: "14:00" },
          { day: 0, open: "", close: "" },
        ],
        eligibility: "Open to all job seekers",
        documentation_required: ["ID", "Resume"],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-03-30",
        capacity: "Hosts up to 200 job seekers",
      },
      {
        name: "St. Francis Homeless Outreach",
        category: "housing",
        subcategories: ["homeless outreach", "emergency shelter"],
        description:
          "Emergency shelter and outreach services for the homeless.",
        location: {
          address: "Point",
          coordinates: [-122.4202, 37.7524],
        },
        contact: {
          phone: "415-555-0314",
          email: "info@stfrancishomeless.org",
          website: "https://stfrancishomeless.org",
        },
        hours: [
          { day: 1, open: "24 hours", close: "" },
          { day: 2, open: "24 hours", close: "" },
          { day: 3, open: "24 hours", close: "" },
          { day: 4, open: "24 hours", close: "" },
          { day: 5, open: "24 hours", close: "" },
          { day: 6, open: "24 hours", close: "" },
          { day: 0, open: "24 hours", close: "" },
        ],
        eligibility: "Open to all homeless individuals",
        documentation_required: [],
        languages: ["English", "Spanish"],
        accessibility: ["wheelchair", "transit"],
        lastUpdated: "2025-04-01",
        capacity: "50 beds available nightly",
      },
    ]);

    console.log("Database initialized with sample data!");
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
