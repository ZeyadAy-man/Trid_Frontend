//Completed

import { useGLTF } from "@react-three/drei";
export default function LoadingModels({path, position = [0,0,0], rotation = [0,0,0], scale = [1,1,1]}){
    const {scene} = useGLTF(path);
    return (
        <primitive object={scene} position={position} rotation={rotation} scale={scale}/>
    );
}