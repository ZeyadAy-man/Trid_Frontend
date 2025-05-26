/* eslint-disable react/prop-types */
import { Suspense, useMemo, useState, useRef, useEffect } from "react";
import { createXRStore } from "@react-three/xr";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import {
  getSportConstants,
  AMBIENT_LIGHT_INTENSITY,
  FLOOR_SIZE,
  FLOOR_COLOR,
  SPORTS_ITEMS_CONFIG,
} from "../Constants/SportStore";
import Loader from "../Utils/Loader/Loader";
import ProductInfoPanel, {
  PriceTag,
  ControlsPanel,
} from "../Utils/ProductClick/handleProductClick";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";

const SportsItem = ({
  path,
  position,
  rotation,
  scale,
  index,
  onSportClick,
  productInfo,
}) => {
  const [hovered, setHovered] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const meshRef = useRef();

  const { scene } = useGLTF(path);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.name = `shoe-${index}-${child.name}`;
      }
    });
    return clone;
  }, [scene, index]);

  useEffect(() => {
    if (hovered) {
      const timer = setTimeout(() => setShowLabel(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLabel(false);
    }
  }, [hovered]);

  const newScale = hovered
    ? [scale[0] * 1.08, scale[1] * 1.08, scale[2] * 1.08]
    : scale;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={newScale}
      onClick={(e) => {
        e.stopPropagation();
        onSportClick(index, {
          ...productInfo,
          path,
          position,
          rotation,
          scale,
        });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <PriceTag
        price={productInfo.price}
        name={productInfo.name}
        visible={showLabel}
      />
      <primitive object={clonedScene} />
    </group>
  );
};

const SportsItemsDisplay = ({ onSportClick }) => {
  const shoesWithInfo = useMemo(() => {
    return SPORTS_ITEMS_CONFIG.map((sport, idx) => ({
      ...sport,
      productInfo: {
        name: `Premium Shoe ${idx + 1}`,
        price: (79.99 + idx * 10).toFixed(2),
        description: `High-quality premium footwear designed for comfort and style. Perfect for any occasion.`,
        colors: ["Black", "White", "Red", "Blue"],
        sizes: [7, 8, 9, 10, 11, 12],
        rating: 4 + Math.random(),
        reviews: Math.floor(Math.random() * 100) + 10,
      },
    }));
  }, []);
  return (
    <>
      {shoesWithInfo.map((shoe, index) => (
        <Suspense key={`shoe-${index}`} fallback={<Loader />}>
          <SportsItem
            path={shoe.path}
            position={shoe.position}
            rotation={shoe.rotation}
            scale={shoe.scale}
            index={index}
            onSportClick={onSportClick}
            productInfo={shoe.productInfo}
          />
        </Suspense>
      ))}
    </>
  );
};

const CustomGLTFModel = ({ modelUrl, position, rotation, scale }) => {
  const { scene } = useGLTF(modelUrl);

  useMemo(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

const ShoeShopScene = ({ onSportClick, orbitControlsRef, shopConfig }) => {
  const store = createXRStore({});
  return (
    <>
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY * 0.7} color="#ffffff" />
      <pointLight
        position={[0, 5, 0]}
        intensity={30}
        distance={12}
        decay={2}
        color="#ffffff"
        castShadow
      />
      <pointLight
        position={[3, 4, 3]}
        intensity={15}
        distance={8}
        decay={2}
        color="#ffffff"
      />
      <pointLight
        position={[-3, 4, 3]}
        intensity={15}
        distance={8}
        decay={2}
        color="#ffffff"
      />
      <pointLight
        position={[3, 4, -3]}
        intensity={15}
        distance={8}
        decay={2}
        color="#ffffff"
      />
      <pointLight
        position={[-3, 4, -3]}
        intensity={15}
        distance={8}
        decay={2}
        color="#ffffff"
      />
      <spotLight
        position={[2, 3, 0]}
        intensity={15}
        angle={Math.PI / 5}
        penumbra={0.5}
        distance={10}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={[-2, 3, 0]}
        intensity={15}
        angle={Math.PI / 5}
        penumbra={0.5}
        distance={10}
        color="#ffffff"
        castShadow
      />

      <Physics gravity={[0, -9.81, 0]}>
        <Suspense fallback={<Loader />}>
          {shopConfig.MODEL_URL && (
            <RigidBody type="fixed">
              <CustomGLTFModel
                modelUrl={shopConfig.MODEL_URL}
                position={shopConfig.SHOP_POSITION}
                rotation={shopConfig.SHOP_ROTATION}
                scale={shopConfig.SHOP_SCALE}
              />
            </RigidBody>
          )}

          <SportsItemsDisplay onSportClick={onSportClick} />

          <RigidBody type="fixed">
            <mesh
              receiveShadow
              position={[0, -0.01, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={FLOOR_SIZE} />
              <meshStandardMaterial
                color={FLOOR_COLOR}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          </RigidBody>
        </Suspense>
      </Physics>

      <fog attach="fog" args={["#e0e0e0", 10, 50]} />
      <color attach="background" args={["#D9D9D9"]} />
      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
};

function Crosshair() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px',
        height: '8px',
        backgroundColor: 'white',
        borderRadius: '50%',
        zIndex: 1000,
        pointerEvents: 'none', // ensures it doesn't block mouse interaction
      }}
    />
  )
}


export default function ShoesShop() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [cartItems, setCartItems] = useState(0);
  const orbitControlsRef = useRef();
  const { shopId } = useParams();

  const [error, setError] = useState(null);
  const [shopConfig, setShopConfig] = useState({
    MODEL_URL: "",
    SHOP_POSITION: [0, 0, 0],
    SHOP_ROTATION: [0, 0, 0],
    SHOP_SCALE: [1, 1, 1],
  });

  useEffect(() => {
    const loadConstants = async () => {
      try {
        const id = shopId || "default";
        const constants = await getSportConstants(id);
        setShopConfig(constants);
      } catch (e) {
        console.error("Failed to load shop constants:", e);
        setError(e.message);
      }
    };

    loadConstants();
  }, [shopId]);

  useEffect(() => {
    if (shopConfig.MODEL_URL) {
      useGLTF.preload(shopConfig.MODEL_URL);
      SPORTS_ITEMS_CONFIG.forEach((shoe) => {
        useGLTF.preload(shoe.path);
      });
    }
  }, [shopConfig.MODEL_URL]);

  const onProductClick = (index, data) => {
    setSelectedIndex(index);
    setSelectedInfo(data);
  };

  const closeInfo = () => {
    setSelectedIndex(null);
    setSelectedInfo(null);
  };

  const addToCart = () => {
    setCartItems(cartItems + 1);
    const notification = document.createElement("div");
    notification.className = "add-to-cart-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">✓</div>
        <div>
          <div class="notification-title">Added to Cart</div>
          <div class="notification-desc">${selectedInfo.name} - $${selectedInfo.price}</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);

    closeInfo();
  };

  const resetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };

  if (error) {
    return (
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>Error loading shop: {error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#4F46E5",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Navbar cartItems={cartItems} shopName={"SportsShop"} />
      <ControlsPanel resetCamera={resetCamera} />

      {selectedInfo && (
        <ProductInfoPanel
          selectedInfo={selectedInfo}
          closeInfo={closeInfo}
          addToCart={addToCart}
        />
      )}
      <Canvas
        style={{
          width: "100vw",
          height: "calc(100vh - 60px)",
        }}
        gl={{ antialias: true }}
        shadows="soft"
        camera={{ position: [0.5, 0.5, 0.5] }}
      >
        <Suspense fallback={<Loader />}>
          <ShoeShopScene
            onSportClick={onProductClick}
            orbitControlsRef={orbitControlsRef}
            shopConfig={shopConfig}
          />
        </Suspense>
      </Canvas>
      <Crosshair/>
      <style>{`
        .add-to-cart-notification {
          position: fixed;
          top: 80px;
          right: 20px;
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease-out forwards;
          max-width: 300px;
        }
        
        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .notification-icon {
          background-color: #4CAF50;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .notification-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .notification-desc {
          font-size: 14px;
          color: #666;
        }
        
        .fade-out {
          animation: fadeOut 0.5s ease-out forwards;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
