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
 * @param {number} productId - ID of the product
 * @returns {Promise<{data, success, error}>}
 */
export const getProductModel = async (productId) => {
  return handleApiResponse(apiClient.get(`/products/${productId}/model`));
};

/**
 * @param {number} productId - ID of the product
 * @param {File} glbFile - GLB model file
 * @returns {Promise<{data, success, error}>}
 */
export const uploadProductModel = async (productId, glbFile) => {
  const formData = new FormData();
  formData.append("glb", glbFile);

  return handleApiResponse(
    apiClient.put(`/products/${productId}/model`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};

/**
 * @param {number} productId - ID of the product
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
export const updateProductCoordinates = async (productId, coordinates) => {
  return handleApiResponse(
    apiClient.put(`/products/${productId}/coordinates`, coordinates)
  );
};

/**
 * @param {number} variantId - ID of the variant
 * @param {Object} data - Variant data to update
 * @param {string} data.color - Variant color
 * @param {string} data.size - Variant size
 * @param {number} data.stock - Stock quantity
 * @param {number} data.price - Variant price
 * @returns {Promise<{data, success, error}>}
 */
export const updateProductVariant = async (variantId, data) => {
  console.log(variantId, data);
  return handleApiResponse(
    apiClient.put(`/products/variant/${variantId}`, data)
  );
};

/**
 * @param {number} variantId - ID of the variant
 * @returns {Promise<{data, success, error}>}
 */
export const deleteProductVariant = async (variantId) => {
  return handleApiResponse(apiClient.delete(`/products/variant/${variantId}`));
};

/**
 * @param {number} productId - ID of the product
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Items per page (default: 10)
 * @returns {Promise<{data, success, error}>}
 */
export const getProductVariants = async (productId, page = 0, size = 10) => {
  return handleApiResponse(
    apiClient.get(`/products/${productId}/variants`, {
      params: { page, size },
    })
  );
};

/**
 * @param {number} productId - ID of the product
 * @param {Object} data - Variant data
 * @param {string} data.color - Variant color
 * @param {string} data.size - Variant size
 * @param {number} data.stock - Stock quantity
 * @param {number} data.price - Variant price
 * @returns {Promise<{data, success, error}>}
 */
export const addProductVariant = async (productId, data) => {
  console.log(productId, data);
  return handleApiResponse(
    apiClient.post(`/products/${productId}/variants`, data)
  );
};

/**
 * @param {number} shopId - ID of the shop
 * @param {number} page - Page number
 * @param {number} size - Items per page
 * @returns {Promise<{data, success, error}>}
 */
export const getShopProducts = async (shopId, page, size) => {
  return handleApiResponse(
    apiClient.get(`/products/shop/${shopId}`, {
      params: { page, size },
    })
  );
};

/**
 * @param {string} productName
 * @param {number} page
 * @param {number} size
 * @returns {Promise<{data, success, error}>}
 */
export const getProductByName = async (productName, page = 0, size = 8) => {
  return handleApiResponse(
    apiClient.get(`/products`, {
      params: {
        name: productName,
        page,
        size,
      },
    })
  );
};

/**
 * @param {number} page
 * @param {number} size
 * @returns {Promise<{data, success, error}>}
 */
export const getWishList = async (page = 0, size = 10) => {
  return handleApiResponse(
    apiClient.get(`/wishlist`, {
      params: { page, size },
    })
  );
};

/**
 * @param {string} productId
 * @returns {Promise<{data, success, error}>}
 */
export const addToWishList = async (productId) => {
  return handleApiResponse(apiClient.put(`/wishlist?productId=${productId}`));
};
