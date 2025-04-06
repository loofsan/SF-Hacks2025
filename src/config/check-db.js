require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Could not connect to MongoDB Atlas", err);
    process.exit(1);
  });

// Define schemas for checking
const resourceSchema = new mongoose.Schema({}, { strict: false });
const categorySchema = new mongoose.Schema({}, { strict: false });

const Resource = mongoose.model("Resource", resourceSchema);
const Category = mongoose.model("Category", categorySchema);

async function checkDatabase() {
  try {
    // Check resources
    const resourceCount = await Resource.countDocuments();
    console.log(`Resources collection has ${resourceCount} documents`);

    if (resourceCount > 0) {
      const sampleResource = await Resource.findOne();
      console.log("Sample resource:", JSON.stringify(sampleResource, null, 2));
    }

    // Check categories
    const categoryCount = await Category.countDocuments();
    console.log(`Categories collection has ${categoryCount} documents`);

    if (categoryCount > 0) {
      const categories = await Category.find();
      console.log(
        "Categories:",
        categories.map((cat) => cat.name)
      );
    }

    mongoose.connection.close();
    console.log("Database check complete");
  } catch (error) {
    console.error("Error checking database:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

checkDatabase();
