/* eslint-disable react/prop-types */
import styles from "../Model/Model.module.css";
import { useNavigate } from "react-router-dom";
import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import {
  getModel,
  deleteModel,
  getAllModels,
} from "../../Service/adminService";
import { Pencil, Trash2 } from "lucide-react";

const Model = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchAllModels = async () => {
      setLoading(true);
      const modelIds = [
        100, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 142, 143, 144, 145,  147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160
      ];//the list is stopped at 126
      const fetchedModels = [];

      for (let id of modelIds) {
        try {
          const response = await getModel(id);
          if (response?.data?.model?.glbUrl) {
            fetchedModels.push({
              id: id,
              title: `Model ${id}`,
              glb: response.data.model.glbUrl,
              coordinates: response.data.model.coordinates,
              images: response.data.images || [],
            });
          } else {
            console.warn(`Model ${id} has no glbUrl.`);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.warn(`Model with ID ${id} not found (404).`);
          } else {
            console.error(`Error fetching model ${id}:`, error);
          }
        }
      }

      setModels(fetchedModels);
      setLoading(false);
    };

    fetchAllModels();
  }, []);

  const handleNavigate = () => {
    navigate("./create-model");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      setDeleting(id);
      try {
        await deleteModel(id);
        setModels((prevModels) =>
          prevModels.filter((model) => model.id !== id)
        );
      } catch (error) {
        console.error(`Error deleting model ${id}:`, error);
        alert("Failed to delete model. Please try again.");
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleEdit = (modelId) => {
    navigate(`./edit-model/${modelId}`);
  };

  return (
    <div className={styles.containerOfModelPage}>
      <div className={styles.headerSection} style={{ width: "100%" }}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h1 className={styles.pageTitle}>Models Management</h1>
              <p className={styles.pageSubtitle}>Manage your models</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.createModelAndNumberProductContainer}>
        <div className={styles.productCountBox}>
          <span className={styles.countLabel}>
            🧮 You currently have
            <span className={styles.productCount}> {models?.length} </span>
            awesome product{models?.length !== 1 ? "s" : ""}!
          </span>
        </div>
        <button className={styles.createModelButton} onClick={handleNavigate}>
          Add New Model
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Loading models...</p>
        </div>
      ) : (
        <div className={styles.containerOfCards}>
          {models?.map(({ id, glb, title }) => (
            <ShowCard
              key={id}
              id={id}
              modelUrl={glb}
              title={title}
              onDelete={handleDelete}
              onEdit={handleEdit}
              isDeleting={deleting === id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function ShowModel({ url }) {
  const { scene } = useGLTF(url);
  try {
    return <primitive object={scene} scale={1.5} />;
  } catch (error) {
    console.error("Error loading model:", error);
    return null;
  }
}

function ShowCard({ id, title, modelUrl, onDelete, onEdit, isDeleting }) {
  return (
    <div className={styles.card}>
      <div className={styles.canvasContainer}>
        <Canvas camera={{ position: [0, 0, 5], fov: 30 }} frameloop="demand">
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
              <ShowModel url={modelUrl} />
            </Stage>
            <OrbitControls enableZoom={false} />
          </Suspense>
        </Canvas>
      </div>
      <div className={styles.cardInfo}>
        <h3>{title}</h3>
        <div className={styles.containerOfShowCardButtons}>
          <button
            className={`${styles.coolButton} ${styles.edit}`}
            onClick={() => onEdit(id)}
            disabled={isDeleting}
          >
            <Pencil size={16} style={{ marginRight: "6px" }} />
            Edit
          </button>

          <button
            className={`${styles.coolButton} ${styles.delete}`}
            onClick={() => onDelete(id)}
            disabled={isDeleting}
          >
            <Trash2 size={16} style={{ marginRight: "6px" }} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Model;
