import {
  Environment,
  Float,
  Gltf,
  Scroll,
  Stats,
  useDetectGPU,
  useScroll,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  GodRays,
  Noise,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { useRef, useState } from "react";
import { AdditiveBlending } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils.js";
import { StarrySky } from "./StarrySky";
import { WawaCard } from "./WawaCard";
import { WawaCoin } from "./WawaCoin";
import Cursor from "./Cursor";
import Comets from "./Comets";

export const Experience = () => {
  const [sun, setSun] = useState();

  const transmissionSettings = useControls("Transmission Settings", {
    // https://codesandbox.io/p/sandbox/ju368j?file=%2Fsrc%2FApp.js%3A75%2C8
    backside: false,
    samples: { value: 16, min: 1, max: 32, step: 1 },
    resolution: { value: 128, min: 64, max: 2048, step: 64 },
    transmission: { value: 0.95, min: 0, max: 1 },
    roughness: { value: 0.42, min: 0, max: 1, step: 0.01 },
    clearcoat: { value: 1, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.2, min: 0, max: 200, step: 0.01 },
    backsideThickness: { value: 200, min: 0, max: 200, step: 0.01 },
    ior: { value: 1.25, min: 1, max: 5, step: 0.01 },
    chromaticAberration: { value: 0.25, min: 0, max: 1 },
    anisotropy: { value: 0, min: 0, max: 10, step: 0.01 },
    distortion: { value: 0, min: 0, max: 1, step: 0.01 },
    distortionScale: { value: 0.2, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0, min: 0, max: 1, step: 0.01 },
    attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: "#ffffff",
    color: "#ffffff",
  });
  const viewport = useThree((state) => state.viewport);

  const {tier,isMobile} = useDetectGPU()

  return (
    <>
    {tier !== 0 && !isMobile && <Cursor/>}
      <Lights sun={sun} />
      <StarrySky nbParticles={600} />
      <Scroll>
        <Comets nTrails={tier === 0 || isMobile ? 20 : 42}/>
        <Float
          position-x={2}
          position-z={5}
          position-y={-viewport.height}
          floatIntensity={3}
          speed={4}
          rotationIntensity={0}
          rotation-x={degToRad(90)}
          rotation-y={degToRad(30)}
        >
          <group scale={1}>
            <WawaCoin scale={5} transmissionSettings={transmissionSettings} />
          </group>
        </Float>
        <Float floatIntensity={3} speed={2} position-y={-viewport.height * 2}>
          <Gltf src="/models/stylized_planet.glb" scale={4} />
          {/* "Stylized planet" (https://skfb.ly/oyDUw) by cmzw is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/). */}
        </Float>
        <Float
          floatIntensity={3}
          rotationIntensity={1}
          speed={2}
          position-y={-viewport.height * 3}
        >
          <group scale={1} position-z={5} position-y={1}>
            <WawaCard
              rotation-x={degToRad(70)}
              rotation-z={degToRad(20)}
              scale={3}
              transmissionSettings={transmissionSettings}
            />
          </group>
        </Float>
      </Scroll>
      {/* <Stats /> */}
      <Environment preset="sunset" />

      <mesh position-z={-20} position-y={-25}>
        <sphereGeometry args={[20, 64, 64]} />
        <meshPhysicalMaterial color="#191929" />
      </mesh>
      <mesh rotation-x={degToRad(0)} ref={setSun}>
        <circleGeometry args={[55, 64, 64]} />
        <meshBasicMaterial color="#e4c64e" />
      </mesh>
      {sun && (
        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={1} mipmapBlur />
          <Noise blendFunction={AdditiveBlending} opacity={0.04} />
          <GodRays sun={sun} exposure={0.5} decay={.8} blur />
        </EffectComposer>
      )}
    </>
  );
};

const Lights = ({ sun }) => {
  const dirLight = useRef();
  const data = useScroll();

  useFrame(() => {
    if (dirLight.current) {
      dirLight.current.position.y = lerp(5, 20, data.range(0, 1 / 4));
      dirLight.current.position.x = lerp(0, 20, data.range(1 / 4, 1 / 4));
      dirLight.current.position.z = lerp(-20, 20, data.range(2 / 4, 1 / 4));
    }
    if (sun) {
      sun.position.y = lerp(-80, -72, data.range(0, 1 / 4));
      sun.position.x = lerp(0, 5, data.range(1 / 4, 1 / 4));
      sun.position.z = lerp(-100, -100, data.range(2 / 4, 1 / 4));
    }
  });
  return (
    <>
      <pointLight
        position-z={1}
        position-x={-1}
        position-y={1}
        intensity={4}
        color="red"
        distance={10}
      />
      <pointLight
        position-z={-5}
        position-x={1}
        position-y={1}
        intensity={10}
        distance={12}
        color="blue"
      />
      <directionalLight
        ref={dirLight}
        position={[-20, 20, -20]}
        intensity={4}
        color={"#e4c64e"}
      />
    </>
  );
};
