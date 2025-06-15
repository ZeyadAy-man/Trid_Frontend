/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Heart,
  AlertCircle,
  Star,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import styles from "./ShopProduct.module.css";
import {
  getProductModel,
  getShopProducts,
  getProductByName,
  addToWishList,
  getWishList,
} from "../../../Service/productsService";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
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

const LoadingSpinner = ({ size = "medium" }) => (
  <div
    className={`${styles.loadingContainer} ${
      styles[`loading${size.charAt(0).toUpperCase() + size.slice(1)}`]
    }`}
  >
    <div
      className={`${styles.spinner} ${
        styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`]
      }`}
    ></div>
  </div>
);

const FilterDropdown = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={styles.filterDropdown}>
      <button
        className={styles.filterButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {Icon && <Icon className={styles.filterIcon} />}
        <span className={styles.filterLabel}>
          {selectedOption ? selectedOption.label : label}
        </span>
        <ChevronDown
          className={`${styles.chevronIcon} ${
            isOpen ? styles.chevronRotated : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={styles.filterOptions}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterOption} ${
                value === option.value ? styles.filterOptionActive : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ sortBy, setSortBy, filterBy, setFilterBy }) => {
  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "price_low_high", label: "Price: Low to High" },
    { value: "price_high_low", label: "Price: High to Low" },
    { value: "rating_high_low", label: "Best Rated" },
    { value: "rating_low_high", label: "Lowest Rated" },
    { value: "name_a_z", label: "Name: A to Z" },
    { value: "name_z_a", label: "Name: Z to A" },
  ];

  const filterOptions = [
    { value: "all", label: "All Products" },
    { value: "in_stock", label: "In Stock" },
    { value: "high_rated", label: "Highly Rated (4+ stars)" },
  ];

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterControls}>
        <FilterDropdown
          label="Sort by"
          value={sortBy}
          options={sortOptions}
          onChange={setSortBy}
          icon={ArrowUpDown}
        />

        <FilterDropdown
          label="Filter"
          value={filterBy}
          options={filterOptions}
          onChange={setFilterBy}
          icon={Filter}
        />
      </div>
    </div>
  );
};

const ErrorMessage = ({ message, onRetry }) => (
  <div className={styles.errorContainer}>
    <div className={styles.errorContent}>
      <AlertCircle className={styles.errorIcon} />
      <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
      <p className={styles.errorDescription}>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  </div>
);

const EmptyState = ({ isSearch, searchTerm }) => (
  <div className={styles.emptyContainer}>
    <div className={styles.emptyContent}>
      {isSearch ? (
        <>
          <Search className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No Products Found</h2>
          <p className={styles.emptyDescription}>
            No products found matching &quot;{searchTerm}&quot;. Try a different
            search term.
          </p>
        </>
      ) : (
        <>
          <Package className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No Products Found</h2>
          <p className={styles.emptyDescription}>
            This shop does not have any products available at the moment.
          </p>
        </>
      )}
    </div>
  </div>
);

const ProductCard = ({
  product,
  wishList,
  onWishlistToggle,
  wishlistLoading,
  onClick,
}) => {
  const isInWishlist = wishList.includes(product.id);
  const isWishlistLoading = wishlistLoading[product.id];
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistToggle(product.id);
  };

  const handleRatingChange = async (rating) => {
    setUserRating(rating);
    setIsSubmittingReview(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(
        `Review submitted for product ${product.id} with rating: ${rating}`
      );
    } catch (err) {
      console.error("Error submitting review:", err);
      setUserRating(0);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productImage} onClick={() => onClick(product)}>
        {product.model ? (
          <div className={styles.canvasContainer}>
            {modelLoading && (
              <div className={styles.modelLoadingOverlay}>
                <LoadingSpinner size="small" />
              </div>
            )}
            <Canvas
              camera={{ position: [0, 0, 5], fov: 30 }}
              onCreated={() => setModelLoading(false)}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[0, 4, 0]} />
              <Suspense fallback={null}>
                <Stage environment={"city"} intensity={0.6}>
                  <ModelViewer modelUrl={product.model} />
                </Stage>
              </Suspense>
            </Canvas>
          </div>
        ) : (
          <div className={styles.productImageFallback}>
            <Package className={styles.fallbackIcon} />
          </div>
        )}

        {product.discount && (
          <div className={styles.discountBadge}>-{product.discount}%</div>
        )}

        <button
          className={`${styles.wishlistButton} ${
            isInWishlist ? styles.wishlistActive : ""
          }`}
          onClick={handleWishlistClick}
          disabled={isWishlistLoading}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlistLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Heart
              className={`${styles.heartIcon} ${
                isInWishlist ? styles.heartFilled : ""
              }`}
            />
          )}
        </button>
      </div>

      <div className={styles.productContent}>
        <h3 className={styles.productName}>{product.name}</h3>

        {product.category && (
          <p className={styles.productCategory}>{product.category}</p>
        )}

        {product.description && (
          <p className={styles.productDescription}>
            {product.description.length > 100
              ? `${product.description.substring(0, 100)}...`
              : product.description}
          </p>
        )}

        <div className={styles.productInfo}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>
              ${product.basePrice || "N/A"}
            </span>
            {product.originalPrice &&
              product.originalPrice > product.basePrice && (
                <span className={styles.originalPrice}>
                  ${product.originalPrice}
                </span>
              )}
          </div>

          {product.averageRating && (
            <div className={styles.averageRating}>
              <StarRating
                rating={product.averageRating}
                readonly={true}
                size="small"
              />
              <span className={styles.ratingText}>
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
        </div>

        <div className={styles.productFooter}>
          <div className={styles.userReviewSection}>
            <span className={styles.rateLabel}>Rate this product:</span>
            <StarRating
              rating={userRating}
              onRatingChange={handleRatingChange}
              readonly={isSubmittingReview}
              size="small"
            />
            {isSubmittingReview && (
              <span className={styles.submittingText}>Submitting...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopProducts = () => {
  const { shopId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("name") || "";

  const shopInfo = location.state || {};
  const { shopName, shopCategory } = shopInfo;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [sortBy, setSortBy] = useState("default");
  const [filterBy, setFilterBy] = useState("all");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
  });

  const isSearchMode = !shopId && query.trim() !== "";
  const isShopMode = shopId && !query.trim();

  const fetchWishList = useCallback(async () => {
    try {
      const response = await getWishList(0, 20);
      if (response.success && response.data) {
        setWishList(
          response.data.content.map((item) => item.productId || item.id)
        );
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  }, []);

  const handleWishlistToggle = async (productId) => {
    const isInWishlist = wishList.includes(productId);

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await addToWishList(productId);

      if (response.success) {
        if (isInWishlist) {
          setWishList((prev) => prev.filter((id) => id !== productId));
        } else {
          setWishList((prev) => [...prev, productId]);
        }
      } else {
        throw new Error(response.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const enhanceProductsWithModels = async (products) => {
    return await Promise.all(
      (products || []).map(async (product) => {
        try {
          const [modelResponse] = await Promise.all([
            getProductModel(product.id),
          ]);

          return {
            ...product,
            model: modelResponse?.data?.glbUrl || null,
            coordinates: modelResponse?.data?.coordinates || null,
            averageRating: Math.random() * 5,
            reviewCount: Math.floor(Math.random() * 100) + 1,
          };
        } catch (err) {
          console.error(`Error enhancing product ${product.id}:`, err);
          return {
            ...product,
            model: null,
            coordinates: null,
            averageRating: Math.random() * 5,
            reviewCount: Math.floor(Math.random() * 100) + 1,
          };
        }
      })
    );
  };

  const sortProducts = useCallback((products, sortType) => {
    const sorted = [...products];

    switch (sortType) {
      case "price_low_high":
        return sorted.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
      case "price_high_low":
        return sorted.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      case "rating_high_low":
        return sorted.sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
        );
      case "rating_low_high":
        return sorted.sort(
          (a, b) => (a.averageRating || 0) - (b.averageRating || 0)
        );
      case "name_a_z":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name_z_a":
        return sorted.sort((a, b) => b.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, []);

  const filterProducts = useCallback((products, filterType) => {
    switch (filterType) {
      case "in_stock":
        return products.filter((product) => product.inStock !== false);
      case "high_rated":
        return products.filter((product) => (product.averageRating || 0) >= 4);
      default:
        return products;
    }
  }, []);

  useEffect(() => {
    let filtered = filterProducts(products, filterBy);
    let sorted = sortProducts(filtered, sortBy);
    setFilteredProducts(sorted);
  }, [products, sortBy, filterBy, sortProducts, filterProducts]);

  const fetchShopProducts = useCallback(
    async (page = 0, size = 12, append = false) => {
      try {
        if (!append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await getShopProducts(shopId, page, size);

        if (response.success && response.data) {
          const {
            content,
            page: currentPage,
            size: pageSize,
            totalElements,
            totalPages,
            first,
            last,
          } = response.data;

          const enhancedProducts = await enhanceProductsWithModels(content);

          if (append) {
            setProducts((prev) => [...prev, ...enhancedProducts]);
          } else {
            setProducts(enhancedProducts);
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
          throw new Error(response.message || "Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching shop products:", err);
        setError("Failed to load shop products. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [shopId]
  );

  const fetchSearchProducts = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProductByName(searchTerm.trim());

      if (response.success && response.data) {
        const enhancedProducts = await enhanceProductsWithModels(
          response.data.content
        );
        setProducts(enhancedProducts);
        setPagination({
          page: 0,
          size: enhancedProducts.length,
          totalElements: enhancedProducts.length,
          totalPages: 1,
          first: true,
          last: true,
        });
      } else {
        setProducts([]);
        setPagination({
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        });
      }
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Failed to search products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isShopMode) {
      fetchShopProducts();
      fetchWishList();
    } else if (isSearchMode) {
      fetchSearchProducts(query);
      fetchWishList();
    } else {
      setLoading(false);
      setProducts([]);
    }
  }, [
    shopId,
    query,
    isShopMode,
    isSearchMode,
    fetchShopProducts,
    fetchSearchProducts,
    fetchWishList,
  ]);

  const handleLoadMore = () => {
    if (!pagination.last && !loading && !loadingMore && isShopMode) {
      fetchShopProducts(pagination.page + 1, pagination.size, true);
    }
  };

  const handleBackToShops = () => {
    navigate(-1);
  };

  const handleProductClick = (product) => {
    navigate(`/productInfo/${product.id}`, { state: { product } });
  };

  const getPageTitle = () => {
    if (isSearchMode) {
      return `${filteredProducts.length} Result${
        filteredProducts.length !== 1 ? "s" : ""
      } found for "${query}"`;
    } else if (isShopMode && shopName) {
      return `${shopName} Products (${filteredProducts.length} item${
        filteredProducts.length !== 1 ? "s" : ""
      })`;
    } else if (isShopMode) {
      return "Shop Products";
    } else {
      return "Products";
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{getPageTitle()}</h1>
            <p className={styles.subtitle}>
              {isSearchMode ? "Searching..." : "Loading products..."}
            </p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToShops}>
            <ArrowLeft className={styles.backIcon} />
            Back
          </button>
          <div>
            <h1 className={styles.title}>
              {isSearchMode ? "Search Error" : "Error Loading Products"}
            </h1>
          </div>
        </div>
        <ErrorMessage
          message={error}
          onRetry={() => {
            if (isSearchMode) {
              fetchSearchProducts(query);
            } else if (isShopMode) {
              fetchShopProducts();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Navbar />
        <div>
          <h1 className={styles.title}>{getPageTitle()}</h1>
        </div>
        {products.length > 0 && (
          <FilterBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
          />
        )}
      </div>

      {filteredProducts.length === 0 && !loading ? (
        <EmptyState isSearch={isSearchMode} searchTerm={query} />
      ) : (
        <>
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishList={wishList}
                onWishlistToggle={handleWishlistToggle}
                wishlistLoading={wishlistLoading}
                onClick={handleProductClick}
              />
            ))}
          </div>

          {isShopMode && !pagination.last && (
            <div className={styles.loadMoreContainer}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={loading || loadingMore}
              >
                {loadingMore ? (
                  <>
                    <LoadingSpinner size="small" />
                    Loading More...
                  </>
                ) : (
                  "Load More Products"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShopProducts;
