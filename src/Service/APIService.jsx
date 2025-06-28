import apiClient, { handleApiResponse } from "./apiClient";

/**
 * @param {string} msg
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const apimessage = async (msg) => {
  return handleApiResponse(apiClient.post(`/ai/respond?message=${msg}`));
};
