/* eslint-disable react/prop-types */
import { Html } from "@react-three/drei";
import styles from "./ProductInfoPanel.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PriceTag = ({ price, name, visible }) => {
  if (!visible) return null;

  return (
    <Html position={[0, 0.2, 0]} center style={{ pointerEvents: "none" }}>
      <div
        className={`${styles.container} ${
          visible ? styles.visible : styles.hidden
        }`}
      >
        <p className={styles.name}>{name}</p>
        <p className={styles.price}>${price}</p>
        <div className={styles.tag}>Click to view</div>
      </div>
    </Html>
  );
};

export const ProductInfoPanel = ({ selectedInfo, closeInfo, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
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

      // Reset color selection when size changes
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
      } else {
        setSelectedVariant(null);
      }
    }
  }, [selectedSize, selectedColor, selectedInfo]);

  if (!selectedInfo) return null;

  const productURL = selectedInfo.path;
  const productScale = selectedInfo.scale;

  const query = new URLSearchParams({
    scale: JSON.stringify(productScale),
  }).toString();

  const handleNavigateToRoom = () => {
    navigate(`/room/${selectedInfo.productId}`);
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({
        variantId: selectedVariant.id,
        quantity: quantity,
      });
    } else {
      console.warn("No variant selected for product with variants");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0)
      return <span className={styles.outOfStock}>Out of Stock</span>;
    if (stock < 5)
      return <span className={styles.lowStock}>Low Stock: {stock}</span>;
    return <span className={styles.inStock}>In Stock: {stock}</span>;
  };

  const sound1 = new Audio('/click_sound.mp3')
  sound1.volume = 0.3;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>{selectedInfo.name}</h3>

        <div className={styles.headerActions}>
          <button className={styles.vrButton} onClick={() => {handleNavigateToRoom(); sound1.play()}}>
            VR View
          </button>
          <button
            className={styles.closeButton}
            onClick={() => {closeInfo(); sound1.play();}}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.modelSection}>
            <p className={styles.label}>Model</p>
            <p className={styles.text}>{selectedInfo.model}</p>
          </div>
          <div>
            <p className={styles.label}>Description</p>
            <p className={styles.description}>{selectedInfo.description}</p>
          </div>
          <div className={styles.priceSection}>
            <p className={styles.label}>Price</p>
            <p className={styles.basePrice}>${displayPrice}</p>
            {selectedVariant && (
              <div className={styles.stockIndicator}>
                {getStockStatus(selectedVariant.stock)}
              </div>
            )}
          </div>
        </div>

        {selectedInfo.variants && selectedInfo.variants.length > 0 && (
          <div className={styles.card}>
            <div className={styles.selectionSection}>
              <div className={styles.sizeSection}>
                <h4 className={styles.selectionTitle}>Size</h4>
                <div className={styles.sizeGrid}>
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeButton} ${
                        selectedSize === size ? styles.selectedSize : ""
                      }`}
                      onClick={() => {setSelectedSize(size); sound1.play()}}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSize && availableColors.length > 0 && (
                <div className={styles.colorSection}>
                  <h4 className={styles.selectionTitle}>Color</h4>
                  <div className={styles.colorGrid}>
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        className={`${styles.colorButton} ${
                          selectedColor === color ? styles.selectedColor : ""
                        }`}
                        onClick={() => {setSelectedColor(color); sound1.play()}}
                        style={{
                          backgroundColor:
                            color === "white-black" ? "white" : color,
                          backgroundImage:
                            color === "white-black"
                              ? "linear-gradient(to right, white 50%, black 50%)"
                              : "none",
                        }}
                        title={color}
                      >
                        <span className={styles.colorName}>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedVariant && (
              <div className={styles.selectedVariantInfo}>
                <h4 className={styles.selectionTitle}>Selected Product</h4>
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
                    <span>{getStockStatus(selectedVariant.stock)}</span>
                  </div>
                </div>

                <div className={styles.quantitySection}>
                  <h4 className={styles.selectionTitle}>Quantity</h4>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => {handleQuantityChange(quantity - 1); sound1.play()}}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className={styles.quantityDisplay}>{quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => {handleQuantityChange(quantity + 1); sound1.play()}}
                      disabled={quantity >= selectedVariant.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.addButton}
          onClick={() => {handleAddToCart()}}
          disabled={
            !selectedInfo.variants ||
            selectedInfo.variants.length === 0 ||
            !selectedVariant ||
            selectedVariant.stock <= 0
          }
        >
          <span className={styles.cartIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
            >
              <path
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M16 17a2 2 0 100 4 2 2 0 000-4zm0 0H9m0 0a2 2 0 100 4 2 2 0 000-4z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
          Add to Cart ({quantity})
        </button>
        <button className={styles.cancelButton} onClick={() => {closeInfo(); sound1.play()}}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export const ControlsPanel = ({ resetCamera }) => {
  return (
    <div className={styles.controlsPanel}>
      <button className={styles.resetButton} onClick={resetCamera}>
        Reset View
      </button>
    </div>
  );
};

export default ProductInfoPanel;
