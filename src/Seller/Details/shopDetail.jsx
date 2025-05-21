import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getShopAssets,
  getShopDetails,
  deleteShop,
} from "../../Service/shopService";
import styles from "./ShopDetail.module.css";

const ShopDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      try {
        const shopResponse = await getShopDetails(shopId);

        if (shopResponse.success) {
          setShop(shopResponse.data);

          const assetsResponse = await getShopAssets(shopId);

          if (assetsResponse.success) {
            setAssets(assetsResponse.data);
          }
        } else {
          setError(shopResponse.error || "Failed to fetch shop details");
        }
      } catch (err) {
        setError("An error occurred while fetching shop data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  const handleDeleteShop = async () => {
    if (window.confirm("Are you sure you want to delete this shop?")) {
      try {
        const response = await deleteShop(shopId);

        if (response.success) {
          alert("Shop deleted successfully");
          navigate("/seller-shop", { replace: true });
        } else {
          alert(`Failed to delete shop: ${response.error}`);
        }
      } catch (err) {
        alert("An error occurred while deleting the shop");
        console.error(err);
      }
    }
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>Loading shop details...</div>
    );
  if (error) return <div className={styles.errorContainer}>Error: {error}</div>;
  if (!shop)
    return <div className={styles.notFoundContainer}>Shop not found</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.shopName}>{shop.name}</h1>
          <div className={styles.headerButtons}>
            <button
              className={`${styles.button} ${styles.editButton}`}
              onClick={() => navigate(`./Product`)}
            >
              Add Product
            </button>
            <button
              className={`${styles.button} ${styles.editButton}`}
              onClick={() => navigate(`./edit`)}
            >
              Edit Shop
            </button>
          </div>
        </div>
      </header>
      <section className={styles.detailsSection}>
        <div className={styles.detailCard}>
          <div className={styles.detailTitle}>Category</div>
          <div className={styles.detailValue}>{shop.category}</div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailTitle}>Description</div>
          <div className={styles.detailValue}>{shop.description}</div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailTitle}>Location</div>
          <div className={styles.detailValue}>{shop.location}</div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailTitle}>Email</div>
          <div className={styles.detailValue}>{shop.email}</div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailTitle}>Phone</div>
          <div className={styles.detailValue}>{shop.phone}</div>
        </div>
      </section>

      <section className={styles.assetsSection}>
        <div className={styles.sectionHeader}>
          <button
            className={`${styles.button} ${styles.assetsButton}`}
            onClick={() => navigate(`./assets`)}
          >
            Manage Assets & Positions
          </button>
        </div>

        {!assets?.model?.glbUrl && (
          <div className={styles.errorCard}>
            <p className={styles.errorMessage}>No 3D Model Found</p>
            <p className={styles.errorMessage}>Go to Manage It</p>
          </div>
        )}
      </section>

      <footer className={styles.actionsContainer}>
        <button
          className={`${styles.button} ${styles.deleteButton}`}
          onClick={handleDeleteShop}
        >
          Delete Shop
        </button>
      </footer>
    </div>
  );
};

export default ShopDetail;
