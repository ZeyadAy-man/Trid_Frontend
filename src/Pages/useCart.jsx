import { useState } from "react";

// Hook for cart state management (ready for API integration)
const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add item to cart
  const addToCart = async (product) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.addToCart(product);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingItem = cartItems.find(item => 
        item.id === product.id && 
        item.selectedVariant?.size === product.selectedVariant?.size &&
        item.selectedVariant?.color === product.selectedVariant?.color
      );

      if (existingItem) {
        setCartItems(prev => prev.map(item =>
          item.id === existingItem.id && 
          item.selectedVariant?.size === existingItem.selectedVariant?.size &&
          item.selectedVariant?.color === existingItem.selectedVariant?.color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const cartItem = {
          ...product,
          id: `${product.id}_${product.selectedVariant?.size || 'default'}_${product.selectedVariant?.color || 'default'}`,
          quantity: 1,
          dateAdded: new Date().toISOString()
        };
        setCartItems(prev => [...prev, cartItem]);
      }
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // await api.updateCartItem(itemId, quantity);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (err) {
      setError('Failed to update item quantity');
      console.error('Update quantity error:', err);
      throw err;
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // await api.removeFromCart(itemId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to remove item');
      console.error('Remove item error:', err);
      throw err;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // await api.clearCart();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCartItems([]);
    } catch (err) {
      setError('Failed to clear cart');
      console.error('Clear cart error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.finalPrice || item.basePrice || 0) * item.quantity;
    }, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cartItems,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
    setError
  };
};

export default useCart;