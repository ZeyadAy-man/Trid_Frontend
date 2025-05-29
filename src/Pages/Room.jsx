import { OrbitControls, useGLTF } from '@react-three/drei'
import { useFrame, Canvas } from '@react-three/fiber'
import { useRef, Suspense, useMemo, createRef, useCallback, useEffect } from 'react'
import { useXR, createXRStore, noEvents, useXRControllerLocomotion, XR, XROrigin, PointerEvents } from '@react-three/xr'
import { Physics, useBox, usePlane, useTrimesh } from '@react-three/cannon'
import { Vector3 } from 'three'
import { usePointToPointConstraint, useSphere } from '@react-three/cannon'
import { getProductModel } from '../Service/productsService'
import * as THREE from 'three'
import { useLocation, useParams } from 'react-router-dom'
import { useState } from 'react'
import { getShopAssets } from '../Service/shopService'
import Loader from '../Utils/Loader/Loader'
export const cursor = createRef()

const modelUrl = 'https://test911.blob.core.windows.net/shop-products/54%2F18%2FglbFile.glb?sv=2025-05-05&spr=https&se=2025-05-30T09%3A05%3A15Z&sr=b&sp=r&sig=RlYi%2F8Ur1DTSIYvs2%2FqbeDCIAABp03ARhNrthRZsHaM%3D&rscd=attachment%3B%20filename%3DglbFile.glb';

let grabbingPointerId = undefined
const grabbedPosition = new Vector3()

export function useDragConstraint(child) {
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] })
  useEffect(() => void api.disable(), [])
  const onPointerUp = useCallback((e) => {
    if (grabbingPointerId == null) {
      return
    }
    grabbingPointerId = undefined
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
    api.disable()
  }, [])
  const onPointerDown = useCallback((e) => {
    if (grabbingPointerId != null) {
      return
    }
    grabbingPointerId = e.pointerId
    grabbedPosition.copy(e.point)
    document.body.style.cursor = 'grabbing'
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    api.enable()
  }, [])
  const onPointerMove = useCallback((e) => {
    if (grabbingPointerId != e.pointerId) {
      return
    }
    grabbedPosition.copy(e.point)
  })
  return { onPointerUp, onPointerMove, onPointerDown }
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

function SolidGLTFModel({ url, position, scale }) {
  const { nodes } = useGLTF(url)
  console.log(nodes);
  const geometry = useMemo(() => {
    let geom
    Object.values(nodes).forEach((node) => {
      if (node.isMesh) {
        geom = node.geometry
      }
    })
    return geom
  }, [nodes])

  const vertices = useMemo(() => geometry.attributes.position.array, [geometry])
  const indices = useMemo(() => geometry.index.array, [geometry])
  const [ref] = useTrimesh(() => ({
    mass: 300,
    args: [vertices, indices],
    position,
    type: 'Static'
  }))

  return (<primitive ref={ref} object={nodes[Object.keys(nodes)[0]]} scale={scale}/>)
}

const PhysicsModel = ({path, scale, rotation, position}) => {
  const [ref] = useBox(() => ({
    mass: 1,
    position: position,
  }))

  const { scene } = useGLTF(path);
  const bind = useDragConstraint(ref)
  return (
    <group ref={ref} {...bind}>
      <primitive ref={ref} object={scene} position={position} rotation={rotation} scale={scale}/>
    </group>
  );
}

export function Room() {
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


  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     store.enterAR();
  //   }, 3000);
  //   return () => clearTimeout(timeout);
  // }, []);

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
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <PointerEvents />
        <OrbitControls />
        <ambientLight intensity={0.8} color="#ffffff" />
        
        <directionalLight
          position={[10, 20, 10]}
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0001}
        />
        
        <directionalLight
          position={[-10, 10, -10]}
          intensity={0.8}
          color="#ffffff"
        />
        
        <pointLight
          position={[5, 5, 0]}
          intensity={1.5}
          distance={20}
          decay={1}
          color="#ffffff"
          castShadow
        />
        
        <pointLight
          position={[0, 15, 0]}
          intensity={1}
          distance={30}
          decay={1}
          color="#ffffff"
        />

        <fog attach="fog" args={["#ffffff", 10, 30]} />
        <color attach="background" args={["#ffffff"]} />

        <XR store={store}>
          <Suspense fallback={(<><OrbitControls/><Loader/></>)}>
            <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
              <Cursor />
              <Floor position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
              <SolidGLTFModel
                url={url}
                scale={[8.2, 8.2, 8.2]}
                position={[1, -7.5, 1]}
              />
              <PhysicsModel
                path={modelUrl}
                scale={[0.8, 0.8, 0.8]}
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
      </Canvas>
    </>
  );
}

function ControlledXROrigin() {
  const ref = useRef()
  const { player } = useXR()
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
      <meshStandardMaterial 
        color="#f5f5f5" 
        roughness={0.1} 
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
function Wall(props) {
  const [ref] = usePlane(() => ({ type: 'Static', ...props }))
  return (
    <mesh ref={ref} receiveShadow scale={[5, 5, 0.1]}>
      <planeGeometry args={[0,0]} scale={[5, 0.1, 5]} />
      <meshStandardMaterial 
        color="#f5f5f5" 
        roughness={0.1} 
        metalness={0.1}
        side={THREE.DoubleSide}
      />
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
      <meshStandardMaterial 
        color="#f5f5f5" 
        roughness={0.1} 
        metalness={0.1}
      />
    </mesh>
  )
}
