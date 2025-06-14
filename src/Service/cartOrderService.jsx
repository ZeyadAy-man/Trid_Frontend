import apiCart, { handleApiResponse } from "./apiClient";
import { getProduct, getProductModel } from "./productsService";

/**
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Items per page (default: 10)
 * @returns {Promise<{data, success, error}>}
 */
export const getcart = async (page = 0, size = 10) => {
  const cartResponse = await handleApiResponse(
    apiCart.get(`/cart?page=${page}&size=${size}`)
  );

  if (!cartResponse.success) return cartResponse;

  const { content, ...pagination } = cartResponse.data;

  const enhancedCartItems = await Promise.all(
    content.map(async (item) => {
      const { productId, quantity, variantResponse } = item;
      const {
        id: variantId,
        color,
        size: variantSize,
        stock,
        price,
      } = variantResponse || {};

      const productDetails = await getProduct(productId);
      const name = productDetails.success
        ? productDetails.data.name
        : "Unknown";
      const description = productDetails.success
        ? productDetails.data.description
        : "Unknown";

      const modelResponse = await getProductModel(productId);
      const model = modelResponse.success ? modelResponse.data.glbUrl : null;

      return {
        productId,
        variantId,
        name,
        description,
        quantity,
        color,
        size: variantSize,
        stock,
        price,
        model,
      };
    })
  );

  return {
    data: { content: enhancedCartItems, ...pagination },
    success: true,
    error: null,
  };
};

/**
 * @param {number} variantId  - ID of the variant
 * @param {number} quantity - Quantity to add
 * @returns {Promise<{data, success, error}>}
 */
export const addtoCart = async (variantId, quantity = 1) => {
  return handleApiResponse(
    apiCart.post(`/cart?variantId=${variantId}&quantity=${quantity}`)
  );
};

/**
 * @param {number} variantId - ID of the variant to delete
 * @returns {Promise<{data, success, error}>}
 */
export const deletefromCart = async (variantId) => {
  return handleApiResponse(apiCart.delete(`/cart?variantId=${variantId}`));
};

/**
 * @returns {Promise<{data, success, error}>}
 */
export const checkoutCart = async () => {
  return handleApiResponse(apiCart.post("/cart/checkout"));
};

/**
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Items per page (default: 10)
 * @returns {Promise<{data, success, error}>}
 */
export const getUserOrders = async (page = 0, size = 10) => {
  return handleApiResponse(apiCart.get(`/order?page=${page}&size=${size}`));
};

/**
 * @param {number} orderId - The ID of the order
 * @returns {Promise<{data, success, error}>}
 */
export const getOrderById = async (orderId) => {
  return handleApiResponse(apiCart.get(`/order/${orderId}`));
};

/**
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Items per page (default: 10)
 * @returns {Promise<{data, success, error}>}
 */
export const getSellerOrders = async (page = 0, size = 10) => {
  return handleApiResponse(
    apiCart.get(`/order/seller?page=${page}&size=${size}`)
  );
};
