import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshStandardMaterial } from "three";

const CoinMesh = ({ radius, material, spin }) => {
  const meshRef = useRef();
  const [direction, setDirection] = useState(Math.random() > 0.5 ? 1 : -1);
  const [goBack, setGoBack] = useState(false);

  useFrame((_, delta) => {
    if (spin && !goBack) {
      meshRef.current.rotation.z += direction * delta;
      if (meshRef.current.rotation.z >= 0.5) {
        setDirection(-1);
        setGoBack(true);
      }
      if (meshRef.current.rotation.z <= -0.5) {
        setDirection(1);
        setGoBack(true);
      }
    } else {
      if (meshRef.current.rotation.z > 0) meshRef.current.rotation.z -= 0.01;
      if (meshRef.current.rotation.z < 0) meshRef.current.rotation.z += 0.01;

      if (
        meshRef.current.rotation.z < 0.01 &&
        meshRef.current.rotation.z > -0.01 && !spin
      ) {
        meshRef.current.rotation.z = 0;
        setGoBack(false);
      }
    }
  });

  return (
    <group ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry
          position={[0, 0, 0]}
          args={[radius, radius, 0.5, 100]}
        />
        <primitive object={material} />
      </mesh>
    </group>
  );
};

export const Coin = ({ tier, spin }) => {
  let material;

  switch (tier) {
    case "platinum":
      material = new MeshStandardMaterial({
        color: "white",
        metalness: 0.8,
        roughness: 0.2,
      });
      break;
    case "gold":
      material = new MeshStandardMaterial({
        color: "gold",
        metalness: 0.9,
        roughness: 0.2,
      });
      break;
    case "silver":
      material = new MeshStandardMaterial({
        color: "silver",
        metalness: 0.8,
        roughness: 0.2,
      });
      break;
    case "bronze":
      material = new MeshStandardMaterial({
        color: "darkgoldenrod",
        metalness: 0.9,
        roughness: 0.5,
      });
      break;
    default:
      material = new MeshStandardMaterial({
        color: "gray",
        metalness: 0.1,
        roughness: 0.8,
      });
  }

  return (
    <Canvas style={{ width: "150px", margin: "auto" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} color={"#fffecc"} />
      <directionalLight position={[5, -5, 5]} intensity={1} color={"#faa"} />
      <directionalLight position={[-5, 5, 5]} intensity={1} color={"#aaf"} />
      <camera position={[0, 0, 5]} />

      <CoinMesh
        position={[0, 0, 0]}
        radius={3}
        material={material}
        spin={spin}
      />
    </Canvas>
  );
};
