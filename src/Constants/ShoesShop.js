import { getShopAssets } from "../Service/shopService";
import {
  getShopProducts,
  getProductModel,
  getProductVariants,
} from "../Service/productsService";

export const getShopConstants = async (shopId) => {
  try {
    const response = await getShopAssets(shopId);

    if (!response.success) {
      throw new Error("Failed to fetch shop assets");
    }

    const coords = response.data.model.coordinates || {
      x_pos: 0,
      y_pos: 0,
      z_pos: 0,
      x_rot: 0,
      y_rot: 0,
      z_rot: 0,
      x_scale: 1,
      y_scale: 1,
      z_scale: 1,
    };

    const urls = response.data.model.glbUrl || "";

    let page = 0;
    const size = 20;
    let allProducts = [];
    let hasMore = true;

    while (hasMore) {
      const res = await getShopProducts(shopId, page, size);
      if (!res.success) throw new Error("Failed to fetch shop products");

      const products = res.data.content;
      allProducts = allProducts.concat(products);

      hasMore = !res.data.last;
      page++;
    }

    const productAssetsList = await Promise.all(
      allProducts.map(async (product) => {
        const modelRes = await getProductModel(product.id);
        const variantsRes = await getProductVariants(product.id);
        const variants = variantsRes?.data?.content || [];
        const c = modelRes?.data?.coordinates || {
          x_pos: 0,
          y_pos: 0,
          z_pos: 0,
          x_rot: 0,
          y_rot: 0,
          z_rot: 0,
          x_scale: 1,
          y_scale: 1,
          z_scale: 1,
        };

        return {
          productId: product.id,
          mainInfo: [product.name, product.description, product.basePrice],
          path: modelRes?.data?.glbUrl || "",
          position: [c.x_pos, c.y_pos, c.z_pos],
          rotation: [c.x_rot, c.y_rot, c.z_rot],
          scale: [c.x_scale, c.y_scale, c.z_scale],
          variants: variants,
        };
      })
    );

    return {
      MODEL_URL: urls || "",
      SHOP_POSITION: [coords.x_pos, coords.y_pos, coords.z_pos],
      SHOP_ROTATION: [coords.x_rot, coords.y_rot, coords.z_rot],
      SHOP_SCALE: [coords.x_scale, coords.y_scale, coords.z_scale],
      products: productAssetsList,
    };
  } catch (error) {
    console.error("Error fetching shop constants:", error);
    throw error;
  }
};

// const SHOES_CONFIGURATIONS = [
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes1/ShoesOne.gltf",
//     position: [1.5, 1.08, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes2/ShoesTWO.gltf",
//     position: [1.55, 1.66, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes3/ShoesTHREE.gltf",
//     position: [2.648, 1.65, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes4/ShoesFour.gltf",
//     position: [2.648, 1.1, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   // GG
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes9/scene.gltf",
//     position: [0.39, 0.575, 2.35],
//     rotation: [0, 0, 0],
//     scale: [0.15, 0.15, 0.1],
//   },
//   // nb
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesA/scene.gltf",
//     position: [1.55, 0.575, 2.3],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.0009111, 0.00091115, 0.00091115],
//   },
//   // nike white
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes7/scene.gltf",
//     position: [2.65, 0.676, 2.2],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.015, 0.015, 0.015],
//   },
//   {
//     //nike blue
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesB/scene.gltf",
//     position: [-3, 0.72, 1],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     // nike gray
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesC/scene.gltf",
//     position: [0.39, 1.23, 2.35],
//     rotation: [0, Math.PI / -2, 0],
//     scale: [0.3, 0.23, 0.23],
//   },
//   {
//     // nike gray 2
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesD/scene.gltf",
//     position: [0.39, 1.69, 2.35],
//     rotation: [0, Math.PI, 0],
//     scale: [1, 1, 1],
//   },
//   {
//     // nike gray 2
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesE/scene.gltf",
//     position: [-0.72, 1.68, 2.35],
//     rotation: [0, Math.PI, 0],
//     scale: [1.5, 1.5, 1.5],
//   },
//   {
//     // Dior
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesH/scene.gltf",
//     position: [-0.72, 1.13, 2.35],
//     rotation: [0, 0, 0],
//     scale: [0.35, 0.35, 0.35],
//   },
//   {
//     // nb gray
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesI/scene.gltf",
//     position: [-0.72, 0.72, 2.35],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.076, 0.076, 0.076],
//   },
//   {
//     // white & blue
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesK/scene.gltf",
//     position: [-1.8, 0.569, 2.35],
//     rotation: [0, Math.PI, 0],
//     scale: [0.5, 0.5, 0.5],
//   },
//   {
//     // nike white
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes1/ShoesOne.gltf",
//     position: [-1.9, 1.08, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     //nike black
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes2/ShoesTWO.gltf",
//     position: [-1.9, 1.66, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     // nike blue
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes3/ShoesTHREE.gltf",
//     position: [-3, 1.65, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     // nike gray
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes4/ShoesFour.gltf",
//     position: [-3, 1.1, 2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   // nb
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesA/scene.gltf",
//     position: [-3, 0.575, 2.3],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.0009111, 0.00091115, 0.00091115],
//   },
//   //////
//   {
//     // nike gray
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesC/scene.gltf",
//     position: [0.39, 1.23, -2.35],
//     rotation: [0, Math.PI / -2, 0],
//     scale: [0.3, 0.23, 0.23],
//   },
//   {
//     // nike gray 2
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesD/scene.gltf",
//     position: [0.39, 1.69, -2.35],
//     rotation: [0, Math.PI, 0],
//     scale: [1, 1, 1],
//   },
//   {
//     // nike gray 2
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesE/scene.gltf",
//     position: [-0.72, 1.68, -2.35],
//     rotation: [0, Math.PI, 0],
//     scale: [1.5, 1.5, 1.5],
//   },
//   {
//     // Dior
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesH/scene.gltf",
//     position: [-0.72, 1.13, -2.35],
//     rotation: [0, 0, 0],
//     scale: [0.35, 0.35, 0.35],
//   },
//   {
//     // nb gray
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesI/scene.gltf",
//     position: [-0.72, 0.72, -2.35],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.076, 0.076, 0.076],
//   },
//   {
//     // white & blue
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesK/scene.gltf",
//     position: [-1.8, 0.569, -2.35],
//     rotation: [0, Math.PI, 0],
//     scale: [0.5, 0.5, 0.5],
//   },
//   {
//     // nike white
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes1/ShoesOne.gltf",
//     position: [-1.9, 1.08, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     //nike black
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes2/ShoesTWO.gltf",
//     position: [-1.9, 1.66, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     // nike blue
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes3/ShoesTHREE.gltf",
//     position: [-3, 1.65, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     // nike gray
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes4/ShoesFour.gltf",
//     position: [-3, 1.1, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   // nb
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesA/scene.gltf",
//     position: [-3, 0.575, -2.3],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.0009111, 0.00091115, 0.00091115],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes1/ShoesOne.gltf",
//     position: [1.5, 1.08, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes2/ShoesTWO.gltf",
//     position: [1.55, 1.66, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes3/ShoesTHREE.gltf",
//     position: [2.648, 1.65, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes4/ShoesFour.gltf",
//     position: [2.648, 1.1, -2.3],
//     rotation: [0, Math.PI, 0],
//     scale: [0.08, 0.08, 0.08],
//   },
//   // GG
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes9/scene.gltf",
//     position: [0.39, 0.575, -2.35],
//     rotation: [0, 0, 0],
//     scale: [0.15, 0.15, 0.1],
//   },
//   // nb
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesA/scene.gltf",
//     position: [1.55, 0.575, -2.3],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.0009111, 0.00091115, 0.00091115],
//   },
//   // nike white
//   {
//     path: "../../Assets/3D_Models/ShoesShop/DynamicObjects/Shoes7/scene.gltf",
//     position: [2.65, 0.676, -2.4],
//     rotation: [0, Math.PI / 2, 0],
//     scale: [0.015, 0.015, 0.015],
//   },
// ];

const AMBIENT_LIGHT_INTENSITY = 1.5;
const FLOOR_SIZE = [50, 50];
const FLOOR_COLOR = "#ffffff";

export {
  AMBIENT_LIGHT_INTENSITY,
  FLOOR_SIZE,
  FLOOR_COLOR,
};
