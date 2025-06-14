import React, { useEffect, useState } from "react";
import { getSellerOrders } from "../../Service/cartOrderService";
import styles from "./SellerOrders.module.css";
import { getProduct } from "../../Service/productsService";

const SellerOrders = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const result = await getSellerOrders(pagination.page, pagination.size);

      if (result.success) {
        const productIds = [
          ...new Set(result.data.content.map((item) => item.productId)),
        ];

        const products = await Promise.all(
          productIds.map(async (id) => {
            try {
              const data = await getProduct(id);
              return { id, data };
            } catch (error) {
              console.error("Error fetching product:", id, error);
              return { id, data: null };
            }
          })
        );

        const productMap = new Map(products.map((p) => [p.id, p.data]));

        setOrderItems(result.data.content);

        const grouped = result.data.content.reduce((acc, item) => {
          const product = productMap.get(item.productId);
          if (!product) return acc;

          if (!acc[item.orderId]) {
            acc[item.orderId] = {
              orderId: item.orderId,
              status: item.status,
              items: [],
              totalAmount: 0,
              itemCount: 0,
            };
          }

          acc[item.orderId].items.push({
            ...item,
            product: product.data,
          });

          acc[item.orderId].totalAmount += item.variant.price * item.quantity;
          acc[item.orderId].itemCount += item.quantity;

          return acc;
        }, {});

        setGroupedOrders(grouped);

        setPagination((prev) => ({
          ...prev,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
        }));
      } else {
        setError(result.error || "Failed to load orders.");
      }

      setLoading(false);
    };

    fetchOrders();
  }, [pagination.page, pagination.size]);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        class: styles.statusPending,
        label: "Pending",
        color: "#f59e0b",
      },
      processing: {
        class: styles.statusProcessing,
        label: "Processing",
        color: "#3b82f6",
      },
      completed: {
        class: styles.statusCompleted,
        label: "Completed",
        color: "#10b981",
      },
      cancelled: {
        class: styles.statusCancelled,
        label: "Cancelled",
        color: "#ef4444",
      },
    };
    return (
      statusMap[status.toLowerCase()] || {
        class: styles.statusDefault,
        label: status,
        color: "#6b7280",
      }
    );
  };

  const getOrderStats = () => {
    const orders = Object.values(groupedOrders);
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalItems = orders.reduce((sum, order) => sum + order.itemCount, 0);
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalItems,
      statusCounts,
      totalOrders: orders.length,
    };
  };

  const filteredOrders = () => {
    let orders = Object.values(groupedOrders);

    if (statusFilter !== "all") {
      orders = orders.filter(
        (order) => order.status.toLowerCase() === statusFilter
      );
    }

    orders.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.orderId - a.orderId;
        case "oldest":
          return a.orderId - b.orderId;
        case "highest":
          return b.totalAmount - a.totalAmount;
        case "lowest":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return orders;
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
          <p className={styles.loadingText}>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Error Loading Orders</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ordersArray = filteredOrders();
  const stats = getOrderStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Order Management</h1>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalOrders}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                ${stats.totalRevenue.toFixed(2)}
              </span>
              <span className={styles.statLabel}>Total Revenue</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalItems}</span>
              <span className={styles.statLabel}>Items Sold</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats.statusCounts.pending || 0}
              </span>
              <span className={styles.statLabel}>Pending Orders</span>
            </div>
          </div>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status:</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort by:</label>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {ordersArray.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>No Orders Found</h3>
          <p className={styles.emptyMessage}>
            {statusFilter !== "all"
              ? `No ${statusFilter} orders found. Try changing the filter.`
              : "You haven't received any orders yet."}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.ordersContainer}>
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                Showing {ordersArray.length} of {stats.totalOrders} orders
              </span>
            </div>

            <div className={styles.ordersGrid}>
              {ordersArray.map((order) => {
                const statusInfo = getStatusInfo(order.status);

                return (
                  <div key={order.orderId} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>Order ID</span>
                        <span className={styles.orderId}>#{order.orderId}</span>
                      </div>
                      <div
                        className={`${styles.statusBadge} ${statusInfo.class}`}
                      >
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className={styles.orderSummary}>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>
                          Total Amount:
                        </span>
                        <span className={styles.totalAmount}>
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Items:</span>
                        <span className={styles.itemCount}>
                          {order.itemCount} item
                          {order.itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className={styles.orderItems}>
                      <h4 className={styles.itemsTitle}>Order Items</h4>
                      <div className={styles.itemsList}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.orderItem}>
                            <div className={styles.itemHeader}>
                              <span className={styles.productName}>
                                {item.product.name}
                              </span>
                              <span className={styles.productId}>
                                ID: {item.productId}
                              </span>
                            </div>

                            <div className={styles.itemDetails}>
                              <div className={styles.variantInfo}>
                                <span className={styles.variantDetail}>
                                  Size: {item.variant.size}
                                </span>
                                <span className={styles.variantDetail}>
                                  Color: {item.variant.color}
                                </span>
                              </div>

                              <div className={styles.pricingInfo}>
                                <span className={styles.quantity}>
                                  Qty: {item.quantity}
                                </span>
                                <span className={styles.unitPrice}>
                                  ${item.variant.price.toFixed(2)}
                                </span>
                                <span className={styles.itemTotal}>
                                  $
                                  {(item.variant.price * item.quantity).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.orderActions}>
                      <button className={styles.actionButton}>
                        View Details
                      </button>
                      <button className={styles.actionButton}>
                        Update Status
                      </button>
                      <button className={styles.actionButton}>
                        Contact Customer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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

export default SellerOrders;
