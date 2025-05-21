import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getShopAssets,
  uploadShopAssets,
  updateShopCoordinates,
} from "../../Service/shopService";
import styles from "./ShopAssets.module.css";

const ShopAssets = () => {
  const { shopId } = useParams();
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadSuccessCoor, setUploadSuccessCoor] = useState(false);
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
  const [initialCoordinates, setInitialCoordinates] = useState(null);

  const [activeTab, setActiveTab] = useState("position");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductModel = async () => {
      if (!shopId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, success, error } = await getShopAssets(shopId);
        console.log("Shop Assets Data:", data);

        if (success && data?.model.glbUrl) {
          setCoordinates(data.model.coordinates);
          setInitialCoordinates(data.model.coordinates);
          setModelUrl(data.model.glbUrl);
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
  }, [shopId]);

  const validateFile = (file, allowedTypes, maxSizeMB = 1000) => {
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

  const adjustValue = (field, increment) => {
    let step = 0.1;
    if (field.includes("_scale")) step = 0.01;
    if (field.includes("_rot")) step = 1;

    const newValue = parseFloat(
      (coordinates[field] + (increment ? step : -step)).toFixed(2)
    );
    setCoordinates((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSaveCoordinates = async () => {
    try {
      const { success, error } = await updateShopCoordinates(
        shopId,
        coordinates
      );
      if (success) {
        setUploadSuccessCoor(true);
        setTimeout(() => {
          setUploadSuccessCoor(false);
        }, 3000);
      } else {
        setError(error || "Failed to update coordinates.");
      }
    } catch (err) {
      console.error("Error updating coordinates:", err);
      setError("An error occurred while updating coordinates.");
    }
  };

  const handleResetCoordinates = () => {
    if (initialCoordinates) {
      setCoordinates(initialCoordinates);
      setError(null);
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
      const { success, error } = await uploadShopAssets(shopId, fixedFile);

      if (success) {
        const modelResponse = await getShopAssets(shopId);
        if (modelResponse.success && modelResponse.data?.model.glbUrl) {
          setModelUrl(modelResponse.data.model.glbUrl);
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
      const { success, error } = await uploadShopAssets(shopId, fixedFile);

      if (success) {
        const modelResponse = await getShopAssets(shopId);
        if (modelResponse.success && modelResponse.data?.model.glbUrl) {
          setModelUrl(modelResponse.data.model.glbUrl);
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

  const renderCoordinateControls = () => {
    const getFields = () => {
      switch (activeTab) {
        case "position":
          return ["x_pos", "y_pos", "z_pos"];
        case "scale":
          return ["x_scale", "y_scale", "z_scale"];
        case "rotation":
          return ["x_rot", "y_rot", "z_rot"];
        default:
          return [];
      }
    };

    const getLabelText = (field) => {
      const axis = field.charAt(0).toUpperCase();
      if (field.includes("_pos")) return `${axis} Position`;
      if (field.includes("_scale")) return `${axis} Scale`;
      if (field.includes("_rot")) return `${axis} Rotation`;
      return field;
    };

    const getMinMax = (field) => {
      if (field.includes("_pos")) return { min: -100, max: 100, step: 0.1 };
      if (field.includes("_scale")) return { min: 0.0001, max: 20, step: 0.01 };
      if (field.includes("_rot")) return { min: 0, max: 360, step: 1 };
      return { min: 0, max: 1, step: 0.01 };
    };

    return (
      <>
        {getFields().map((field) => {
          const { min, max, step } = getMinMax(field);
          return (
            <div key={field} className={styles.coordinateControl}>
              <div className={styles.controlHeader}>
                <div className={styles.axisIndicator}></div>
                <label htmlFor={field}>{getLabelText(field)}</label>
                <div className={styles.inputControls}>
                  <button
                    className={styles.adjustButton}
                    onClick={() => adjustValue(field, false)}
                    aria-label="Decrease value"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    name={field}
                    value={coordinates[field]}
                    onChange={handleCoordinateChange}
                    className={styles.numberInput}
                  />
                  <button
                    className={styles.adjustButton}
                    onClick={() => adjustValue(field, true)}
                    aria-label="Increase value"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.assetContainer}>
      <div className={styles.assetHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          Back to Product
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 className={styles.assetTitle}>Product 3D Model</h2>
          <button
            className={`${styles.button} ${styles[`uploadButton`]}`}
            onClick={() => navigate("./ModelPreview")}
          >
            Model Preview
          </button>
        </div>
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

            <div className={styles.modelInfo}>
              <h3 className={styles.infoTitle}>Supported Format</h3>
              <p className={styles.infoText}>
                GLB (GL Transmission Format Binary) is a binary file format for
                3D scenes and models. It is optimized for web and mobile
                viewing.
              </p>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            {uploadSuccessCoor ? (
              <div className={styles.successMessage}>
                Coordinates updated successfully!
              </div>
            ) : uploadSuccess ? (
              <div className={styles.successMessage}>
                Model uploaded successfully!
              </div>
            ) : null}
          </>
        )}
      </div>

      {modelUrl ? (
        <div className={styles.coordinatesSection}>
          <h3 className={styles.coordinatesTitle}>Model Coordinates</h3>

          <div className={styles.coordinatesTabs}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "position" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("position")}
            >
              Position
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "scale" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("scale")}
            >
              Scale
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "rotation" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("rotation")}
            >
              Rotation
            </button>
          </div>

          <div className={styles.coordinatesControls}>
            {renderCoordinateControls()}
          </div>

          <div className={styles.coordinatesActions}>
            <button
              className={styles.resetButton}
              onClick={handleResetCoordinates}
            >
              Reset
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSaveCoordinates}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.coordinatesPlaceholder} style={{ color: "red" }}>
          <p>Upload a model to adjust its coordinates, scale, and rotation.</p>
        </div>
      )}
    </div>
  );
};

export default ShopAssets;
