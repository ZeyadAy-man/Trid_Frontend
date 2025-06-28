import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createModel,
  setModelCoordinates,
} from "../../../Service/adminService";
import styles from "./CreateModel.module.css";

const ProductAdminAssets = () => {
  const [modelFile, setModelFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelId, setModelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccessCoor, setUploadSuccessCoor] = useState(false);
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
  const [activeTab, setActiveTab] = useState("position");

  const navigate = useNavigate();

  const validateFile = (file, allowedTypes, maxSizeMB = 500) => {
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
    if (!modelId) {
      setError("Please create a model first before setting coordinates.");
      return;
    }

    try {
      setLoading(true);
      const { success, error } = await setModelCoordinates(
        modelId,
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!modelFile) {
      setError("Please select a GLB file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const response = await createModel(modelFile, imageFiles);
      if (response && response.success !== false) {
        setModelId(response.data);
        setUploadSuccess(true);

        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } else {
        setError(response.error || "Failed to create model.");
      }
    } catch (err) {
      console.error("Error creating model:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred while creating the model.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModelFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "model/gltf-binary",
      "application/octet-stream",
      ".glb",
    ];

    const { isValid, error: validationError } = validateFile(
      file,
      allowedTypes
    );

    if (!isValid) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setModelFile(file);
    setError(null);
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];

    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      const { isValid, error: validationError } = validateFile(
        file,
        allowedTypes,
        10
      );

      if (isValid) {
        validFiles.push(file);
      } else {
        errors.push(`File ${index + 1}: ${validationError}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join("; "));
      return;
    }

    setImageFiles(validFiles);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);

    const modelFiles = files.filter((file) => {
      const allowedTypes = [
        "model/gltf-binary",
        "application/octet-stream",
        ".glb",
      ];
      const { isValid } = validateFile(file, allowedTypes);
      return isValid;
    });

    const imageFiles = files.filter((file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
      ];
      const { isValid } = validateFile(file, allowedTypes, 10);
      return isValid;
    });

    if (modelFiles.length > 0) {
      setModelFile(modelFiles[0]);
    }

    if (imageFiles.length > 0) {
      setImageFiles(imageFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

    const getAxisColor = (field) => {
      if (field.includes("x_")) return "#0dc1a3";
      if (field.includes("y_")) return "#0dc1a3";
      if (field.includes("z_")) return "#0dc1a3";
      return "#000";
    };

    const getLabelText = (field) => {
      const axis = field.charAt(0).toUpperCase();
      if (field.includes("_pos")) return `${axis} Position`;
      if (field.includes("_scale")) return `${axis} Scale`;
      if (field.includes("_rot")) return `${axis} Rotation`;
      return field;
    };

    const getMinMax = (field) => {
      if (field.includes("_pos")) return { min: -10, max: 10, step: 0.1 };
      if (field.includes("_scale")) return { min: 0.1, max: 2, step: 0.01 };
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
                <div
                  className={styles.axisIndicator}
                  style={{ backgroundColor: getAxisColor(field) }}
                ></div>
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
          Back
        </button>
        <h2 className={styles.assetTitle}>Create 3D Model</h2>
        <p className={styles.assetDescription}>
          Upload a 3D model in GLB format and optionally add images. Set
          coordinates after creating the model.
        </p>
      </div>

      <div className={styles.assetContent}>
        <div
          className={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {modelFile ? (
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
              <p className={styles.modelFilename}>{modelFile.name}</p>
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
            onChange={handleModelFileChange}
            disabled={loading}
            className={styles.fileInput}
          />

          <label
            htmlFor="model-upload"
            className={`${styles.uploadButton} ${
              loading ? styles.disabled : ""
            }`}
          >
            {modelFile ? "Change GLB File" : "Select GLB File"}
          </label>
        </div>

        <div className={styles.imageUploadSection}>
          <h4>Optional Images</h4>
          <input
            id="image-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleImageFilesChange}
            disabled={loading}
            className={styles.fileInput}
          />

          <label
            htmlFor="image-upload"
            className={`${styles.uploadButton} ${
              loading ? styles.disabled : ""
            }`}
          >
            {imageFiles.length > 0
              ? `${imageFiles.length} Images Selected`
              : "Select Images (Optional)"}
          </label>

          {imageFiles.length > 0 && (
            <div className={styles.imagePreview}>
              {imageFiles.map((file, index) => (
                <div key={index} className={styles.imageItem}>
                  <span>{file.name}</span>
                  <button
                    onClick={() => {
                      setImageFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className={`${styles.createButton} ${
            loading || !modelFile ? styles.disabled : ""
          }`}
          onClick={handleCreateModel}
          disabled={loading || !modelFile}
        >
          {loading ? "Creating Model..." : `Create Model`}
        </button>

        <div className={styles.modelInfo}>
          <h3 className={styles.infoTitle}>Supported Formats</h3>
          <p className={styles.infoText}>
            <strong>GLB:</strong> GL Transmission Format Binary for 3D models
            (max 500MB)
            <br />
            <strong>Images:</strong> JPEG, PNG, WebP (max 10MB each)
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
            Model created successfully!
            {modelId && (
              <div className={styles.urlInfo}>
                <strong>Model Id:</strong> {modelId}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {modelId && (
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
              className={styles.saveButton}
              onClick={handleSaveCoordinates}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Coordinates"}
            </button>
          </div>
        </div>
      )}

      {!modelId && (
        <div className={styles.coordinatesPlaceholder} style={{ color: "red" }}>
          <p>
            Create a model first to adjust its coordinates, scale, and rotation.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductAdminAssets;
