import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteShop,
  getAllShops,
  getShopAssets,
  getShopDetails,
} from "../../Service/shopService";
import {
  Plus,
  Search,
  Filter,
  Package,
  Settings,
  Trash2,
  Eye,
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import styles from "./ShopList.module.css";
import { getShopProducts } from "../../Service/productsService";

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (shops.length > 0) {
      const uniqueCategories = [
        ...new Set(shops.map((shop) => shop.category)),
      ].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [shops]);

  useEffect(() => {
    const fetchAllShopsWithAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await getAllShops(0, 100);
        if (!resp.success)
          throw new Error(resp.error || "Failed to fetch shops");
        const allShops = resp.data.content || [];

        const enriched = await Promise.all(
          allShops.map(async (shop) => {
            const prodResp = await getShopProducts(shop.id, 0, 1);
            const productCount = prodResp.success
              ? prodResp.data.totalElements
              : 0;

            const assetsResp = await getShopDetails(shop.id);
            const images = assetsResp.success ? assetsResp.data.logo : [];

            return {
              ...shop,
              productCount,
              images,
            };
          })
        );

        setShops(enriched);
      } catch (err) {
        console.error(err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAllShopsWithAssets();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDeleteShop = async (shopId, shopName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${shopName}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await deleteShop(shopId);

        if (response.success) {
          alert("Shop deleted successfully");
          const updatedShops = shops.filter((shop) => shop.id !== shopId);
          setShops(updatedShops);
        } else {
          alert(`Failed to delete shop: ${response.error}`);
        }
      } catch (err) {
        console.error("Error deleting shop:", err);
        alert("Failed to delete shop. Please try again.");
      }
    }
  };

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || shop.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Something went wrong</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shopList}>
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h1 className={styles.pageTitle}>Shop Management</h1>
              <p className={styles.pageSubtitle}>
                Manage your shop and track performance
              </p>
            </div>
          </div>
          <button
            className={styles.createButton}
            onClick={() => navigate(`./create`)}
          >
            <Plus size={20} />
            Create New Shop
          </button>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search shops by name or description..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {categories.length > 0 && (
          <div className={styles.filterContainer}>
            <Filter className={styles.filterIcon} size={20} />
            <select
              className={styles.filterSelect}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredShops.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Store size={64} />
          </div>
          <h3 className={styles.emptyStateTitle}>
            {shops.length === 0 ? "No shops yet" : "No shops found"}
          </h3>
          <p className={styles.emptyStateMessage}>
            {shops.length === 0
              ? "Start by creating your first shop to begin selling"
              : "Try adjusting your search criteria or filters"}
          </p>
          {shops.length === 0 && (
            <button
              className={styles.createButton}
              onClick={() => navigate(`./create`)}
            >
              <Plus size={20} />
              Create Your First Shop
            </button>
          )}
        </div>
      ) : (
        <div className={styles.shopListContainer}>
          <div className={styles.shopListHeader}>
            <h2 className={styles.shopListTitle}>
              <Store size={20} />
              Your Shops ({filteredShops.length})
            </h2>
          </div>

          {filteredShops.map((shop) => (
            <div key={shop.id} className={styles.shopItem}>
              <div className={styles.shopItemTop}>
                <div className={styles.shopAvatar}>
                  {shop.images ? (
                    <img
                      src={shop.images}
                      alt={shop.name}
                      className={styles.shopImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Store size={32} />
                    </div>
                  )}
                  {shop.category && (
                    <span className={styles.categoryBadge}>
                      {shop.category}
                    </span>
                  )}
                </div>

                <div className={styles.shopInfo}>
                  <h3 className={styles.shopName}>{shop.name}</h3>
                  <p className={styles.shopDescription}>
                    {shop.description || "No description available"}
                  </p>

                  <div className={styles.shopMeta}>
                    {shop.location && (
                      <div className={styles.metaItem}>
                        <MapPin size={14} />
                        <span>{shop.location}</span>
                      </div>
                    )}
                    {shop.phone && (
                      <div className={styles.metaItem}>
                        <Phone size={14} />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    {shop.email && (
                      <div className={styles.metaItem}>
                        <Mail size={14} />
                        <span>{shop.email}</span>
                      </div>
                    )}
                    {shop.website && (
                      <div className={styles.metaItem}>
                        <Globe size={14} />
                        <span>{shop.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.shopStats}>
                <div className={styles.statItem}>
                  <p className={styles.statNumber}>{shop.productCount || 0}</p>
                  <p className={styles.statLabel}>Products</p>
                </div>
                <div className={styles.statItem}>
                  <p className={styles.statNumber}>0</p>
                  <p className={styles.statLabel}>Orders</p>
                </div>
              </div>

              <div className={styles.shopActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => navigate(`./details/${shop.id}`)}
                  title="View Details"
                >
                  <Eye size={16} />
                  <span>Details</span>
                </button>

                <button
                  className={styles.actionButton}
                  onClick={() => navigate(`./${shop.id}/Product`)}
                  title="Manage Products"
                >
                  <Package size={16} />
                  <span>Products</span>
                </button>

                <button
                  className={styles.actionButton}
                  onClick={() => navigate(`./${shop.id}/assets`)}
                  title="Assets"
                >
                  <Settings size={16} />
                  <span>Assets</span>
                </button>

                <button
                  className={`${styles.actionButton} ${styles.dangerButton}`}
                  onClick={() => handleDeleteShop(shop.id, shop.name)}
                  title="Delete Shop"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopList;
