import { getShopAssets } from "../Service/shopService";
import { getShopProducts } from "../Service/productsService";
import { getProductModel } from "../Service/productsService";
import { getProductVariants } from "../Service/productsService";

export const getClothesConstants = async () => {
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

const CLOTHES_ITEMS_CONFIG = [
  {
    path: '/Assets/3D_Models/Clothes/Mirror/scene.glb',
    position: [0.055, 0.04,-0.22],
    rotation: [0, 0, 0],
    scale: [0.79, 0.8, 1],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.0338, 0.036,-0.195],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.0338, 0.036,-0.2],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.0338, 0.036,-0.205],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.0845, 0.036,-0.195],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.0845, 0.036,-0.2],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.0845, 0.036,-0.205],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Polo/scene.glb',
    position: [0.08445, 0.0297,-0.2018],
    rotation: [0, 0, 0],
    scale: [0.003, 0.003, 0.003],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Polo/scene.glb',
    position: [0.08445, 0.0297,-0.1968],
    rotation: [0, 0, 0],
    scale: [0.003, 0.003, 0.003],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Polo/scene.glb',
    position: [0.08445, 0.0297,-0.1918],
    rotation: [0, 0, 0],
    scale: [0.003, 0.003, 0.003],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Polo_white_tshirt/scene.glb',
    position: [0.0338, 0.018,-0.193],
    rotation: [0, 0, 0],
    scale: [0.32, 0.32, 0.32],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Polo_white_tshirt/scene.glb',
    position: [0.0338, 0.018,-0.198],
    rotation: [0, 0, 0],
    scale: [0.32, 0.32, 0.32],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Polo_white_tshirt/scene.glb',
    position: [0.0338, 0.018,-0.203],
    rotation: [0, 0, 0],
    scale: [0.32, 0.32, 0.32],
    clickable: true
    
  },
 {
    path: '/Assets/3D_Models/Clothes/Cashier_machine/scene.glb',
    position: [-0.008,  0.018,-0.16],
    rotation: [0, -Math.PI, 0],
    scale: [0.3, 0.3, 0.3],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Plant/scene.glb',
    position: [-0.017,  0.001,-0.13],
    rotation: [0, -Math.PI, 0],
    scale: [0.5, 0.5, 0.5],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Suit/scene.glb',
    position: [0.125, 0.0,-0.18],
    rotation: [0, -Math.PI/4, 0],
    scale: [0.35, 0.35, 0.35],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Mannequin3/scene.glb',
    position: [-0.015, 0.0215,0.02],
    rotation: [0, 0, 0],
    scale: [0.5, 0.5, 0.5],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Mannequin2/scene.glb',
    position: [0.013, 0.025,0.025],
    rotation: [0, Math.PI/2, 0],
    scale: [0.4, 0.4, 0.4],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/ClothesRack/scene.glb',
    position: [0.125, 0.002,0.004],
    rotation: [0, 0, 0],
    scale: [5, 5, 5],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/ClothesRack2/scene.glb',
    position: [0.085, 0.002,-0.09],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.4, 0.4, 0.4],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Plant1/scene.glb',
    position: [0.13,  0.01,-0.11],
    rotation: [0, -Math.PI, 0],
    scale: [0.5, 0.5, 0.5],
    clickable: false
    
  },
  
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.1253, 0.047,-0.01],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.1253, 0.047,-0.0165],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.1253, 0.0466,-0.02],
    rotation: [0, 0, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.11, 0.0466,0.0026],
    rotation: [0, Math.PI/2, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.104, 0.0466,0.0026],
    rotation: [0, Math.PI/2, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.1, 0.0466,0.0026],
    rotation: [0, Math.PI/2, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants5/scene.glb',
    position: [0.1, 0.025,0.0026],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.011, 0.006, 0.006],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants4/scene.glb',
    position: [0.104, 0.021,0.0026],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.6, 0.3, 0.3],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants3/scene.glb',
    position: [0.111, 0.021,0.0026],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.6, 0.3, 0.3],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants3/scene.glb',
    position: [0.1253, 0.021,-0.02],
    rotation: [0, Math.PI, 0],
    scale: [0.6, 0.3, 0.3],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants4/scene.glb',
    position: [0.1253, 0.021,-0.0165],
    rotation: [0, Math.PI, 0],
    scale: [0.6, 0.3, 0.3],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants5/scene.glb',
    position: [0.1253, 0.025,-0.01],
    rotation: [0, Math.PI, 0],
    scale: [0.011, 0.006, 0.006],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Table/scene.glb',
    position: [0.045,-0.007,-0.1],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.3, 0.3, 0.3],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants/scene.glb',
    position: [0.0525,0.023,-0.06],
    rotation: [0, -Math.PI, 0],
    scale: [0.03, 0.03, 0.03],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants/scene.glb',
    position: [0.13,0.034,-0.073],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.03, 0.03, 0.03],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants/scene.glb',
    position: [0.13,0.056,-0.073],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.03, 0.03, 0.03],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants/scene.glb',
    position: [0.13,0.01,-0.073],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.03, 0.03, 0.03],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants1/scene.glb',
    position: [0.0525,0.044,-0.075],
    rotation: [0, Math.PI, 0],
    scale: [0.35, 0.35, 0.35],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Pants2/scene.glb',
    position: [0.0525,0.044,-0.092],
    rotation: [0, Math.PI, 0],
    scale: [0.35, 0.35, 0.35],
    clickable: false
    
  },
    {
    path: '/Assets/3D_Models/Clothes/Shirt/scene.glb',
    position: [0.069,0.024,-0.063],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.2, 0.2, 0.2],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt2/scene.glb',
    position: [0.069,0.024,-0.09],
    rotation: [0, 0, 0],
    scale: [0.551, 0.551, 0.551],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt1/scene.glb',
    position: [0.13,0.013,-0.095],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.18, 0.18, 0.18],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt3/scene.glb',
    position: [0.13,0.021,-0.075],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.18, 0.18, 0.18],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt4/scene.glb',
    position: [0.13,0.039,-0.075],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.6, 0.6, 0.6],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.133, 0.0524,-0.085],
    rotation: [0, -Math.PI, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.133, 0.0524,-0.09],
    rotation: [0, -Math.PI, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.133, 0.0524,-0.095],
    rotation: [0, -Math.PI, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.133, 0.0524,-0.1],
    rotation: [0, -Math.PI, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Hanger/scene.glb',
    position: [0.133, 0.0524,-0.105],
    rotation: [0, -Math.PI, 0],
    scale: [0.002, 0.002, 0.002],
    clickable: false
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt5/scene.glb',
    position: [0.133, 0.045,-0.097],
    rotation: [0, -Math.PI/2, 0],
    scale: [0.035, 0.035, 0.035],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt6/scene.glb',
    position: [0.133, 0.0035,-0.085],
    rotation: [0, 0, 0],
    scale: [0.78, 0.78, 0.78],
    clickable: true
    
  },
  {
    path: '/Assets/3D_Models/Clothes/Shirt7/scene.glb',
    position: [0.133, 0.045,-0.107],
    rotation: [0, 0, 0],
    scale: [0.09, 0.09, 0.09],
    clickable: true
    
  }
  
];

export {
  AMBIENT_LIGHT_INTENSITY,
  FLOOR_SIZE,
  FLOOR_COLOR,
  CLOTHES_ITEMS_CONFIG
};