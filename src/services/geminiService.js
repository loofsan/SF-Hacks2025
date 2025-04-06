// src/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Category = require("../models/Category");

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Analyze user query with Gemini AI to extract search parameters
 * @param {string} query - The user's natural language query
 * @returns {Object} - Extracted search parameters
 */
async function analyzeQuery(query) {
  try {
    // Get all categories and their keywords from the database
    const categories = await Category.find();
    const categoryData = categories.map((cat) => ({
      name: cat.name,
      displayName: cat.displayName,
      subcategories: cat.subcategories,
      keywords: cat.keywords,
    }));

    // Create a prompt for Gemini
    const prompt = `
      You are an AI assistant for a community resource navigator. Your task is to analyze a user's natural language query and extract key information to help them find appropriate resources. The user is looking for community resources in San Francisco.

      Available resource categories:
      ${JSON.stringify(categoryData, null, 2)}

      User query: "${query}"

      Analyze this query and extract the following information in JSON format:
      1. Primary categories the user is looking for (use the category names exactly as listed)
      2. Any subcategories mentioned (use the subcategory names exactly as listed)
      3. Important keywords that might help narrow the search
      4. Any location mentioned (neighborhood, address, etc.)
      5. A rephrased version of the query that highlights the core need
      6. Any special requirements mentioned (languages, accessibility, etc.)

      Response format:
      {
        "categories": ["category1", "category2"],
        "subcategories": ["subcategory1", "subcategory2"],
        "keywords": ["keyword1", "keyword2"],
        "location": "mentioned location or empty string",
        "rephrased_query": "clear rephrasing of the core need",
        "special_requirements": ["requirement1", "requirement2"]
      }
    `;

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handling potential formatting issues)
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response as JSON");
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    return parsedResult;
  } catch (error) {
    console.error("Error analyzing query with Gemini:", error);
    // Fallback to basic keyword matching if Gemini fails
    return fallbackQueryAnalysis(query);
  }
}

/**
 * Generate a personalized response explaining the search results
 * @param {Array} resources - The resources found
 * @param {Object} queryAnalysis - The analysis of the original query
 * @returns {string} - A personalized explanation of the results
 */
async function generateResultsExplanation(resources, queryAnalysis) {
  try {
    // Create a simplified version of resources for the prompt
    const simplifiedResources = resources.map((r) => ({
      name: r.name,
      category: r.category,
      description: r.description,
      eligibility: r.eligibility,
      location: r.location.address,
    }));

    const prompt = `
      You are an AI assistant for a community resource navigator. Your task is to create a helpful, compassionate explanation of search results for someone looking for community resources.

      Original query analysis: ${JSON.stringify(queryAnalysis)}
      
      Resources found (${resources.length}): 
      ${JSON.stringify(simplifiedResources, null, 2)}

      Please generate a brief, helpful explanation of these results that:
      1. Acknowledges the user's need in a compassionate way
      2. Explains what types of resources were found
      3. Highlights any particularly relevant matches
      4. Offers brief guidance on next steps (e.g., contacting resources)
      5. If few or no results were found, offers alternative suggestions

      Keep your response concise (3-5 sentences) and focus on being helpful rather than technical.
    `;

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating results explanation:", error);
    // Fallback message if Gemini fails
    return `We found ${resources.length} resources that might help with your needs. Please review the list and contact any that seem like a good fit for your situation.`;
  }
}

/**
 * Fallback method for basic query analysis when Gemini is unavailable
 * @param {string} query - The user's query
 * @returns {Object} - Basic search parameters
 */
function fallbackQueryAnalysis(query) {
  const queryLower = query.toLowerCase();

  // Simple keyword matching for categories
  const categoryMatches = [];
  if (
    queryLower.includes("food") ||
    queryLower.includes("hungry") ||
    queryLower.includes("meal")
  ) {
    categoryMatches.push("food");
  }
  if (
    queryLower.includes("house") ||
    queryLower.includes("home") ||
    queryLower.includes("shelter") ||
    queryLower.includes("homeless")
  ) {
    categoryMatches.push("housing");
  }
  if (
    queryLower.includes("health") ||
    queryLower.includes("doctor") ||
    queryLower.includes("medical") ||
    queryLower.includes("sick")
  ) {
    categoryMatches.push("healthcare");
  }
  if (
    queryLower.includes("job") ||
    queryLower.includes("work") ||
    queryLower.includes("employ") ||
    queryLower.includes("career")
  ) {
    categoryMatches.push("employment");
  }

  // Extract potential location from query
  const sfNeighborhoods = [
    "mission",
    "tenderloin",
    "sunset",
    "richmond",
    "bayview",
    "marina",
    "haight",
    "castro",
    "nob hill",
    "downtown",
  ];
  const locationMatch =
    sfNeighborhoods.find((n) => queryLower.includes(n)) || "";

  return {
    categories:
      categoryMatches.length > 0
        ? categoryMatches
        : ["food", "housing", "healthcare", "employment"],
    subcategories: [],
    keywords: query.split(" ").filter((word) => word.length > 3),
    location: locationMatch,
    rephrased_query: query,
    special_requirements: [],
  };
}

module.exports = {
  analyzeQuery,
  generateResultsExplanation,
};
