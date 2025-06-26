/* eslint-disable react/prop-types */
import {  OrbitControls, useGLTF } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import * as THREE from 'three'
import {
  getBagConstants,
  AMBIENT_LIGHT_INTENSITY,
  FLOOR_SIZE,
  FLOOR_COLOR,
  BAGS_ITEMS_CONFIG,
} from "../Constants/BagsStore";
import { Physics, RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MathUtils } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import ProductInfoPanel, {
  ControlsPanel,
  PriceTag,
} from "../Utils/ProductClick/handleProductClick";
import Loader from "../Utils/Loader/Loader";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import { CustomCameraControls } from "../Utils/CameraBagsShop";
import CartModal from "./CartModel";
import { addtoCart } from "../Service/cartOrderService";
import useCart from "./useCart";
const BagItem = ({
  path,
  position,
  rotation,
  scale,
  index,
  onBagClick,
  productInfo,
}) => {
  const { scene } = useGLTF(path);
  const [hovered, setHovered] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const meshRef = useRef();
  const initialY = position[1];

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

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Float animation
    if (hovered && productInfo.name !== "plant") {
      meshRef.current.position.y = MathUtils.lerp(
        meshRef.current.position.y,
        initialY + 0.1,
        0.1
      );
    } else {
      meshRef.current.position.y = MathUtils.lerp(
        meshRef.current.position.y,
        initialY,
        0.1
      );
    }
  });

  useEffect(() => {
    let timer;
    if (hovered) {
      timer = setTimeout(() => setShowLabel(true), 300);
    } else {
      setShowLabel(false);
    }
    return () => clearTimeout(timer);
  }, [hovered]);

  const newScale = hovered && productInfo.name !== "plant"
    ? [scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1]
    : scale;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={newScale}
      onClick={(e) => {
        e.stopPropagation();
        onBagClick(index, { ...productInfo, path, position, rotation, scale });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = productInfo.name === "plant" ? "cursor" : "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    > {showLabel && productInfo.basePrice !== 1 && <PriceTag
        price={productInfo.basePrice}
        name={productInfo.name}
        visible={true}
      />}
      <primitive object={clonedScene} />
    </group>
  );
};

const BagsItemsDisplay = ({ onBagClick, Product, setIsFinished }) => {
  // const uniquePaths = [...new Set(BAGS_ITEMS_CONFIG.map((item) => item.path))];
  // uniquePaths.forEach((path) => useGLTF.preload(path));
  // useGLTF.preload(PATH_TO_BAGSSTORE_MODEL);
  const bagWithInfo = useMemo(() => {
    return (Product || [])
      .filter((bag) => bag.path && bag.path.trim() !== "")
      .map((bag, index) => {
        const [name, description, basePrice] = bag.mainInfo || [];
        return {
          ...bag,
          name,
          description,
          basePrice,
          index,
        };
      });
  }, [Product]);
  return (
    <>
      {bagWithInfo.map((bag, index) => (
        <Suspense key={`bag-item-${index}`} fallback={<Loader setIsFinished={setIsFinished}/>}>
          <BagItem
            path={bag.path}
            position={bag.position}
            rotation={bag.rotation}
            scale={bag.scale}
            index={index}
            onBagClick={onBagClick}
            productInfo={{
              name: bag.name,
              description: bag.description,
              basePrice: bag.basePrice,
              productId: bag.productId,
              path: bag.path,
              variants: bag.variants
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

const BagStoreScene = ({ onBagClick, shopConfig, Product, setIsFinished }) => {

  return (
    <>
      <Suspense fallback={<Loader setIsFinished={setIsFinished}/>}>
        <ambientLight intensity={AMBIENT_LIGHT_INTENSITY * 0.7} color="#ffffff" />
        <pointLight
          position={[0, 5, 0]}
          intensity={30}
          distance={12}
          decay={2}
          color="#ffffff"
          castShadow
        />
        <spotLight
          position={[0, 1, 0]}
          angle={Math.PI / 2}        // 90° cone
          intensity={15}
          penumbra={0.8}
          distance={30}
          castShadow
          rotation={[Math.PI / 2, 0, 0]} // <- Pointing up
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
          <Suspense fallback={<Loader setIsFinished={setIsFinished}/>}>
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

            <BagsItemsDisplay onBagClick={onBagClick} Product={Product} setIsFinished={setIsFinished}/>

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
            <SkyDome/>
          </Suspense>
        </Physics>

        <fog attach="fog" args={["#f3f3f3", 10, 50]} />
        <color attach="background" args={["#D9D9D9"]} />
      </Suspense>
    </>
  );
};

export default function BagStore() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [ products, setProducts ] = useState(null);
  const [ isAddingToCart, setIsAddingToCart ] = useState(false);
  const [ isCartModalOpen, setIsCartModalOpen ] = useState(false) 
  const {cartItems, removeItem, getCartItemCount, fetchCartItems } = useCart();
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
    const isReload =
      window.performance &&
      performance.getEntriesByType('navigation')[0]?.type === 'reload';

    if (isReload) {
      setIsFinished(false);
      // console.log('🔁 Page was reloaded by the user.');
    }
  }, []);

  useEffect(() => {
    const loadConstants = async () => {
      try {
        const id = shopId || "default";
        const constants = await getBagConstants(id);
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
      // BAGS_ITEMS_CONFIG.forEach((shoe) => {
      //   useGLTF.preload(shoe.path);
      // });
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
    } catch (err) {
      console.error("Failed to add to cart:", err);
      const displayPrice =
        selectedInfo.selectedVariant?.price || selectedInfo.basePrice;
      showNotification(
        selectedInfo.name,
        displayPrice,
        cartItem.quantity,
        false
      );
    } finally {
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
      <Navbar cartItems={getCartItemCount()} shopName={"BagsShop"} onCartClick={handleCartClick}/>
      <ControlsPanel resetCamera={resetCamera} />
      {selectedInfo && selectedInfo.name !== "plant" && (
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
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows="soft"
        camera={{ position: [0.5, 0.5, 0.5] }}
      >
        <Suspense fallback={<Loader setIsFinished={setIsFinished}/>}>
          <BagStoreScene
            setIsFinished={setIsFinished}
            onBagClick={onProductClick}
            orbitControlsRef={orbitControlsRef}
            shopConfig={shopConfig}
            Product={products}
          />
          {isFinished && <CustomCameraControls/>}
        </Suspense>
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