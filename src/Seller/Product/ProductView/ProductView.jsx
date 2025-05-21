import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductModel } from "../../../Service/productsService";
import styles from "./ProductView.module.css";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import PropTypes from "prop-types";

const GltfModel = ({ modelUrl, coordinates }) => {
  const gltf = useLoader(GLTFLoader, modelUrl);
  const modelRef = useRef();

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(
        coordinates.x_pos,
        coordinates.y_pos,
        coordinates.z_pos
      );

      modelRef.current.scale.set(
        coordinates.x_scale,
        coordinates.y_scale,
        coordinates.z_scale
      );

      modelRef.current.rotation.set(
        coordinates.x_rot,
        coordinates.y_rot,
        coordinates.z_rot
      );
    }
  }, [coordinates]);

  return <primitive object={gltf.scene} ref={modelRef} />;
};

GltfModel.propTypes = {
  modelUrl: PropTypes.string.isRequired,
  coordinates: PropTypes.shape({
    x_pos: PropTypes.number,
    y_pos: PropTypes.number,
    z_pos: PropTypes.number,
    x_scale: PropTypes.number,
    y_scale: PropTypes.number,
    z_scale: PropTypes.number,
    x_rot: PropTypes.number,
    y_rot: PropTypes.number,
    z_rot: PropTypes.number,
  }).isRequired,
};

const ModelLoader = ({ modelUrl, coordinates }) => {
  return (
    <Suspense
      fallback={
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      }
    >
      <GltfModel modelUrl={modelUrl} coordinates={coordinates} />
    </Suspense>
  );
};

ModelLoader.propTypes = {
  modelUrl: PropTypes.string.isRequired,
  coordinates: PropTypes.shape({
    x_pos: PropTypes.number,
    y_pos: PropTypes.number,
    z_pos: PropTypes.number,
    x_scale: PropTypes.number,
    y_scale: PropTypes.number,
    z_scale: PropTypes.number,
    x_rot: PropTypes.number,
    y_rot: PropTypes.number,
    z_rot: PropTypes.number,
  }).isRequired,
};

const ErrorFallback = ({ error }) => {
  return (
    <div className={styles.errorContainer}>
      <h3>Error Loading 3D Model</h3>
      <details>
        <summary>View Error Details</summary>
        <pre>{error.message}</pre>
      </details>
      <p>Please check your model files and permissions.</p>
    </div>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }).isRequired,
};

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const assetsResponse = await getProductModel(productId);

        if (assetsResponse.success) {
          setModelUrl(assetsResponse.data.glbUrl);

          if (assetsResponse.data?.coordinates) {
            setCoordinates(assetsResponse.data.coordinates);
          }
        } else {
          setError(assetsResponse.error || "Failed to fetch shop details");
        }
      } catch (err) {
        setError("An error occurred while fetching shop data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  if (loading) return <div className={styles.loadingContainer}>Loading...</div>;
  if (error && !modelUrl) return <ErrorFallback error={new Error(error)} />;
  if (!modelUrl)
    return <div className={styles.errorMessage}>3D Model not found</div>;

  return (
    <div className={styles.shopAssetsPage}>
      <h2>3D Model Preview</h2>

      <div className={styles.canvasWrapper}>
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ModelLoader modelUrl={modelUrl} coordinates={coordinates} />
          <Environment preset="city" />
          <OrbitControls />
        </Canvas>
      </div>

      <div className={styles.modelInfo}>
        <h3>Model Information</h3>
        <p>GLB URL: {modelUrl ? "✓ Available" : "✕ Missing"}</p>
        <details>
          <summary>Debug Information</summary>
          <div className={styles.debugInfo}>
            <p>
              <strong>GLB:</strong> {modelUrl}
            </p>
          </div>
        </details>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          Back to Model Page
        </button>
      </div>
    </div>
  );
};

export default ProductView;
