// Global variables
let userLocation = null;
let searchResults = [];
let sessionId = localStorage.getItem("session_id") || generateSessionId();

// Store session ID in localStorage
localStorage.setItem("session_id", sessionId);

// DOM Elements
const searchForm = document.getElementById("search-form");
const searchQuery = document.getElementById("search-query");
const locationInput = document.getElementById("location-input");
const locationDetect = document.getElementById("location-detect");
const searchLoader = document.getElementById("search-loader");
const searchExplanation = document.getElementById("search-explanation");
const resultsContainer = document.getElementById("results-container");
const resourcesGrid = document.getElementById("resources-grid");
const resultsCount = document.getElementById("results-count");
const noResults = document.getElementById("no-results");
const filterButtons = document.querySelectorAll(".filter-btn");

// Category colors for visual styling
const categoryColors = {
  food: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-100" },
  housing: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-100" },
  healthcare: { bg: "bg-red-600", text: "text-red-600", light: "bg-red-100" },
  employment: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    light: "bg-purple-100",
  },
  default: { bg: "bg-gray-600", text: "text-gray-600", light: "bg-gray-100" },
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Get references to elements
  const searchForm = document.getElementById("search-form");
  const locationDetect = document.getElementById("location-detect");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Add event listeners only if elements exist
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearch);
  }

  if (locationDetect) {
    locationDetect.addEventListener("click", detectUserLocation);
  }

  if (filterButtons.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", handleFilterClick);
    });
  }

  // Check for search params in URL (for shared links)
  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get("q");
  if (queryParam && searchForm) {
    const searchQueryInput = document.getElementById("search-query");
    if (searchQueryInput) {
      searchQueryInput.value = queryParam;
      handleSearch(new Event("submit"));
    }
  }

  // Initialize any other features
  initializeSavedResources();
});

function initializeSavedResources() {
  // Load saved resources from localStorage
  const savedResources = getSavedResources();
  console.log("Loaded saved resources:", savedResources.length);
}

function getSavedResources() {
  const saved = localStorage.getItem("saved_resources");
  return saved ? JSON.parse(saved) : [];
}

function toggleSaveResource(resource, button) {
  const savedResources = getSavedResources();
  const index = savedResources.findIndex((r) => r._id === resource._id);

  if (index === -1) {
    // Save resource
    savedResources.push({
      _id: resource._id,
      name: resource.name,
      type: resource.type || resource.category,
      address:
        resource.address ||
        (resource.location && resource.location.address) ||
        "",
      savedAt: new Date().toISOString(),
    });
    button.innerHTML = '<i class="fas fa-bookmark mr-1"></i> Saved';
    button.classList.add("bg-blue-100");
    button.classList.remove("bg-gray-100");
  } else {
    // Remove resource
    savedResources.splice(index, 1);
    button.innerHTML = '<i class="far fa-bookmark mr-1"></i> Save';
    button.classList.remove("bg-blue-100");
    button.classList.add("bg-gray-100");
  }

  localStorage.setItem("saved_resources", JSON.stringify(savedResources));
}

// Handle the search form submission
async function handleSearch(e) {
  e.preventDefault();
  const query = searchQuery.value.trim();

  if (!query) {
    alert("Please enter a search query");
    return;
  }

  // Show loading state
  setLoadingState(true);

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        location: userLocation,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const data = await response.json();

    // Process and display results after a 2-second delay
    setTimeout(() => {
      // Process and display results
      searchResults = data.resources;
      displaySearchResults(data);

      // Update URL with search query for bookmarking/sharing
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", query);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({ path: newUrl }, "", newUrl);

      // Hide loading state
      setLoadingState(false);
    }, 1000); // 1-second delay
  } catch (error) {
    console.error("Search error:", error);
    alert("An error occurred during search. Please try again.");
    setLoadingState(false);
  }
}

// Display search results
function displaySearchResults(data) {
  const { resources, explanation } = data;

  // Display explanation
  searchExplanation.textContent = explanation;
  searchExplanation.classList.remove("hidden");

  // Display results count
  resultsCount.textContent = `${resources.length} found`;

  // Clear previous results
  resourcesGrid.innerHTML = "";

  if (resources.length === 0) {
    // Show no results message
    noResults.classList.remove("hidden");
    resultsContainer.classList.remove("hidden");
    return;
  }

  // Hide no results message if there are results
  noResults.classList.add("hidden");

  // Create and append resource cards
  resources.forEach((resource) => {
    const card = createResourceCard(resource);
    resourcesGrid.appendChild(card);
  });

  // Show results container
  resultsContainer.classList.remove("hidden");

  // Reset filters
  setActiveFilter("all");
}

// Create a resource card from template
function createResourceCard(resource) {
  const template = document.getElementById("resource-card-template");
  const card = template.content.cloneNode(true);

  // Get category from either the category field or derive from type
  const category = resource.category || getResourceCategory(resource);

  // Set data attribute for filtering
  const resourceCard = card.querySelector(".resource-card");
  resourceCard.setAttribute("data-category", category);
  resourceCard.setAttribute("data-id", resource._id);

  // Set category colors
  const colors = categoryColors[category] || categoryColors.default;
  const categoryBanner = card.querySelector(".category-banner");
  categoryBanner.classList.add(colors.bg);

  // Set content
  card.querySelector(".category-name").textContent = capitalizeFirstLetter(
    resource.type || category
  );
  card.querySelector(".resource-name").textContent = resource.name;
  card.querySelector(".resource-description").textContent =
    resource.description || "";

  // Handle different address formats
  const addressElement = card.querySelector(".resource-address");
  // Try to get address from different possible locations in the data structure
  const address =
    resource.address ||
    (resource.location && resource.location.address) ||
    "Address not available";

  addressElement.textContent = address;

  // Set phone number
  const phoneElement = card.querySelector(".resource-phone");
  if (resource.contact && resource.contact.phone) {
    phoneElement.textContent = resource.contact.phone;
    // Add click-to-call functionality
    phoneElement.closest("div").addEventListener("click", () => {
      window.location.href = `tel:${resource.contact.phone}`;
    });
  } else {
    phoneElement.closest("div").classList.add("hidden");
  }

  // Set hours - support both day name and day number formats
  const todayHoursElement = card.querySelector(".today-hours");
  const allHoursContainer = card.querySelector(".all-hours-container");
  const viewHoursBtn = card.querySelector(".view-hours-btn");

  if (resource.hours && resource.hours.length > 0) {
    // Get today's day as both name and number
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayNum = new Date().getDay(); // 0-6
    const todayName = days[todayNum];

    // Find today's hours - support both formats
    const todayHours = resource.hours.find(
      (h) =>
        h.day === todayName || // String format
        h.day === todayNum // Number format
    );

    const todayHoursText =
      todayHours && todayHours.open
        ? `Today: ${todayHours.open}${
            todayHours.open === "24 hours" ? "" : ` - ${todayHours.close}`
          }`
        : "Closed today";

    // Set today's hours text
    todayHoursElement.textContent = todayHoursText;

    // Create the full hours display
    const allHoursList = document.createElement("div");
    allHoursList.className = "hours-list";

    // Sort hours by day number if possible
    const sortedHours = [...resource.hours].sort((a, b) => {
      // Try to convert to numbers first
      const dayA = typeof a.day === "number" ? a.day : days.indexOf(a.day);
      const dayB = typeof b.day === "number" ? b.day : days.indexOf(b.day);
      return dayA - dayB;
    });

    // Create a display for each day
    sortedHours.forEach((hour) => {
      const dayNum =
        typeof hour.day === "number" ? hour.day : days.indexOf(hour.day);
      const dayName = days[dayNum];

      const hourRow = document.createElement("div");
      hourRow.className = "hour-row";
      hourRow.style.display = "flex";
      hourRow.style.justifyContent = "space-between";
      hourRow.style.marginBottom = "0.25rem";

      const dayLabel = document.createElement("span");
      dayLabel.textContent = dayName;
      dayLabel.style.fontWeight = dayNum === todayNum ? "bold" : "normal";
      dayLabel.style.marginRight = "1rem";

      const timeValue = document.createElement("span");
      if (hour.open) {
        timeValue.textContent =
          hour.open === "24 hours"
            ? "24 hours"
            : `${hour.open} - ${hour.close}`;
      } else {
        timeValue.textContent = "Closed";
      }

      hourRow.appendChild(dayLabel);
      hourRow.appendChild(timeValue);
      allHoursList.appendChild(hourRow);
    });

    // Add the hours list to the container
    allHoursContainer.appendChild(allHoursList);

    // Add toggle functionality
    viewHoursBtn.addEventListener("click", () => {
      if (allHoursContainer.style.display === "none") {
        allHoursContainer.style.display = "block";
        viewHoursBtn.textContent = "Hide hours";
      } else {
        allHoursContainer.style.display = "none";
        viewHoursBtn.textContent = "View all hours";
      }
    });
  } else {
    // No hours available
    todayHoursElement.textContent = "Hours not available";
    viewHoursBtn.style.display = "none";
  }
  // Set eligibility/requirements (support both fields)
  const eligibilityElement = card.querySelector(".resource-eligibility");
  if (resource.eligibility) {
    eligibilityElement.innerHTML = `<strong>Eligibility:</strong> ${resource.eligibility}`;
  } else if (resource.requirements && resource.requirements.length > 0) {
    eligibilityElement.innerHTML = `<strong>Requirements:</strong> ${resource.requirements.join(
      ", "
    )}`;
  } else {
    eligibilityElement.classList.add("hidden");
  }

  // Set website link (support both formats)
  const websiteElement = card.querySelector(".resource-website");
  const website =
    resource.website || (resource.contact && resource.contact.website);
  if (website) {
    // Make sure website URL has protocol
    let websiteUrl = website;
    if (
      !websiteUrl.startsWith("http://") &&
      !websiteUrl.startsWith("https://")
    ) {
      websiteUrl = "https://" + websiteUrl;
    }

    websiteElement.href = websiteUrl;
    websiteElement.setAttribute("target", "_blank");
    websiteElement.setAttribute("rel", "noopener noreferrer");

    // Make sure the link is visible
    websiteElement.style.display = "inline-flex";
    websiteElement.style.alignItems = "center";
  } else {
    // Hide the website link if not available
    websiteElement.style.display = "none";
  }
  // Set tags
  const tagsContainer = card.querySelector(".resource-tags");

  // Add language tags
  if (resource.languages && resource.languages.length > 0) {
    resource.languages.forEach((language) => {
      const tag = document.createElement("span");
      tag.classList.add(
        "px-2",
        "py-1",
        "rounded-full",
        "text-xs",
        "bg-blue-100",
        "text-blue-800"
      );
      tag.innerHTML = `<i class="fas fa-language mr-1"></i> ${language}`;
      tagsContainer.appendChild(tag);
    });
  }

  // Add services tags
  if (resource.services && resource.services.length > 0) {
    resource.services.forEach((service) => {
      const tag = document.createElement("span");
      tag.classList.add(
        "px-2",
        "py-1",
        "rounded-full",
        "text-xs",
        "bg-purple-100",
        "text-purple-800"
      );
      tag.innerHTML = `<i class="fas fa-hands-helping mr-1"></i> ${service}`;
      tagsContainer.appendChild(tag);
    });
  }

  // Add accessibility tags
  if (resource.accessibility && resource.accessibility.length > 0) {
    resource.accessibility.forEach((feature) => {
      const tag = document.createElement("span");
      tag.classList.add(
        "px-2",
        "py-1",
        "rounded-full",
        "text-xs",
        "bg-green-100",
        "text-green-800"
      );

      let icon = "fa-check";
      if (feature === "wheelchair") icon = "fa-wheelchair";
      if (feature === "transit") icon = "fa-bus";

      tag.innerHTML = `<i class="fas ${icon} mr-1"></i> ${capitalizeFirstLetter(
        feature
      )}`;
      tagsContainer.appendChild(tag);
    });
  }

  // Set distance badge if available
  const distanceBadge = card.querySelector(".distance-badge");
  if (resource.distance !== undefined) {
    const distanceKm = (resource.distance / 1000).toFixed(1);
    distanceBadge.textContent = `${distanceKm} km`;
  } else {
    distanceBadge.classList.add("hidden");
  }

  // Set up directions button
  const directionsBtn = card.querySelector(".directions-btn");

  if (address) {
    directionsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const encodedAddress = encodeURIComponent(address);
      // Open in Google Maps
      window.open(
        `https://maps.google.com/maps?daddr=${encodedAddress}`,
        "_blank"
      );
    });
  } else {
    // If no address is available, disable the button
    directionsBtn.disabled = true;
    directionsBtn.classList.add("opacity-50");
    directionsBtn.title = "No address available";
  }

  // Set up save button
  const saveBtn = card.querySelector(".save-btn");
  const isSaved = isSavedResource(resource._id);

  if (isSaved) {
    saveBtn.innerHTML = '<i class="fas fa-bookmark mr-1"></i> Saved';
    saveBtn.classList.add("bg-blue-100");
    saveBtn.classList.remove("bg-gray-100");
  }

  saveBtn.addEventListener("click", () => {
    toggleSaveResource(resource, saveBtn);
  });

  // Add feedback event listener
  resourceCard.addEventListener("click", (e) => {
    // Ignore clicks on buttons and links
    if (e.target.closest("button") || e.target.closest("a")) {
      return;
    }

    // Log resource view (anonymously)
    logResourceView(resource._id);
  });

  return card;
}

// Handle filter button clicks
function handleFilterClick(e) {
  const filterValue = e.target.getAttribute("data-filter");
  filterResources(filterValue);
  setActiveFilter(filterValue);
}

// Filter resources by category
function filterResources(category) {
  const cards = resourcesGrid.querySelectorAll(".resource-card");

  cards.forEach((card) => {
    if (category === "all" || card.getAttribute("data-category") === category) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });

  // Check if any cards are visible
  const visibleCards = resourcesGrid.querySelectorAll(
    ".resource-card:not(.hidden)"
  );

  if (visibleCards.length === 0 && searchResults.length > 0) {
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
  }

  // Update count
  resultsCount.textContent = `${visibleCards.length} found`;
}

// Set the active filter button
function setActiveFilter(filterValue) {
  filterButtons.forEach((btn) => {
    if (btn.getAttribute("data-filter") === filterValue) {
      btn.classList.add("active", "bg-blue-100", "text-blue-800");
      btn.classList.remove("bg-gray-100", "text-gray-800");
    } else {
      btn.classList.remove("active", "bg-blue-100", "text-blue-800");
      btn.classList.add("bg-gray-100", "text-gray-800");
    }
  });
}

// Detect user's current location
function detectUserLocation() {
  if (navigator.geolocation) {
    // Change button appearance to show it's working
    locationDetect.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    locationDetect.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success handler
        userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Reverse geocode to get address (simplified)
        locationInput.value = `Near me (${userLocation.latitude.toFixed(
          4
        )}, ${userLocation.longitude.toFixed(4)})`;

        // Reset the button
        locationDetect.innerHTML =
          '<i class="fas fa-check" style="color: #10b981;"></i>';
        locationDetect.disabled = false;

        // If we already have results, we could resort by distance
        if (
          searchResults.length > 0 &&
          confirm("Would you like to search again with your current location?")
        ) {
          // Trigger a new search with the current query and the new location
          handleSearch(new Event("submit"));
        }

        // Change back to original icon after a delay
        setTimeout(() => {
          locationDetect.innerHTML =
            '<i class="fas fa-location-crosshairs"></i>';
        }, 3000);
      },
      (error) => {
        // Error handler
        console.error("Geolocation error:", error);

        let errorMessage = "Unable to access your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += " Location permission was denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += " Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += " The request to get location timed out.";
            break;
        }

        alert(
          errorMessage +
            " Please check your browser settings or enter your location manually."
        );

        // Reset the button
        locationDetect.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
        locationDetect.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } else {
    alert(
      "Geolocation is not supported by your browser. Please enter your location manually."
    );
  }
}

// Set loading state
function setLoadingState(isLoading) {
  const submitButton = searchForm.querySelector('button[type="submit"]');

  if (isLoading) {
    // Disable the button while loading
    submitButton.disabled = true;
    // Show the loader
    searchLoader.style.display = "block";
    // Hide any previous results
    if (resultsContainer.classList.contains("hidden") === false) {
      resultsContainer.classList.add("hidden");
    }
    if (searchExplanation.classList.contains("hidden") === false) {
      searchExplanation.classList.add("hidden");
    }
  } else {
    // Re-enable the button when done
    submitButton.disabled = false;
    // Hide the loader
    searchLoader.style.display = "none";
  }
}

// Saved resources management
function getSavedResources() {
  const saved = localStorage.getItem("saved_resources");
  return saved ? JSON.parse(saved) : [];
}

function isSavedResource(resourceId) {
  const savedResources = getSavedResources();
  return savedResources.some((r) => r._id === resourceId);
}

function toggleSaveResource(resource, button) {
  const savedResources = getSavedResources();
  const index = savedResources.findIndex((r) => r._id === resource._id);

  if (index === -1) {
    // Save resource
    savedResources.push({
      _id: resource._id,
      name: resource.name,
      category: resource.category,
      address: resource.location.address,
      savedAt: new Date().toISOString(),
    });
    button.innerHTML = '<i class="fas fa-bookmark mr-1"></i> Saved';
    button.classList.add("bg-blue-100");
    button.classList.remove("bg-gray-100");
  } else {
    // Remove resource
    savedResources.splice(index, 1);
    button.innerHTML = '<i class="far fa-bookmark mr-1"></i> Save';
    button.classList.remove("bg-blue-100");
    button.classList.add("bg-gray-100");
  }

  localStorage.setItem("saved_resources", JSON.stringify(savedResources));
}

// Log resource view (anonymously)
async function logResourceView(resourceId) {
  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resource_id: resourceId,
        rating: 0, // View only, no rating
        helpful: true,
        session_id: sessionId,
      }),
    });
  } catch (error) {
    console.error("Error logging resource view:", error);
  }
}

// Helper functions
function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Map resource types to categories
function getResourceCategory(resource) {
  // Use explicit mapping for common types
  const typeToCategory = {
    shelter: "housing",
    "food bank": "food",
    "food pantry": "food",
    "meal program": "food",
    "medical clinic": "healthcare",
    "health center": "healthcare",
    "mental health": "healthcare",
    "job center": "employment",
    "employment center": "employment",
    "career center": "employment",
  };

  // Look for specific services to categorize
  if (resource.services) {
    if (
      resource.services.some(
        (s) =>
          s.toLowerCase().includes("food") ||
          s.toLowerCase().includes("meal") ||
          s.toLowerCase().includes("nutrition")
      )
    ) {
      return "food";
    }

    if (
      resource.services.some(
        (s) =>
          s.toLowerCase().includes("housing") ||
          s.toLowerCase().includes("shelter") ||
          s.toLowerCase().includes("homeless")
      )
    ) {
      return "housing";
    }

    if (
      resource.services.some(
        (s) =>
          s.toLowerCase().includes("health") ||
          s.toLowerCase().includes("medical") ||
          s.toLowerCase().includes("therapy")
      )
    ) {
      return "healthcare";
    }

    if (
      resource.services.some(
        (s) =>
          s.toLowerCase().includes("job") ||
          s.toLowerCase().includes("employ") ||
          s.toLowerCase().includes("career")
      )
    ) {
      return "employment";
    }
  }

  // Look up by type
  if (resource.type) {
    return typeToCategory[resource.type.toLowerCase()] || "other";
  }

  // Default
  return "other";
}
