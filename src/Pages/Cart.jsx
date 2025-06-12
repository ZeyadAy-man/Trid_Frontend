/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Trash2,
  ShoppingCart,
  Shield,
  Truck,
  Check,
  AlertTriangle,
} from "lucide-react";
import styles from "../Styles/Cart.module.css";
import useCart from "./useCart";
import { addtoCart } from "../Service/cartService";
import Navbar from "../Components/HomePage/Nav/Nav";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const ModelViewer = ({ modelUrl, itemId }) => {
  const { scene } = useGLTF(modelUrl || "/placeholder-model.glb");
  
  const clonedScene = scene.clone();
  
  return (
    <>
      <primitive 
        object={clonedScene} 
        scale={0.4} 
        position={[0, -0.5, 0]} 
        key={itemId}
      />
      <OrbitControls />
    </>
  );
};

export const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [isLocalUpdating, setIsLocalUpdating] = useState(false);

  useEffect(() => setQuantity(item.quantity || 1), [item.quantity]);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setIsLocalUpdating(true);
    const oldQuantity = quantity;
    setQuantity(newQuantity);
    try {
      await onUpdateQuantity(item.variantId, newQuantity);
    } catch (error) {
      setQuantity(oldQuantity);
      console.error("Failed to update quantity:", error);
    } finally {
      setIsLocalUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsLocalUpdating(true);
    try {
      await onRemove(item.variantId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      setIsLocalUpdating(false);
    }
  };

  const getVariantDisplay = () => {
    const hasVariants = item.size || item.color;
    if (!hasVariants) return null;
    return (
      <div className={styles.variantInfo}>
        {item.size && (
          <span className={styles.variantBadge}>Size: {item.size}</span>
        )}
        {item.color && (
          <span className={styles.variantBadge}>Color: {item.color}</span>
        )}
      </div>
    );
  };

  const getStockWarning = () => {
    const stock = item.stock || 0;
    if (stock < quantity)
      return (
        <div className={styles.stockWarning}>
          <AlertTriangle size={16} /> Only {stock} left in stock
        </div>
      );
    if (stock < 5 && stock > 0)
      return (
        <div className={styles.lowStock}>
          <AlertTriangle size={16} /> Low stock: {stock} remaining
        </div>
      );
    if (stock > 5)
      return (
        <div className={styles.inStock}>Available in stock ({stock} items)</div>
      );
    return null;
  };

  const itemPrice = item.price || 0;
  const itemTotal = itemPrice * quantity;
  const updating = isLocalUpdating || isUpdating;

  return (
    <div className={`${styles.cartItem} ${updating ? styles.updating : ""}`}>
      <div className={styles.itemImageContainer}>
        <Canvas 
          camera={{ position: [0, 0, 2.5] }}
          key={`canvas-${item.variantId}`}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 0, 5]} />
          <Suspense fallback={null}>
            <ModelViewer 
              modelUrl={item.model} 
              itemId={item.variantId}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.itemInfo}>
        <div className={styles.itemMainInfo}>
          <h3 className={styles.itemName}>
            {item.name || `Product #${item.productId || item.variantId}`}
          </h3>
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
              disabled={quantity <= 1 || updating}
            >
              -
            </button>
            <span className={styles.quantityDisplay}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updating || quantity >= (item.stock || 0)}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.unitPrice}>${itemPrice.toFixed(2)} each</div>
          <div className={styles.totalPrice}>
            Total: ${itemTotal.toFixed(2)}
          </div>
        </div>

        <button
          className={styles.removeButton}
          onClick={handleRemove}
          disabled={updating}
          aria-label="Remove item from cart"
        >
          <Trash2 size={20} />
          Remove
        </button>
      </div>

      {updating && (
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
  isLoading = false,
}) => (
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

export const Cart = ({ onCheckout, className = "", showNavbar = true }) => {
  const {
    cartItems,
    error,
    loading,
    removeItem,
    getCartItemCount,
    fetchCartItems,
    updateItemQuantity,
  } = useCart();
  const [isUpdating, setIsUpdating] = useState({});

  const handleUpdateQuantity = async (variantId, quantity) => {
    setIsUpdating((prev) => ({ ...prev, [variantId]: true }));
    try {
      await updateItemQuantity(variantId, quantity);
      await addtoCart(variantId, quantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      await fetchCartItems();
    } finally {
      setIsUpdating((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const handleRemoveItem = async (variantId) => {
    setIsUpdating((prev) => ({ ...prev, [variantId]: true }));
    try {
      await removeItem(variantId);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const calculateSummary = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const itemCount = getCartItemCount();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total, itemCount };
  };

  const { subtotal, tax, shipping, total, itemCount } = calculateSummary();
  const isEmpty = cartItems.length === 0 && !loading;

  if (loading && cartItems.length === 0) {
    return (
      <div style={{ minHeight: "100vh" }}>
        {showNavbar && <Navbar />}
        <div 
          className={`${styles.cartPage} ${className}`}
          style={{ marginTop: showNavbar ? "60px" : "0" }}
        >
          <div className={styles.cartHeader}>
            <h1 className={styles.cartTitle}>Shopping Cart</h1>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {showNavbar && <Navbar />}
      <div 
        className={`${styles.cartPage} ${className}`}
        style={{ marginTop: showNavbar ? "60px" : "0" }}
      >
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>
            Shopping Cart
            {!isEmpty && (
              <span className={styles.itemCount}>{itemCount} items</span>
            )}
          </h1>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertTriangle size={20} className={styles.errorIcon} />
            <span>{error}</span>
            <button
              className={styles.retryButton}
              onClick={() => fetchCartItems()}
            >
              Retry
            </button>
          </div>
        )}

        {isEmpty ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>
              <ShoppingCart size={64} />
            </div>
            <h2>Your cart is empty</h2>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItemsSection}>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <CartItem
                    key={`${item.variantId}-${item.quantity}`}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={isUpdating[item.variantId]}
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
                isLoading={loading}
              />
              <div className={styles.checkoutSection}>
                <button
                  className={styles.checkoutButton}
                  onClick={() =>
                    onCheckout({
                      subtotal,
                      tax,
                      shipping,
                      total,
                      items: cartItems,
                    })
                  }
                  disabled={
                    isEmpty ||
                    loading ||
                    Object.values(isUpdating).some(Boolean)
                  }
                >
                  {loading ? (
                    <span className={styles.checkoutLoading}>
                      <div className={styles.spinner}></div>
                      Processing...
                    </span>
                  ) : (
                    <span>
                      <Check size={20} />
                      Proceed to Checkout • ${total.toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
              <div className={styles.securityBadges}>
                <div className={styles.securityBadge}>
                  <Shield size={16} />
                  Secure Checkout
                </div>
                <div className={styles.securityBadge}>
                  <Truck size={16} />
                  Fast Shipping
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

/*
import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Trash2,
  ShoppingCart,
  Shield,
  Truck,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import styles from "../Styles/Cart.module.css";
import useCart from "./useCart";
import { addtoCart } from "../Service/cartService";
import Navbar from "../Components/HomePage/Nav/Nav";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";

const ModelViewer = ({ modelUrl }) => {
  const { scene } = useGLTF(modelUrl || "/placeholder-model.glb");
  return (
    <>
      <primitive object={scene} scale={0.4} position={[0, -0.5, 0]} />
      <OrbitControls />
    </>
  );
};

const groupCartItemsByProduct = (cartItems) => {
  const grouped = cartItems.reduce((acc, item) => {
    const productId = item.productId;
    if (!acc[productId]) {
      acc[productId] = {
        productId,
        name: item.name,
        description: item.description,
        model: item.model,
        variants: [],
      };
    }
    acc[productId].variants.push(item);
    return acc;
  }, {});

  return Object.values(grouped);
};

export const CartItemGroup = ({
  productGroup,
  onUpdateQuantity,
  onRemove,
  isUpdating = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMultipleVariants = productGroup.variants.length > 1;

  const totalQuantity = productGroup.variants.reduce(
    (sum, variant) => sum + (variant.quantity || 1),
    0
  );
  const totalPrice = productGroup.variants.reduce(
    (sum, variant) => sum + (variant.price || 0) * (variant.quantity || 1),
    0
  );

  return (
    <div className={styles.cartItemGroup}>
      <div className={styles.cartItem}>
        <div className={styles.itemImageContainer}>
          <Canvas camera={{ position: [0, 0, 2.5] }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[0, 0, 5]} />
            <Suspense fallback={null}>
              <ModelViewer modelUrl={productGroup.model} />
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.itemInfo}>
          <div className={styles.itemMainInfo}>
            <h3 className={styles.itemName}>
              {productGroup.name || `Product #${productGroup.productId}`}
            </h3>
            {productGroup.description && (
              <p className={styles.itemDescription}>
                {productGroup.description}
              </p>
            )}

            {hasMultipleVariants && (
              <div className={styles.variantSummary}>
                <span>
                  {productGroup.variants.length} variants • {totalQuantity}{" "}
                  items total
                </span>
                <button
                  className={styles.expandButton}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {isExpanded ? "Hide variants" : "Show variants"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.itemControls}>
          <div className={styles.priceSection}>
            <div className={styles.totalPrice}>
              Total: ${totalPrice.toFixed(2)}
            </div>
            {hasMultipleVariants && (
              <div className={styles.variantCount}>
                {totalQuantity} items across {productGroup.variants.length}{" "}
                variants
              </div>
            )}
          </div>
        </div>
      </div>

      {(!hasMultipleVariants || isExpanded) && (
        <div className={styles.variantDetails}>
          {productGroup.variants.map((variant) => (
            <CartVariantItem
              key={variant.variantId}
              variant={variant}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              isUpdating={isUpdating[variant.variantId]}
              isNested={hasMultipleVariants}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CartVariantItem = ({
  variant,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isNested = false,
}) => {
  const [quantity, setQuantity] = useState(variant.quantity || 1);
  const [isLocalUpdating, setIsLocalUpdating] = useState(false);

  useEffect(() => setQuantity(variant.quantity || 1), [variant.quantity]);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setIsLocalUpdating(true);
    const oldQuantity = quantity;
    setQuantity(newQuantity);
    try {
      await onUpdateQuantity(variant.variantId, newQuantity);
    } catch (error) {
      setQuantity(oldQuantity);
      console.error("Failed to update quantity:", error);
    } finally {
      setIsLocalUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsLocalUpdating(true);
    try {
      await onRemove(variant.variantId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      setIsLocalUpdating(false);
    }
  };

  const getVariantDisplay = () => {
    const hasVariants = variant.size || variant.color;
    if (!hasVariants) return null;
    return (
      <div className={styles.variantInfo}>
        {variant.size && (
          <span className={styles.variantBadge}>Size: {variant.size}</span>
        )}
        {variant.color && (
          <span className={styles.variantBadge}>Color: {variant.color}</span>
        )}
      </div>
    );
  };

  const getStockWarning = () => {
    const stock = variant.stock || 0;
    if (stock < quantity)
      return (
        <div className={styles.stockWarning}>
          <AlertTriangle size={16} /> Only {stock} left in stock
        </div>
      );
    if (stock < 5 && stock > 0)
      return (
        <div className={styles.lowStock}>
          <AlertTriangle size={16} /> Low stock: {stock} remaining
        </div>
      );
    if (stock > 5)
      return (
        <div className={styles.inStock}>Available in stock ({stock} items)</div>
      );
    return null;
  };

  const itemPrice = variant.price || 0;
  const itemTotal = itemPrice * quantity;
  const updating = isLocalUpdating || isUpdating;

  return (
    <div
      className={`${styles.cartVariant} ${
        isNested ? styles.nestedVariant : ""
      } ${updating ? styles.updating : ""}`}
    >
      {isNested && (
        <div className={styles.variantHeader}>
          {getVariantDisplay()}
          {getStockWarning()}
        </div>
      )}

      <div className={styles.variantControls}>
        <div className={styles.quantitySection}>
          <label className={styles.quantityLabel}>Quantity:</label>
          <div className={styles.quantityControls}>
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || updating}
            >
              -
            </button>
            <span className={styles.quantityDisplay}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updating || quantity >= (variant.stock || 0)}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.unitPrice}>${itemPrice.toFixed(2)} each</div>
          <div className={styles.totalPrice}>${itemTotal.toFixed(2)}</div>
        </div>

        <button
          className={styles.removeButton}
          onClick={handleRemove}
          disabled={updating}
          aria-label="Remove variant from cart"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>

      {updating && (
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
  isLoading = false,
}) => (
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

export const Cart = ({ onCheckout, className = "" }) => {
  const {
    cartItems,
    error,
    loading,
    removeItem,
    getCartItemCount,
    fetchCartItems,
    updateItemQuantity,
  } = useCart();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState({});

  const handleUpdateQuantity = async (variantId, quantity) => {
    setIsUpdating((prev) => ({ ...prev, [variantId]: true }));
    try {
      await updateItemQuantity(variantId, quantity);
      await addtoCart(variantId, quantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      await fetchCartItems();
    } finally {
      setIsUpdating((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const handleRemoveItem = async (variantId) => {
    setIsUpdating((prev) => ({ ...prev, [variantId]: true }));
    try {
      await removeItem(variantId);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const calculateSummary = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const itemCount = getCartItemCount();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total, itemCount };
  };

  const groupedItems = groupCartItemsByProduct(cartItems);
  const { subtotal, tax, shipping, total, itemCount } = calculateSummary();
  const isEmpty = cartItems.length === 0 && !loading;

  if (loading && cartItems.length === 0) {
    return (
      <div className={`${styles.cartPage} ${className}`}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>Shopping Cart</h1>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`${styles.cartPage} ${className}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft className={styles.backIcon} />
          Back to Shops
        </button>
        <Navbar />
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>
            Shopping Cart
            {!isEmpty && (
              <span className={styles.itemCount}>
                {groupedItems.length}{" "}
                {groupedItems.length === 1 ? "product" : "products"} •{" "}
                {itemCount} items
              </span>
            )}
          </h1>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertTriangle size={20} className={styles.errorIcon} />
            <span>{error}</span>
            <button
              className={styles.retryButton}
              onClick={() => fetchCartItems()}
            >
              Retry
            </button>
          </div>
        )}

        {isEmpty ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>
              <ShoppingCart size={64} />
            </div>
            <h2>Your cart is empty</h2>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItemsSection}>
              <div className={styles.cartItems}>
                {groupedItems.map((productGroup) => (
                  <CartItemGroup
                    key={productGroup.productId}
                    productGroup={productGroup}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={isUpdating}
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
                isLoading={loading}
              />
              <div className={styles.checkoutSection}>
                <button
                  className={styles.checkoutButton}
                  onClick={() =>
                    onCheckout({
                      subtotal,
                      tax,
                      shipping,
                      total,
                      items: cartItems,
                    })
                  }
                  disabled={
                    isEmpty ||
                    loading ||
                    Object.values(isUpdating).some(Boolean)
                  }
                >
                  {loading ? (
                    <span className={styles.checkoutLoading}>
                      <div className={styles.spinner}></div>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Check size={20} />
                      Proceed to Checkout • ${total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
              <div className={styles.securityBadges}>
                <div className={styles.securityBadge}>
                  <Shield size={16} />
                  Secure Checkout
                </div>
                <div className={styles.securityBadge}>
                  <Truck size={16} />
                  Fast Shipping
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
*/ 