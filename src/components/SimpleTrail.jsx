import { useFrame } from "@react-three/fiber";
import React from "react";
import { useMemo } from "react";
import { useRef } from "react";
import { Color, Vector3 } from "three/src/Three.Core";

const SimpleTrail = ({
  target = null,
  color = "#fff",
  intensity = 6,
  numPoints = 20,
  height = 0.42,
  minDistance = 0.1,
  opacity = 0.5,
  duration = 20,
}) => {
  const mesh = useRef();

  const position = useRef(new Array(numPoints).fill(new Vector3(0, 0, 0)));
  const lastUnshift = useRef(Date.now());

  useFrame(() => {
    if (target.current || mesh.current) {
      const curPoint = target.current.position;
      const lastPoint = position.current[0];

      const disToLastPoint = lastPoint.distanceTo(curPoint);
      if (disToLastPoint < minDistance) {
        if (Date.now() - lastUnshift.current > duration) {
          position.current.unshift(lastPoint);
          position.current.pop();
          lastUnshift.current = Date.now();
        }
      } else {
        position.current.pop();
        position.current.unshift(curPoint.clone());
      }

      const geometry = mesh.current.geometry;
      const postionAttr = geometry.getAttribute("position");

      for (let index = 0; index < numPoints; index++) {
        const points = position.current[(position.current.length - 1, index)];
        postionAttr.setXYZ(
          index * 2,
          points.x,
          points.y - height / 2,
          points.z,
        );
        postionAttr.setXYZ(
          index * 2 + 1,
          points.x,
          points.y + height / 2,
          points.z,
        );
      }
      postionAttr.needsUpdate = true;
    }
  });

  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uOpacity: { value: opacity },
      uIntensity: { value: intensity },
    }),
    [color, opacity, intensity],
  );

  const vertex = /* glsl*/ `
    varying vec2 vUv;
    void main(){
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
    }
  `;

  const fragment = /* glsl*/ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    float alpha = smoothstep(1.0, 0.5, vUv.y) * smoothstep(0.5, 1.0, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
    gl_FragColor = vec4(uColor * uIntensity, alpha * uOpacity);
  }
`;
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, 1, numPoints - 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        side={2}
      />
    </mesh>
  );
};

export default SimpleTrail;
