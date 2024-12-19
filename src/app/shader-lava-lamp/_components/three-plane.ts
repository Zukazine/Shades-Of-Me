import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ShaderMaterial, PlaneGeometry, Mesh } from "three";

const ThreePlane = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const elapsed = state.clock.getElapsedTime();
      meshRef.current.rotation.x = 0.2 * elapsed;
      meshRef.current.rotation.y = 0.1 * elapsed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 128, 128]} />
      <shaderMaterial
        attach="material"
        args={[
          {
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec2 vUv;
              void main() {
                gl_FragColor = vec4(vUv, 0.0, 1.0);
              }
            `,
            uniforms: {
              progress: { value: 0 },
            },
            wireframe: true,
          },
        ]}
      />
    </mesh>
  );
};

export default ThreePlane;
