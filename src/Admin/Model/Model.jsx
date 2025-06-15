import styles from '../Model/Model.module.css'
import { useNavigate } from 'react-router-dom';
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import { deleteProduct } from '../../Service/productsService';
import { getProduct } from '../../Service/productsService';
import { updateProduct } from '../../Service/productsService';
import { createProduct } from '../../Service/productsService';
import { Pencil, Trash2 } from 'lucide-react';
// import '../../../Assets/3D_Models/Bags/Bag1/scene.glb'
const products = [
  { id: 1, title: "Car", glb: "/lol.glb" },
  { id: 2, title: "Sun", glb: "/sun.glb" },
  { id: 3, title: "Bag", glb: '../../../Assets/3D_Models/Bags/Bag1/scene.glb'},
  { id: 4, title: "Bag", glb: '../../../Assets/3D_Models/Bags/Bag2/scene.glb'},
  { id: 5, title: "Bag", glb: '../../../Assets/3D_Models/Bags/Bag3/scene.glb'},
  { id: 6, title: "Car", glb: "/lol.glb" },
  { id: 7, title: "Sun", glb: "/sun.glb" },
  { id: 8, title: "Bag", glb: '../../../Assets/3D_Models/Bags/Bag1/scene.glb'},
  { id: 9, title: "Bag", glb: '../../../Assets/3D_Models/Bags/Bag2/scene.glb'},
  { id: 10, title: "Bag", glb: '../../../Assets/3D_Models/Bags/Bag3/scene.glb'},
];

const Model = () => {
    const navigate = useNavigate();
    
    const handleNavigate = () => {
        navigate('./create-model')
    }
    return (
        <div className={styles.containerOfModelPage}>

            <div className={styles.headerSection} style={{width: '100%'}}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <div>
                            <h1 className={styles.pageTitle}>Models Management</h1>
                            <p className={styles.pageSubtitle}>
                                Manage your models
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.createModelAndNumberProductContainer}>
              <div className={styles.productCountBox}>
                <span className={styles.countLabel}>
                  🧮 You currently have 
                  <span className={styles.productCount}> {products.length} </span> 
                  awesome product{products.length !== 1 ? 's' : ''}!
                </span>
              </div>
              <button className={styles.createModelButton} onClick={handleNavigate}>Add New Model</button>
            </div>
            <div className={styles.containerOfCards}>
                {products.map(({id, glb, title}) => 
                    <ShowCard key={id} modelUrl={glb} title={title}/>
                ) }
            </div>
        </div>
    );
}


function ShowModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}

function ShowCard({ title, modelUrl }) {

  

  return (
    <div className={styles.card}>
      <div className={styles.canvasContainer}>
        <Canvas camera={{ position: [0, 0, 5], fov: 30 }} frameloop="demand">
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
              <ShowModel url={modelUrl} />
            </Stage>
            <OrbitControls enableZoom={false} />
          </Suspense>
        </Canvas>
      </div>
      <div className={styles.cardInfo}>
        <h3>{title}</h3>
        <div className={styles.containerOfShowCardButtons}>
            <button className={`${styles.coolButton} ${styles.edit}`}>
              <Pencil size={16} style={{ marginRight: '6px' }} />
              Edit
            </button>

            <button className={`${styles.coolButton} ${styles.delete}`}>
              <Trash2 size={16} style={{ marginRight: '6px' }} />
              Delete
            </button>
        </div>
      </div>
    </div>
  );
}

export default Model;
