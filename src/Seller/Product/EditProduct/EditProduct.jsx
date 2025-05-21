import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProduct,
  updateProduct,
  deleteProduct,
} from "../../../Service/productsService";
import styles from "./EditProduct.module.css";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    sizes: "",
    colors: "",
    description: "",
    basePrice: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sizes: "",
    colors: "",
    description: "",
    basePrice: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data, success, error } = await getProduct(parseInt(productId));

        if (success) {
          setProduct(data);
          setFormData(data);
          setError(null);
        } else {
          setError(error || "Failed to fetch product details");
        }
      } catch (err) {
        setError("An error occurred while fetching product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "basePrice") {
      processedValue = value === "" ? 0 : parseFloat(value);
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { success, error } = await updateProduct(
        parseInt(productId),
        formData
      );

      if (success) {
        setProduct(formData);
        setSuccessMessage("Product updated successfully");
        setIsEditing(false);

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(error || "Failed to update product");
      }
    } catch (err) {
      setError("An error occurred while updating the product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { success, error } = await deleteProduct(parseInt(productId));

      if (success) {
        navigate(-1);
      } else {
        setError(error || "Failed to delete product");
        setDeleteConfirm(false);
      }
    } catch (err) {
      setError("An error occurred while deleting the product");
      console.error(err);
      setDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(product);
    setIsEditing(false);
    setError(null);
  };

  if (loading && !product.name) {
    return (
      <div className={styles.loadingState}>Loading product details...</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEditing ? "Edit Product" : "Product Details"}
        </h1>
        <div className={styles.actions}>
          {!isEditing ? (
            <>
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                Edit Product
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => setDeleteConfirm(true)}
              >
                Delete Product
              </button>
            </>
          ) : (
            <button className={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.errorMessage}>Error: {error}</div>}

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <div className={styles.content}>
        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Product Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="basePrice" className={styles.label}>
                Base Price ($)
              </label>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                rows="5"
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.productDetails}>
            <div className={styles.detailSection}>
              <h2 className={styles.productName}>{product.name}</h2>
              <div className={styles.priceBadge}>
                ${product.basePrice?.toFixed(2)}
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Available Sizes:</div>
                <div className={styles.detailValue}>
                  {product.sizes || "Not specified"}
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Available Colors:</div>
                <div className={styles.detailValue}>
                  {product.colors || "Not specified"}
                </div>
              </div>
            </div>

            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.descriptionText}>
                {product.description || "No description available."}
              </p>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Confirm Deletion</h2>
            <p className={styles.modalText}>
              Are you sure you want to delete `{product.name}`? This action
              cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        Back to Product
      </button>
    </div>
  );
};

export default EditProduct;
