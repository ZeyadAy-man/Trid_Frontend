// import apiClient, { handleApiResponse } from "./apiClient";

// /**
//  * @param {Object} data
//  * @returns {Promise<{data, success, error}>}
//  */
// export const signup = async (data) => {
//   return handleApiResponse(apiClient.post("/auth/signup", data));
// };

// /**
//  * @param {Object} data
//  * @returns {Promise<{data, success, error}>}
//  */
// export const signin = async (data) => {
//   return await handleApiResponse(apiClient.post("/auth/signin", data));
// };

// /**
//  * @param {Object} data
//  * @returns {Promise<{data, success, error}>}
//  */
// export const forgotPassword = async (data) => {
//   return handleApiResponse(apiClient.post("/auth/password/reset", data));
// };

import apiClient, { handleApiResponse } from "./apiClient";

/**
 * @param {Object} data
 * @param {string} data.firstname
 * @param {string} data.lastname
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.birthDate
 * @param {string} data.gender
 * @returns {Promise<{data, success, error}>}
 */
export const register = async (data) => {
  return handleApiResponse(apiClient.post("/auth/register", data));
};

/**
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{data, success, error}>}
 */
export const authenticate = async (data) => {
  return await handleApiResponse(apiClient.post("/auth/authenticate", data));
};

/**
 * @param {string} token
 * @returns {Promise<{data, success, error}>}
 */
export const activateAccount = async (token) => {
  return handleApiResponse(
    apiClient.get(`/auth/activate-account?token=${token}`)
  );
};

/**
 * @param {Object} data
 * @param {string} data.refreshToken
 * @returns {Promise<{data, success, error}>}
 */
export const refreshToken = async (data) => {
  return handleApiResponse(apiClient.post("/auth/refresh-token", data));
};

/**
 * @param {Object} data
 * @param {string} data.email
 * @returns {Promise<{data, success, error}>}
 */
export const forgotPassword = async (data) => {
  return handleApiResponse(apiClient.post("/auth/forgot-password", data));
};

/**
 * @param {string} token
 * @param {Object} data
 * @param {string} data.password
 * @returns {Promise<{data, success, error}>}
 */
export const resetPassword = async (token, data) => {
  return handleApiResponse(
    apiClient.post(`/auth/reset-password?token=${token}`, data)
  );
};

/**
 * @param {Object} data
 * @param {string} data.refreshToken
 * @returns {Promise<{data, success, error}>}
 */
export const logout = async (data) => {
  return handleApiResponse(apiClient.post("/auth/logout", data));
};
