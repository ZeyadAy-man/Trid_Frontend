import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useXR, useXRControllerLocomotion, XROrigin } from '@react-three/xr'
import { Vector3 } from 'three'

export function MovementController() {
  const { player, isPresenting } = useXR()
  const direction = new THREE.Vector3()

  useFrame(() => {
    if (!isPresenting) return

    const session = navigator.xr?.getSession?.()
    if (!session) return

    for (const source of session.inputSources) {
      const gp = source.gamepad
      if (!gp || gp.axes.length < 2) continue

      const [x, y] = gp.axes
      if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) continue // deadzone

      // Set movement direction (invert Y so pushing forward moves forward)
      direction.set(x, 0, -y).normalize().multiplyScalar(0.05)

      // Align with headset direction
      const head = player.children[0] // camera is first child
      const quaternion = head.quaternion.clone()
      direction.applyQuaternion(quaternion)

      player.position.add(direction)
    }
  })

  return null
}


export function ControlledXROrigin() {
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