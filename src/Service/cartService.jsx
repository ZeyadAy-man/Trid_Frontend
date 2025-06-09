import apiCart, { handleApiResponse } from "./apiClient";
import {
  getProduct,
  getProductModel,
  getProductVariants,
  getShopProducts,
} from "./productsService";
import { getAllShops } from "./shopService";

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

  const cartItems = cartResponse.data.content;

  const enhancedCartItems = await Promise.all(
    cartItems.map(async (item) => {
      const variantId = item.id;

      const shops = (await getAllShops()).data.content;

      for (const shop of shops) {
        const products = (await getShopProducts(shop.id, 0, 100)).data.content;

        for (const product of products) {
          const variantsResponse = await getProductVariants(product.id, 0, 100);
          const variants = variantsResponse.data.content;

          const matchedVariant = variants.find((v) => v.id === variantId);
          if (matchedVariant) {
            const productDetails = await getProduct(product.id);
            const modelResponse = await getProductModel(product.id);

            return {
              ...item,
              name: productDetails.data.name,
              description: productDetails.data.description,
              productId: product.id,
              model: modelResponse?.data?.glbUrl || null,
              coordinates: modelResponse?.data?.coordinates || null,
            };
          }
        }
      }

      return {
        ...item,
        name: "Unknown",
        description: "Unknown",
        glbUrl: null,
        coordinates: null,
      };
    })
  );

  return {
    data: { ...cartResponse.data, content: enhancedCartItems },
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
 * @param {number} variantId - ID of the shop
 * @returns {Promise<{data, success, error}>}
 */
export const deletefromCart = async (variantId) => {
  return handleApiResponse(apiCart.delete(`/cart?variantId=${variantId}`));
};
