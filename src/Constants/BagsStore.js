import { getShopAssets } from "../Service/shopService";
import { getShopProducts } from "../Service/productsService";
import { getProductModel } from "../Service/productsService";
import { getProductVariants } from "../Service/productsService";
export const getBagConstants = async (shopId) => {
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
          position: [c.x_pos, c.y_pos + 0.1, c.z_pos],
          rotation: [c.x_rot, c.y_rot, c.z_rot],
          scale: [c.x_scale, c.y_scale, c.z_scale],
          variants: variants,
        };
      })
    );
    return {
      MODEL_URL: urls || "",
      SHOP_POSITION: [coords.x_pos, coords.y_pos + 1.6, coords.z_pos],
      SHOP_ROTATION: [coords.x_rot, coords.y_rot, coords.z_rot],
      SHOP_SCALE: [coords.x_scale, coords.y_scale, coords.z_scale],
      products: productAssetsList,
    };
  } catch (error) {
    console.error("Error fetching shop constants:", error);
    throw error;
  }
};

const AMBIENT_LIGHT_INTENSITY = 1.5;
const FLOOR_SIZE = [50, 50];
const FLOOR_COLOR = "#ffffff";
const DEFAULT_CAMERA_POSITION = [3, 3, 3];
const BAGS_ITEMS_CONFIG = [
  {
        path: '../../Assets/3D_Models/Bags/Bag13/scene.glb',
        position: [0, 0.83, 2.6],
        rotation: [0, -Math.PI/6, 0],
        scale: [0.38, 0.38,0.38]
    }, //done
    {
        path: '../../Assets/3D_Models/Bags/Bag10/scene.glb',
        position: [0,  0.8, 3.1],
        rotation: [0, -Math.PI/6, 0],
        scale: [0.16, 0.16, 0.16]
    }, //done DIOR bag needs to be fixed
    {
      path: '../../Assets/3D_Models/Bags/Bag12/scene.glb',
      position: [0,  0.85, 3.5],
      rotation: [0, -Math.PI/6, 0],
      scale: [0.13, 0.13, 0.13]
      },//done Louis Vuitton needs to be fixed
    {
      path: '../../Assets/3D_Models/Bags/Bag5/scene.glb',
      position: [1.75 ,1.344, 1.25],
      rotation: [0, -Math.PI/6, 0],
      scale: [0.3, 0.3, 0.3]
    },//done 
    {
      path: '../../Assets/3D_Models/Bags/Bag7/scene.glb',
      position: [1.75 ,1.344, 2],
      rotation: [0, -Math.PI/6, 0],
      scale: [0.3, 0.3, 0.3]
    },//Christian DIOR done
    {
      path: '../../Assets/3D_Models/Bags/Bag1/scene.glb',
      position: [1.75 ,1.344, 2.7],
      rotation: [0, -Math.PI/6, 0],
      scale: [0.3, 0.3, 0.3]
    },//Done Dior model 1
    {
      path: '../../Assets/3D_Models/Bags/Bag5/scene.glb',
      position: [1.75 ,1.344, 3.4],
      rotation: [0, -Math.PI/6, 0],
      scale: [0.3, 0.3, 0.3]
    },//Done DIOR model 2
    {
    path: '../../Assets/3D_Models/Bags/Bag8/scene.glb',
    position: [1.75 ,1.0, 3.6],
    rotation: [0, -Math.PI/6, 0],
    scale: [0.13, 0.13, 0.13]
    },//done
    {
    path: '../../Assets/3D_Models/Bags/Bag9/scene.glb',
    position: [1.75 ,1.0, 2.8],
    rotation: [0, -Math.PI/6, 0],
    scale: [0.13, 0.13, 0.13]
    },//done Hermes
    {
    path: '../../Assets/3D_Models/Bags/Bag11 (2)/scene.glb',
    position: [1.3 ,0.025, 1.9],
    rotation: [0, -Math.PI/6, 0],
    scale: [0.3, 0.3, 0.3]
    },//DIOR model 3 done (broken model!) replaced with bag5
    {
      path: '../../Assets/3D_Models/Bags/Bag1/scene.glb',
      position: [1.75 ,0.83, 1.4],
      rotation: [0, -Math.PI/6, 0],
      scale: [0.3, 0.3, 0.3]
    },//DIOR model 4 done
    {
    path: '../../Assets/3D_Models/Bags/Bag9/scene.glb',
    position: [-3.9 ,1.37, 1.5],
    rotation: [0, Math.PI/6, 0],
    scale: [0.13, 0.13, 0.13]
    },//GUCCI model 1 done
    {
    path: '../../Assets/3D_Models/Bags/Bag8/scene.glb',
    position: [-3.9 ,1.37, 2.8],
    rotation: [0, Math.PI/6, 0],
    scale: [0.13, 0.13, 0.13]
    },//Prada model 1
    {
    path: '../../Assets/3D_Models/Bags/Bag7/scene.glb',
    position: [-3.9 ,1.2, 2.24],
    rotation: [0, Math.PI/6, 0],
    scale: [0.3, 0.3, 0.3]
    },//DIOR model 5
    {
      path: '../../Assets/3D_Models/Bags/planta/scene.glb',
      position: [1.6 ,0.2, 0.6],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45]
    },
    {
      path: '../../Assets/3D_Models/Bags/planta/scene.glb',
      position: [-3 ,0.2, 0.6],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45]
    }
];

export { AMBIENT_LIGHT_INTENSITY, FLOOR_SIZE, FLOOR_COLOR, BAGS_ITEMS_CONFIG };
