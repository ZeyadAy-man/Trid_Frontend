import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../../../Service/productsService";
import styles from "./ProductVariant.module.css";

const ProductVariants = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 6,
    totalPages: 0,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const defaultForm = { color: "", size: "", stock: 0, price: 0 };
  const [formData, setFormData] = useState(defaultForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data,
        success: ok,
        error: err,
      } = await getProductVariants(+productId, pageInfo.page, pageInfo.size);
      if (ok) {
        setVariants(data.content);
        setPageInfo((prev) => ({ ...prev, totalPages: data.totalPages }));
      } else {
        throw new Error(err || "Fetch failed");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [productId, pageInfo.page, pageInfo.size]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "stock"
          ? +value
          : name === "price"
          ? parseFloat(value)
          : value,
    }));
  };

  const openForm = (variant) => {
    if (variant) {
      setCurrentVariant(variant);
      setFormData(variant);
    } else {
      setCurrentVariant(null);
      setFormData(defaultForm);
    }
    setIsFormOpen(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentVariant(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const action = currentVariant
        ? updateProductVariant(currentVariant.id, formData)
        : addProductVariant(+productId, formData);
      const { success: ok, error: err } = await action;
      if (ok) {
        setSuccess(currentVariant ? "Variant updated" : "Variant added");
        closeForm();
        fetchVariants();
      } else {
        throw new Error(err || "Operation failed");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const confirmDelete = (id) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setLoading(true);
    setError("");
    try {
      const { success: ok, error: err } = await deleteProductVariant(
        confirmDeleteId
      );
      if (ok) {
        setSuccess("Variant deleted");
        fetchVariants();
      } else {
        throw new Error(err || "Delete failed");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const changePage = (newPage) => {
    setPageInfo((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          {isFormOpen
            ? currentVariant
              ? "Edit Variant"
              : "Add Variant"
            : "Variants"}
        </h1>
        {!isFormOpen && (
          <button className={styles.addBtn} onClick={() => openForm()}>
            Add Variant
          </button>
        )}
      </header>

      {(error || success) && (
        <div className={error ? styles.error : styles.success}>
          {error || success}
        </div>
      )}

      {isFormOpen ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          {["color", "size", "stock", "price"].map((field) => (
            <div key={field} className={styles.fieldGroup}>
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={field}
                name={field}
                type={
                  field === "price" || field === "stock" ? "number" : "text"
                }
                step={field === "price" ? "0.01" : undefined}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              Save
            </button>
            <button type="button" onClick={closeForm} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : variants.length === 0 ? (
            <p className={styles.empty}>No variants found.</p>
          ) : (
            <div className={styles.grid}>
              {variants.map((v) => (
                <div key={v.id} className={styles.card}>
                  <div>
                    <h2>Color: {v.color}</h2>
                    <h2>Size: {v.size}</h2>
                    <p>Price: ${v.price.toFixed(2)}</p>
                    <p>Stock: {v.stock}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => openForm(v)}>Edit</button>
                    <button onClick={() => confirmDelete(v.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pageInfo.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => changePage(pageInfo.page - 1)}
                disabled={pageInfo.page === 0}
              >
                Prev
              </button>
              <span>
                Page {pageInfo.page + 1} of {pageInfo.totalPages}
              </span>
              <button
                onClick={() => changePage(pageInfo.page + 1)}
                disabled={pageInfo.page >= pageInfo.totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            Back to Product
          </button>
        </>
      )}

      {confirmDeleteId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Confirm delete variant?</p>
            <div className={styles.modalActions}>
              <button onClick={cancelDelete} disabled={loading}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={loading}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductVariants;
