import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Star, TrendingUp, X } from "lucide-react";
import { getAllShops } from "../../../Service/shopService";
import styles from "./ShopList.module.css";
import { useNavigate } from "react-router-dom";

const ShopList = () => {
  const navigate = useNavigate();
  const [allShops, setAllShops] = useState([]);
  const [displayedShops, setDisplayedShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllShops, setShowAllShops] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const shopsRef = useRef(null);

  const categoryStyles = {
    Cloths: { icon: "👗", colorClass: "pinkGradient" },
    Fitness: { icon: "⚽", colorClass: "greenGradient" },
    Shoes: { icon: "👟", colorClass: "blueGradient" },
    Bags: { icon: "👜", colorClass: "purpleGradient" },
  };

  const getCategoryIcon = useCallback((category) => {
    const normalized = category?.toLowerCase();
    if (normalized?.includes("cloths")) return categoryStyles.Cloths.icon;
    if (normalized?.includes("fitness")) return categoryStyles.Fitness.icon;
    if (normalized?.includes("shoes")) return categoryStyles.Shoes.icon;
    if (normalized?.includes("bags")) return categoryStyles.Bags.icon;
    return "🏪";
  }, [categoryStyles.Bags.icon, categoryStyles.Cloths.icon, categoryStyles.Fitness.icon, categoryStyles.Shoes.icon]);

  const getCategoryColorClass = useCallback((category) => {
    const normalized = category?.toLowerCase();
    if (normalized?.includes("cloths")) return categoryStyles.Cloths.colorClass;
    if (normalized?.includes("fitness"))
      return categoryStyles.Fitness.colorClass;
    if (normalized?.includes("shoes")) return categoryStyles.Shoes.colorClass;
    if (normalized?.includes("bag")) return categoryStyles.Bags.colorClass;
    return "blueGradient";
  }, [categoryStyles.Bags.colorClass, categoryStyles.Cloths.colorClass, categoryStyles.Fitness.colorClass, categoryStyles.Shoes.colorClass]);

  const generateCategoriesFromShops = useCallback(
    (shopsData) => {
      const map = new Map();
      shopsData.forEach((shop) => {
        const cat = shop.category || "Other";
        if (map.has(cat)) {
          const ex = map.get(cat);
          map.set(cat, { ...ex, shopCount: ex.shopCount + 1 });
        } else {
          map.set(cat, {
            name: cat,
            icon: getCategoryIcon(cat),
            colorClass: getCategoryColorClass(cat),
            shopCount: 1,
          });
        }
      });
      return Array.from(map.values()).map((c) => ({
        ...c,
        items:
          c.shopCount > 5
            ? `${Math.floor(c.shopCount * 150)}+`
            : `${Math.floor(c.shopCount * 100)}+`,
      }));
    },
    [getCategoryIcon, getCategoryColorClass]
  );

  const fetchShops = useCallback(
    async (page = 0, size = 50) => {
      try {
        setLoading(true);
        setError(null);

        const resp = await getAllShops(page, size);
        if (resp.success && resp.data) {
          const {
            content,
            page: currentPage,
            size: pageSize,
            totalElements,
            totalPages,
            first,
            last,
          } = resp.data;

          setAllShops(content || []);
          setDisplayedShops(content || []);
          setPagination({
            page: currentPage,
            size: pageSize,
            totalElements,
            totalPages,
            first,
            last,
          });

          if (content.length > 0) {
            setCategories(generateCategoriesFromShops(content));
          }
        } else {
          throw new Error(resp.message || "Failed to fetch shops");
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops and categories. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [generateCategoriesFromShops]
  );

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleVisitShop = (shop) => {
    const slug = shop.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    navigate(`/${slug}/${shop.id}`);
  };

  const handleViewAllShops = () => {
    setShowAllShops(true);
    setSelectedCategory(null);
    setDisplayedShops(allShops);

    if (shopsRef.current) {
      shopsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleCategoryClick = (categoryName) => {
    const filteredShops = allShops.filter(
      (shop) => shop.category?.toLowerCase() === categoryName.toLowerCase()
    );

    setSelectedCategory(categoryName);
    setDisplayedShops(filteredShops);
    setShowAllShops(false);

    if (shopsRef.current) {
      shopsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
    setShowAllShops(false);
    setDisplayedShops(allShops);
  };

  const handleLoadMoreShops = async () => {
    if (!pagination.last) {
      await fetchShops(pagination.page + 1, pagination.size);
    }
  };

  const getShopsToShow = () => {
    if (showAllShops || selectedCategory) {
      return displayedShops;
    }
    return displayedShops.slice(0, 6);
  };

  const shopsToShow = getShopsToShow();

  if (loading) {
    return (
      <div>
        <section className={styles.categoriesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Shop by Category</h2>
              <p className={styles.sectionDescription}>Loading categories...</p>
            </div>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        </section>

        <section className={styles.shopsSection}>
          <div className={styles.container}>
            <div className={styles.shopsHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Popular Shops</h2>
                <p className={styles.sectionDescription}>Loading shops...</p>
              </div>
            </div>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <section className={styles.errorSection}>
          <div className={styles.container}>
            <div className={styles.errorContent}>
              <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
              <p className={styles.errorDescription}>{error}</p>
              <button
                className={styles.retryButton}
                onClick={() => fetchShops()}
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <p className={styles.sectionDescription}>
              Discover amazing deals across all categories
            </p>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <div
                key={category.name}
                className={`${styles.categoryCard} ${
                  selectedCategory === category.name
                    ? styles.categoryCardActive
                    : ""
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div
                  className={`${styles.categoryContent} ${
                    styles[category.colorClass]
                  }`}
                >
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                    {/* Todo: Uncomment when items count is available  */}
                    <p className={styles.categoryItems}>
                      {category.items} items
                    </p>
                    <p className={styles.categoryShops}>
                      {category.shopCount}{" "}
                      {category.shopCount === 1 ? "shop" : "shops"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.shopsSection} ref={shopsRef}>
        <div className={styles.container}>
          <div className={styles.shopsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {selectedCategory
                  ? `${selectedCategory} Shops`
                  : showAllShops
                  ? "All Shops"
                  : "Popular Shops"}
              </h2>
              <p className={styles.sectionDescription}>
                {selectedCategory
                  ? `Showing ${displayedShops.length} shops in ${selectedCategory} category`
                  : showAllShops
                  ? `All ${pagination.totalElements} shops in our mall`
                  : `Top-rated stores in our mall (${pagination.totalElements} shops available)`}
              </p>
            </div>
            <div className={styles.headerActions}>
              {selectedCategory && (
                <button
                  className={styles.clearFilterButton}
                  onClick={handleClearFilter}
                >
                  <X className={styles.clearIcon} />
                  Clear Filter
                </button>
              )}
              {!showAllShops && !selectedCategory && (
                <button
                  className={styles.viewAllButton}
                  onClick={handleViewAllShops}
                >
                  View All <ArrowRight className={styles.viewAllIcon} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.shopsGrid}>
            {shopsToShow.map((shop) => (
              <div key={shop.id} className={styles.shopCard}>
                <div className={styles.shopContent}>
                  <div className={styles.shopHeader}>
                    <div className={styles.shopIcon}>
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={`${shop.name} logo`}
                          className={styles.shopLogo}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : null}
                      <span
                        className={styles.shopIconFallback}
                        style={{ display: shop.logo ? "none" : "block" }}
                      >
                        {getCategoryIcon(shop.category)}
                      </span>
                    </div>
                    <div className={styles.shopRating}>
                      <Star className={styles.starIcon} />
                      <span className={styles.ratingText}>
                        {/* Todo: Replace with actual rating */}
                        4.5
                      </span>
                    </div>
                  </div>

                  <h3 className={styles.shopName}>{shop.name}</h3>
                  <p className={styles.shopCategory}>{shop.category}</p>
                  {shop.description && (
                    <p className={styles.shopDescription}>{shop.description}</p>
                  )}
                  {shop.location && (
                    <p className={styles.shopLocation}>📍 {shop.location}</p>
                  )}

                  <div className={styles.shopStats}>
                    <span className={styles.contactInfo}>
                      {shop.email && (
                        <span className={styles.shopEmail}>
                          ✉️ Contact Available
                        </span>
                      )}
                      {shop.phone && (
                        <span className={styles.shopPhone}>
                          📞 {shop.phone}
                        </span>
                      )}
                    </span>
                    <div className={styles.popularBadge}>
                      <TrendingUp className={styles.trendingIcon} />
                      <span className={styles.popularText}>Popular</span>
                    </div>
                  </div>

                  {shop.socials && shop.socials.length > 0 && (
                    <div className={styles.socialLinks}>
                      {shop.socials.slice(0, 3).map((social, index) => (
                        <a
                          key={index}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title={social.platform}
                        >
                          🔗 {social.platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.shopFooter}>
                  <button
                    className={styles.visitButton}
                    onClick={() => handleVisitShop(shop)}
                  >
                    Visit Shop
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedCategory && shopsToShow.length === 0 && (
            <div className={styles.noShopsMessage}>
              <p>No shops found in the {selectedCategory} category.</p>
              <button
                className={styles.clearFilterButton}
                onClick={handleClearFilter}
              >
                Show All Shops
              </button>
            </div>
          )}

          {!showAllShops && !selectedCategory && allShops.length > 6 && (
            <div className={styles.showMoreContainer}>
              <button
                className={styles.showMoreButton}
                onClick={handleViewAllShops}
              >
                Show All {pagination.totalElements} Shops
              </button>
            </div>
          )}

          {!pagination.last && (showAllShops || selectedCategory) && (
            <div className={styles.loadMoreContainer}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMoreShops}
              >
                Load More Shops
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShopList;
