import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createProduct } from "../../../Service/productsService";
import styles from "./CreateProduct.module.css";

const CreateProduct = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    basePrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
      isValid = false;
    }

    if (!formData.basePrice.trim()) {
      newErrors.basePrice = "Base price is required";
      isValid = false;
    } else if (
      isNaN(parseFloat(formData.basePrice)) ||
      parseFloat(formData.basePrice) <= 0
    ) {
      newErrors.basePrice = "Base price must be a positive number";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
      };

      const { success, error, data } = await createProduct(
        parseInt(shopId),
        productData
      );

      if (success) {
        setSuccess("Product created successfully!");

        setFormData({
          name: "",
          description: "",
          basePrice: "",
        });

        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setError(error || "Failed to create product");
      }
    } catch (err) {
      setError("An error occurred while creating the product");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create New Product</h2>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form
        className={`${styles.form} ${isLoading ? styles.loading : ""}`}
        onSubmit={handleSubmit}
      >
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Product Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter product name"
            disabled={isLoading}
          />
          {formErrors.name && (
            <div className={styles.error}>{formErrors.name}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Product Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            placeholder="Enter product description"
            disabled={isLoading}
          />
          {formErrors.description && (
            <div className={styles.error}>{formErrors.description}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="basePrice" className={styles.label}>
            Base Price* ($)
          </label>
          <input
            type="text"
            id="basePrice"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            className={styles.input}
            placeholder="29.99"
            disabled={isLoading}
          />
          {formErrors.basePrice && (
            <div className={styles.error}>{formErrors.basePrice}</div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.buttonCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.buttonSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
