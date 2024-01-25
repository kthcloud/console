import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Vector3 } from "three";

const url = "/static/models/cloud.gltf";

function CloudModel() {
  const gltf = useLoader(GLTFLoader, url);
  gltf.scene.traverse((child) => {
    if (child.material) child.material.metalness = 0;
  });

  return <primitive object={gltf.scene}></primitive>;
}

export function CloudMesh({ mobile, position, props }) {
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
      meshRef.current.rotation.set(1 - vector.y - 0.8, vector.x, 0);
    }
  });

  return (
    <mesh position={position} ref={meshRef} {...props}>
      <CloudModel />
    </mesh>
  );
}
