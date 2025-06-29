import { 
  useGLTF,
  useTexture,
  useAnimations
} from '@react-three/drei'

import { Stage } from '@react-three/drei'

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
  PointerEvents,
  useXR,
   
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
  getProductModel, 
  getShopProducts
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
  getAllShops,
  getShopAssets, 
  getShopDetails
} from '../Service/shopService'
import Loader from '../Utils/Loader/Loader'
import { getModel } from '../Service/adminService'

export const cursor = createRef()

let grabbingPointerId = undefined
const grabbedPosition = new Vector3()

export function useDragConstraint(child, maxDistance = 15) {
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
          window.history.back();
          setTimeout(() => {
            window.location.reload();
          }, 100);
          store.getState().session?.end();
        }, 4100);
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

  useTwoHandRotation(meshRef);
  
  const { scene } = useGLTF(path);
  const grabBuffer = useLoader(THREE.AudioLoader, '/picking.mp3');
  const releaseBuffer = useLoader(THREE.AudioLoader, '/dropping.mp3');

  const bbox = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { size, center };
  }, [scene]);

  const [ref, api] = useBox(() => ({
    mass: 1,
    args: [scale[0] * 5, scale[1] * 1, scale[2] * 5],
    position: [
      position[0] + bbox.center.x * scale[0],
      position[1] + bbox.center.y * scale[1],
      position[2] + bbox.center.z * scale[2],
    ],
    angularDamping: 0.9,
    angularFactor: [0.3, 0.3, 0.3],
  }));

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
    <group ref={ref} {...bind} args={scale}>
      <primitive
        ref={meshRef}
        object={scene}
        position={position}
        rotation={rotation}
        scale={scale}
      />
      <UniversalStickyGrab objectRef={ref}/>
    </group>
  );
};


export function Room() {

  const { shopName, shopId } = useParams();

  const [ productUrl, setProductUrl ] = useState(); 
  const [ scaleXProduct, setScaleXProduct ] = useState(NaN)
  const [ scaleYProduct, setScaleYProduct ] = useState(NaN)
  const [ scaleZProduct, setScaleZProduct ] = useState(NaN)

  const [ shopUrl, setShopUrl ] = useState()
  const [ shopCoordinates, setShopCoordinates ] = useState();

  const [ doorUrl, setDoorUrl ] = useState()
  const [ doorCoordinates, setDoorCoordinates ] = useState();

  const [ signUrl, setSignUrl ] = useState()
  const [ signCoordinates, setSignCoordinates ] = useState();

  useEffect(() => {
    async function fetchAssets() {
      
      try {
        const respProduct = await getProductModel(shopId);
        console.log(respProduct);
        if (respProduct.success && respProduct.data?.glbUrl) {
          setProductUrl(respProduct.data.glbUrl);
          setScaleXProduct(respProduct.data.coordinates.x_scale);
          setScaleYProduct(respProduct.data.coordinates.y_scale);
          setScaleZProduct(respProduct.data.coordinates.z_scale);            
        } else {
          console.warn("No model found or response not successful");
        }
      } catch (error) {
        console.error("Failed to fetch model assets:", error);
      }
    }
    fetchAssets();
  }, []);
  useEffect(() => {
    async function fetchAssets(){
      try{
        const respSign = await getModel(107);
        if(respSign){
          setSignUrl(respSign.data.model.glbUrl);
          setSignCoordinates(respSign.data.model.coordinates);
        }
      }catch(error){
        console.error(error)
      }
    }
    fetchAssets();
  }, [signUrl])

  useEffect(() => {
    async function fetchAssets(){
      try{
        const respDoor = await getModel(106);
        console.log(respDoor.data.model.coordinates)
        if(respDoor){
          setDoorUrl(respDoor.data.model.glbUrl);
          setDoorCoordinates(respDoor.data.model.coordinates);
        }
      }catch(error){
        console.error(error)
      }
    }
    fetchAssets();
  }, [doorUrl])

  let factor;

  useEffect(() => {
    async function fetchAssets(){
      try{
        const shopModel = await getModel(108)
        // const respFactor = await getShopAssets(34);

        if(shopModel){
          setShopUrl(shopModel.data.model.glbUrl);
          setShopCoordinates(shopModel.data.model.coordinates);
          console.log(shopCoordinates);
        }
      }catch(error){
        console.error(error)
      }
    }
    fetchAssets()
  }, [shopUrl])
  
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
      camera={{ position: [0, 8, 10] }}
      contactEquationRelaxation={4} 
      contactEquationStiffness={1e6}

    >
      <Suspense fallback={<Loader/>}>
          <PointerEvents />
            <XR store={store}>
              <SkyDome/>
              <ambientLight intensity={0.7} position={[3,0,3]}/>
              <directionalLight 
                castShadow
                position={[10, 20, 10]} 
                intensity={1.2} 
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
              />
              <pointLight position={[-20, -5, -20]} color="FFFFFF" />
              <Suspense fallback={<Loader/>}>
                <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
                  <Cursor />
                  <Floor position={[0, -7, 0]} rotation={[-Math.PI / 2, 0, 0]} />
                  {(shopUrl && shopCoordinates) ? <SolidGLTFModel
                    receiveShadow
                    url={shopUrl}
                    scale={[shopCoordinates.x_scale, shopCoordinates.y_scale, shopCoordinates.z_scale]}
                    position={[shopCoordinates.x_pos, shopCoordinates.y_pos - 9, shopCoordinates.z_pos]}
                  /> : null}
                  {(signCoordinates && signUrl) ? <SolidGLTFModel
                    url={signUrl}
                    scale={[signCoordinates.x_scale, signCoordinates.y_scale, signCoordinates.z_scale]}
                    rotation={[signCoordinates.x_rot, signCoordinates.y_rot, signCoordinates.z_rot]}
                    position={[signCoordinates.x_pos, signCoordinates.y_pos - 3, signCoordinates.z_pos]}
                  /> : null}
                  {(doorCoordinates && doorUrl) ? <SolidGLTFModel
                    url={doorUrl}
                    scale={[doorCoordinates.x_scale, doorCoordinates.y_scale, doorCoordinates.z_scale]}
                    position={[doorCoordinates.x_pos, doorCoordinates.y_pos - 3, doorCoordinates.z_pos]}
                  /> : null}
                  {(productUrl && scaleXProduct && scaleYProduct && scaleZProduct) ? <PhysicsModel
                    path={productUrl}
                    scale={[scaleXProduct * 11, scaleYProduct * 11, scaleZProduct * 11]}
                    isGrabbed
                    position={[0, -3, 0]}
                  /> : null}
                  <Wall position={[21, 9, 0]} rotation={[0, -Math.PI / 2, 0]} />
                  <Wall position={[-20.5, 9, 0]} rotation={[0, Math.PI / 2, 0]} />
                  <Wall position={[0, 9, -26]} rotation={[0, 0, 0]} />
                  <Wall position={[0, 9, 25]} rotation={[0, Math.PI, 0]} />
                  <RangedWall
                    position={[0, -3.5, -0.1]}
                    size={[12, 5, 12]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                  {/* <group position={[2, -3.5, 7]}> */}
                    <ControlledXROrigin />
                  {/* </group> */}
                </Physics>
              </Suspense>
            </XR>
        </Suspense>
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

  return <XROrigin ref={ref} scale={10} position={[0, -7.5, 0]}/>
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
    args: [16.5,3.3,9.5],
    position,
  }))

  return (
    <mesh ref={ref} args={[0,0,0]} castShadow receiveShadow>
      <boxGeometry/>
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

function useTwoHandRotation(ref) {
  const { controllers } = useXR();
  const prevAngle = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    function getControllerWorldPos(controller) {
      const pos = new THREE.Vector3();
      controller.controller.getWorldPosition(pos);
      return pos;
    }

  function getRotationAngleBetweenControllers(controllers) {
    if (!Array.isArray(controllers) || controllers.length < 2) {
      return 0; // or return early
    }

    const [left, right] = controllers;

    const dirBefore = new THREE.Vector3().subVectors(right.prevPos, left.prevPos).normalize();
    const dirAfter = new THREE.Vector3().subVectors(right.pos, left.pos).normalize();

    return dirBefore.angleTo(dirAfter);
  }


    let mounted = true;

    const animate = () => {
      // if (!mounted || controllers.length < 2 || !ref.current) return;

      const angle = getRotationAngleBetweenControllers();
      if (angle !== null && prevAngle.current !== null && ref) {
        const delta = angle - prevAngle.current;
        ref.current.rotation.y += delta;
      }
      prevAngle.current = angle;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mounted = false;
    };
  }, [controllers, ref]);
}

function UniversalStickyGrab({ objectRef }) {
  const { isPresenting, controllers = [] } = useXR() || {}

  const grabbingController = useRef(null)
  const isStickyGrabbing = useRef(false)

  const dragEvents = useDragConstraint(objectRef) // fallback for desktop

  // Bind VR grab events if a real controller is found
  useEffect(() => {
    const controller = controllers.find(c => !!c.controller)?.controller
    if (!isPresenting || !controller || !objectRef.current?.api) return

    const handleGrab = () => {
      grabbingController.current = controller
      isStickyGrabbing.current = true
      objectRef.current.api.mass?.set?.(0)
    }

    const handleRelease = () => {
      isStickyGrabbing.current = false
      grabbingController.current = null
      objectRef.current.api.mass?.set?.(1)
    }

    controller.addEventListener('selectstart', handleGrab)
    controller.addEventListener('selectend', handleRelease)

    return () => {
      controller.removeEventListener('selectstart', handleGrab)
      controller.removeEventListener('selectend', handleRelease)
    }
  }, [isPresenting, controllers, objectRef])

  // Stick object to controller position in VR
  useFrame(() => {
    if (isStickyGrabbing.current && grabbingController.current && objectRef.current?.api) {
      const pos = new THREE.Vector3()
      const quat = new THREE.Quaternion()
      grabbingController.current.getWorldPosition(pos)
      grabbingController.current.getWorldQuaternion(quat)
      objectRef.current.api.position.copy(pos)
      objectRef.current.api.quaternion.copy(quat)
    }
  })

  // Return pointer-based dragging if not in VR
  return !isPresenting ? <group {...dragEvents} /> : null
}