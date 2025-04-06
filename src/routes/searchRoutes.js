// src/routes/searchRoutes.js (updated to handle different resource formats)

const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");
const SearchLog = require("../models/SearchLog");
const {
  analyzeQuery,
  generateResultsExplanation,
} = require("../services/geminiService");

// Testing endpoint to verify database connection
router.get("/test", async (req, res) => {
  try {
    const count = await Resource.countDocuments();
    const resources = await Resource.find().limit(5);
    res.json({
      count,
      resources,
    });
  } catch (err) {
    console.error("Test error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Simple keyword search for all resources
router.get("/keyword/:keyword", async (req, res) => {
  try {
    const keyword = req.params.keyword;

    // Search for the keyword in multiple fields
    const resources = await Resource.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { address: { $regex: keyword, $options: "i" } },
        { services: { $regex: keyword, $options: "i" } },
        { type: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ],
    });

    res.json({
      count: resources.length,
      resources,
    });
  } catch (err) {
    console.error("Keyword search error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Natural language search endpoint
router.post("/", async (req, res) => {
  try {
    const { query, location, sessionId } = req.body;
    console.log("Search query received:", query);

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Try to analyze with Gemini, but don't halt execution if it fails
    let queryAnalysis = null;
    try {
      queryAnalysis = await analyzeQuery(query);
      console.log("Query analysis result:", queryAnalysis);
    } catch (error) {
      console.error("Error analyzing query with Gemini:", error);
      // Continue with basic search
    }

    // Extract keywords from the query
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3) // Filter out short words
      .filter(
        (word) =>
          !["help", "need", "find", "looking", "where", "what"].includes(word)
      ); // Filter common words

    // Build search criteria
    let searchCriteria = {};

    // If we have Gemini analysis, use it
    if (queryAnalysis) {
      const orConditions = [];

      // Add category search if available
      if (queryAnalysis.categories && queryAnalysis.categories.length > 0) {
        orConditions.push({ category: { $in: queryAnalysis.categories } });
        // Also search by type that might map to these categories
        const categoryTypes = {
          food: ["food bank", "meal", "pantry", "nutrition"],
          housing: ["shelter", "housing", "homeless"],
          healthcare: ["health", "medical", "clinic", "therapy"],
          employment: ["job", "career", "employment", "work"],
        };

        queryAnalysis.categories.forEach((category) => {
          if (categoryTypes[category]) {
            categoryTypes[category].forEach((type) => {
              orConditions.push({ type: { $regex: type, $options: "i" } });
            });
          }
        });
      }

      // Add keyword search
      if (queryAnalysis.keywords && queryAnalysis.keywords.length > 0) {
        queryAnalysis.keywords.forEach((keyword) => {
          orConditions.push({ name: { $regex: keyword, $options: "i" } });
          orConditions.push({
            description: { $regex: keyword, $options: "i" },
          });
          orConditions.push({ services: { $regex: keyword, $options: "i" } });
        });
      }

      if (orConditions.length > 0) {
        searchCriteria.$or = orConditions;
      }
    } else {
      // Fallback to basic keyword matching
      const orConditions = [];

      // Try to match keywords to categories
      const categoryKeywords = {
        food: ["food", "hungry", "meal", "eat", "nutrition"],
        housing: ["shelter", "housing", "homeless", "stay", "sleep"],
        healthcare: ["health", "medical", "doctor", "sick", "dental"],
        employment: ["job", "work", "employment", "career", "resume"],
      };

      // Add conditions for each keyword
      keywords.forEach((keyword) => {
        // Check if keyword matches a category
        for (const [category, words] of Object.entries(categoryKeywords)) {
          if (words.includes(keyword) || keyword.includes(category)) {
            orConditions.push({ category });
            break;
          }
        }

        // Add general search conditions
        orConditions.push({ name: { $regex: keyword, $options: "i" } });
        orConditions.push({ description: { $regex: keyword, $options: "i" } });
        orConditions.push({ type: { $regex: keyword, $options: "i" } });
        orConditions.push({ services: { $regex: keyword, $options: "i" } });
      });

      if (orConditions.length > 0) {
        searchCriteria.$or = orConditions;
      }
    }

    console.log(
      "Final search criteria:",
      JSON.stringify(searchCriteria, null, 2)
    );

    // If search criteria is empty, return all resources
    if (Object.keys(searchCriteria).length === 0) {
      searchCriteria = {};
    }

    // Execute the search
    const resources = await Resource.find(searchCriteria);
    console.log(`Found ${resources.length} matching resources`);

    // Generate explanation (simplified if Gemini fails)
    let explanation = "";
    try {
      if (queryAnalysis) {
        explanation = await generateResultsExplanation(
          resources,
          queryAnalysis
        );
      } else {
        explanation = `Found ${
          resources.length
        } resources that might help with your needs. These include ${getResourceTypeDescription(
          resources
        )}.`;
      }
    } catch (error) {
      console.error("Error generating explanation:", error);
      explanation = `Here are ${resources.length} resources that might help with your needs.`;
    }

    // Log the search
    try {
      const searchLog = new SearchLog({
        query: query,
        processed_query: queryAnalysis || {
          keywords: keywords,
          categories: [],
          rephrased_query: query,
        },
        results_count: resources.length,
        session_id: sessionId || Math.random().toString(36).substring(2, 15),
      });

      await searchLog.save();
    } catch (error) {
      console.error("Error saving search log:", error);
      // Continue without failing the request
    }

    // Return search results
    res.json({
      resources,
      explanation,
      search_log_id: "search-" + Date.now(),
    });
  } catch (err) {
    console.error("Search error:", err);
    res
      .status(500)
      .json({ message: "An error occurred during search", error: err.message });
  }
});

// Helper function to create a description of resource types
function getResourceTypeDescription(resources) {
  const types = new Set();

  resources.forEach((resource) => {
    if (resource.type) {
      types.add(resource.type.toLowerCase());
    } else if (resource.category) {
      types.add(resource.category.toLowerCase());
    }
  });

  const typeArray = Array.from(types);

  if (typeArray.length === 0) {
    return "various services";
  } else if (typeArray.length === 1) {
    return typeArray[0];
  } else if (typeArray.length === 2) {
    return `${typeArray[0]} and ${typeArray[1]}`;
  } else {
    const lastType = typeArray.pop();
    return `${typeArray.join(", ")}, and ${lastType}`;
  }
}

module.exports = router;
