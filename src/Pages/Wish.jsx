import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartOff,
  Heart,
  Package,
  RefreshCw,
  Share2,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import styles from "../styles/Wishlist.module.css";
import {
  getWishList,
  addToWishList,
  getProductVariants,
} from "../Service/productsService";
import { addtoCart } from "../Service/cartService";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [sortBy, setSortBy] = useState("dateAdded");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [variantQuantities, setVariantQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
  });

  const hasStock = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return false;
    }
    return product.variants.some((variant) => variant.stock > 0);
  };

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return 0;
    }
    return product.variants.reduce(
      (total, variant) => total + (variant.stock || 0),
      0
    );
  };

  const getVariantQuantity = (variantId) => {
    return variantQuantities[variantId] || 1;
  };

  const updateVariantQuantity = (variantId, quantity, maxStock) => {
    const newQuantity = Math.max(1, Math.min(quantity, maxStock));
    setVariantQuantities((prev) => ({
      ...prev,
      [variantId]: newQuantity,
    }));
  };

  const incrementQuantity = (variantId, maxStock) => {
    const currentQuantity = getVariantQuantity(variantId);
    updateVariantQuantity(variantId, currentQuantity + 1, maxStock);
  };

  const decrementQuantity = (variantId, maxStock) => {
    const currentQuantity = getVariantQuantity(variantId);
    updateVariantQuantity(variantId, currentQuantity - 1, maxStock);
  };

  const fetchWishlist = useCallback(
    async (page = 0, size = 20, append = false) => {
      try {
        if (!append) {
          setLoading(true);
          setError(null);
        }

        const response = await getWishList(page, size);

        if (response.success && response.data) {
          const {
            content = [],
            page: currentPage,
            size: pageSize,
            totalElements,
            totalPages,
            first,
            last,
          } = response.data;

          const productsWithVariants = await Promise.all(
            content.map(async (item) => {
              const variantsResponse = await getProductVariants(
                item.id,
                page,
                size
              );
              return {
                ...item,
                variants: variantsResponse.data?.content || [],
              };
            })
          );

          if (append) {
            setWishlist((prev) => [...prev, ...productsWithVariants]);
          } else {
            setWishlist(productsWithVariants);
          }

          setPagination({
            page: currentPage,
            size: pageSize,
            totalElements,
            totalPages,
            first,
            last,
          });
        } else {
          throw new Error(response.message || "Failed to fetch wishlist");
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Failed to load wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let filtered = [...wishlist];

    switch (filterBy) {
      case "available":
        filtered = filtered.filter((item) => hasStock(item));
        break;
      default:
        break;
    }

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price":
        filtered.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        break;
      case "priceDesc":
        filtered.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
    }

    setFilteredWishlist(filtered);
  }, [wishlist, sortBy, filterBy]);

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItems((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await addToWishList(productId);

      if (response.success) {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
        setPagination((prev) => ({
          ...prev,
          totalElements: prev.totalElements - 1,
        }));
      } else {
        throw new Error(response.message || "Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove item from wishlist");
    } finally {
      setRemovingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleShareWishlist = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Wishlist",
          text: `Check out my wishlist with ${pagination.totalElements} amazing products!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        console.log("Wishlist link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing wishlist:", err);
    }
  };

  const handleaddToCart = async (variant) => {
    const quantity = getVariantQuantity(variant.id);
    setAddingToCart((prev) => ({ ...prev, [variant.id]: true }));

    try {
      await addtoCart(variant.id, quantity);
      alert(`Added ${quantity} items to cart`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [variant.id]: false }));
    }
  };

  const toggleExpandVariants = (productId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleLoadMore = () => {
    if (!pagination.last && !loading) {
      fetchWishlist(pagination.page + 1, pagination.size, true);
    }
  };

  const handleRetry = () => {
    fetchWishlist();
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (loading && wishlist.length === 0) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.status}>
          <div className={styles.spinner}></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error && wishlist.length === 0) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.status}>
          <div className={styles.errorContent}>
            <Package className={styles.errorIcon} />
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={handleRetry}>
              <RefreshCw className={styles.retryIcon} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0 && !loading) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.emptyState}>
          <HeartOff className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
          <p className={styles.emptyDescription}>
            Start adding products you love to your wishlist and keep track of
            items you want to buy later!
          </p>
          <button className={styles.shopButton} onClick={() => navigate(-1)}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wishlistContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft className={styles.backIcon} />
          Back to Shops
        </button>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.heading}>My Wishlist</h1>
            <p className={styles.subtitle}>
              {pagination.totalElements} item
              {pagination.totalElements !== 1 ? "s" : ""} saved
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.shareButton}
              onClick={handleShareWishlist}
              title="Share wishlist"
            >
              <Share2 className={styles.buttonIcon} />
              Share
            </button>

            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
              title="Filter and sort"
            >
              <Filter className={styles.buttonIcon} />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (Low to High)</option>
                <option value="priceDesc">Price (High to Low)</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Show:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Items</option>
                <option value="available">In Stock Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className={styles.tableHeader}>
        <div className={styles.headerRow}>
          <div className={styles.productColumn}>Product</div>
          <div className={styles.priceColumn}>Price</div>
          <div className={styles.stockColumn}>Stock</div>
          <div className={styles.variantsColumn}>Variants</div>
          <div className={styles.actionsColumn}>Actions</div>
        </div>
      </div>

      <div className={styles.tableBody}>
        {filteredWishlist.map((product) => (
          <div key={product.id} className={styles.tableRow}>
            <div
              className={`${styles.productRow} ${
                !hasStock(product) ? styles.outOfStock : ""
              }`}
            >
              <div className={styles.productColumn}>
                <div className={styles.productInfo}>
                  <div className={styles.productImageContainer}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <Package className={styles.packageIcon} />
                      </div>
                    )}
                    {product.discount && (
                      <div className={styles.discountBadge}>
                        -{product.discount}%
                      </div>
                    )}
                    {!hasStock(product) && (
                      <div className={styles.outOfStockBadge}>Out of Stock</div>
                    )}
                  </div>
                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productDescription}>
                      {product.description}
                    </p>
                    {product.category && (
                      <span className={styles.productCategory}>
                        {product.category}
                      </span>
                    )}
                    {product.shopName && (
                      <p className={styles.shopName}>
                        Sold by {product.shopName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.priceColumn}>
                <div className={styles.priceInfo}>
                  {product.originalPrice &&
                    product.originalPrice !== product.basePrice && (
                      <span className={styles.originalPrice}>
                        ${product.originalPrice}
                      </span>
                    )}
                  <span className={styles.currentPrice}>
                    ${product.basePrice || "N/A"}
                  </span>
                </div>
              </div>

              <div className={styles.stockColumn}>
                <div className={styles.stockInfo}>
                  <span
                    className={`${styles.stockBadge} ${
                      hasStock(product)
                        ? styles.inStock
                        : styles.outOfStockBadge
                    }`}
                  >
                    {hasStock(product)
                      ? `${getTotalStock(product)} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className={styles.variantsColumn}>
                <div className={styles.variantsInfo}>
                  <span className={styles.variantsCount}>
                    {product.variants?.length || 0} variant
                    {product.variants?.length !== 1 ? "s" : ""}
                  </span>
                  {product.variants && product.variants.length > 0 && (
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleExpandVariants(product.id)}
                      title={
                        expandedItems[product.id]
                          ? "Hide variants"
                          : "Show variants"
                      }
                    >
                      {expandedItems[product.id] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.actionsColumn}>
                <div className={styles.actionsInfo}>
                  <button
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                    disabled={removingItems[product.id]}
                    title="Remove from wishlist"
                  >
                    {removingItems[product.id] ? (
                      <div className={styles.miniSpinner}></div>
                    ) : (
                      <Heart className={styles.heartIcon} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {expandedItems[product.id] && product.variants && (
              <div className={styles.variantsExpanded}>
                <div className={styles.variantsHeader}>
                  <span>Available Variants:</span>
                </div>
                <div className={styles.variantsList}>
                  {product.variants.map((variant) => (
                    <div key={variant.id} className={styles.variantItem}>
                      <div className={styles.variantDetails}>
                        <span className={styles.variantColor}>
                          Color: {variant.color}
                        </span>
                        <span className={styles.variantSize}>
                          Size: {variant.size}
                        </span>
                        <span className={styles.variantPrice}>
                          ${variant.price}
                        </span>
                        <span
                          className={`${styles.variantStock} ${
                            variant.stock > 0
                              ? styles.stockAvailable
                              : styles.stockUnavailable
                          }`}
                        >
                          Stock: {variant.stock}
                        </span>
                      </div>
                      <div className={styles.variantActions}>
                        {variant.stock > 0 && (
                          <div className={styles.quantitySelector}>
                            <button
                              className={styles.quantityButton}
                              onClick={() =>
                                decrementQuantity(variant.id, variant.stock)
                              }
                              disabled={getVariantQuantity(variant.id) <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              className={styles.quantityInput}
                              value={getVariantQuantity(variant.id)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                updateVariantQuantity(
                                  variant.id,
                                  value,
                                  variant.stock
                                );
                              }}
                              min="1"
                              max={variant.stock}
                            />
                            <button
                              className={styles.quantityButton}
                              onClick={() =>
                                incrementQuantity(variant.id, variant.stock)
                              }
                              disabled={
                                getVariantQuantity(variant.id) >= variant.stock
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                        <button
                          className={`${styles.addToCartButton} ${
                            variant.stock === 0 ? styles.disabled : ""
                          }`}
                          onClick={() => handleaddToCart(variant)}
                          disabled={
                            variant.stock === 0 || addingToCart[variant.id]
                          }
                        >
                          {addingToCart[variant.id] ? (
                            <>
                              <div className={styles.miniSpinner}></div>
                              Adding...
                            </>
                          ) : variant.stock === 0 ? (
                            "Out of Stock"
                          ) : (
                            `Add ${getVariantQuantity(variant.id)} to Cart`
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!pagination.last && (
        <div className={styles.loadMoreContainer}>
          <button
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.miniSpinner}></div>
                Loading...
              </>
            ) : (
              "Load More Items"
            )}
          </button>
        </div>
      )}

      {error && wishlist.length > 0 && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
          <button onClick={handleRetry}>
            <RefreshCw className={styles.retryIcon} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
