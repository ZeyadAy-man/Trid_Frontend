import React, { useEffect, useState } from "react";
import { getUserOrders } from "../Service/cartOrderService";
import styles from "../Styles/UserOrders.module.css";
import Navbar from "../Components/HomePage/Nav/Nav";

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const result = await getUserOrders(pagination.page, pagination.size);

      if (result.success) {
        setOrders(result.data.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: result.data.totalPages,
        }));
      } else {
        setError(result.error || "Failed to load orders.");
      }

      setLoading(false);
    };

    fetchOrders();
  }, [pagination.page, pagination.size]);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return styles.statusPending;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      case "processing":
        return styles.statusProcessing;
      default:
        return styles.statusDefault;
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Oops! Something went wrong</h3>
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
    <div className={styles.container}>
      <Navbar />
      {orders.length !== 0 && (
        <div className={styles.header}>
          <h1 className={styles.title}>Your Orders</h1>
          <div className={styles.orderCount}>
            {orders.length > 0 && (
              <span className={styles.badge}>
                {pagination.totalElements || orders.length} orders found
              </span>
            )}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>No orders yet</h3>
          <p className={styles.emptyMessage}>
            When you place your first order, it will appear here.
          </p>
          <button className={styles.shopButton}>Start Shopping</button>
        </div>
      ) : (
        <>
          <div className={styles.ordersGrid}>
            {orders.map((order) => (
              <div key={order.orderId} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderLabel}>Order</span>
                    <span className={styles.orderId}>#{order.orderId}</span>
                  </div>
                  <div
                    className={`${styles.statusBadge} ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.totalAmount}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>
                      {order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.itemsInfo}>
                    <span className={styles.itemsLabel}>Items:</span>
                    <span className={styles.itemsCount}>
                      {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  <div className={styles.itemsHeader}>
                    <span className={styles.itemsTitle}>Order Items</span>
                  </div>
                  <div className={styles.itemsList}>
                    {order.orderItems.map((itemId, idx) => (
                      <div key={idx} className={styles.orderItem}>
                        <span className={styles.itemId}>Item #{itemId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() =>
                  handlePageChange(Math.max(pagination.page - 1, 0))
                }
                disabled={pagination.page === 0}
                className={`${styles.paginationButton} ${
                  pagination.page === 0 ? styles.disabled : ""
                }`}
              >
                ← Previous
              </button>

              <div className={styles.pageNumbers}>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + Math.max(0, pagination.page - 2);
                    if (pageNum >= pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`${styles.pageNumber} ${
                          pageNum === pagination.page ? styles.activePage : ""
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  }
                ).filter(Boolean)}
              </div>

              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.page + 1, pagination.totalPages - 1)
                  )
                }
                disabled={pagination.page >= pagination.totalPages - 1}
                className={`${styles.paginationButton} ${
                  pagination.page >= pagination.totalPages - 1
                    ? styles.disabled
                    : ""
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserOrdersPage;
