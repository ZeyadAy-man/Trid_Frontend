import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getShopProducts,
  getProductVariants,
} from "../../../Service/productsService";
import styles from "./Details.module.css";

const ProductsPage = () => {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [variantCounts, setVariantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, success, error } = await getShopProducts(
          parseInt(shopId),
          pagination.page,
          pagination.size
        );

        if (success) {
          setProducts(data.content);
          setPagination((prev) => ({
            ...prev,
            totalPages: data.totalPages,
          }));

          const productIds = data.content.map((product) => product.id);
          fetchVariantCounts(productIds);
        } else {
          setError(error || "Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, pagination.page, pagination.size]);

  const fetchVariantCounts = async (productIds) => {
    const countsObj = {};

    const promises = productIds.map(async (productId) => {
      try {
        const { data, success } = await getProductVariants(productId, 0, 1);
        if (success) {
          countsObj[productId] = data.totalElements || 0;
        } else {
          countsObj[productId] = 0;
        }
      } catch (err) {
        console.error(`Error fetching variants for product ${productId}:`, err);
        countsObj[productId] = 0;
      }
    });

    await Promise.all(promises);

    setVariantCounts(countsObj);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const hasVariants = (product) => {
    return product.variantCount && product.variantCount > 0;
  };

  const merged = products.map((product) => ({
    ...product,
    variantCount: variantCounts[product.id] ?? 0,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shop Products</h1>
        <Link
          to={`/seller-shop/details/${shopId}/Product/createProduct`}
          className={styles.addButton}
        >
          Add New Product
        </Link>
      </div>

      {error && <div className={styles.errorMessage}>Error: {error}</div>}

      {loading ? (
        <div className={styles.loadingState}>Loading products...</div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            No products found for this shop.
          </p>
          <Link
            to={`/seller-shop/details/${shopId}/Product/createProduct`}
            className={styles.addFirstProduct}
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className={styles.productsContainer}>
          <div className={styles.productsGrid}>
            {merged.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <h2 className={styles.productTitle}>{product.name}</h2>
                <p className={styles.productPrice}>
                  ${product.basePrice.toFixed(2)}
                </p>
                <p className={styles.productDescription}>
                  {product.description}
                </p>

                <div className={styles.actionButtons}>
                  <button
                    onClick={() =>
                      navigate(
                        `/seller-shop/details/${shopId}/Product/${product.id}/variants`
                      )
                    }
                    className={styles.actionButton}
                    title="Manage different colors, sizes, or versions of this product"
                  >
                    Product Variations (
                    {hasVariants(product) ? product.variantCount : 0})
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/seller-shop/details/${shopId}/Product/${product.id}/edit`
                      )
                    }
                    className={styles.actionButton}
                  >
                    Edit Info
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/seller-shop/details/${shopId}/Product/${product.id}/ProductAssets`
                      )
                    }
                    className={styles.actionButton}
                  >
                    Manage Assets
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/seller-shop/details/${shopId}/Product/${product.id}/View`
                      )
                    }
                    className={styles.actionButton}
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.paginationText}>
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
