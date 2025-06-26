import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import {
  createXRStore,
  IfInSessionMode,
  isXRInputSourceState,
  noEvents,
  PointerEvents,
  useHover,
  useSessionFeatureEnabled,
  useXR,
  XR,
  XRLayer,
  XROrigin,
} from '@react-three/xr'
import { PositionalAudio, RoundedBox, useGLTF } from '@react-three/drei'
import {
  OrbitHandles,
  Handle,
  HandleTarget,
  createScreenCameraStore,
  PivotHandles,
} from '@react-three/handle'
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DirectionalLight,
  Euler,
  Group,
  Object3D,
  Quaternion,
  Scene as SceneImpl,
  ShaderMaterial,
  Uniform,
  Vector3,
  PositionalAudio as PAudio,
  BackSide,
} from 'three'
import { create } from 'zustand'
import {
  applyDampedScreenCameraState,
  defaultApply,
} from '@pmndrs/handle'
import { damp } from 'three/src/math/MathUtils.js'
import { getVoidObject } from '@pmndrs/pointer-events'
import { CopyPass, EffectComposer, RenderPass, ShaderPass } from 'postprocessing'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { CustomCameraControls } from '../Utils/CameraShoesShop'

function createDefaultTransformation(x, y, z) {
  return {
    position: [x, y, z],
    rotation: new Quaternion().toArray(),
    scale: [1, 1, 1],
  }
}

const useSceneStore = create(() => ({
  lightPosition: [0.3, 0.3, 0.3],
  sphereTransformation: createDefaultTransformation(-0.1, 0, 0),
  cubeTransformation: createDefaultTransformation(0.1, 0, 0),
  coneTransformation: createDefaultTransformation(0, 0, 0.1),
  selected: undefined,
}))

const cameraStore = createScreenCameraStore({ yaw: 0, distance: 0.5 })

const store = createXRStore({ emulate: { syntheticEnvironment: false } })

const buttonStyles = {
  background: 'white',
  border: 'none',
  color: 'black',
  padding: '0.5rem 1.5rem',
  cursor: 'pointer',
  fontSize: '1.5rem',
  fontFamily: 'monospace',
  bottom: '1rem',
  left: '50%',
  boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
}

export function DemoRoom() {

  const myHandleRef = useRef();


  return (
    <>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, 0)',
          bottom: '1rem',
          gap: '1rem',
          zIndex: '10000',
        }}
      >
        <button style={buttonStyles} onClick={() => store.enterVR()}>
          VR
        </button>
        <button style={buttonStyles} onClick={() => store.enterAR()}>
          AR
        </button>
      </div>
      <Canvas
        shadows="soft"
        camera={{ position: [-0.5, 0.5, 0.5] }}
        events={noEvents}
        style={{ width: '100vw', flexGrow: 1, height: '100vh' }}
      >
        <XR store={store}>
          <group pointerEventsType={{ deny: 'touch' }}>
            <AudioEffects />
            <PointerEvents />
            <XROrigin position={[0, -1, 0.5]} />
            <HandleTarget>
              <Scene isNotInRT />

              <Handle targetRef="from-context" scale={false} multitouch={false} rotate={false}>
                <Hover>
                  {(hovered) => (
                    <RoundedBox position-x={0.35} position-y={-0.05} args={[0.2, 0.2, 2]} scale={hovered ? 0.125 : 0.1}>
                      <meshStandardMaterial
                        emissiveIntensity={hovered ? 0.3 : 0}
                        emissive={0xffffff}
                        toneMapped={false}
                        color="grey"
                      />
                    </RoundedBox>
                  )}
                </Hover>
              </Handle>

              <Handle
                targetRef="from-context"
                scale={{ uniform: true }}
                multitouch={false}
                
                translate="as-rotate-and-scale"
                rotate={{ x: false, z: false }}
              >
                <Hover>
                  {(hovered) => (
                    <mesh
                      position-x={0.335}
                      position-z={0.335}
                      position-y={-0.05}
                      rotation-y={Math.PI}
                      scale={hovered ? 0.04 : 0.03}
                    >
                      <RotateGeometry />
                      <meshStandardMaterial
                        emissiveIntensity={hovered ? 0.3 : 0}
                        emissive={0xffffff}
                        toneMapped={false}
                        color="grey"
                      />
                    </mesh>
                  )}
                </Hover>
              </Handle>
              {/* <Handle
                targetRef="from-context"
                scale={{ uniform: true }}
                multitouch={false}
                
                translate="as-rotate-and-scale"
                rotate={{ x: false, z: false }}
              >
                <Hover>
                  {(hovered) => (
                    <mesh
                      position-x={0.735}
                      position-z={0.335}
                      position-y={-0.05}
                      rotation-y={Math.PI}
                      scale={hovered ? 0.04 : 0.03}
                    >
                      <RotateGeometry path='lol.glb'/>
                      <meshStandardMaterial
                        emissiveIntensity={hovered ? 0.3 : 0}
                        emissive={0xffffff}
                        toneMapped={false}
                        color="grey"
                      />
                    </mesh>
                  )}
                </Hover>
              </Handle> */}
              <CameraHelper />
            </HandleTarget>
          </group>
        </XR>
        <CustomCameraControls/>
      </Canvas>
    </>
  )
}

function RotateGeometry({path = 'rotate.glb'}) {
  const { scene } = useGLTF(path)
  console.log(path);
  console.log(scene)
  const childIndex = scene.children.length - 1
  console.log(childIndex);
  return <primitive attach="geometry" object={(scene.children[2]).geometry} />
}

const eulerHelper = new Euler()
const quaternionHelper = new Quaternion()
const vectorHelper1 = new Vector3()
const vectorHelper2 = new Vector3()
const zAxis = new Vector3(0, 0, 1)

// Create a custom ShaderMaterial for gamma correction
const myShaderMaterial = new ShaderMaterial({
  uniforms: {
    tDiffuse: new Uniform(null), // Input texture (rendered scene)
    gamma: new Uniform(2.2), // Default gamma value
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float gamma;
    varying vec2 vUv;

    void main() {
      // Sample the input texture
      vec4 color = texture2D(tDiffuse, vUv);

      // Apply gamma correction
      color.rgb = pow(color.rgb, vec3(1.0 / gamma));

      // Output the corrected color
      gl_FragColor = color;
    }
  `,
})

function CameraHelper() {
  const ref = useRef(null)
  const update = useMemo(
    () =>
      applyDampedScreenCameraState(
        cameraStore,
        () => ref.current,
        () => true,
      ),
    [],
  )
  useFrame((state, dt) => update(dt * 1000))
  const cameraGeometry = (useGLTF('camera.glb').scene.children[0]).geometry
  const hoverTargetRef = useRef(null)
  const myHandleRef = useRef();

  return (
    <HandleTarget ref={ref}>
      <Hover hoverTargetRef={hoverTargetRef}>
        {(hovered) => (
          <>
            <Handle
              targetRef="from-context"
              apply={(state) => cameraStore.getState().setCameraPosition(...state.current.position.toArray())}
              scale={false}
              multitouch={false}
              rotate={false}
            >
              <mesh ref={hoverTargetRef} scale={hovered ? 0.025 : 0.02}>
                <sphereGeometry />
                <meshStandardMaterial
                  emissiveIntensity={hovered ? 0.3 : 0}
                  emissive={0xffffff}
                  toneMapped={false}
                  color="grey"
                />
              </mesh>
            </Handle>
            <group scale-x={16 / 9} rotation-y={Math.PI}>
              <mesh position-z={0.1} scale={hovered ? 0.025 : 0.02}>
                <primitive attach="geometry" object={cameraGeometry} />
                <meshStandardMaterial
                  emissiveIntensity={hovered ? 0.3 : 0}
                  emissive={0xffffff}
                  toneMapped={false}
                  color="grey"
                />
              </mesh>
            </group>
          </>
        )}
      </Hover>
    </HandleTarget>
  )
}

function Scene({ isNotInRT = false }) {
  const lightTarget = useMemo(() => new Object3D(), [])
  const light = useMemo(() => new DirectionalLight(), [])
  light.castShadow = true
  light.shadow.camera.left = -0.5
  light.shadow.camera.right = 0.5
  light.shadow.camera.bottom = -0.5
  light.shadow.camera.top = 0.5
  light.shadow.camera.near = 0
  light.target = lightTarget
  light.position.set(0, 0, 0)
  light.intensity = 5

  const sunGeometry = (useGLTF('sun.glb').scene.children[0]).geometry

  const lightGroupRef = useRef(null)
  useEffect(() => {
    const fn = (state) => lightGroupRef.current?.position.set(...state)
    fn(useSceneStore.getState().lightPosition)
    return useSceneStore.subscribe((s) => fn(s.lightPosition))
  }, [])

  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const voidObject = getVoidObject(scene)
    const fn = () => useSceneStore.setState({ selected: undefined })
    voidObject.addEventListener('click', fn)
    return () => voidObject.removeEventListener('click', fn)
  }, [scene])

  const sunHoverTargetRef = useRef(null)

  const pivotSize = isNotInRT ? 1 : 2
  const myHandleRef = useRef();
  return (
    <>
      <ambientLight intensity={0.6} />
      <Hover hoverTargetRef={sunHoverTargetRef}>
        {(hovered) => (
          <>
            {isNotInRT && (
              <StripedLineToCenter
                color={hovered ? 'white' : 'gray'}
                width={hovered ? 0.008 : 0.005}
                fromRef={lightGroupRef}
              />
            )}
            <HandleTarget ref={lightGroupRef}>
              <primitive object={light} />
              {isNotInRT && (
                <>
                  <Handle
                    targetRef="from-context"
                    apply={(state) => useSceneStore.setState({ lightPosition: state.current.position.toArray() })}
                    scale={false}
                    multitouch={false}
                    rotate={false}
                  >
                    <mesh ref={sunHoverTargetRef} scale={hovered ? 0.025 : 0.02}>
                      <sphereGeometry />
                      <meshStandardMaterial
                        emissiveIntensity={hovered ? 0.3 : 0}
                        emissive={0xffffff}
                        toneMapped={false}
                        color="grey"
                      />
                    </mesh>
                  </Handle>
                  {/* <Handle targetRef="from-context"> */}
                  <mesh scale={(hovered ? 0.025 : 0.02) * 0.7}>
                    <primitive attach="geometry" object={sunGeometry} />
                    <meshStandardMaterial
                      emissiveIntensity={hovered ? 0.3 : 0}
                      emissive={0xffffff}
                      toneMapped={false}
                      color="grey"
                    />
                  </mesh>
                  {/* </Handle> */}
                </>
              )}
            </HandleTarget>
          </>
        )}
      </Hover>
      <CustomTransformHandles size={pivotSize} target="cone">
        <Hover>
          {(hovered) => (
            <mesh castShadow receiveShadow scale={0.1}>
              <cylinderGeometry args={[0, 1]} />
              <meshStandardMaterial
                emissiveIntensity={hovered ? 0.3 : -0.4}
                emissive="blue"
                toneMapped={false}
                color="blue"
              />
            </mesh>
          )}
        </Hover>
      </CustomTransformHandles>

      <CustomTransformHandles size={pivotSize} target="sphere">
        <Hover>
          {(hovered) => (
            <mesh castShadow receiveShadow scale={0.1}>
              <sphereGeometry />
              <meshStandardMaterial
                emissiveIntensity={hovered ? 0.3 : -0.4}
                emissive="green"
                toneMapped={false}
                color="green"
              />
            </mesh>
          )}
        </Hover>
      </CustomTransformHandles>
      <CustomTransformHandles size={pivotSize} target="cube">
        <Hover>
          {(hovered) => (
            <mesh castShadow receiveShadow scale={0.1}>
              <boxGeometry />
              <meshStandardMaterial
                emissiveIntensity={hovered ? 0.3 : -0.4}
                emissive="red"
                toneMapped={false}
                color="red"
              />
            </mesh>
          )}
        </Hover>
      </CustomTransformHandles>

      <RoundedBox receiveShadow rotation-x={Math.PI / 2} position-y={-0.05} scale={0.1} args={[6, 6, 0.1]}>
        <meshStandardMaterial toneMapped={false} color="purple" />
        <primitive object={lightTarget} />
      </RoundedBox>
    </>
  )
}

function CustomTransformHandles({
  target,
  children,
  size,
}) {
  const isInXR = useXR((s) => s.session != null)
  const targetRef = useRef(null)
  const [isBeingGrabbed, setBeingGrabbed] = useState(false)

  useEffect(() => {
    const fn = ({ position, rotation, scale }) => {
      if (targetRef.current == null) {
        return
      }
      targetRef.current.position.fromArray(position)
      targetRef.current.quaternion.fromArray(rotation)
      targetRef.current.scale.fromArray(scale)
    }
    fn(useSceneStore.getState()[`${target}Transformation`])
    return useSceneStore.subscribe((state) => fn(state[`${target}Transformation`]))
  }, [isInXR, target])

  const apply = useCallback(
    (state) => {
      useSceneStore.setState({
        [`${target}Transformation`]: {
          position: state.current.position.toArray(),
          rotation: state.current.quaternion.toArray(),
          scale: state.current.scale.toArray(),
        },
      })
    },
    [target],
  )

  useFrame(() => {
    if (isBeingGrabbed && targetRef.current) {
      // Force update transform to avoid lag when moving camera
      targetRef.current.updateMatrixWorld()
    }
  })

  return (
    <HandleTarget ref={targetRef}>
      <Handle
        targetRef="from-context"
        apply={apply}
        onDragStart={() => setBeingGrabbed(true)}
        onDragEnd={() => setBeingGrabbed(false)}
      >
        {children}
      </Handle>
    </HandleTarget>
  )
}




const SelectablePivotHandles = forwardRef(({ children, size, apply, target }, ref) => {
  const isSelected = useSceneStore((state) => state.selected === target)
  const groupRef = useRef(null)
  useHover(groupRef, (hover, e) => {

  })
  return (
    <group ref={groupRef} onClick={() => useSceneStore.setState({ selected: target })}>
      <PivotHandles
        size={size}
        enabled={isSelected}
        apply={(state, target) => applyWithAudioEffect(state, target, apply)}
        ref={ref}
      >
        {children}
      </PivotHandles>
    </group>
  )
})

function Hover({
  children,
  hoverTargetRef,
}) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  useHover(hoverTargetRef ?? ref, (hoverd, e) => {
    setHovered(hoverd)
  })
  return <group ref={ref}>{children?.(hovered)}</group>
}



extend({ MeshLineGeometry, MeshLineMaterial })

function StripedLineToCenter({
  fromRef,
  width,
  color,
}) {
  const ref = useRef(null)
  const materialRef = useRef(null)
  useFrame(() => {
    if (ref.current == null || fromRef.current == null || materialRef.current == null) {
      return
    }
    const p1 = vectorHelper1.copy(fromRef.current.position)
    const p2 = vectorHelper2.set(0, 0, 0)
    materialRef.current.dashArray = (0.8 / p1.distanceTo(p2)) * 0.02
    ref.current.position.copy(p1)
    p2.sub(p1)
    const length = p2.length()
    ref.current.quaternion.setFromUnitVectors(zAxis, p2.divideScalar(length))
    ref.current.scale.setScalar(length)
  })
  return (
    <mesh ref={ref}>
      {/*@ts-ignore*/}
      <meshLineGeometry points={[0, 0, 0, 0, 0, 1]} />
      {/*@ts-ignore*/}
      <meshLineMaterial ref={materialRef} lineWidth={width} dashArray={0.03} opacity={0.5} transparent color={color} />
    </mesh>
  )
}

const handleStartAudioEffectRef = { current: null }
const handleEndAudioEffectRef = { current: null }

function AudioEffects() {
  return (
    <>
      <PositionalAudio loop={false} ref={handleStartAudioEffectRef} url="start.mp3" />
      <PositionalAudio loop={false} ref={handleEndAudioEffectRef} url="end.mp3" />
    </>
  )
}

function applyWithAudioEffect(state, target, apply) {
  if (state.first && handleStartAudioEffectRef.current != null) {
    target.getWorldPosition(handleStartAudioEffectRef.current.position)
    handleStartAudioEffectRef.current.setVolume(0.3)
    if (handleStartAudioEffectRef.current.isPlaying) {
      handleStartAudioEffectRef.current.stop()
    }
    handleStartAudioEffectRef.current.play()
  }
  if (state.last && handleEndAudioEffectRef.current != null) {
    target.getWorldPosition(handleEndAudioEffectRef.current.position)
    handleEndAudioEffectRef.current.setVolume(0.3)
    if (handleEndAudioEffectRef.current.isPlaying) {
      handleEndAudioEffectRef.current.stop()
    }
    handleEndAudioEffectRef.current.play()
  }
  return (apply ?? defaultApply)(state, target)
}

const HandleWithAudio = forwardRef((props, ref) => {
  return <Handle {...props} apply={(state, target) => applyWithAudioEffect(state, target, props.apply)} ref={ref} />
})
