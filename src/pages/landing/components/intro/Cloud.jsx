import { Canvas } from "@react-three/fiber";
import { CloudMesh } from "./CloudMesh";
import * as THREE from "three";

export function Cloud({ mobile, position }) {

  return (
    <Canvas
      height={mobile ? "250px" : "100%"}
      width="100%"
      style={
        !mobile && {
          position: "absolute",
          top: "0",
          left: "0",
        }
      }
    >
      <ambientLight intensity={0.5}/>
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} color={"#faa"} />
      <directionalLight position={[-5, 5, 5]} intensity={1} color={"#aaf"} />

      <CloudMesh
        mobile={mobile}
        position={position}
        props={{
          material: new THREE.MeshBasicMaterial({
            color: "yellow",
            flatShading: true,
          }),
        }}
      />
    </Canvas>
  );
}
