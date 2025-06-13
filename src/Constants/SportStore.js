import { getShopAssets } from "../Service/shopService";
import { getShopProducts } from "../Service/productsService";
import { getProductModel } from "../Service/productsService";
import { getProductVariants } from "../Service/productsService";

export const getSportConstants = async (shopId) => {
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
        // console.log(product);
        const modelRes = await getProductModel(product.id);
        const variantsRes = await getProductVariants(product.id);
        // console.log(variantsRes)
        const variants = variantsRes?.data?.content || [];
        console.log(variants)
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
    console.log(productAssetsList);
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

const AMBIENT_LIGHT_INTENSITY = 1.5;
const FLOOR_SIZE = [50, 50];
const FLOOR_COLOR = "#ffffff";
const DEFAULT_CAMERA_POSITION = [3, 3, 3];

const SPORTS_ITEMS_CONFIG = [
  {
        path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/american_ball/scene.glb',
        position: [-0.251, 0.1, -0.43],
        rotation: [0, 0, 0],
        scale: [0.00714, 0.00714, 0.00714]
    },
    {
      path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/american_ball/scene.glb',
      position: [-0.351, 0.1, -0.429],
      rotation: [0, Math.PI/2, 0],
      scale: [0.00714, 0.00714, 0.00714]
    },
    {
        path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/dumbel/scene.glb',
        position: [0.66, 0.6, -0.44],
        rotation: [0, 0, 0],
        scale: [0.08, 0.08, 0.08]
    },//done Dumbbell
    {
      path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/dumbel/scene.glb',
      position: [0.86, 0.6, -0.44],
      rotation: [0, 0, 0],
      scale: [0.08, 0.08, 0.08]
  },//done Dumbbell
  {
    path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/dumble3/scene.glb',
    position: [0.645, 0.33, -0.44],
    rotation: [0, 0, 0],
    scale: [0.59, 0.59, 0.59]
  },
  {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle/scene.glb',
  position: [-1.044, 0.1, -0.30],
  rotation: [0,Math.PI/3, 0],
  scale: [0.03, 0.03, 0.03]
  },//done Bicycle
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle/scene.glb',
  position: [-0.97, 0.1, -0.30],
  rotation: [0,Math.PI/3, 0],
  scale: [0.03, 0.03, 0.03]
},//done Bicycle
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle/scene.glb',
  position: [-0.89, 0.1, -0.30],
  rotation: [0,Math.PI/3, 0],
  scale: [0.03, 0.03, 0.03]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle_helmet/scene.glb',
  position: [-0.83, 0.44, -0.43],
  rotation: [Math.PI/2,0, 0],
  scale: [0.019, 0.019, 0.019]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle_helmet/scene.glb',
  position: [-0.9, 0.44, -0.43],
  rotation: [Math.PI/2,0, 0],
  scale: [0.019, 0.019, 0.019]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle_helmet/scene.glb',
  position: [-0.97, 0.44, -0.43],
  rotation: [Math.PI/2,0, 0],
  scale: [0.019, 0.019, 0.019]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.963, 0.59, -0.43],
  rotation: [0,0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.94, 0.59, -0.455],
  rotation: [0, 0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.92, 0.59, -0.43],
  rotation: [0,0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.9, 0.59, -0.455],
  rotation: [0, 0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.88, 0.59, -0.43],
  rotation: [0,0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.86, 0.59, -0.455],
  rotation: [0, 0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bottle/scene.glb',
  position: [-0.84, 0.59, -0.43],
  rotation: [0,0, 0],
  scale: [0.25, 0.25, 0.25]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/skateboard/scene.glb',
  position: [-0.7, 0.25, -0.43],
  rotation: [Math.PI/2,Math.PI/2, 0],
  scale: [0.1, 0.1, 0.1]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/skateboard/scene.glb',
  position: [-0.7, 0.25, -0.42],
  rotation: [Math.PI/2,Math.PI/3, 0],
  scale: [0.1, 0.1, 0.1]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/skateboard/scene.glb',
  position: [-0.57, 0.25, -0.43],
  rotation: [Math.PI/2,Math.PI/2, 0],
  scale: [0.1, 0.1, 0.1]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/skateboard/scene.glb',
  position: [-0.6, 0.12, -0.39],
  rotation: [0,0, 0],
  scale: [0.1, 0.1, 0.1]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/5_kg_dumbells/scene.glb',
  position: [0.6, 0.08, -0.39],
  rotation: [0,0, 0],
  scale: [0.007, 0.007, 0.007]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/helmet/scene.glb',
  position: [0.28, 0.367, 0.77],
  rotation: [0,Math.PI/2, 0],
  scale: [0.019, 0.019, 0.019]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/helmet/scene.glb',
  position: [0.3418, 0.367, 0.77],
  rotation: [0,Math.PI/2, 0],
  scale: [0.019, 0.019, 0.019]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/helmet/scene.glb',
  position: [0.405, 0.367, 0.77],
  rotation: [0,Math.PI/2, 0],
  scale: [0.019, 0.019, 0.019]
},
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/sports_bag/scene.glb',
  position: [-0.18, 0.07, 0.77],
  rotation: [0,0, 0],
  scale: [0.3, 0.3, 0.3]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/sports_bag/scene.glb',
  position: [-0.18, 0.16, 0.77],
  rotation: [0,0, 0],
  scale: [0.3, 0.3, 0.3]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/tennis_ball/scene.glb',
  position: [0.25, 0.08, 0.77],
  rotation: [0,0, 0],
  scale: [0.005,0.005, 0.005]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/tenniscontainer/scene.glb',
  position: [0.2, 0.08, 0.77],
  rotation: [0,0, 0],
  scale: [0.00007,0.00007, 0.00007]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/freestyle_ski/scene.glb',
  position: [0.59,0.28, 0.75],
  rotation: [0,Math.PI/2, Math.PI/10],
  scale: [0.081,0.081,0.081]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/freestyle_ski/scene.glb',
  position: [0.68,0.28, 0.75],
  rotation: [0,Math.PI/2, Math.PI/10],
  scale: [0.081,0.081,0.081]
},

 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball_bat/scene.glb',
  position: [0.943, 0.687, 0.62],
  rotation: [Math.PI/2 ,0, 0],
  scale: [0.2,0.2, 0.2]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball_bat/scene.glb',
  position: [0.943, 0.687, 0.6],
  rotation: [Math.PI/2 ,0, 0],
  scale: [0.2,0.2, 0.2]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball_bat/scene.glb',
  position: [0.943, 0.687, 0.58],
  rotation: [Math.PI/2 ,0, 0],
  scale: [0.2,0.2, 0.2]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball_bat/scene.glb',
  position: [0.943, 0.694, 0.61],
  rotation: [Math.PI/2 ,0, 0],
  scale: [0.2,0.2, 0.2]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball_bat/scene.glb',
  position: [0.943, 0.694, 0.59],
  rotation: [Math.PI/2 ,0, 0],
  scale: [0.2,0.2, 0.2]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball_bat/scene.glb',
  position: [0.943, 0.702, 0.6],
  rotation: [Math.PI/2 ,0, 0],
  scale: [0.2,0.2, 0.2]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/football_helmet/scene.glb',
  position: [0.97, 0.35, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.02,0.02, 0.02]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/football_helmet/scene.glb',
  position: [0.9, 0.35, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.02,0.02, 0.02]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/football_helmet/scene.glb',
  position: [0.83, 0.35, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.02,0.02, 0.02]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/football_helmet/scene.glb',
  position: [0.97, 0.45, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.02,0.02, 0.02]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/football_helmet/scene.glb',
  position: [0.9, 0.45, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.02,0.02, 0.02]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/football_helmet/scene.glb',
  position: [0.83, 0.45, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.02,0.02, 0.02]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/soccer_ball/scene.glb',
  position: [-0.89, 0.635, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.3,0.3, 0.3]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/soccer_ball/scene.glb',
  position: [-0.815, 0.635, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.3,0.3, 0.3]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/soccer_ball/scene.glb',
  position: [-0.74, 0.635, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.3,0.3, 0.3]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/soccer_ball/scene.glb',
  position: [-0.665, 0.635, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.3,0.3, 0.3]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/soccer_ball/scene.glb',
  position: [-0.59, 0.635, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.3,0.3, 0.3]
 },
 {
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/soccer_ball/scene.glb',
  position: [-0.7, 0.69, 0.77],
  rotation: [-Math.PI/2 ,0, 0],
  scale: [0.3,0.3, 0.3]
 }
];

export {
  AMBIENT_LIGHT_INTENSITY,
  FLOOR_SIZE,
  FLOOR_COLOR,
  SPORTS_ITEMS_CONFIG,
};
