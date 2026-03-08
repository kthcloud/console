// @ts-nocheck

import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import { Vector3 } from "three";
import { useGLTF } from "@react-three/drei";

const url = "/static/models/brain.glb";

function BrainModel() {
  const { scene } = useGLTF(url);
  scene.traverse((obj) => {
    if (obj.material) obj.material.metalness = 0;
  });

  return <primitive object={scene}></primitive>;
}

export function BrainMesh({ mobile, position, props }) {
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const meshRef = useRef();

  const mouseMoveHandler = (event) => {
    setMouseCoordinates({
      x: event.clientX,
      y: event.clientY,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", mouseMoveHandler);
    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (mobile) {
      meshRef.current.rotation.y += delta;
    } else {
      let x = mouseCoordinates.x / window.innerWidth;
      let y = 1 - mouseCoordinates.y / window.innerHeight;
      const vector = new Vector3(x, y, 0);
      vector.unproject(camera);
      //meshRef.current.rotation.set(1 - vector.y * 20, vector.x * 10, 0);
      meshRef.current.rotation.set(1 - vector.y - 0.8, vector.x, 0);
    }
  });

  return (
    <mesh position={position} scale={0.03} ref={meshRef} {...props}>
      <BrainModel />
    </mesh>
  );
}
