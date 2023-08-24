import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment } from "@react-three/drei";
import { Vector3 } from "three";

const url = process.env.PUBLIC_URL + "/static/models/cloud.gltf";

function CloudModel() {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene}></primitive>;
}

export function Cloud(props) {
  const meshRef = useRef();
  useFrame((state, delta) => (meshRef.current.rotation.y += delta));

  useFrame(({ camera, mouse }) => {
    const vector = new Vector3(mouse.x, mouse.y, 0);
    vector.unproject(camera);
    meshRef.current.rotation.set(1 - vector.y - 0.8, vector.x, 0);
  });
  return (
    <mesh {...props} ref={meshRef}>
      <CloudModel />
      <Environment preset="sunset" />
    </mesh>
  );
}
