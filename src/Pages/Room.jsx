import { 
  useGLTF,
  useTexture,
  useAnimations
} from '@react-three/drei'

import { 
  useFrame, 
  Canvas,
  useThree,
  useLoader
} from '@react-three/fiber'

import { 
  useRef, 
  Suspense, 
  useMemo, 
  createRef, 
  useCallback, 
  useEffect 
} from 'react'

import { 
  createXRStore,
  useXRControllerLocomotion,
  XR, 
  XROrigin, 
  PointerEvents 
} from '@react-three/xr'

import { 
  Physics, 
  useBox, 
  usePlane, 
  useTrimesh,
  usePointToPointConstraint,
  useSphere
} from '@react-three/cannon'

import { 
  Vector3 
} from 'three'

import { 
  getProductModel 
} from '../Service/productsService'

import * as THREE from 'three'

import { 
  useLocation, 
  useParams,
  useNavigate 
} from 'react-router-dom'

import { 
  useState
} from 'react'

import { 
  getShopAssets 
} from '../Service/shopService'

export const cursor = createRef()

const modelUrl = 'https://test911.blob.core.windows.net/shop-products/54%2F18%2FglbFile.glb?sv=2025-05-05&spr=https&se=2025-05-30T09%3A05%3A15Z&sr=b&sp=r&sig=RlYi%2F8Ur1DTSIYvs2%2FqbeDCIAABp03ARhNrthRZsHaM%3D&rscd=attachment%3B%20filename%3DglbFile.glb';

let grabbingPointerId = undefined
const grabbedPosition = new Vector3()

export function useDragConstraint(child, maxDistance = 13) {
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] })
  const { camera } = useThree()

  const tempVec = new Vector3()

  useEffect(() => void api.disable(), [])

  const onPointerDown = useCallback((e) => {
    if (grabbingPointerId != null) return
    if (!child.current) return

    const objectWorldPos = child.current.getWorldPosition(tempVec)
    const cameraWorldPos = camera.getWorldPosition(new Vector3())
    const distance = objectWorldPos.distanceTo(cameraWorldPos)

    if (distance > maxDistance) {
      console.log(`Too far to grab: ${distance.toFixed(2)}m`)
      return
    }

    setIsGrabbed(true)
    grabbingPointerId = e.pointerId
    grabbedPosition.copy(e.point)
    document.body.style.cursor = 'grabbing'
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    api.enable()
    child.current.api?.type?.set('Kinematic') // disable gravity
  }, [camera])

  const onPointerMove = useCallback((e) => {
    if (grabbingPointerId === e.pointerId) {
      grabbedPosition.copy(e.point)
    }
  }, [])

  const onPointerUp = useCallback((e) => {
    if (grabbingPointerId == null) return

    setIsGrabbed(false)
    grabbingPointerId = undefined
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
    api.disable()
    child.current.api?.type?.set('Dynamic') // enable gravity
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, isGrabbed }
}

export function Cursor() {
  const [, api] = useSphere(() => ({ collisionFilterMask: 1, type: 'Kinematic', mass: 0, args: [0.5] }), cursor)
  useFrame(() => {
    if (grabbingPointerId == null) {
      return
    }
    api.position.set(grabbedPosition.x, grabbedPosition.y, grabbedPosition.z)
  })
  return null
}

const store = createXRStore({
  hand: { touchPointer: false },
  secondaryInputSources: true,
  offerSession: 'immersive-vr',
})

export function SolidGLTFModel({ url, position, scale, rotation=[0, 0, 0] }) {
  const group = useRef()
  const [played, setPlayed] = useState(false)
  const { scene, animations, nodes } = useGLTF(url)
  const { actions } = useAnimations(animations, group)
  const soundBuffer = useLoader(THREE.AudioLoader, '/open_door_sound.mp3')
  const { camera } = useThree()
  const navigate = useNavigate()

  const geometry = useMemo(() => {
    for (const node of Object.values(nodes)) {
      if (node.isMesh) return node.geometry
    }
  }, [nodes])

  const vertices = useMemo(() => geometry?.attributes.position.array, [geometry])
  const indices = useMemo(() => geometry?.index.array, [geometry])

  const [ref] = useTrimesh(() => ({
    mass: 300,
    args: [vertices, indices],
    position,
    type: 'Static',
  }))

  const handleClick = () => {
    if (!group.current || !camera) return;

    // Get world position of door model
    const doorPos = new THREE.Vector3(-3.5, -9, -30);
    // group.current.getWorldPosition(doorPos);

    // Get world position of camera
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos); // This is critical!

    const distance = camPos.distanceTo(doorPos);
    console.log('Camera Pos:', camPos);
    console.log('Door Pos:', doorPos);
    console.log('Distance:', distance);

    if (distance > 20.5) {
      console.log("Too far to interact with the door.");
      return;
    }

    if (!played && animations.length > 0) {
      const firstClip = animations[0].name;
      const action = actions[firstClip];
      if (action) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.reset().fadeIn(0.4).play();
        setPlayed(true);

        // Positional Audio
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.PositionalAudio(listener);
        sound.setBuffer(soundBuffer);
        sound.setRefDistance(5);
        sound.setVolume(1);
        group.current.add(sound);
        setTimeout(() => {
          sound.play();
        }, 100)

        // After delay
        setTimeout(() => {
          navigate('/someRandomPage');
          store.getState().session?.end();
        }, 4000);
      }
    }
  };
  return (
    <group ref={group} onClick={animations.length > 0 ? handleClick : null}  rotation={rotation}>
      <primitive ref={ref} object={scene} scale={scale} />
    </group>
  )
}

const PhysicsModel = ({ path, scale, rotation, position }) => {
  const meshRef = useRef();
  const grabSoundRef = useRef();
  const releaseSoundRef = useRef();
  const { camera } = useThree();

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    angularDamping: 0.95,
    angularFactor: [0.3, 0.3, 0.3],
  }));

  const { scene } = useGLTF(path);
  const grabBuffer = useLoader(THREE.AudioLoader, '/picking.mp3');
  const releaseBuffer = useLoader(THREE.AudioLoader, '/dropping.mp3');

  const bind = useDragConstraint(ref);

  const [wasGrabbed, setWasGrabbed] = useState(false);

  // Setup positional audio
  useEffect(() => {
    if (!meshRef.current || !camera) return;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const grabSound = new THREE.PositionalAudio(listener);
    grabSound.setBuffer(grabBuffer);
    grabSound.setRefDistance(4);
    grabSound.setVolume(1);
    grabSoundRef.current = grabSound;

    const releaseSound = new THREE.PositionalAudio(listener);
    releaseSound.setBuffer(releaseBuffer);
    releaseSound.setRefDistance(4);
    releaseSound.setVolume(1);
    releaseSoundRef.current = releaseSound;

    meshRef.current.add(grabSound);
    meshRef.current.add(releaseSound);
  }, [camera, grabBuffer, releaseBuffer]);

  // Handle grabbing and releasing sound
  useEffect(() => {
    if (bind.isGrabbed && !wasGrabbed) {
      grabSoundRef.current?.play();
    }
    if (!bind.isGrabbed && wasGrabbed) {
      releaseSoundRef.current?.play();
    }
    setWasGrabbed(bind.isGrabbed);
  }, [bind.isGrabbed, wasGrabbed]);

  // Store api for external use
  useEffect(() => {
    if (ref.current) {
      ref.current.api = api;
    }
  }, [ref, api]);

  return (
    <group ref={ref} {...bind}>
      <primitive
        ref={meshRef}
        object={scene}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    </group>
  );
};

export function Room() {
  // const { productUrl } = useParams();
  // const { search } = useLocation();

  // Parse scale query parameter
  // const searchParams = new URLSearchParams(search);
  // const scaleParam = searchParams.get("scale");
  const { shopId } = useParams();
  // const { search } = useLocation();
  const [ url, setUrl ] = useState("");
  const [ coordinateX, setCoordinateX ] = useState(1);
  const [ coordinateY, setCoordinateY ] = useState(1);
  const [ coordinateZ, setCoordinateZ ] = useState(1);
  // Parse scale query parameter
  // const searchParams = new URLSearchParams(search);
  // const scaleParam = searchParams.get("scale");
  const [ objUrl, setObjUrl ] = useState(``);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const resp = await getShopAssets(shopId);
        // const productResp = await getProductModel();

        console.log("Raw response:", resp);

        if (resp.success && resp.data?.model) {
          const { glbUrl, coordinates } = resp.data.model;
          console.log("GLB URL:", glbUrl);
          // console.log("Scale values:", coordinates);

          setUrl(glbUrl);
          // setScale([coordinates.x_scale, coordinates.y_scale, coordinates.z_scale]);
        } else {
          console.warn("No model found or response not successful");
        }
      } catch (error) {
        console.error("Failed to fetch model assets:", error);
      }
    }

    fetchAssets();
  }, [shopId]);

  return (
    <>
      <button
        style={{
          position: 'absolute',
          zIndex: 10000,
          background: 'black',
          borderRadius: '0.5rem',
          border: 'none',
          fontWeight: 'bold',
          color: 'white',
          padding: '1rem 2rem',
          cursor: 'pointer',
          fontSize: '1.5rem',
          bottom: '1rem',
          left: '50%',
          boxShadow: '0px 0px 20px rgba(0,0,0,1)',
          transform: 'translate(-50%, 0)',
      }}
      onClick={() => store.enterVR()}
    >
      Enter VR
    </button>
    <Canvas
      onPointerMissed={() => console.log("missed")}
      dpr={[1, 2]}
      shadows
      events={false}
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 5, 10] }}
    >

      <PointerEvents />
      {/* <OrbitControls /> */}
      <XR store={store}>
        <SkyDome/>
        <ambientLight intensity={0.7} />
        <pointLight position={[-20, -5, -20]} color="FFFFFF" />
        <Suspense>
          <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
            <Cursor />
            <Floor position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
            <SolidGLTFModel
              url={'../Assets/3D_Models/Room/room/scene.glb'}
              scale={[8, 8, 8]}
              position={[0, -6, 0]}
            />
            <SolidGLTFModel
              url={'../Assets/3D_Models/Room/exit/scene.glb'}
              scale={[10, 10, 10]}
              rotation={[0, Math.PI/2, 0]}
              position={[29, 10, -3.5]}
            />
            <SolidGLTFModel
              url="../Assets/3D_Models/Room/door/scene.glb"
              scale={[7, 7, 7]}
              position={[-3.5, -6, -30]}
            />
            <PhysicsModel
              path={'../../Assets/3D_Models/ShoesShop/DynamicObjects/ShoesA/scene.glb'}
              //error jijijijij
              // scale factor = 7.6
              scale={[0.008 , 0.008, 0.008]}
              isGrabbed
              position={[1, -0.5, 1]}
            />
            <Wall position={[21, 9, 0]} rotation={[0, -Math.PI / 2, 0]} />
            <Wall position={[-20.5, 9, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Wall position={[0, 9, -26]} rotation={[0, 0, 0]} />
            <Wall position={[0, 9, 25]} rotation={[0, Math.PI, 0]} />
            <RangedWall
              position={[0, -0.5, -0.1]}
              size={[12, 5, 12]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <group position={[0, -9, 0]}>
              <ControlledXROrigin />
            </group>
          </Physics>
        </Suspense>
      </XR>
      {/* <CustomCameraControls/> */}
    </Canvas>
    </>
  );
}

function ControlledXROrigin() {
  const ref = useRef()
  const tempVec = new Vector3()

  useXRControllerLocomotion(ref, { speed: 12 })

  useFrame((state) => {

    if (!ref.current) console.log("no")

    const cameraWorldPosition = state.camera.getWorldPosition(tempVec);

    const minX = -18.5, maxX = 18.5
    const minZ = -25, maxZ = 25

    const obstacleMinX = -8.743
    const obstacleMaxX = 8.743
    const obstacleMinZ = -5.099
    const obstacleMaxZ = 5.099

    const insideObstacle =
    tempVec.x >= obstacleMinX && tempVec.x <= obstacleMaxX &&
    tempVec.z >= obstacleMinZ && tempVec.z <= obstacleMaxZ

    if (insideObstacle) {
      const distToXEdge = Math.min(
        Math.abs(tempVec.x - obstacleMinX),
        Math.abs(tempVec.x - obstacleMaxX)
      )
      const distToZEdge = Math.min(
        Math.abs(tempVec.z - obstacleMinZ),
        Math.abs(tempVec.z - obstacleMaxZ)
      )

      if (distToXEdge < distToZEdge) {
        const pushX = tempVec.x < 0 ? obstacleMinX - 0.1 : obstacleMaxX + 0.1
        const deltaX = pushX - tempVec.x
        ref.current.position.x += deltaX
      } else {
        const pushZ = tempVec.z < 0 ? obstacleMinZ - 0.1 : obstacleMaxZ + 0.1
        const deltaZ = pushZ - tempVec.z
        ref.current.position.z += deltaZ
      }
    }

    const clampedX = THREE.MathUtils.clamp(tempVec.x, minX, maxX)
    const clampedZ = THREE.MathUtils.clamp(tempVec.z, minZ, maxZ)

    if (tempVec.x !== clampedX || tempVec.z !== clampedZ) {

      const deltaX = clampedX - tempVec.x;
      const deltaZ = clampedZ - tempVec.z;

      ref.current.position.x += deltaX;
      ref.current.position.z += deltaZ;

    }
  })

  return <XROrigin ref={ref} scale={10} />
}


function Floor(props) {
  const [ref] = usePlane(() => ({ type: 'Static', ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry scale={[60,60]} args={[0 ,0]}/>
      <meshPhongMaterial/>
    </mesh>
  )
}
function Wall(props) {
  const [ref] = usePlane(() => ({ type: 'Static', ...props }))
  return (
    <mesh ref={ref} receiveShadow scale={[5, 5, 0.1]}>
      <planeGeometry args={[0,0]} scale={[5, 0.1, 5]} />
      <meshPhongMaterial/>
    </mesh>
  )
}
function RangedWall({ position = [0, 5, 10], size = [13,8,24] }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: [17.5,4.5,9.5],
    position,
  }))

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[0,0,0]}/>
      <meshStandardMaterial  />
    </mesh>
  )
}
function SkyDome() {

  const texture = useTexture('/lol.jpg') 

  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <mesh scale={[-0.25, 0.25, 0.25]} position={[0,30,0]}>
      <sphereGeometry args={[400, 50, 50]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}