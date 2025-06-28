import apiClient, { handleApiResponse } from "./apiClient";

/**
 * @param {Object} data
 * @param {number} data.productId
 * @param {number} data.rating
 * @param {string} data.comment
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const createReview = async (data) => {
  return handleApiResponse(apiClient.post("/review", data));
};

/**
 * @param {number} productId
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const getReviewsByProductId = async (productId) => {
  return handleApiResponse(apiClient.get(`/review/${productId}`));
};

/**
 * @param {number} id
 * @param {Object} data
 * @param {number} data.rating
 * @param {string} data.comment
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const updateReview = async (id, data) => {
  return handleApiResponse(apiClient.put(`/review/${id}`, data));
};

/**
 * @param {number} id
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const deleteReview = async (id) => {
  return handleApiResponse(apiClient.delete(`/review/${id}`));
};
