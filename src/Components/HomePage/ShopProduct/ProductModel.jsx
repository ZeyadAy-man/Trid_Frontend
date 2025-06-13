/* eslint-disable react/prop-types */
import React, { useState, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import styles from "./ProductModal.module.css";
import {
  getProduct,
  getProductVariants,
  getProductModel,
} from "../../../Service/productsService";
import { addtoCart } from "../../../Service/cartService";
import { useNavigate } from "react-router-dom";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ShoppingCartIcon, Package, AlertCircle, Eye } from "lucide-react";

const ModelViewer = ({ modelUrl }) => {
  const { scene, error } = useGLTF(modelUrl || "/placeholder-model.glb");

  if (error) {
    return (
      <div className={styles.modelError}>
        <Package className={styles.fallbackIcon} />
        <p>Unable to load 3D model</p>
      </div>
    );
  }

  return (
    <>
      <primitive object={scene} scale={0.6} position={[0, -1, 0]} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={1}
        maxDistance={5}
      />
    </>
  );
};

const LoadingState = () => (
  <div className={styles.status}>
    <div className={styles.spinner}></div>
    <p>Loading product details...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className={styles.statusError}>
    <AlertCircle size={48} />
    <p>{message}</p>
  </div>
);

const StockStatus = ({ stock }) => {
  if (stock <= 0) {
    return <span className={styles.outOfStock}>Out of Stock</span>;
  }
  if (stock < 5) {
    return <span className={styles.lowStock}>Low Stock: {stock} left</span>;
  }
  return <span className={styles.inStock}>In Stock: {stock} available</span>;
};

const SizeSelection = ({ sizes, selectedSize, onSizeSelect }) => (
  <div className={styles.sizeSection}>
    <h4 className={styles.selectionTitle}>Size</h4>
    <div className={styles.sizeGrid}>
      {sizes.map((size) => (
        <button
          key={size}
          className={`${styles.sizeButton} ${
            selectedSize === size ? styles.selectedSize : ""
          }`}
          onClick={() => onSizeSelect(size)}
          aria-pressed={selectedSize === size}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
);

const ColorSelection = ({ colors, selectedColor, onColorSelect }) => (
  <div className={styles.colorSection}>
    <h4 className={styles.selectionTitle}>Color</h4>
    <div className={styles.colorGrid}>
      {colors.map((color) => (
        <button
          key={color}
          className={`${styles.colorButton} ${
            selectedColor === color ? styles.selectedColor : ""
          }`}
          onClick={() => onColorSelect(color)}
          style={{
            backgroundColor: color === "white-black" ? "white" : color,
            backgroundImage:
              color === "white-black"
                ? "linear-gradient(to right, white 50%, black 50%)"
                : "none",
          }}
          title={color}
          aria-label={`Select ${color} color`}
          aria-pressed={selectedColor === color}
        >
          <span className={styles.colorName}>{color}</span>
        </button>
      ))}
    </div>
  </div>
);

const QuantityControls = ({ quantity, maxQuantity, onChange }) => (
  <div className={styles.quantitySection}>
    <h4 className={styles.selectionTitle}>Quantity</h4>
    <div className={styles.quantityControls}>
      <button
        className={styles.quantityButton}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className={styles.quantityDisplay} aria-live="polite">
        {quantity}
      </span>
      <button
        className={styles.quantityButton}
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  </div>
);

const ProductInfoPanel = ({ selectedInfo, closeInfo, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedInfo?.variants) {
      const sizes = [...new Set(selectedInfo.variants.map((v) => v.size))];
      setAvailableSizes(sizes);
      setDisplayPrice(selectedInfo.basePrice);
      setSelectedSize(null);
      setSelectedColor(null);
      setSelectedVariant(null);
      setQuantity(1);
    }
  }, [selectedInfo]);

  useEffect(() => {
    if (selectedInfo?.variants && selectedSize) {
      const colors = [
        ...new Set(
          selectedInfo.variants
            .filter((v) => v.size === selectedSize)
            .map((v) => v.color)
        ),
      ];
      setAvailableColors(colors);
      setSelectedColor(null);
      setSelectedVariant(null);
    }
  }, [selectedSize, selectedInfo]);

  useEffect(() => {
    if (selectedInfo?.variants && selectedSize && selectedColor) {
      const variant = selectedInfo.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );

      if (variant) {
        setSelectedVariant(variant);
        setDisplayPrice(variant.price);
        setQuantity(1);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [selectedSize, selectedColor, selectedInfo]);

  if (!selectedInfo) return null;

  const productURL = selectedInfo.path;
  const productScale = selectedInfo.scale;

  const handleNavigateToRoom = () => {
    const query = new URLSearchParams({
      scale: JSON.stringify(productScale),
    }).toString();
    navigate(`/room/${encodeURIComponent(productURL)}?${query}`);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      console.warn("No variant selected for product with variants");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: quantity,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const maxStock = selectedVariant?.stock || 1;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const canAddToCart =
    selectedInfo.variants.length === 0 ||
    (selectedVariant && selectedVariant.stock > 0);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>{selectedInfo.name}</h3>
        <div className={styles.headerActions}>
            <button
              className={styles.vrButton}
              onClick={handleNavigateToRoom}
              aria-label="View in VR"
            >
              VR View
            </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.modelSection}>
            {selectedInfo.model ? (
              <Canvas camera={{ position: [0, 0, 2.5] }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[0, 0, 5]} />
                <Suspense fallback={null}>
                  <ModelViewer modelUrl={selectedInfo.model} />
                </Suspense>
              </Canvas>
            ) : (
              <div className={styles.modelFallback}>
                <Package className={styles.fallbackIcon} />
                <p>No 3D model available</p>
              </div>
            )}
          </div>

          <div>
            <p className={styles.label}>Description</p>
            <p className={styles.description}>
              {selectedInfo.description || "No description available."}
            </p>
          </div>

          <div className={styles.priceSection}>
            <p className={styles.label}>Price</p>
            <p className={styles.basePrice}>${displayPrice}</p>
            {selectedVariant && (
              <div className={styles.stockIndicator}>
                <StockStatus stock={selectedVariant.stock} />
              </div>
            )}
          </div>
        </div>

        {selectedInfo.variants && selectedInfo.variants.length > 0 && (
          <div className={styles.card}>
            <div className={styles.selectionSection}>
              <SizeSelection
                sizes={availableSizes}
                selectedSize={selectedSize}
                onSizeSelect={setSelectedSize}
              />

              {selectedSize && availableColors.length > 0 && (
                <ColorSelection
                  colors={availableColors}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
              )}
            </div>

            {selectedVariant && (
              <div className={styles.selectedVariantInfo}>
                <h4 className={styles.selectionTitle}>
                  Selected Configuration
                </h4>
                <div className={styles.variantDetails}>
                  <div className={styles.variantProperty}>
                    <span className={styles.variantLabel}>Size:</span>
                    <span className={styles.variantValue}>
                      {selectedVariant.size}
                    </span>
                  </div>
                  <div className={styles.variantProperty}>
                    <span className={styles.variantLabel}>Color:</span>
                    <span className={styles.variantValue}>
                      {selectedVariant.color}
                    </span>
                  </div>
                  <div className={styles.variantProperty}>
                    <span className={styles.variantLabel}>Price:</span>
                    <span className={styles.variantValue}>
                      ${selectedVariant.price}
                    </span>
                  </div>
                  <div className={styles.variantProperty}>
                    <span className={styles.variantLabel}>Availability:</span>
                    <StockStatus stock={selectedVariant.stock} />
                  </div>
                </div>

                <QuantityControls
                  quantity={quantity}
                  maxQuantity={selectedVariant.stock}
                  onChange={handleQuantityChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.addButton}
          onClick={handleAddToCart}
          disabled={!canAddToCart || addingToCart}
          aria-describedby={
            selectedVariant ? `stock-${selectedVariant.id}` : undefined
          }
        >
          <ShoppingCartIcon className={styles.cartIcon} />
          {addingToCart ? "Adding..." : `Add to Cart (${quantity})`}
        </button>
        <button className={styles.cancelButton} onClick={closeInfo}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const ProductModal = ({ productId, onClose }) => {
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (!productId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const [detailRes, varRes, modelRes] = await Promise.all([
          getProduct(productId),
          getProductVariants(productId, 0, 100),
          getProductModel(productId),
        ]);

        if (!detailRes.success) {
          throw new Error(
            detailRes.message || "Failed to load product details"
          );
        }

        if (!varRes.success) {
          throw new Error(varRes.message || "Failed to load product variants");
        }

        if (!modelRes.success) {
          throw new Error(modelRes.message || "Failed to load product model");
        }

        setSelectedInfo({
          ...detailRes.data,
          variants: varRes.data.content || [],
          model: modelRes.data.glbUrl,
          coordinates: modelRes.data.coordinates,
          path: modelRes.data.path,
          scale: modelRes.data.scale,
        });
      } catch (e) {
        console.error("Error fetching product details:", e);
        setError(e.message || "Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [productId]);

  const handleAddToCart = async (cartItem) => {
    if (!cartItem || !cartItem.variantId) {
      console.error("No variant ID provided");
      return;
    }
    
    const audio = new Audio('/pay_sound.mp3');
    try {
      const { variantId, quantity } = cartItem;
      const response = await addtoCart(variantId, quantity);

      if (response.success) {
        alert("Added to cart successfully");
      } else {
        throw new Error(response.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert(`Failed to add to cart: ${err}`)
    }
  };

  if (!productId) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {selectedInfo && (
          <ProductInfoPanel
            selectedInfo={selectedInfo}
            closeInfo={onClose}
            addToCart={handleAddToCart}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProductModal;
