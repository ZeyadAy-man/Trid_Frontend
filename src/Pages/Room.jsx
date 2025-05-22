import { OrbitControls, useGLTF } from '@react-three/drei'
import { useFrame, Canvas } from '@react-three/fiber'
import { useRef, Suspense, useMemo, createRef, useCallback, useEffect } from 'react'
import { useXR, createXRStore, noEvents, useXRControllerLocomotion, XR, XROrigin, PointerEvents } from '@react-three/xr'
import { Physics, useBox, usePlane, useTrimesh } from '@react-three/cannon'
import { Vector3 } from 'three'
import { usePointToPointConstraint, useSphere } from '@react-three/cannon'

import * as THREE from 'three'
import { useParams } from 'react-router-dom'

export const cursor = createRef()

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

  const { productUrl } = useParams()
  console.log("URL is " + productUrl);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      store.enterAR();
    }, 3000)

    return () => clearTimeout(timeout);
  }, [])
  return (
    <>
      <Canvas
        onPointerMissed={() => console.log('missed')}
        dpr={[1, 2]}
        shadows
        events={noEvents}
        style={{width: '100vw', height: '100vh'}}
        camera={{position: [0,5,10]}}
      >
        <PointerEvents />
        <OrbitControls />
        <XR store={store}>
          <ambientLight intensity={0.7} />
          <pointLight position={[-20, -5, -20]} color="FFFFFF" />
          <Suspense>
            <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
              <Cursor />


              {/* Don't change cursor, floor, wall, rangedWall, or controlledXROrigin at any cost!!!*/}


              <Floor position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]} /> 
              <SolidGLTFModel url={'../Assets/3D_Models/Room/scene.glb'} scale={[8,8,8]} position={[0,-6,0]}/>
              <PhysicsModel path={productUrl} scale={[1, 1, 1]} position={[1, -0.5, 1]}/>
              <Wall position={[21,9,0]} rotation={[0, -Math.PI / 2, 0]}/>
              <Wall position={[-20.5,9,0]} rotation={[0, Math.PI / 2, 0]}/>
              <Wall position={[0,9,-26]} rotation ={[0, 0, 0]}/>
              <Wall position={[0,9,25]} rotation ={[0, Math.PI , 0]}/>
              <RangedWall position={[0, -0.5,-0.1]} size={[12,5,12]} rotation={[-Math.PI / 2, 0, 0]}/>
              <group position={[0, -9, 0]}>
                <ControlledXROrigin />
              </group>
            </Physics>
          </Suspense>
        </XR>
      </Canvas>
    </>
  )
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
