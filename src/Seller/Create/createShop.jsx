/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  ArrowLeft,
  Store,
  MapPin,
  Mail,
  Phone,
  Tag,
  FileText,
  X,
} from "lucide-react";
import styles from "./CreateShop.module.css";
import { useNavigate } from "react-router-dom";
import { createShop } from "../../Service/shopService";

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

const CreateShop = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    email: "",
    phone: "",
  });

  const categories = [
    { value: "clothing", label: "Clothing & Fashion", icon: "👕" },
    { value: "Bags", label: "Bags & Accessories", icon: "👜" },
    { value: "Shoes", label: "Shoes & Footwear", icon: "👟" },
    { value: "Fitness", label: "Fitness & Sports", icon: "💪" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return !value.trim() ? "Shop name is required" : "";
      case "category":
        return !value ? "Please select a category" : "";
      case "location":
        return !value.trim() ? "Location is required" : "";
      case "description":
        return !value.trim() ? "Description is required" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        return !validateEmail(value) ? "Invalid email format" : "";
      case "phone":
        return value.trim() && !/^[+]?[\d\s()-]{10,}$/.test(value)
          ? "Invalid phone number format"
          : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newFieldErrors[field] = error;
        hasErrors = true;
      }
    });

    setFieldErrors(newFieldErrors);
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (errors) {
      setErrors("");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    if (error) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrors("Please fix the errors above");
      return;
    }

    setIsSubmitting(true);
    setErrors("");

    try {
      const response = await createShop(formData);
      console.log("Shop created successfully:", response);

      if (response.success) {
        setFormData({
          name: "",
          category: "",
          location: "",
          description: "",
          email: "",
          phone: "",
        });

        navigate(`/seller-shop`, {
          replace: true,
        });
      } else {
        setErrors(response.error || "Failed to create shop");
      }
    } catch (err) {
      setErrors(err.response?.data?.message || "An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <div
        style={{
          color: "#c42d1c",
          fontSize: "0.85rem",
          marginTop: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <X size={14} />
        {error}
      </div>
    );
  };

  return (
    <div className={styles.createShopContainer}>
      <div className={styles.formWrapper}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #0dc1a3 0%, #0D7377 100%)",
              borderRadius: "16px",
              marginBottom: "1rem",
              color: "white",
            }}
          >
            <Store size={28} />
          </div>
          <h1 className={styles.formTitle}>Create New Shop</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Store
                size={16}
                style={{
                  marginRight: "0.5rem",
                  color: "#0dc1a3",
                  verticalAlign: "middle",
                }}
              />
              Shop Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your shop name"
              className={`${styles.input} ${
                fieldErrors.name ? styles.inputError : ""
              }`}
            />
            <FieldError error={fieldErrors.name} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag
                size={16}
                style={{
                  marginRight: "0.5rem",
                  color: "#0dc1a3",
                  verticalAlign: "middle",
                }}
              />
              Category <span className={styles.required}>*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${
                fieldErrors.category ? styles.inputError : ""
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
            <FieldError error={fieldErrors.category} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MapPin
                size={16}
                style={{
                  marginRight: "0.5rem",
                  color: "#0dc1a3",
                  verticalAlign: "middle",
                }}
              />
              Location <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter shop location"
              className={`${styles.input} ${
                fieldErrors.location ? styles.inputError : ""
              }`}
            />
            <FieldError error={fieldErrors.location} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText
                size={16}
                style={{
                  marginRight: "0.5rem",
                  color: "#0dc1a3",
                  verticalAlign: "middle",
                }}
              />
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe your shop and what you sell"
              className={`${styles.input} ${
                fieldErrors.description ? styles.inputError : ""
              }`}
              rows={4}
            />
            <FieldError error={fieldErrors.description} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Mail
                size={16}
                style={{
                  marginRight: "0.5rem",
                  color: "#0dc1a3",
                  verticalAlign: "middle",
                }}
              />
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter contact email"
              className={`${styles.input} ${
                fieldErrors.email ? styles.inputError : ""
              }`}
            />
            <FieldError error={fieldErrors.email} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Phone
                size={16}
                style={{
                  marginRight: "0.5rem",
                  color: "#0dc1a3",
                  verticalAlign: "middle",
                }}
              />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter phone number (optional)"
              className={`${styles.input} ${
                fieldErrors.phone ? styles.inputError : ""
              }`}
            />
            <FieldError error={fieldErrors.phone} />
          </div>

          {errors && <div className={styles.globalErrorMessage}>{errors}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <>Creating Shop...</>
              ) : (
                <>
                  <Store size={16} />
                  Create Shop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShop;
