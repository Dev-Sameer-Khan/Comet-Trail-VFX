import { Trail, useScroll } from "@react-three/drei";
import React, { useMemo, useRef } from "react";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import {
  lerp,
  randFloat,
  randFloatSpread,
  randInt,
} from "three/src/math/MathUtils";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { Color, AdditiveBlending } from "three";
import { Vector3 } from "three/src/Three.Core";
import { distance } from "three/src/nodes/math/MathNode";

extend({ MeshLineMaterial, MeshLineGeometry });

const Comets = ({ nTrails = 42 }) => {
  const comets = useMemo(
    () =>
      new Array(nTrails).fill(0).map(() => {
        const size = randFloat(1, 3);
        return {
          size,
          length: randInt(2, 4),
          color: [
            "#fc7de7",
            "#b485ee",
            "#618fff",
            "#61ffdb",
            "#61ff93",
            "#faff61",
            "#ff6161",
            "#ffffff",
            "#ec824d",
            "#eff0b1",
          ][randInt(0, 9)],
          startPosition: [randFloatSpread(20), 0, 0],
          orbitSpeed: (2 / size) * (randInt(0, 1) || -1),
          coinSpeed: (15 / size) * (randInt(0, 1) || -1),
          radius: randFloat(4, 6),
          planetOrbitSpeed: (4 / size) * (randInt(0, 1) || -1),
          planetOrbitRotation: [
            randFloatSpread(Math.PI),
            randFloatSpread(Math.PI),
            0,
          ],
        };
      }),
    [],
  );

  return (
    <>
      {comets.map((props, i) => (
        <Comet key={i} {...props} />
      ))}
    </>
  );
};

export default Comets;

const Comet = ({
  length,
  size,
  color,
  startPosition,
  orbitSpeed,
  coinSpeed,
  radius,
  planetOrbitSpeed,
  planetOrbitRotation,
}) => {
  const ref = useRef();
  const group = useRef();

  const temVec = new Vector3(0, 0, 0);
  const LERP_SPEED = 10;

  const emissive = useMemo(() => {
    const newCol = new Color(color);
    newCol.multiplyScalar(20);
    return newCol;
  }, [color]);

  const data = useScroll();
  const { viewport } = useThree();

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    const smoothDelta = Math.min(0.1, delta)
    let target = 0;

    if (ref.current) {
      const coinMode = data.visible(1 / 4, 1 / 4);
      const planetMode = data.visible(2 / 4, 1 / 4);
      const cardMode = data.visible(3 / 4, 1 / 4);

      if (coinMode) {
        target = -viewport.height;
        temVec.x = Math.cos(time * coinSpeed) * radius;
        temVec.y = Math.sin(time * coinSpeed) * radius;
        temVec.z = 0;
      } else if (planetMode) {
        target = -viewport.height * 2;
        temVec.x = Math.cos(time * planetOrbitSpeed) * radius;
        temVec.y = Math.sin(time * planetOrbitSpeed) * radius;
        temVec.z = 0;
      } else if (cardMode) {
        target = -viewport.height * 3;
        temVec.x = Math.cos(time * orbitSpeed) * viewport.width;
        temVec.y = Math.sin(time * orbitSpeed * 8) * 2;
        temVec.z = -2 + Math.cos(time * orbitSpeed);
      } else {
        temVec.x = startPosition[0];
        temVec.y = Math.sin(time * orbitSpeed) * 20;
        temVec.z = -5 + Math.cos(time * orbitSpeed) * 80;
      }

      const distance = ref.current.position.distanceTo(temVec);
      const lerpFactor = Math.min(1, Math.max(0.005, 10/distance))

      ref.current.position.lerp(temVec, smoothDelta * LERP_SPEED * lerpFactor);
      group.current.position.y = lerp(
        group.current.position.y,
        target,
        smoothDelta * LERP_SPEED,
      );
      group.current.rotation.x = lerp(
        group.current.rotation.x,
        planetMode ? planetOrbitRotation[0] : 0,
        smoothDelta * LERP_SPEED,
      );
      group.current.rotation.y = lerp(
        group.current.rotation.y,
        planetMode ? planetOrbitRotation[1] : 0,
        smoothDelta * LERP_SPEED,
      );
    }
  });

  return (
    <group ref={group}>
      <Trail
        width={size}
        length={length}
        decay={1}
        local={false}
        stride={0}
        interval={1}
        color={color}
        attenuation={(width) => width}
      >
        <mesh ref={ref} position={startPosition}>
          <sphereGeometry args={[size / 50]} />
          <meshStandardMaterial
            transparent
            color={emissive}
            emissive={emissive}
            emissiveIntensity={1}
            blending={AdditiveBlending}
   
            toneMapped={false}
            side={2}
          />
        </mesh>
      </Trail>
    </group>
  );
};
