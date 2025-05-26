/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import styles from "../Styles/Cart.module.css";
import  useCart from "../Pages/useCart";

export const CartIcon = ({ itemCount, onClick }) => {
  return (
    <button className={styles.cartIcon} onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="24"
        height="24"
      >
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M16 17a2 2 0 100 4 2 2 0 000-4zm0 0H9m0 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      {itemCount > 0 && (
        <span className={styles.cartBadge}>{itemCount}</span>
      )}
    </button>
  );
};

export const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  isUpdating = false 
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isLocalUpdating, setIsLocalUpdating] = useState(false);

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsLocalUpdating(true);
    setQuantity(newQuantity);
    
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      setQuantity(item.quantity);
      console.error('Failed to update quantity:', error);
    } finally {
      setIsLocalUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsLocalUpdating(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsLocalUpdating(false);
    }
  };

  const getItemImage = () => {
    return item.image || '/placeholder-product.jpg';
  };

  const getVariantDisplay = () => {
    if (!item.selectedVariant) return null;
    
    return (
      <div className={styles.variantInfo}>
        <span className={styles.variantBadge}>
          Size: {item.selectedVariant.size}
        </span>
        <span className={styles.variantBadge}>
          Color: {item.selectedVariant.color}
        </span>
      </div>
    );
  };

  const getStockWarning = () => {
    const stock = item.selectedVariant?.stock || item.stock || 0;
    if (stock < quantity) {
      return (
        <div className={styles.stockWarning}>
          ⚠️ Only {stock} left in stock
        </div>
      );
    }
    if (stock < 5 && stock > 0) {
      return (
        <div className={styles.lowStock}>
          ⚠️ Low stock: {stock} remaining
        </div>
      );
    }
    return null;
  };

  const itemTotal = (item.finalPrice || item.basePrice || 0) * quantity;

  return (
    <div className={`${styles.cartItem} ${isLocalUpdating || isUpdating ? styles.updating : ''}`}>
      <div className={styles.itemImageContainer}>
        <img src={getItemImage()} alt={item.name} className={styles.itemImage} />
      </div>
      
      <div className={styles.itemInfo}>
        <div className={styles.itemMainInfo}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <p className={styles.itemModel}>Model: {item.model}</p>
          {item.description && (
            <p className={styles.itemDescription}>{item.description}</p>
          )}
          {getVariantDisplay()}
          {getStockWarning()}
        </div>
      </div>

      <div className={styles.itemControls}>
        <div className={styles.quantitySection}>
          <label className={styles.quantityLabel}>Quantity:</label>
          <div className={styles.quantityControls}>
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isLocalUpdating || isUpdating}
            >
              -
            </button>
            <span className={styles.quantityDisplay}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isLocalUpdating || isUpdating}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.unitPrice}>
            ${(item.finalPrice || item.basePrice || 0).toFixed(2)} each
          </div>
          <div className={styles.totalPrice}>
            Total: ${itemTotal.toFixed(2)}
          </div>
        </div>

        <button 
          className={styles.removeButton}
          onClick={handleRemove}
          disabled={isLocalUpdating || isUpdating}
          aria-label="Remove item from cart"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
          </svg>
          Remove
        </button>
      </div>
      
      {(isLocalUpdating || isUpdating) && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export const CartSummary = ({ 
  subtotal, 
  tax, 
  shipping, 
  total, 
  itemCount,
  isLoading = false 
}) => {
  return (
    <div className={styles.cartSummary}>
      <h3 className={styles.summaryTitle}>Order Summary</h3>
      
      <div className={styles.summaryContent}>
        <div className={styles.summaryRow}>
          <span>Items ({itemCount}):</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className={styles.summaryRow}>
          <span>Shipping:</span>
          <span>
            {shipping === 0 ? (
              <span className={styles.freeShipping}>FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>
        
        <div className={styles.summaryRow}>
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        <div className={styles.summaryDivider}></div>
        
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Order Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        
        {shipping === 0 && subtotal < 50 && (
          <div className={styles.shippingNote}>
            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className={styles.summaryLoading}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export const Cart = ({ 
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  isLoading = false,
  error = null,
  className = ""
}) => {
  const [isUpdating, setIsUpdating] = useState({});

  const handleUpdateQuantity = async (itemId, quantity) => {
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await onUpdateQuantity(itemId, quantity);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await onRemoveItem(itemId);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const calculateSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.finalPrice || item.basePrice || 0) * item.quantity;
    }, 0);
    
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total, itemCount };
  };

  const { subtotal, tax, shipping, total, itemCount } = calculateSummary();
  const isEmpty = cartItems.length === 0;

  return (
    <div className={`${styles.cartPage} ${className}`}>
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>
          Shopping Cart
          {!isEmpty && (
            <span className={styles.itemCount}>({itemCount} items)</span>
          )}
        </h1>
        
        {!isEmpty && onContinueShopping && (
          <button 
            className={styles.continueButton}
            onClick={onContinueShopping}
          >
            ← Continue Shopping
          </button>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {isEmpty ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="64"
              height="64"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M16 17a2 2 0 100 4 2 2 0 000-4zm0 0H9m0 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven not added any items to your cart yet.</p>
          {onContinueShopping && (
            <button 
              className={styles.startShoppingButton}
              onClick={onContinueShopping}
            >
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItemsSection}>
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  isUpdating={isUpdating[item.id]}
                />
              ))}
            </div>
          </div>

          <div className={styles.cartSidebar}>
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
              itemCount={itemCount}
              isLoading={isLoading}
            />

            <div className={styles.checkoutSection}>
              <button
                className={styles.checkoutButton}
                onClick={() => onCheckout({ subtotal, tax, shipping, total, items: cartItems })}
                disabled={isEmpty || isLoading || Object.values(isUpdating).some(Boolean)}
              >
                {isLoading ? (
                  <span className={styles.checkoutLoading}>
                    <div className={styles.spinner}></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                      <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
                    </svg>
                    Proceed to Checkout • ${total.toFixed(2)}
                  </>
                )}
              </button>
              
              {onContinueShopping && (
                <button 
                  className={styles.continueShoppingButton}
                  onClick={onContinueShopping}
                >
                  Continue Shopping
                </button>
              )}
            </div>

            <div className={styles.securityBadges}>
              <div className={styles.securityBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                Secure Checkout
              </div>
              <div className={styles.securityBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="7.5,10.5 12,15 16.5,10.5"/>
                </svg>
                Fast Shipping
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;