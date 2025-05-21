import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductModel,
  uploadProductModel,
  updateProductCoordinates,
} from "../../../Service/productsService";
import styles from "./ProductAssets.module.css";

const ProductAssets = () => {
  const { productId } = useParams();
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [coordinates, setCoordinates] = useState({
    x_pos: 0,
    y_pos: 0,
    z_pos: 0,
    x_scale: 1,
    y_scale: 1,
    z_scale: 1,
    x_rot: 0,
    y_rot: 0,
    z_rot: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductModel = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, success, error } = await getProductModel(productId);

        if (success && data?.glbUrl) {
          setModelUrl(data.glbUrl);
        } else {
          setModelUrl(null);
          if (error) {
            setError(error);
          }
        }
      } catch (err) {
        setError("Failed to load 3D model. Please try again later.");
        console.error("Error fetching product model:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductModel();
  }, [productId]);

  const validateFile = (file, allowedTypes, maxSizeMB = 50) => {
    if (!file) return { isValid: false, error: "No file selected" };

    const fileName = file.name.toLowerCase();
    const fileType = file.type || "";

    const isValidType = allowedTypes.some((type) => {
      const extension = type.replace("model/", ".");
      return (
        fileType === type ||
        fileType.includes(type) ||
        fileName.endsWith(extension)
      );
    });

    const isValidSize = file.size <= maxSizeMB * 1024 * 1024;

    return {
      isValid: isValidType && isValidSize,
      error: !isValidType
        ? `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
        : !isValidSize
        ? `File too large (max ${maxSizeMB}MB)`
        : null,
    };
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setCoordinates((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSaveCoordinates = async () => {
    try {
      const { success, error } = await updateProductCoordinates(
        productId,
        coordinates
      );
      if (success) {
        alert("Coordinates updated successfully!");
      } else {
        setError(error || "Failed to update coordinates.");
      }
    } catch (err) {
      console.error("Error updating coordinates:", err);
      setError("An error occurred while updating coordinates.");
    }
  };

  const prepareFileForUpload = (file) => {
    return new File([file], file.name, {
      type: "model/gltf-binary",
      lastModified: file.lastModified,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "model/gltf-binary",
      "application/octet-stream",
      ".glb",
    ];
    const fixedFile = prepareFileForUpload(file);
    const { isValid, error: validationError } = validateFile(
      fixedFile,
      allowedTypes
    );

    if (!isValid) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const { success, error } = await uploadProductModel(productId, fixedFile);

      if (success) {
        const modelResponse = await getProductModel(productId);
        if (modelResponse.success && modelResponse.data?.glbUrl) {
          setModelUrl(modelResponse.data.glbUrl);
          setUploadSuccess(true);

          setTimeout(() => {
            setUploadSuccess(false);
          }, 2000);
        }
      } else {
        setError(error || "Upload failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during upload. Please try again later.");
      console.error("Error uploading model:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const allowedTypes = [
      "model/gltf-binary",
      "application/octet-stream",
      ".glb",
    ];
    const fixedFile = prepareFileForUpload(file);
    const { isValid, error: validationError } = validateFile(
      fixedFile,
      allowedTypes
    );

    if (!isValid) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const { success, error } = await uploadProductModel(productId, fixedFile);

      if (success) {
        const modelResponse = await getProductModel(productId);
        if (modelResponse.success && modelResponse.data?.glbUrl) {
          setModelUrl(modelResponse.data.glbUrl);
          setUploadSuccess(true);

          setTimeout(() => {
            setUploadSuccess(false);
          }, 3000);
        }
      } else {
        setError(error || "Upload failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during upload. Please try again later.");
      console.error("Error uploading model:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.assetContainer}>
      <div className={styles.assetHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          Back to Product
        </button>
        <h2 className={styles.assetTitle}>Product 3D Model</h2>
        <p className={styles.assetDescription}>
          {modelUrl
            ? `Model uploaded successfully! Click "Replace Model" to upload a new one.`
            : "Upload a 3D model for your product in GLB format (max 50MB)."}
        </p>
      </div>

      <div className={styles.assetContent}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading 3D model...</p>
          </div>
        ) : (
          <>
            <div
              className={styles.dropZone}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {modelUrl ? (
                <div className={styles.modelPreview}>
                  <div className={styles.modelIcon}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <p className={styles.modelFilename}>3D Model Available</p>
                  <a
                    href={modelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewModelButton}
                  >
                    View Model
                  </a>
                </div>
              ) : (
                <div className={styles.noModelState}>
                  <div className={styles.uploadIcon}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <p className={styles.dropText}>
                    Drag & drop your GLB file here or click to browse
                  </p>
                </div>
              )}

              <input
                id="model-upload"
                type="file"
                accept=".glb"
                onChange={handleFileChange}
                disabled={uploading}
                className={styles.fileInput}
              />

              <label
                htmlFor="model-upload"
                className={`${styles.uploadButton} ${
                  uploading ? styles.disabled : ""
                }`}
              >
                {uploading
                  ? "Uploading..."
                  : modelUrl
                  ? "Replace Model"
                  : "Upload Model"}
              </label>
            </div>

            {uploadSuccess && (
              <div className={styles.successMessage}>
                Model uploaded successfully!
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <div className={styles.modelInfo}>
              <h3 className={styles.infoTitle}>Supported Format</h3>
              <p className={styles.infoText}>
                GLB (GL Transmission Format Binary) is a binary file format for
                3D scenes and models. It is optimized for web and mobile
                viewing.
              </p>
            </div>
          </>
        )}
      </div>
      <div className={styles.coordinatesSection}>
        <h3 className={styles.infoTitle}>Model Coordinates</h3>
        <div className={styles.coordinatesGrid}>
          {[
            "x_pos",
            "y_pos",
            "z_pos",
            "x_scale",
            "y_scale",
            "z_scale",
            "x_rot",
            "y_rot",
            "z_rot",
          ].map((field) => (
            <div key={field} className={styles.coordinateField}>
              <label htmlFor={field}>
                {field.replace(/_/g, " ").toUpperCase()}
              </label>
              <input
                type="number"
                step="0.01"
                name={field}
                value={coordinates[field]}
                onChange={handleCoordinateChange}
              />
            </div>
          ))}
        </div>
        <button className={styles.saveButton} onClick={handleSaveCoordinates}>
          Save Coordinates
        </button>
      </div>
    </div>
  );
};

export default ProductAssets;
