import { useParams } from "react-router-dom";
import styles from './AdminShopDetails.module.css';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getShopDetails } from "../../Service/shopService";
export default function AdminShopDetails() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId) {
        setError("Shop ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const shopResponse = await getShopDetails(shopId);

        if (shopResponse?.success && shopResponse?.data) {
          setShop(shopResponse.data);
        } else {
          setError(shopResponse?.error || "Failed to fetch shop details");
        }
      } catch (err) {
        setError("An error occurred while fetching shop data");
        console.error("Shop fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  const handleBackToList = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠</div>
          <h2 className={styles.errorTitle}>Unable to Load Shop</h2>
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

  if (!shop) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.notFoundState}>
          <div className={styles.notFoundIcon}>🏪</div>
          <h2 className={styles.notFoundTitle}>Shop Not Found</h2>
          <p className={styles.notFoundMessage}>
            The shop you are looking for doesnot exist or has been removed.
          </p>
          <button className={styles.backButton} onClick={handleBackToList}>
            Back to Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <div className={styles.banner}>
            <button className={styles.backLink} onClick={handleBackToList}>
              Back to Shops
            </button>
            <div className={styles.headerActions}>
            </div>
          </div>
        </nav>

        <header className={styles.pageHeader}>
          <div className={styles.headerMain}>
            <div className={styles.shopInfo}>
              <h1 className={styles.shopName}>
                {shop.name}
              </h1>
              <span className={styles.shopCategory}>
                {shop.category}
              </span>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {shop.description && (
            <section className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>About</h2>
              <p className={styles.description}>
                {shop.description}
              </p>
            </section>
          )}

          <section className={styles.detailsSection}>
            <h2 className={styles.sectionTitle}>Shop Information</h2>

            <div className={styles.detailsGrid}>
              {shop.location && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>
                    <span className={styles.detailIcon}>📍</span>
                    Location
                  </dt>
                  <dd className={styles.detailValue}>
                    {shop.location}
                  </dd>
                </div>
              )}

            

              {shop.email && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>
                    <span className={styles.detailIcon}>✉️</span>
                    Email
                  </dt>
                  <dd className={styles.detailValue}>
                    <a
                      href={`mailto:${shop.email}`}
                      className={styles.contactLink}
                    >
                      {shop.email}
                    </a>
                  </dd>
                </div>
              )}

              {shop.phone && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>
                    <span className={styles.detailIcon}>📞</span>
                    Phone
                  </dt>
                  <dd className={styles.detailValue}>
                    <a
                      href={`tel:${shop.phone}`}
                      className={styles.contactLink}
                    >
                      {shop.phone}
                    </a>
                  </dd>
                </div>
              )}

              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>
                  <span className={styles.detailIcon}>🏷️</span>
                  Category
                </dt>
                <dd className={styles.detailValue}>
                  <span className={styles.categoryBadge}>{shop.category}</span>
                </dd>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
