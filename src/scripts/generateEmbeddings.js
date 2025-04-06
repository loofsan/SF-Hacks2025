require("dotenv").config();
const mongoose = require("mongoose");
const { updateAllResourceEmbeddings } = require("../services/embeddingService");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Could not connect to MongoDB Atlas", err);
    process.exit(1);
  });

// Generate embeddings for all resources
async function generateAllEmbeddings() {
  try {
    console.log("Starting embedding generation...");
    await updateAllResourceEmbeddings();
    console.log("Embedding generation complete!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error generating embeddings:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

generateAllEmbeddings();
