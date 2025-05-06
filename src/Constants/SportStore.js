const PATH_TO_SPORTSTORE_MODEL = '../../Assets/3D_Models/SportShop/Shop/Untitled.gltf';
const SPORTSTORE_SHOP_POSITION = [0, 0, 0];
const SPORTSTORE_SHOP_ROTATION = [0, 0, 0]; 
const AMBIENT_LIGHT_INTENSITY = 1.5;
const SPORTSTORE_SHOP_SCALE = [4.5, 4.5, 4.5];
const FLOOR_SIZE = [50, 50];
const FLOOR_COLOR = '#ffffff';
const DEFAULT_CAMERA_POSITION = [3,3,3];
const SPORTS_ITEMS_CONFIG = [
    {
        path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/american_ball/scene.gltf',
        position: [-0.251, 0.1, -0.45],
        rotation: [0, 0, 0],
        scale: [0.00714, 0.00714, 0.00714]
    },
    {
      path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/american_ball/scene.gltf',
      position: [-0.351, 0.1, -0.45],
      rotation: [0, Math.PI/2, 0],
      scale: [0.00714, 0.00714, 0.00714]
  },
    {
        path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/baseball/scene.gltf',
        position: [1.5, 1, 0],
        rotation: [0, 0, 0],
        scale: [0.15, 0.15, 0.15]
    },
    {
        path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/dumbel/scene.gltf',
        position: [0.66, 0.6, -0.44],
        rotation: [0, 0, 0],
        scale: [0.08, 0.08, 0.08]
    },
    {
      path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/dumbel/scene.gltf',
      position: [0.86, 0.6, -0.44],
      rotation: [0, 0, 0],
      scale: [0.08, 0.08, 0.08]
  },
  {
    path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/dumble3/scene.gltf',
    position: [0.645, 0.33, -0.44],
    rotation: [0, 0, 0],
    scale: [0.59, 0.59, 0.59]
},
{
  path: '../../Assets/3D_Models/SportShop/Dynamic_Objects/bicycle/scene.gltf',
  position: [0.645, 0.33, -0.44],
  rotation: [0, 0, 0],
  scale: [0.59, 0.59, 0.59]
}
];

export {
    PATH_TO_SPORTSTORE_MODEL,
    SPORTSTORE_SHOP_POSITION,
    SPORTSTORE_SHOP_ROTATION,
    AMBIENT_LIGHT_INTENSITY,
    SPORTSTORE_SHOP_SCALE,
    FLOOR_SIZE,
    FLOOR_COLOR,
    SPORTS_ITEMS_CONFIG
}