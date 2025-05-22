import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

export function CameraControls() {
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  const speed = 0.05;
  const direction = new THREE.Vector3();
  const velocity = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(-0.93, 1.2, 3.989);
    camera.lookAt(-1.05, 1.2, 2.19);
  }, [camera]);

  // console.log(camera.position);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': setMoveForward(true); break;
        case 's': setMoveBackward(true); break;
        case 'a': setMoveLeft(true); break;
        case 'd': setMoveRight(true); break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': setMoveForward(false); break;
        case 's': setMoveBackward(false); break;
        case 'a': setMoveLeft(false); break;
        case 'd': setMoveRight(false); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wall boundaries
  const wallBounds = {
    minX: -3.2,
    maxX: 1.2,
    minZ: 0.38,
    maxZ: 4
  };

  // Table 1 bounding box
  const table1 = {
    minX: -0.45,
    maxX: 0.38,
    minZ: 2.1,
    maxZ: 4
  };

  // Table 2 bounding box
  const table2 = {
    minX: -2.3,
    maxX: -1.5,
    minZ: 2.1,
    maxZ: 4
  };

  const collidesWith = (x, z, bounds) => (
    x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ
  );

  useFrame(() => {
    direction.set(0, 0, 0);
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, camera.up).normalize();

    if (moveForward) direction.add(forward);
    if (moveBackward) direction.sub(forward);
    if (moveLeft) direction.sub(right);
    if (moveRight) direction.add(right);

    direction.normalize();
    velocity.copy(direction).multiplyScalar(speed);

    const nextX = camera.position.x + velocity.x;
    const nextZ = camera.position.z + velocity.z;

    const insideWalls =
      nextX >= wallBounds.minX && nextX <= wallBounds.maxX &&
      nextZ >= wallBounds.minZ && nextZ <= wallBounds.maxZ;

    const collides = collidesWith(nextX, nextZ, table1) || collidesWith(nextX, nextZ, table2);

    if (insideWalls && !collides) {
      camera.position.x = nextX;
      camera.position.z = nextZ;
    }
  });

  return <PointerLockControls />;
}
