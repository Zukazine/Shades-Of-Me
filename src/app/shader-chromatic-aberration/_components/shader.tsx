import React, { useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "../shaders";
import * as THREE from "three";
import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";

type ShaderUniforms = {
  u_mouse: { value: THREE.Vector2 };
  u_prevMouse: { value: THREE.Vector2 };
  u_aberrationIntensity: { value: number };
  u_texture: { value: THREE.Texture };
};

const ShaderPlane = () => {
  // REACT STATE
  const [targetState, setTargetState] = useState({ x: 0.5, y: 0.5 });
  const [aberrationIntensity, setAberrationIntensity] = useState(0.0);
  const [easeFactor, setEaseFactor] = useState(0.02);

  // REACT REFS (for mutable values that shouldn't cause re-renders)
  const currentState = useRef({ x: 0.5, y: 0.5 });
  const prevState = useRef({ x: 0.5, y: 0.5 });

  // THREE UNIFORMS
  const uniforms = useRef<ShaderUniforms>({
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_aberrationIntensity: { value: 0 },
    u_texture: {
      value: new THREE.TextureLoader().load(
        "https://assets.codepen.io/9051928/palm-tree.jpg"
      ),
    },
  });

  // HELPER FUNCTION
  const smoothStep = (target: number, current: number, alpha: number): number =>
    current + (target - current) * alpha;

  // ANIMATION FUNCTION
  useFrame(() => {
    // MOUSE SMOOTHING
    currentState.current.x = smoothStep(targetState.x, currentState.current.x, easeFactor);
    currentState.current.y = smoothStep(targetState.y, currentState.current.y, easeFactor);

    // ABERRATION INTENSITY DECAY
    setAberrationIntensity((intensity) => Math.max(0.0, intensity - 0.05));

    // UPDATE UNIFORMS
    if (uniforms.current) {
      uniforms.current.u_mouse.value.set(currentState.current.x, currentState.current.y);
      uniforms.current.u_prevMouse.value.set(prevState.current.x, prevState.current.y);
      uniforms.current.u_aberrationIntensity.value = aberrationIntensity;
    }
  });

  // EVENT HANDLERS
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    setEaseFactor(0.02);
    prevState.current.x = targetState.x;
    prevState.current.y = targetState.y;
    setTargetState({
      x: e.point.x,
      y: e.point.y,
    });
    setAberrationIntensity(1);
  };

  const handlePointerEnter = () => {
    setEaseFactor(0.02);
    currentState.current.x = targetState.x;
    currentState.current.y = targetState.y;
  };

  const handlePointerLeave = () => {
    setEaseFactor(0.05);
    setTargetState({ ...prevState.current });
  };

  return (
    <mesh
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export const Shader = () => {
  return (
    <Canvas
      camera={{
        position: [0, 0, 1],
      }}
    >
      <ShaderPlane />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={["red", "green", "blue"]} />
      </GizmoHelper>
      <OrbitControls makeDefault />
    </Canvas>
  );
};
