import apiClient, { handleApiResponse } from "./apiClient";

/**
 * @param {number} shopId - ID of the shop
 * @param {Object} data - Product data
 * @param {string} data.name - Product name
 * @param {string} data.sizes - Available sizes
 * @param {string} data.colors - Available colors
 * @param {string} data.description - Product description
 * @param {number} data.basePrice - Base price of the product
 * @returns {Promise<{data, success, error}>}
 */
export const createProduct = async (shopId, data) => {
  return handleApiResponse(apiClient.post(`/products/shop/${shopId}`, data));
};

/**
 * @param {number} productId - ID of the product
 * @returns {Promise<{data, success, error}>}
 */
export const getProduct = async (productId) => {
  return handleApiResponse(apiClient.get(`/products/${productId}`));
};

/**
 * @param {number} productId - ID of the product
 * @param {Object} data - Updated product data
 * @param {string} data.name - Product name
 * @param {string} data.sizes - Available sizes
 * @param {string} data.colors - Available colors
 * @param {string} data.description - Product description
 * @param {number} data.basePrice - Base price of the product
 * @returns {Promise<{data, success, error}>}
 */
export const updateProduct = async (productId, data) => {
  return handleApiResponse(apiClient.put(`/products/${productId}`, data));
};

/**
 * @param {number} productId - ID of the product
 * @returns {Promise<{data, success, error}>}
 */
export const deleteProduct = async (productId) => {
  return handleApiResponse(apiClient.delete(`/products/${productId}`));
};

/**
 * @param {number} shopId - ID of the shop
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Items per page (default: 10)
 * @returns {Promise<{data, success, error}>}
 */
export const getShopProducts = async (shopId, page = 0, size = 10) => {
  return handleApiResponse(
    apiClient.get(`/products/shop/${shopId}?page=${page}&size=${size}`)
  );
};

/**
 * @param {number} productId - ID of the product
 * @param {FormData} formData - Form data containing files
 * @param {File} formData.gltf - GLTF model file
 * @param {File} formData.bin - Binary data file
 * @param {File} [formData.icon] - Product icon file
 * @param {File} [formData.texture] - Texture file
 * @returns {Promise<{data, success, error}>}
 */
export const uploadProductAssets = async (productId, formData) => {
  return handleApiResponse(
    apiClient.put(`/products/${productId}/upload-assets`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};

/**
 * @param {number} productId - ID of the product
 * @returns {Promise<{data, success, error}>}
 */
export const getProductAssets = async (productId) => {
  return handleApiResponse(apiClient.get(`/products/${productId}/assets`));
};

/**
 * @param {number} productId - ID of the product
 * @param {Object} coordinates - 3D coordinates data
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
export const updateProductCoordinates = async (productId, coordinates) => {
  return handleApiResponse(
    apiClient.put(`/products/${productId}/coordinates`, coordinates)
  );
};

/**
 * @param {number} productId - ID of the product
 * @param {Object} variantData - Variant data
 * @param {string} variantData.color - Variant color
 * @param {string} variantData.size - Variant size
 * @param {number} variantData.stock - Stock quantity
 * @param {number} variantData.price - Variant price
 * @returns {Promise<{data, success, error}>}
 */
export const addProductVariant = async (productId, variantData) => {
  return handleApiResponse(
    apiClient.post(`/products/${productId}/variants`, variantData)
  );
};

/**
 * @param {number} productId - ID of the product
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Items per page (default: 10)
 * @returns {Promise<{data, success, error}>}
 */
export const getProductVariants = async (productId, page = 0, size = 10) => {
  return handleApiResponse(
    apiClient.get(`/products/${productId}/variants?page=${page}&size=${size}`)
  );
};

/**
 * @param {number} variantId - ID of the variant
 * @param {Object} variantData - Updated variant data
 * @param {string} variantData.color - Variant color
 * @param {string} variantData.size - Variant size
 * @param {number} variantData.stock - Stock quantity
 * @param {number} variantData.price - Variant price
 * @returns {Promise<{data, success, error}>}
 */
export const updateProductVariant = async (variantId, variantData) => {
  return handleApiResponse(
    apiClient.put(`/products/variant/${variantId}`, variantData)
  );
};

/**
 * @param {number} variantId - ID of the variant
 * @returns {Promise<{data, success, error}>}
 */
export const deleteProductVariant = async (variantId) => {
  return handleApiResponse(apiClient.delete(`/products/variant/${variantId}`));
};