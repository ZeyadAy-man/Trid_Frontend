import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateShopDetails,
  getShopDetails,
  getShopAssets,
} from "../../Service/shopService";
import styles from "./EditShop.module.css";

const EditShop = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const logoInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const [state, setState] = useState({
    isLoading: true,
    isSubmitting: false,
    error: null,
    validationErrors: {},
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    logo: "",
    images: [],
  });

  const [previews, setPreviews] = useState({
    logo: null,
    images: [],
  });

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await getShopDetails(shopId);
        const imagesResp = await getShopAssets(shopId);

        if (!imagesResp || !imagesResp.success || !imagesResp.data) {
          console.warn("No assets or invalid response:", imagesResp);
        }
        const imageList = imagesResp?.data?.images || [];

        if (response.success) {
          const shop = response?.data;
          setFormData({
            name: shop.name || "",
            category: shop.category || "",
            location: shop.location || "",
            description: shop.description || "",
            email: shop.email || "",
            phone: shop.phone || "",
            logo: shop.logo || "",
            images: imageList || [],
          });

          setPreviews({
            logo: shop.logo || null,
            images: imageList || [],
          });
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to fetch shop details",
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: "An error occurred while fetching shop details",
        }));
        console.error(err);
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchShopDetails();
  }, [shopId]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Shop name is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (
      formData.phone.trim() &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phone
      )
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    setState((prev) => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (state.validationErrors[name]) {
      setState((prev) => ({
        ...prev,
        validationErrors: { ...prev.validationErrors, [name]: undefined },
      }));
    }

    if (state.error) {
      setState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "logo" && files[0]) {
      if (!files[0].type.startsWith("image/")) {
        setState((prev) => ({
          ...prev,
          validationErrors: {
            ...prev.validationErrors,
            logo: "Please select a valid image file",
          },
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, logo: files[0] }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => ({ ...prev, logo: e.target.result }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name === "images") {
      const newPhotos = Array.from(files);

      const invalidFiles = newPhotos.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        setState((prev) => ({
          ...prev,
          validationErrors: {
            ...prev.validationErrors,
            images: "Please select only image files",
          },
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, images: [...newPhotos] }));

      const newPreviews = [];
      newPhotos.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          if (newPreviews.length === newPhotos.length) {
            setPreviews((prev) => ({ ...prev, images: newPreviews }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (index) => {
    setPreviews((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = document.querySelector(
        `.${styles.validationError}`
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await updateShopDetails(shopId, formData);

      if (response.success) {
        setTimeout(() => navigate(-1), 2000);
      } else {
        if (response.validationErrors) {
          setState((prev) => ({
            ...prev,
            validationErrors: response.validationErrors,
          }));
        } else {
          const errorMessage =
            response.statusCode === 403
              ? "You are not authorized to update this shop"
              : response.statusCode === 400
              ? "Validation failed: " + response.error
              : response.error || "Failed to update shop";

          setState((prev) => ({ ...prev, error: errorMessage }));
        }
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "An error occurred while updating the shop",
      }));
      console.error(err);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const triggerFileInput = (inputRef) => {
    inputRef.current?.click();
  };

  if (state.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Loading shop details...</span>
        </div>
      </div>
    );
  }

  if (state.error && !formData.name) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorText}>{state.error}</p>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Edit Shop Details</h1>
      </header>

      {state.error && (
        <div className={styles.alertError}>
          <span className={styles.alertIcon}>⚠</span>
          <span className={styles.alertText}>{state.error}</span>
        </div>
      )}

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">
                  Shop Name <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${
                    state.validationErrors.name ? styles.inputError : ""
                  }`}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your shop name"
                />
                {state.validationErrors.name && (
                  <div className={styles.validationError}>
                    {state.validationErrors.name}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="category">
                  Category <span className={styles.required}>*</span>
                </label>
                <select
                  className={`${styles.select} ${
                    state.validationErrors.category ? styles.inputError : ""
                  }`}
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  <option value="clothing">Clothes</option>
                  <option value="Bags">Bags</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Fitness">Fitness</option>
                  <option value="other">Other</option>
                </select>
                {state.validationErrors.category && (
                  <div className={styles.validationError}>
                    {state.validationErrors.category}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="location">
                Location <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${
                  state.validationErrors.location ? styles.inputError : ""
                }`}
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter shop location"
              />
              {state.validationErrors.location && (
                <div className={styles.validationError}>
                  {state.validationErrors.location}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="description">
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                className={`${styles.textarea} ${
                  state.validationErrors.description ? styles.inputError : ""
                }`}
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your shop and what you offer..."
              />
              {state.validationErrors.description && (
                <div className={styles.validationError}>
                  {state.validationErrors.description}
                </div>
              )}
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${
                    state.validationErrors.email ? styles.inputError : ""
                  }`}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
                {state.validationErrors.email && (
                  <div className={styles.validationError}>
                    {state.validationErrors.email}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.labelOptional} htmlFor="phone">
                  Phone Number
                </label>
                <input
                  className={`${styles.input} ${
                    state.validationErrors.phone ? styles.inputError : ""
                  }`}
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
                {state.validationErrors.phone && (
                  <div className={styles.validationError}>
                    {state.validationErrors.phone}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Media & Assets</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.labelOptional}>Shop Logo</label>
                <input
                  type="file"
                  ref={logoInputRef}
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
                <div className={styles.fileUploadArea}>
                  <button
                    type="button"
                    className={styles.fileButton}
                    onClick={() => triggerFileInput(logoInputRef)}
                  >
                    <span className={styles.fileButtonIcon}>📁</span>
                    Choose Logo
                  </button>
                  <span className={styles.fileInfo}>
                    {previews.logo ? "Logo selected" : "No file chosen"}
                  </span>
                </div>
                {state.validationErrors.logo && (
                  <div className={styles.validationError}>
                    {state.validationErrors.logo}
                  </div>
                )}
                {previews.logo && (
                  <div className={styles.previewContainer}>
                    <img
                      src={previews.logo}
                      alt="Logo Preview"
                      className={styles.logoPreview}
                    />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.labelOptional}>Shop images</label>
                <input
                  type="file"
                  ref={photosInputRef}
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
                <div className={styles.fileUploadArea}>
                  <button
                    type="button"
                    className={styles.fileButton}
                    onClick={() => triggerFileInput(photosInputRef)}
                  >
                    <span className={styles.fileButtonIcon}>🖼️</span>
                    Choose images
                  </button>
                  <span className={styles.fileInfo}>
                    {previews.images.length > 0
                      ? `${previews.images.length} files selected`
                      : "No files chosen"}
                  </span>
                </div>
                {state.validationErrors.images && (
                  <div className={styles.validationError}>
                    {state.validationErrors.images}
                  </div>
                )}
                {previews.images.length > 0 && (
                  <div className={styles.photosGrid}>
                    {previews.images.map((photo, index) => (
                      <div key={index} className={styles.photoItem}>
                        <img
                          src={photo}
                          alt={`Preview ${index + 1}`}
                          className={styles.photoPreview}
                        />
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemovePhoto(index)}
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={state.isSubmitting}
            >
              {state.isSubmitting ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShop;
