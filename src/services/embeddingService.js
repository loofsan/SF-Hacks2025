// src/services/embeddingService.js - Simplified version without embeddings

const Resource = require("../models/Resource");

/**
 * Find similar resources to a given resource using category and type matching
 * @param {string} resourceId - The ID of the resource to find similar resources for
 * @param {number} limit - The number of similar resources to return
 * @returns {Array} - Array of similar resources
 */
async function findSimilarResources(resourceId, limit = 3) {
  try {
    // Get the resource
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }

    // Find resources with similar characteristics
    const query = {
      _id: { $ne: resource._id }, // Exclude the current resource
    };

    // Add type/category matching conditions
    const typeConditions = [];

    // Match by type
    if (resource.type) {
      typeConditions.push({ type: resource.type });
    }

    // Match by category
    if (resource.category) {
      typeConditions.push({ category: resource.category });
    }

    // Match by subcategories
    if (resource.subcategories && resource.subcategories.length > 0) {
      typeConditions.push({ subcategories: { $in: resource.subcategories } });
    }

    // Match by services
    if (resource.services && resource.services.length > 0) {
      typeConditions.push({ services: { $in: resource.services } });
    }

    // Add the combined conditions to the query
    if (typeConditions.length > 0) {
      query.$or = typeConditions;
    }

    // Find similar resources
    const similarResources = await Resource.find(query).limit(limit).lean();

    // If we don't have enough results, try a more relaxed search
    if (similarResources.length < limit) {
      return findMoreSimilarResources(resource, similarResources, limit);
    }

    return similarResources;
  } catch (error) {
    console.error("Error finding similar resources:", error);
    return [];
  }
}

/**
 * Find more similar resources with relaxed criteria if initial search returns few results
 * @param {Object} resource - The original resource
 * @param {Array} existingResults - Already found similar resources
 * @param {number} limit - The desired number of results
 * @returns {Array} - Combined array of similar resources
 */
async function findMoreSimilarResources(resource, existingResults, limit) {
  try {
    // Extract existing result IDs
    const existingIds = existingResults.map((r) => r._id);
    // Also exclude the original resource
    existingIds.push(resource._id);

    // Create a text search query based on resource description
    const textSearchQuery = {};

    // Add text search if description is available
    if (resource.description) {
      textSearchQuery.$text = { $search: resource.description };
    }

    // Exclude already found resources
    textSearchQuery._id = { $nin: existingIds };

    // Find additional resources
    const additionalResources = await Resource.find(textSearchQuery)
      .limit(limit - existingResults.length)
      .lean();

    // Combine results
    return [...existingResults, ...additionalResources];
  } catch (error) {
    console.error("Error finding additional similar resources:", error);
    return existingResults; // Return what we already found
  }
}

/**
 * Placeholder to match the original API
 */
async function updateAllResourceEmbeddings() {
  console.log("Using simplified similarity matching instead of embeddings");
  return;
}

module.exports = {
  findSimilarResources,
  updateAllResourceEmbeddings,
};
