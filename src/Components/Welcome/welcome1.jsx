/* eslint-disable no-undef */
/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import * as THREE from "three";
import PropTypes from "prop-types";
import styles from "./welcome.module.css";
import { getModel } from "../../Service/adminService";

const modelCache = new Map();
const CACHE_EXPIRY = 10 * 60 * 1000; // 5 minutes

// Cache utility functions
const getCacheKey = (id) => `model_${id}`;

const isCacheValid = (cacheEntry) => {
  return cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_EXPIRY;
};

const getCachedModel = (id) => {
  const cacheKey = getCacheKey(id);
  const cacheEntry = modelCache.get(cacheKey);

  if (isCacheValid(cacheEntry)) {
    return cacheEntry.data;
  }

  // Remove expired cache entry
  if (cacheEntry) {
    modelCache.delete(cacheKey);
  }

  return null;
};

const setCachedModel = (id, data) => {
  const cacheKey = getCacheKey(id);
  modelCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

const getCachedModelData = async (id) => {
  // Check cache first
  const cachedData = getCachedModel(id);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from server if not cached
  try {
    const response = await getModel(id);
    if (response?.data?.model) {
      setCachedModel(id, response.data.model);
      return response.data.model;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching model ${id}:`, error);
    throw error;
  }
};

const preloadGLTF = (url) => {
  useGLTF.preload(url);
};

DoorModel.propTypes = {
  modelPath: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  onClick: PropTypes.func,
  scale: PropTypes.arrayOf(PropTypes.number).isRequired,
  rotation: PropTypes.arrayOf(PropTypes.number).isRequired,
  isClickable: PropTypes.bool,
};

function DoorModel({
  modelPath,
  position,
  onClick,
  scale,
  rotation,
  isClickable = false,
}) {
  const { scene, animations } = useGLTF(modelPath);
  const doorRef = useRef();
  const mixer = useRef();
  const actionRef = useRef();

  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[2]);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.enabled = true;
      action.paused = false;

      actionRef.current = action;
      doorRef.current.action = action;
    }
  }, [animations, scene]);

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  const handleDoorClick = () => {
    if (actionRef.current) {
      actionRef.current.reset().play();
      actionRef.current.onFinish = () => {
        actionRef.current.stop();
        actionRef.current.reset();
      };
    }
    if (onClick) onClick();
  };

  return (
    <group
      ref={doorRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={isClickable ? handleDoorClick : undefined}
      onPointerOver={
        isClickable
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={
        isClickable
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "default";
            }
          : undefined
      }
    >
      <primitive object={scene} />
    </group>
  );
}

export default function Welcome() {
  const cameraRef = useRef();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const modelConfig = {
    109: { type: "AsGuest", handler: null, clickable: false },
    110: { type: "Door1", handler: handleLoginClick, clickable: true },
    111: { type: "Door2", handler: handleSignUpClick, clickable: true },
    112: { type: "Door3", handler: handleGuestClick, clickable: true },
    113: { type: "Login", handler: null, clickable: false },
    114: { type: "SignUp", handler: null, clickable: false },
    115: { type: "Wall", handler: null, clickable: false },
  };

  useEffect(() => {
    const fetchAllModels = async () => {
      const modelIds = [109, 110, 111, 112, 113, 114, 115];
      const fetchedModels = [];
      let loadedCount = 0;

      const modelPromises = modelIds.map(async (id) => {
        try {
          const modelData = await getCachedModelData(id);

          if (modelData?.glbUrl) {
            preloadGLTF(modelData.glbUrl);

            loadedCount++;
            setLoadingProgress((loadedCount / modelIds.length) * 100);

            return {
              id: id,
              glb: modelData.glbUrl,
              coordinates: modelData.coordinates,
              config: modelConfig[id],
            };
          } else {
            console.warn(`Model ${id} has no glbUrl.`);
            return null;
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.warn(`Model with ID ${id} not found (404).`);
          } else {
            console.error(`Error fetching model ${id}:`, error);
          }
          return null;
        }
      });

      const results = await Promise.allSettled(modelPromises);

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          fetchedModels.push(result.value);
        }
      });

      setModels(fetchedModels);
      setIsLoading(false);
    };

    fetchAllModels();
  }, []);

  function handleLoginClick() {
    animateCamera([-10, -1, -1]);
    setTimeout(() => navigate("/login"), 4500);
  }

  function handleSignUpClick() {
    animateCamera([0, 0, -1]);
    setTimeout(() => navigate("/signup"), 4500);
  }

  function handleGuestClick() {
    animateCamera([10, 0, -1]);
    setTimeout(() => navigate("/home"), 4500);
  }

  const animateCamera = (position) => {
    gsap.to(cameraRef.current.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration: 5,
      ease: "power3.inOut",
    });
  };

  const getModelTransform = (coordinates) => {
    return {
      position: [coordinates.x_pos, coordinates.y_pos, coordinates.z_pos],
      rotation: [coordinates.x_rot, coordinates.y_rot, coordinates.z_rot],
      scale: [coordinates.x_scale, coordinates.y_scale, coordinates.z_scale],
    };
  };

  const clearCache = () => {
    modelCache.clear();
  };

  if (process.env.NODE_ENV === "development") {
    window.clearModelCache = clearCache;
    window.modelCache = modelCache;
  }

  return (
    <div className={styles.welcomeContainer}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBar}>
            <div
              className={styles.loadingProgress}
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p>Loading models... {Math.round(loadingProgress)}%</p>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 75 }}
        onCreated={({ gl, camera }) => {
          cameraRef.current = camera;
          gl.setSize(window.innerWidth, window.innerHeight);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <ambientLight intensity={0.3} color="#f5f5f5" />

        <directionalLight
          position={[0, 11, 10]}
          intensity={1.9}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
        />

        <pointLight
          position={[-8, 6, 12]}
          intensity={0.8}
          color="#fff2e6"
          distance={40}
          decay={1.5}
        />

        <pointLight
          position={[10, 8, 8]}
          intensity={0.6}
          color="#e6f0ff"
          distance={35}
          decay={1.8}
        />

        <spotLight
          position={[0, 10, 10]}
          intensity={2}
          angle={Math.PI / 4}
          penumbra={0.3}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          target-position={[0, 2, 0]}
        />

        <directionalLight
          position={[10, 5, 5]}
          intensity={0.4}
          color="#b3d9ff"
        />

        {models.map((model) => {
          const transform = getModelTransform(model.coordinates);
          return (
            <DoorModel
              key={model.id}
              modelPath={model.glb}
              position={transform.position}
              scale={transform.scale}
              rotation={transform.rotation}
              onClick={model.config?.handler}
              isClickable={model.config?.clickable || false}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
