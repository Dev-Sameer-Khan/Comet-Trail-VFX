import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import React from "react";
import { useRef } from "react";
import {Vector3} from 'three/src/Three.Core'
import SimpleTrail from "./SimpleTrail";

const Cursor = () => {
  const target = useRef();

  const { size, color, intensity, opacity } = useControls("Cursor", {
    size: { value: 0.2, min: 0.1, max: 3, step: 0.01 },
    color: "#dfbcff",
    intensity: { value: 4.6, min: 4.6, max: 10, step: 0.1 },
    opacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
  });

  const tempVec = new Vector3(0, 0, 0);
  const { viewport } = useThree();

  useFrame(({ pointer }, delta) => {
    if (target.current) {
      tempVec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0,
      );

      target.current.position.lerp(tempVec, delta * 12);
    }
  });

  return (
    <>
    <group ref={target}>
      <mesh visible={false}>
        <sphereGeometry args={[size / 2, 32, 32]} />
        <meshStandardMaterial
          transparent
          color={color}
          opacity={opacity}
          emissive={color}
          emissiveIntensity={intensity}
        />
      </mesh>
    </group>
          <SimpleTrail
          target={target}
          color={color}
          intensity={intensity}
          opacity={opacity}
          height={size}
        />
    </>
  );
};

export default Cursor;
