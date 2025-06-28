import apiClient, { handleApiResponse } from "./apiClient";

/**
 * Get all addresses
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const getAddress = async () => {
  return handleApiResponse(apiClient.get(`/address`));
};

/**
 * Create a new address
 * @param {Object} addressData - Address data
 * @param {string} addressData.address - Full address string
 * @param {Object} addressData.coordinates - Coordinates object
 * @param {number} addressData.coordinates.lat - Latitude
 * @param {number} addressData.coordinates.lng - Longitude
 * @param {Object} addressData.details - Additional details
 * @param {string} addressData.details.phoneNumber - Phone number
 * @param {string} addressData.details.landmark - Nearby landmark
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const createAddress = async (addressData) => {
  return handleApiResponse(apiClient.post(`/address`, addressData));
};

/**
 * Update an existing address
 * @param {number} id - Address ID
 * @param {Object} addressData - Address data to update
 * @param {string} addressData.address - Full address string
 * @param {Object} addressData.coordinates - Coordinates object
 * @param {number} addressData.coordinates.lat - Latitude
 * @param {number} addressData.coordinates.lng - Longitude
 * @param {Object} addressData.details - Additional details
 * @param {string} addressData.details.phoneNumber - Phone number
 * @param {string} addressData.details.landmark - Nearby landmark
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const updateAddress = async (id, addressData) => {
  return handleApiResponse(apiClient.put(`/address/${id}`, addressData));
};

/**
 * Delete an address
 * @param {number} id - Address ID
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const deleteAddress = async (id) => {
  return handleApiResponse(apiClient.delete(`/address/${id}`));
};

/**
 * Search for locations using LocationIQ API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of location predictions
 */
export const searchLocations = async (query) => {
  const LOCATIONIQ_API_KEY =
    import.meta.env.VITE_LOCATIONIQ_API_KEY ||
    "pk.116948bd7371b99a5393295d3b1c1e31";

  const LOCATIONIQ_BASE_URL = "https://us1.locationiq.com/v1";

  try {
    const response = await fetch(
      `${LOCATIONIQ_BASE_URL}/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
        query
      )}&format=json&countrycodes=eg&limit=5&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data)) {
      return data.map((item) => ({
        place_id: item.place_id,
        description: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || "location",
        address: item.address || {},
      }));
    }
    return [];
  } catch (error) {
    console.error("LocationIQ search error:", error);
    throw error;
  }
};

/**
 * Reverse geocoding using LocationIQ API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Address string
 */
export const reverseGeocode = async (lat, lng) => {
  const LOCATIONIQ_API_KEY =
    import.meta.env.VITE_LOCATIONIQ_API_KEY ||
    "pk.116948bd7371b99a5393295d3b1c1e31";
  const LOCATIONIQ_BASE_URL = "https://us1.locationiq.com/v1";

  try {
    const response = await fetch(
      `${LOCATIONIQ_BASE_URL}/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.display_name || "";
  } catch (error) {
    console.error("LocationIQ reverse geocoding error:", error);
    throw error;
  }
};
