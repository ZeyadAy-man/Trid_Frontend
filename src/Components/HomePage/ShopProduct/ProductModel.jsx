/* eslint-disable react/prop-types */
import React, { useState, useEffect, Suspense } from "react";
import styles from "./ProductModal.module.css";
import {
  getProduct,
  getProductVariants,
  getProductModel,
  addToWishList,
} from "../../../Service/productsService";
import { addtoCart } from "../../../Service/cartOrderService";
import { useNavigate, useParams } from "react-router-dom";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  ShoppingCartIcon,
  Package,
  AlertCircle,
  Heart,
  Star,
} from "lucide-react";
import Navbar from "../Nav/Nav";

const ModelViewer = ({ modelUrl }) => {
  const { scene, error } = useGLTF(modelUrl || "/placeholder-model.glb");

  if (error) {
    return (
      <div className={styles.modelError}>
        <Package className={styles.fallbackIcon} />
      </div>
    );
  }

  return (
    <>
      <primitive object={scene} scale={0.6} position={[0, -1, 0]} />
      <OrbitControls
        // enablePan={false}
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

const SizeSelection = ({ sizes, selectedSize, onSizeSelect }) => {
  const sizeOrder = ["S", "M", "L", "XL", "XXL", "small", "medium", "large"];

  const sortedSizes = [...sizes].sort((a, b) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const aIsNum = !isNaN(aNum);
    const bIsNum = !isNaN(bNum);

    if (aIsNum && bIsNum) {
      return aNum - bNum;
    }
    if (aIsNum) return -1;
    if (bIsNum) return 1;

    const aIndex = sizeOrder.findIndex(
      (s) => s.toLowerCase() === a.toLowerCase()
    );
    const bIndex = sizeOrder.findIndex(
      (s) => s.toLowerCase() === b.toLowerCase()
    );

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.localeCompare(b);
  });

  return (
    <div className={styles.sizeSection}>
      <h4 className={styles.selectionTitle}>Size</h4>
      <div className={styles.sizeGrid}>
        {sortedSizes.map((size) => (
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
};

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

const StarRating = ({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = "small",
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoveredRating(starValue);
    }
  };

  const handleStarLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const getStarClass = (starValue) => {
    const baseClass = size === "large" ? styles.starLarge : styles.starSmall;
    const displayRating = hoveredRating || rating;

    if (starValue <= displayRating) {
      return `${baseClass} ${styles.starFilled}`;
    }
    return `${baseClass} ${styles.starEmpty}`;
  };

  return (
    <div
      className={`${styles.starRating} ${
        readonly ? styles.starRatingReadonly : styles.starRatingInteractive
      }`}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={starValue}
            className={getStarClass(starValue)}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            onMouseLeave={handleStarLeave}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
        );
      })}
    </div>
  );
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
          averageRating: Math.random() * 5,
          reviewCount: Math.floor(Math.random() * 100) + 1,
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

  const handleNavigateToRoom = () => {
    if (!selectedInfo) return;
    const productURL = selectedInfo.path;
    const productScale = selectedInfo.scale;
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
      const response = await addtoCart(selectedVariant.id, quantity);
      if (response.success) {
        alert("Added to cart successfully");
      } else {
        throw new Error(response.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert(`Failed to add to cart: ${error}`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (selectedInfo) => {
    setIsWishlisted(!isWishlisted);
    await addToWishList(selectedInfo.id);
  };

  const handleQuantityChange = (newQuantity) => {
    const maxStock = selectedVariant?.stock || 1;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const canAddToCart =
    selectedInfo?.variants.length === 0 ||
    (selectedVariant && selectedVariant.stock > 0);

  if (!productId) return null;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!selectedInfo) return null;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.productLayout}>
        <div className={styles.modelSection}>
          {selectedInfo.model ? (
            <Canvas camera={{ position: [0, 0, 3.5] }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[0, 4, 0]} />
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

        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1 className={styles.productTitle}>{selectedInfo.name}</h1>
            <div className={styles.headerActions}>
              <button
                className={`${styles.wishlistButton} ${
                  isWishlisted ? styles.wishlisted : ""
                }`}
                onClick={() => handleToggleWishlist(selectedInfo)}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart className={styles.heartIcon} />
              </button>
              <button
                className={styles.vrButton}
                onClick={handleNavigateToRoom}
                aria-label="View in VR"
              >
                VR View
              </button>
            </div>
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{selectedInfo.description || "No description available."}</p>
          </div>

          <div className={styles.productInfo} style={{ gap: "10px 0" }}>
            {selectedVariant ? (
              <div className={styles.prices}>
                <p className={styles.oldPrice}>
                  <del>${selectedInfo.basePrice.toFixed(2)}</del>
                </p>
                <p className={styles.newPrice}>
                  ${selectedVariant.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className={styles.price}>
                ${selectedInfo.basePrice.toFixed(2)}
              </p>
            )}
            {selectedInfo.averageRating && (
              <div className={styles.averageRating}>
                <StarRating
                  rating={selectedInfo.averageRating}
                  readonly={true}
                  size="small"
                />
                <span className={styles.ratingText}>
                  ({selectedInfo.reviewCount || 0} reviews)
                </span>
              </div>
            )}
          </div>

          {selectedVariant && (
            <div className={styles.stockIndicator}>
              <StockStatus stock={selectedVariant.stock} />
            </div>
          )}

          {selectedInfo.variants && selectedInfo.variants.length > 0 && (
            <div className={styles.variantSection}>
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
          )}
        </div>

        <div className={styles.cartSection}>
          <div className={styles.cartCard}>
            {selectedVariant && (
              <QuantityControls
                quantity={quantity}
                maxQuantity={selectedVariant.stock}
                onChange={handleQuantityChange}
              />
            )}

            <button
              className={styles.addButton}
              onClick={handleAddToCart}
              disabled={!canAddToCart || addingToCart}
            >
              <ShoppingCartIcon className={styles.cartIcon} />
              {addingToCart ? "Adding..." : `Add to Cart (${quantity})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
