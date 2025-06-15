/* eslint-disable react/prop-types */
import * as THREE from 'three'
import { useTexture } from "@react-three/drei";
import { addtoCart } from "../Service/cartOrderService";
import { Suspense, useMemo, useState, useRef, useEffect } from "react";
import { createXRStore } from "@react-three/xr";
import { OrbitControls, useGLTF } from "@react-three/drei";
import CartModal from "./CartModel";
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
import useCart from "./useCart";
import { useParams } from "react-router-dom";
import { CustomCameraControls } from "../Utils/CameraSportsShop";

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
        price={productInfo.basePrice}
        name={productInfo.name}
        visible={showLabel}
      />
      <primitive object={clonedScene} />
    </group>
  );
};

const SportItemsDisplay = ({ onSportClick, Product }) => {
  const sportWithInfo = useMemo(() => {
    return (Product || [])
      .filter((sport) => sport.path && sport.path.trim() !== "")
      .map((sport, index) => {
        const [name, description, basePrice] = sport.mainInfo || [];
        return {
          ...sport,
          name,
          description,
          basePrice,
          index,
        };
      });
  }, [Product]);
  console.log(sportWithInfo);
  return (
    <>
      {sportWithInfo.map((sport, index) => (
        <Suspense key={`shoe-${index}`} fallback={<Loader />}>
          <SportsItem
            path={sport.path}
            position={sport.position}
            rotation={sport.rotation}
            scale={sport.scale}
            index={index}
            onSportClick={onSportClick}
            productInfo={{
              name: sport.name,
              description: sport.description,
              basePrice: sport.basePrice,
              productId: sport.productId,
              path: sport.path,
              variants: sport.variants
            }}
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

const SportShopScene = ({ onSportClick, shopConfig, Product }) => {

  return (
    <>
      <Suspense fallback={<Loader/>}>
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

            <SportItemsDisplay onSportClick={onSportClick} Product={Product}/>

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
      </Suspense>
      <fog attach="fog" args={["#e0e0e0", 10, 50]} />
      <color attach="background" args={["#D9D9D9"]} />
      {/* <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.1}
      /> */}
    </>
  );
};

export default function SportShop() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [ products, setProducts ] = useState(null);
  const [ isAddingToCart, setIsAddingToCart ] = useState(false);
  const [ isCartModalOpen, setIsCartModalOpen ] = useState(false);
  const { cartItems, removeItem, getCartItemCount, fetchCartItems} = useCart();
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
        setProducts(constants.products);
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

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleCloseCartModal = async () => {
    setIsCartModalOpen(false);
    try {
      await fetchCartItems();
    } catch (error) {
      console.error("Failed to refresh cart items:", error);
    }
  };

    const showNotification = (productName, price, success = true) => {
    const notification = document.createElement("div");
    notification.className = "add-to-cart-notification";

    if (success) {
      const sound = new Audio('/pay_sound.mp3');

      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon success">✓</div>
          <div>
            <div class="notification-title">Added to Cart</div>
            <div class="notification-desc">${productName} - $${price}</div>
          </div>
        </div>
      `;
      sound.play();
    } else {
      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon error">✗</div>
          <div>
            <div class="notification-title">Failed to Add</div>
            <div class="notification-desc">Please try again</div>
          </div>
        </div>
      `;
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 2000);

    if (success) {
      closeInfo();
    }
  };

  const handleAddToCart = async (cartItem) => {
    if (!cartItem || !cartItem.variantId) {
      console.error("No variant ID provided");
      return;
    }
    if (isAddingToCart) {
      return;
    }
  
    setIsAddingToCart(true);
  
    try {
      const { variantId, quantity } = cartItem;
      const response = await addtoCart(variantId, quantity);
  
      if (response.success) {
        await fetchCartItems();
  
        const displayPrice =
          selectedInfo.selectedVariant?.price || selectedInfo.basePrice;
          showNotification(selectedInfo.name, displayPrice, quantity, true);
      } else {
        throw new Error(response.error || "Failed to add to cart");
      }
    }catch (err) {
      console.error("Failed to add to cart:", err);
      const displayPrice =
        selectedInfo.selectedVariant?.price || selectedInfo.basePrice;
      showNotification(
        selectedInfo.name,
        displayPrice,
        cartItem.quantity,
        false
      );
    }finally {
      setIsAddingToCart(false);
    }
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
      <Navbar cartItems={getCartItemCount()} shopName={"SportsShop"} onCartClick={handleCartClick}/>
      <ControlsPanel resetCamera={resetCamera} />

      {selectedInfo && (
        <ProductInfoPanel
          selectedInfo={selectedInfo}
          closeInfo={closeInfo}
          addToCart={handleAddToCart}
          isLoading={isAddingToCart}
        />
      )}
      
      {isCartModalOpen && (
        <CartModal
          isOpen={isCartModalOpen}
          onClose={handleCloseCartModal}
          cartItems={cartItems}
          removeItem={removeItem}
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
          <SportShopScene
            onSportClick={onProductClick}
            orbitControlsRef={orbitControlsRef}
            shopConfig={shopConfig}
            Product={products}
          />
        </Suspense>
        <CustomCameraControls/>
        <SkyDome/>
      </Canvas>
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

function SkyDome() {

  const texture = useTexture('/lol.jpg') 

  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <mesh scale={[3, 3, 3]} position={[0,10,0]}>
      <sphereGeometry args={[8, 10, 10]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}