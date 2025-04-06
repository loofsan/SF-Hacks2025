document.addEventListener("DOMContentLoaded", () => {
  const resourceForm = document.getElementById("resource-form");
  const resetFormButton = document.getElementById("reset-form");
  const successMessage = document.getElementById("success-message");
  const submitAnotherButton = document.getElementById("submit-another");
  const detectLocationButton = document.getElementById("detect-location");

  // Event listeners
  resourceForm.addEventListener("submit", handleFormSubmit);
  resetFormButton.addEventListener("click", resetForm);
  submitAnotherButton.addEventListener("click", showForm);
  detectLocationButton.addEventListener("click", detectLocation);

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Show loading state
    const submitButton = resourceForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
      const resourceData = collectFormData();

      // Send data to server
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit resource");
      }

      // Show success message
      showSuccessMessage();
    } catch (error) {
      console.error("Error submitting resource:", error);
      alert(
        "An error occurred while submitting the resource: " + error.message
      );
    } finally {
      // Reset button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  }

  // Collect form data
  function collectFormData() {
    const name = document.getElementById("resource-name").value.trim();
    const type = document.getElementById("resource-type").value;
    const description = document
      .getElementById("resource-description")
      .value.trim();
    const address = document.getElementById("resource-address").value.trim();

    // Get location coordinates with appropriate precision
    let latitude =
      parseFloat(document.getElementById("resource-latitude").value) || null;
    let longitude =
      parseFloat(document.getElementById("resource-longitude").value) || null;

    // Round to 4 decimal places if values exist
    if (latitude !== null) latitude = parseFloat(latitude.toFixed(4));
    if (longitude !== null) longitude = parseFloat(longitude.toFixed(4));

    const phone = document.getElementById("resource-phone").value.trim();
    const email = document.getElementById("resource-email").value.trim();
    const website = document.getElementById("resource-website").value.trim();
    const services = document
      .getElementById("resource-services")
      .value.split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const requirements = document
      .getElementById("resource-requirements")
      .value.split(",")
      .map((r) => r.trim())
      .filter((r) => r);
    const languages = document
      .getElementById("resource-languages")
      .value.split(",")
      .map((l) => l.trim())
      .filter((l) => l);
    const capacity = document.getElementById("resource-capacity").value.trim();

    // Get hours of operation
    const hours = [];
    document.querySelectorAll(".day-hours").forEach((input) => {
      const day = parseInt(input.getAttribute("data-day"));
      const value = input.value.trim();

      if (value) {
        let open, close;
        if (value.toLowerCase() === "24 hours") {
          open = "24 hours";
          close = "24 hours";
        } else if (value.toLowerCase() === "closed") {
          open = "";
          close = "";
        } else if (value.includes("-")) {
          [open, close] = value.split("-").map((v) => v.trim());
        } else {
          open = value;
          close = "";
        }

        hours.push({ day, open, close });
      } else {
        // Add entry with empty values for all days to ensure completeness
        hours.push({ day, open: "", close: "" });
      }
    });

    // Get accessibility features
    const accessibility = [];
    document
      .querySelectorAll(".accessibility-checkbox:checked")
      .forEach((checkbox) => {
        accessibility.push(checkbox.value);
      });

    // Create resource data object
    const resourceData = {
      name,
      type,
      description,
      address,
      contactPhone: phone,
      contact: {
        phone,
        email,
        website,
      },
      services,
      requirements,
      languages,
      accessibility,
      capacity,
      hours,
    };

    // Add coordinates if both latitude and longitude are provided
    if (latitude !== null && longitude !== null) {
      resourceData.location = {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON format requires [longitude, latitude] order
      };
    }

    // Remove null or empty values and empty arrays
    Object.keys(resourceData).forEach((key) => {
      if (
        resourceData[key] === null ||
        resourceData[key] === "" ||
        (Array.isArray(resourceData[key]) && resourceData[key].length === 0)
      ) {
        delete resourceData[key];
      }
    });

    // Remove empty contact object
    if (
      resourceData.contact &&
      Object.keys(resourceData.contact).every(
        (key) => !resourceData.contact[key]
      )
    ) {
      delete resourceData.contact;
    }

    return resourceData;
  }

  // Validate form
  function validateForm() {
    const requiredFields = [
      "resource-name",
      "resource-type",
      "resource-description",
      "resource-address",
      "resource-services",
    ];

    let isValid = true;

    // Check required fields
    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add("error");
        isValid = false;
      } else {
        field.classList.remove("error");
      }
    });

    // Show validation error message
    if (!isValid) {
      alert("Please fill in all required fields marked with *");
    }

    return isValid;
  }

  // Reset form
  function resetForm() {
    if (
      confirm(
        "Are you sure you want to reset the form? All entered data will be lost."
      )
    ) {
      resourceForm.reset();
      // Also clear any error styling
      document
        .querySelectorAll(".error")
        .forEach((el) => el.classList.remove("error"));
    }
  }

  // Show success message
  function showSuccessMessage() {
    resourceForm.classList.add("hidden");
    successMessage.classList.remove("hidden");

    // Scroll to top of success message
    successMessage.scrollIntoView({ behavior: "smooth" });
  }

  // Show form again
  function showForm() {
    resourceForm.reset();
    document
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));
    successMessage.classList.add("hidden");
    resourceForm.classList.remove("hidden");
  }

  // Detect user's location with improved precision
  function detectLocation() {
    if (navigator.geolocation) {
      detectLocationButton.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-1"></i>Detecting...';
      detectLocationButton.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get coordinates with 4 decimal places precision (about 11 meters)
          const latitude = parseFloat(position.coords.latitude.toFixed(4));
          const longitude = parseFloat(position.coords.longitude.toFixed(4));

          // Set input values
          document.getElementById("resource-latitude").value = latitude;
          document.getElementById("resource-longitude").value = longitude;

          detectLocationButton.innerHTML =
            '<i class="fas fa-check text-green-500 mr-1"></i>Location detected';
          detectLocationButton.disabled = false;

          // Revert back after a few seconds
          setTimeout(() => {
            detectLocationButton.innerHTML =
              '<i class="fas fa-location-crosshairs mr-1"></i>Detect my location';
          }, 3000);
        },
        (error) => {
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
              " Please check your browser settings or enter coordinates manually."
          );

          detectLocationButton.innerHTML =
            '<i class="fas fa-location-crosshairs mr-1"></i>Detect my location';
          detectLocationButton.disabled = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  }
});
