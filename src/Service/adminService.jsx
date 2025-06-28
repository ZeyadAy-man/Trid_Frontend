const API_BASE =
  "https://trid-dtgpbjcyecekdea8.uaenorth-01.azurewebsites.net/api/v1/admin";

export const adminService = {
  searchUsers: async (email, page = 0, size = 10) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_BASE}/users/search?email=${encodeURIComponent(
        email
      )}&page=${page}&size=${size}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorMsg =
        response.status === 403
          ? "Access denied. Admin privileges required."
          : response.status === 400
          ? "Invalid email pattern."
          : `Error: ${response.status}`;
      throw new Error(errorMsg);
    }

    return await response.json();
  },

  updateUserRoles: async (userId, roles) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/users/${userId}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roles),
    });

    if (!response.ok) {
      const errorMsg =
        response.status === 403
          ? "Access denied. Admin privileges required."
          : response.status === 404
          ? "User not found."
          : response.status === 400
          ? "Invalid roles format."
          : `Error: ${response.status}`;
      throw new Error(errorMsg);
    }

    return await response.json();
  },
};

// ------- API Client-based version below ---------

import apiClient, { handleApiResponse } from "./apiClient";

/**
 * @param {string} email
 * @param {number} page (default: 0)
 * @param {number} size (default: 10)
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const searchUser = async (email, page = 0, size = 10) => {
  const query = `?email=${encodeURIComponent(email)}&page=${page}&size=${size}`;
  return handleApiResponse(apiClient.get(`/admin/users/search${query}`));
};

/**
 * @param {string|number} userId
 * @param {Array<string>} roles
 * @returns {Promise<{data, success, error, statusCode}>}
 */
export const updateUserRole = async (userId, roles) => {
  return handleApiResponse(
    apiClient.put(`/admin/users/${userId}/roles`, roles)
  );
};

/**
 * @param {string|number} modelId
 * @param {Object} coordinates - 3D model coordinates
 * @param {number} coordinates.x_pos - X position
 * @param {number} coordinates.y_pos - Y position
 * @param {number} coordinates.z_pos - Z position
 * @param {number} coordinates.x_scale - X scale
 * @param {number} coordinates.y_scale - Y scale
 * @param {number} coordinates.z_scale - Z scale
 * @param {number} coordinates.x_rot - X rotation
 * @param {number} coordinates.y_rot - Y rotation
 * @param {number} coordinates.z_rot - Z rotation
 * @returns {Promise<{data, success, error}>}
 */
export const setModelCoordinates = async (modelId, coords) =>
  handleApiResponse(apiClient.put(`/models/${modelId}/coordinates`, coords));

/**
 * @param {File} glbFile
 * @param {File[]} imageFiles
 * @returns {Promise<number>}
 */
export const createModel = async (glbFile, imageFiles = []) => {
  if (!(glbFile instanceof File)) {
    throw new Error("glbFile must be a File object");
  }
  const formData = new FormData();
  const glbFileWithType = glbFile.type
    ? glbFile
    : new File([glbFile], glbFile.name, {
        type: "model/gltf-binary",
        lastModified: glbFile.lastModified,
      });

  formData.append("glb", glbFileWithType);

  if (imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });
  }

  try {
    const response = await handleApiResponse(
      apiClient.post(`/models`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Retrieve a model by ID.
 */
export const getModel = async (modelId) =>
  handleApiResponse(apiClient.get(`/models/${modelId}`));

/**
 * Get all models with pagination.
 * @param {number} page
 * @param {number} size
 * @returns {Promise<object>}
 */
export const getAllModels = async (page = 0, size = 10) => {
  const query = new URLSearchParams({ page, size }).toString();
  return handleApiResponse(apiClient.get(`/models?${query}`));
};

/**
 * Delete a model and its assets.
 */
export const deleteModel = async (modelId) =>
  handleApiResponse(apiClient.delete(`/models/${modelId}`));

/**
 * Partially update model asset and images (multipart/form-data).
 * @param {string|number} modelId
 * @param {File} [glbFile]
 * @param {File[]} [imageFiles]
 */
export const updateModel = async (modelId, glbFile, imageFiles = []) => {
  if (!(glbFile instanceof File)) {
    throw new Error("glbFile must be a File object");
  }
  const formData = new FormData();
  const glbFileWithType = glbFile.type
    ? glbFile
    : new File([glbFile], glbFile.name, {
        type: "model/gltf-binary",
        lastModified: glbFile.lastModified,
      });

  formData.append("glb", glbFileWithType);

  if (imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });
  }

  return handleApiResponse(
    apiClient.patch(`/models/${modelId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};
