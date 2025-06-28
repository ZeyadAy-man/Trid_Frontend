import { useThree, useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useRef } from 'react';

const roomBounds = { minX: -3.2, maxX: 1.2, minZ: 0.38, maxZ: 4 };
const tables = [
  { minX: -2.3, maxX: -1.5, minZ: 2.1, maxZ: 4 },
  { minX: -0.45, maxX: 0.38, minZ: 2.1, maxZ: 4 }
];

const WORLD_ROTATION_Y = -Math.PI / 6; // Your world is rotated -30 degrees

function isInsideBox(pos, box) {
  return (
    pos.x >= box.minX &&
    pos.x <= box.maxX &&
    pos.z >= box.minZ &&
    pos.z <= box.maxZ
  );
}

export function CustomCameraControls(isFinished) {
  const { camera, gl } = useThree();
  const [keys, setKeys] = useState({});
  const hasInitialized = useRef(false);

  
  if(isFinished){
    camera.rotateX(0);
    camera.rotateY(0);
    camera.rotateZ(0);
  }
  
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const direction = useRef(new THREE.Vector3(0, 0, 0));
  const yaw = useRef(0);
  const pitch = useRef(0);

  const targetYaw = useRef(0);
  const targetPitch = useRef(0);

  const currentSpeed = useRef(0);
  const maxSpeed = 0.5;
  const acceleration = 15;
  const deceleration = 20;

  const bobbingAmplitude = 0.015;
  const bobbingFrequency = 8;
  const bobbingTime = useRef(0);

  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  const stepSoundBuffer = useLoader(THREE.AudioLoader, '/footstep.mp3');
  const stepAudio = useRef(null);
  const timeSinceLastStep = useRef(0);

  useEffect(() => {
    function onKeyDown(e) {
      setKeys((k) => ({ ...k, [e.code]: true }));
    }
    function onKeyUp(e) {
      setKeys((k) => ({ ...k, [e.code]: false }));
    }
    function onMouseDown(e) {
      isDragging.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseUp() {
      isDragging.current = false;
    }
    function onMouseMove(e) {
      if (!isDragging.current) return;
      const movementX = e.clientX - prevMousePos.current.x;
      const movementY = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.003;

      targetYaw.current -= movementX * sensitivity;
      targetPitch.current -= movementY * sensitivity;

      const maxPitch = Math.PI / 2 * 0.99;
      if (targetPitch.current > maxPitch) targetPitch.current = maxPitch;
      if (targetPitch.current < -maxPitch) targetPitch.current = -maxPitch;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [gl.domElement]);

  useEffect(() => {
    if (!stepAudio.current) {
      const listener = new THREE.AudioListener();
      camera.add(listener);
      stepAudio.current = new THREE.PositionalAudio(listener);
      camera.add(stepAudio.current);
      stepAudio.current.setBuffer(stepSoundBuffer);
      stepAudio.current.setRefDistance(1);
      stepAudio.current.setVolume(0.3);
    }
  }, [camera, stepSoundBuffer]);

  useFrame((_, delta) => {
    
    if (!hasInitialized.current) {

      camera.position.set(-1.15, 1.6, 3.7); // Set initial camera position

      camera.rotation.order = 'YXZ';
      hasInitialized.current = true;
    }

    const lerpFactor = 10 * delta
    yaw.current += (targetYaw.current - yaw.current) * lerpFactor
    pitch.current += (targetPitch.current - pitch.current) * lerpFactor
    
      direction.current.set(0, 0, 0)
      if (keys['KeyW']) direction.current.z -= 1
      if (keys['KeyS']) direction.current.z += 1
      if (keys['KeyA']) direction.current.x -= 1
      if (keys['KeyD']) direction.current.x += 1
      direction.current.normalize()
  
      if (direction.current.length() > 0) {
        currentSpeed.current += acceleration * delta
        if (currentSpeed.current > maxSpeed) currentSpeed.current = maxSpeed
      } else {
        currentSpeed.current -= deceleration * delta
        if (currentSpeed.current < 0) currentSpeed.current = 0
      }
  
      velocity.current
        .copy(direction.current)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
        .multiplyScalar(currentSpeed.current * delta)
  
      const nextPos = camera.position.clone().add(velocity.current)
  
      nextPos.x = Math.max(roomBounds.minX, Math.min(roomBounds.maxX, nextPos.x))
      nextPos.z = Math.max(roomBounds.minZ, Math.min(roomBounds.maxZ, nextPos.z))
  
      const collision = tables.some((table) => isInsideBox(nextPos, table))
  
      if (!collision) {
        camera.position.copy(nextPos)
      }
  
      if (currentSpeed.current > 0.1) {
        bobbingTime.current += delta * bobbingFrequency
        camera.position.y = 1.6 + Math.sin(bobbingTime.current) * bobbingAmplitude
  
        // Play step sound every 0.4 seconds
        timeSinceLastStep.current += delta
        if (timeSinceLastStep.current > 0.7) {
          if (stepAudio.current && stepAudio.current.buffer) {
            const newStep = new THREE.PositionalAudio(stepAudio.current.listener); // reuse listener
            newStep.setBuffer(stepAudio.current.buffer);
            newStep.setRefDistance(1);
            newStep.setVolume(0.3);
            newStep.setPlaybackRate(0.9 + Math.random() * 0.2); // optional realism
            camera.add(newStep); // attach to camera
            newStep.play();

            // Optional cleanup after playback
            setTimeout(() => {
              camera.remove(newStep);
            }, 1000);
          }
          timeSinceLastStep.current = 0;
        }
      } else {
        bobbingTime.current = 0
        camera.position.y = 1.6
        camera.rotation.x = 0
        camera.rotation.y = 0
        camera.rotation.z = 0
        timeSinceLastStep.current = 0
        if (stepAudio.current && stepAudio.current.isPlaying) {
          stepAudio.current.stop()
        }
      }
  
      camera.rotation.order = 'YXZ'
      camera.rotation.y = yaw.current
      camera.rotation.x = pitch.current
      camera.rotation.z = 0;
    })

  return null;
}