/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  Heart,
  AlertCircle,
  Star,
} from "lucide-react";
import styles from "./ShopProduct.module.css";
import {
  getProductModel,
  getShopProducts,
  addToWishList,
  getWishList,
  // addProductReview, // TODO: Add this service when review API is ready
  // getProductReviews, // TODO: Add this service when review API is ready
} from "../../../Service/productsService";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import ProductModal from "./ProductModel";

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

const LoadingSpinner = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner}></div>
  </div>
);

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

const EmptyState = () => (
  <div className={styles.emptyContainer}>
    <div className={styles.emptyContent}>
      <Package className={styles.emptyIcon} />
      <h2 className={styles.emptyTitle}>No Products Found</h2>
      <p className={styles.emptyDescription}>
        This shop does not have any products available at the moment.
      </p>
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

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistToggle(product.id);
  };

  const handleRatingChange = async (rating) => {
    setUserRating(rating);
    setIsSubmittingReview(true);

    try {
      // TODO: Uncomment and implement when review API is ready
      // const response = await addProductReview(product.id, {
      //   rating: rating,
      //   // comment: "", // Optional comment field
      // });

      // if (response.success) {
      //   console.log("Review submitted successfully");
      //   // Optionally refresh product data to show updated average rating
      // } else {
      //   throw new Error(response.message || "Failed to submit review");
      // }

      // For now, just simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(
        `Review submitted for product ${product.id} with rating: ${rating}`
      );
    } catch (err) {
      console.error("Error submitting review:", err);
      setUserRating(0);
      // You might want to show a toast notification here
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productImage} onClick={() => onClick(product)}>
        {product.model ? (
          <Canvas camera={{ position: [0, 0, 2.5] }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[0, 0, 5]} />
            <Suspense fallback={null}>
              <ModelViewer modelUrl={product.model} />
            </Suspense>
          </Canvas>
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
          <Heart
            className={`${styles.heartIcon} ${
              isInWishlist ? styles.heartFilled : ""
            }`}
          />
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
  const [modalProductId, setModalProductId] = useState(null);
  const { shopId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const shopInfo = location.state || {};
  const { shopName, shopCategory } = shopInfo;

  const [products, setProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
  });

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

  const fetchShopProducts = useCallback(
    async (page = 0, size = 12, append = false) => {
      try {
        if (!append) {
          setLoading(true);
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

          const enhancedProducts = await Promise.all(
            (content || []).map(async (product) => {
              try {
                const [modelResponse] = await Promise.all([
                  getProductModel(product.id),
                  // TODO: Add review data fetching when API is ready
                  // getProductReviews(product.id)
                ]);

                return {
                  ...product,
                  model: modelResponse?.data?.glbUrl || null,
                  coordinates: modelResponse?.data?.coordinates || null,
                  // TODO: Add review data when API is ready
                  // averageRating: reviewResponse?.data?.averageRating || 0,
                  // reviewCount: reviewResponse?.data?.totalReviews || 0,
                };
              } catch (err) {
                console.error(`Error enhancing product ${product.id}:`, err);
                return {
                  ...product,
                  model: null,
                  coordinates: null,
                  // averageRating: 0,
                  // reviewCount: 0,
                };
              }
            })
          );

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
      }
    },
    [shopId]
  );

  useEffect(() => {
    if (shopId) {
      fetchShopProducts();
      fetchWishList();
    }
  }, [shopId, fetchShopProducts, fetchWishList]);

  const handleLoadMore = () => {
    if (!pagination.last && !loading) {
      fetchShopProducts(pagination.page + 1, pagination.size, true);
    }
  };

  const handleBackToShops = () => {
    navigate(-1);
  };

  const handleProductClick = (product) => {
    setModalProductId(product.id);
  };

  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToShops}>
            <ArrowLeft className={styles.backIcon} />
            Back to Shops
          </button>
          <div>
            <h1 className={styles.title}>
              {shopName ? `${shopName} Products` : "Shop Products"}
            </h1>
            <p className={styles.subtitle}>Loading products...</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToShops}>
            <ArrowLeft className={styles.backIcon} />
            Back to Shops
          </button>
          <div>
            <h1 className={styles.title}>Error Loading Products</h1>
          </div>
        </div>
        <ErrorMessage message={error} onRetry={() => fetchShopProducts()} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBackToShops}>
          <ArrowLeft className={styles.backIcon} />
          Back to Shops
        </button>
        <div>
          <h1 className={styles.title}>
            {shopName ? `${shopName} Products` : "Shop Products"}
          </h1>
          <p className={styles.subtitle}>
            {shopCategory && `${shopCategory} • `}
            {pagination.totalElements} product
            {pagination.totalElements !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={styles.productsGrid}>
            {products.map((product) => (
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

          {!pagination.last && (
            <div className={styles.loadMoreContainer}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Products"}
              </button>
            </div>
          )}
        </>
      )}

      {modalProductId && (
        <ProductModal
          productId={modalProductId}
          onClose={() => setModalProductId(null)}
        />
      )}
    </div>
  );
};

export default ShopProducts;
