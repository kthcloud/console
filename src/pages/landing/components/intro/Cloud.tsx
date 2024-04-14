/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";
import { CloudMesh } from "./CloudMesh";
import * as THREE from "three";

export function Cloud({
  mobile,
  position,
}: {
  mobile: boolean;
  position: number[];
}) {
  return (
    <Canvas
      style={
        mobile
          ? { height: "250px", width: "100%" }
          : {
              position: "absolute",
              top: "0",
              left: "0",
              height: "100%",
              width: "100%",
            }
      }
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} color={"#fffecc"} />
      <directionalLight position={[5, -5, 5]} intensity={1} color={"#faa"} />
      <directionalLight position={[-5, 5, 5]} intensity={1} color={"#aaf"} />

      <CloudMesh
        mobile={mobile}
        position={position}
        props={{
          material: new THREE.MeshBasicMaterial({
            color: "yellow",
          }),
        }}
      />
    </Canvas>
  );
}
