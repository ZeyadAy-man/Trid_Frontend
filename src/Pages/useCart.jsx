import { useEffect, useState } from "react";
import { getcart, deletefromCart } from "../Service/cartOrderService";

const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getcart();
      if (response.success) {
        setCartItems(response.data.content || []);
      } else {
        setError("Failed to load cart items.");
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError("Error loading cart.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (variantId) => {
    setError(null);
    try {
      const response = await deletefromCart(variantId);
      if (response.success) {
        setCartItems((prev) =>
          prev.filter((item) => item.variantId !== variantId)
        );
      } else {
        setError("Failed to remove item.");
      }
    } catch (err) {
      console.error("Remove item error:", err);
      setError("Error removing item.");
    }
  };

  const updateItemQuantity = async (variantId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  return {
    cartItems,
    error,
    loading,
    removeItem,
    getCartItemCount,
    fetchCartItems,
    updateItemQuantity,
  };
};

export default useCart;
