import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  Package,
  ArrowLeft,
  X,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  updateModel,
  setModelCoordinates,
  getModel,
} from "../../../Service/adminService";
import styles from "./editModel.module.css";

const EditModel = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const [modelFile, setModelFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelData, setModelData] = useState(null);
  const [modelUrl, setModelUrl] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadSuccessCoor, setUploadSuccessCoor] = useState(false);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
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

  useEffect(() => {
    const fetchModelData = async () => {
      if (!modelId) {
        setError("No model ID provided");
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        const response = await getModel(modelId);

        if (response?.data?.model) {
          const modelData = response.data;
          setModelData(modelData.model);
          setModelUrl(modelData.model.glbUrl || modelData.model.modelUrl || "");
          if (modelData.images && Array.isArray(modelData.images)) {
            setExistingImages(modelData.images);
          }
          if (modelData.model.coordinates) {
            setCoordinates(modelData.model.coordinates);
          }
        } else {
          setError("Model not found or invalid format.");
        }
      } catch (err) {
        console.error("Error fetching model:", err);
        setError("An error occurred while fetching model data.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchModelData();
  }, [modelId]);

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
      setError("Model ID is missing.");
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

  const handleUpdateModel = async () => {
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const response = await updateModel(modelId, modelFile, imageFiles);

      if (response && response.success !== false) {
        setUpdateSuccess(true);

        const extractedUrl =
          response.data?.url || response.url || response.data?.modelUrl;

        if (extractedUrl) {
          setModelUrl(extractedUrl);
        }

        if (response.data?.images && Array.isArray(response.data.images)) {
          setExistingImages(response.data.images);
        }

        setModelFile(null);
        setImageFiles([]);

        const modelInput = document.getElementById("model-upload");
        const imageInput = document.getElementById("image-upload");
        if (modelInput) modelInput.value = "";
        if (imageInput) imageInput.value = "";

        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        setError(response.error || "Failed to update model.");
      }
    } catch (err) {
      console.error("Error updating model:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred while updating the model.";

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

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
                    <Minus size={16} />
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
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  if (initialLoading) {
    return (
      <div className={styles.assetContainer}>
        <div className={styles.loadingState}>
          <p>Loading model data...</p>
        </div>
      </div>
    );
  }

  if (error && !modelData) {
    return (
      <div className={styles.assetContainer}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.assetContainer}>
      <div className={styles.assetHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h2 className={styles.assetTitle}>Edit 3D Model</h2>
        <p className={styles.assetDescription}>
          Update your 3D model by uploading a new GLB file or adding/removing
          images. Adjust coordinates, scale, and rotation as needed.
        </p>
      </div>

      <div className={styles.assetContent}>
        <div className={styles.currentModelInfo}>
          <h3>Current Model</h3>
          <div className={styles.modelDetails}>
            <p>
              <strong>Model ID:</strong> {modelId}
            </p>
            {modelUrl && (
              <p>
                <strong>Current GLB URL:</strong>
                <a href={modelUrl} target="_blank" rel="noopener noreferrer">
                  {modelUrl.length > 50
                    ? `${modelUrl.substring(0, 50)}...`
                    : modelUrl}
                </a>
              </p>
            )}
          </div>
        </div>

        {existingImages.length > 0 && (
          <div className={styles.existingImagesSection}>
            <h4>Current Images</h4>
            <div className={styles.existingImages}>
              {existingImages.map((image, index) => (
                <div key={index} className={styles.existingImageItem}>
                  <img
                    src={image}
                    alt={`Model image ${index + 1}`}
                    className={styles.existingImagePreview}
                  />
                  <button
                    onClick={() => removeExistingImage(index)}
                    className={styles.removeImageButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.updateSection}>
          <h3>Update Model</h3>

          <div
            className={styles.dropZone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {modelFile ? (
              <div className={styles.modelPreview}>
                <div className={styles.modelIcon}>
                  <Package size={48} />
                </div>
                <p className={styles.modelFilename}>
                  New GLB: {modelFile.name}
                </p>
              </div>
            ) : (
              <div className={styles.noModelState}>
                <div className={styles.uploadIcon}>
                  <Upload size={48} />
                </div>
                <p className={styles.dropText}>
                  Drag & drop a new GLB file here or click to browse (optional)
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
              {modelFile ? "Change GLB File" : "Select New GLB File (Optional)"}
            </label>
          </div>

          <div className={styles.imageUploadSection}>
            <h4>Add New Images</h4>
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
                ? `${imageFiles.length} New Images Selected`
                : "Select New Images (Optional)"}
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
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className={`${styles.createButton} ${
              loading ? styles.disabled : ""
            }`}
            onClick={handleUpdateModel}
            disabled={loading}
          >
            {loading ? "Updating Model..." : "Update Model"}
          </button>
        </div>

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
            <AlertTriangle size={20} className={styles.errorIcon} />
            {error}
          </div>
        )}

        {uploadSuccessCoor ? (
          <div className={styles.successMessage}>
            <CheckCircle size={20} />
            Coordinates updated successfully!
          </div>
        ) : updateSuccess ? (
          <div className={styles.successMessage}>
            <CheckCircle size={20} />
            Model updated successfully!
            {modelUrl && (
              <div className={styles.urlInfo}>
                <strong>Model URL:</strong> {modelUrl}
              </div>
            )}
          </div>
        ) : null}
      </div>

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
    </div>
  );
};

export default EditModel;
