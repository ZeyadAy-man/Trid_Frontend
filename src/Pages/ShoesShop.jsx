import { Suspense, useMemo } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { 
    PATH_TO_SHOESSHOP_MODEL,
    SHOES_CONFIGURATIONS,
    SHOESSHOP_SHOP_POSITION,
    SHOESSHOP_SHOP_ROTATION,
    SHOESSHOP_SHOP_SCALE,
    AMBIENT_LIGHT_INTENSITY,
    FLOOR_SIZE,
    FLOOR_COLOR,
} from '../Constants/ShoesShop';
import loader from '../Utils/Loader/Loader';
const ShoeItem = ({ path, position, rotation, scale }) => {
    const { scene } = useGLTF(path);
    
    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        clone.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clone;
    }, [scene]);

    return (
        <primitive
            object={clonedScene}
            position={position}
            rotation={rotation}
            scale={scale}
        />
    );
};

const ShoesDisplay = () => {
    const uniqueShoePaths = [...new Set(SHOES_CONFIGURATIONS.map(shoe => shoe.path))];
    
    uniqueShoePaths.forEach(path => {
        useGLTF.preload(path);
    });
    useGLTF.preload(PATH_TO_SHOESSHOP_MODEL);

    return (
        <>
            {SHOES_CONFIGURATIONS.map((shoe, index) => (
                <Suspense key={`shoe-${index}`} fallback={null}>
                    <ShoeItem 
                        path={shoe.path}
                        position={shoe.position}
                        rotation={shoe.rotation}
                        scale={shoe.scale}
                    />
                </Suspense>
            ))}
        </>
    );
};

export default function ShoesShop() {
    const { scene: shoesShopModel } = useGLTF(PATH_TO_SHOESSHOP_MODEL);

    shoesShopModel.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes("door")) {
                child.material.color.set("#C4A484");
                child.material.roughness = 0.4;
                child.material.metalness = 0.1;
            }
        }
    });

    return (
        <>
            <Suspense fallback={<loader/>}>
                <ambientLight intensity={AMBIENT_LIGHT_INTENSITY * 0.7} color="#ffffff" />
                <pointLight position={[0, 5, 0]} intensity={30} distance={12} decay={2} color="#ffffff" castShadow />
                <pointLight position={[3, 4, 3]} intensity={15} distance={8} decay={2} color="#ffffff" />
                <pointLight position={[-3, 4, 3]} intensity={15} distance={8} decay={2} color="#ffffff" />
                <pointLight position={[3, 4, -3]} intensity={15} distance={8} decay={2} color="#ffffff" />
                <pointLight position={[-3, 4, -3]} intensity={15} distance={8} decay={2} color="#ffffff" />
                <spotLight position={[2, 3, 0]} intensity={15} angle={Math.PI/5} penumbra={0.5} distance={10} color="#ffffff" castShadow />
                <spotLight position={[-2, 3, 0]} intensity={15} angle={Math.PI/5} penumbra={0.5} distance={10} color="#ffffff" castShadow />

                <Physics gravity={[0, -9.81, 0]}>
                    <Suspense fallback={null}>
                        <RigidBody type="fixed">
                            <primitive 
                                object={shoesShopModel} 
                                position={SHOESSHOP_SHOP_POSITION} 
                                rotation={SHOESSHOP_SHOP_ROTATION} 
                                scale={SHOESSHOP_SHOP_SCALE} 
                                castShadow 
                                receiveShadow 
                            />
                        </RigidBody>

                        <ShoesDisplay />

                        <RigidBody type="fixed">
                            <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
                                <planeGeometry args={FLOOR_SIZE} />
                                <meshStandardMaterial color={FLOOR_COLOR} roughness={0.3} metalness={0.1} />
                            </mesh>
                        </RigidBody>
                    </Suspense>
                </Physics>

                <fog attach="fog" args={['#e0e0e0', 10, 50]} />
                <color attach="background" args={['#D9D9D9']} />
                <OrbitControls />
            </Suspense>
        </>
    );
}