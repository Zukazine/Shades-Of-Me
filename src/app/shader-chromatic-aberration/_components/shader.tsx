import React, { useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "../shaders";
import * as THREE from "three";
import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";

type ShaderUniforms = {
  u_mouse: { value: THREE.Vector2 }
  u_prevMouse: { value: THREE.Vector2 }
  u_abberationIntensity : { value: number }
  u_texture: { value: THREE.Texture }
}

const ShaderPlane = () => {
  // REACT CONST
  const currentState = useRef<{ x: number, y: number }>({ x: 0.5, y: 0.5})
  const prevState = useRef<{ x: number, y: number }>({ x: 0.5, y: 0.5})
  const [targetState, setTargetState] = useState<{ x: number, y: number }>({ x: 0.5, y: 0.5})
  const [abberationIntensity, setAbberationIntensity] = useState<number>(0.0)
  const [easeFactor, setEaseFactor] = useState<number>(0.02)

  // THREE CONST
  const uniforms = useRef<ShaderUniforms>({
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_abberationIntensity: { value: 0 },
    u_texture: { value: new THREE.TextureLoader()
      .load("https://assets.codepen.io/9051928/palm-tree.jpg")
     },
  });

  // HELPER FUNCTION
  const smoothStep = (target: number, current: number, alpha: number): number => {
    return current + (target - current) * alpha;
  };

  console.log(easeFactor)

  // ANIMATION FUNCTION
  useFrame(() => {
    // MOUSE
    currentState.current.x = smoothStep(
      targetState.x, currentState.current.x, easeFactor
    )
    currentState.current.y = smoothStep(
      targetState.y, currentState.current.y, easeFactor
    )

    // ABBERATION
    setAbberationIntensity(Math.max(0.0, abberationIntensity - 0.05))

    // UNIFORMS
    if (uniforms.current) {
      uniforms.current.u_mouse.value.set(
        currentState.current.x,
        1.0 - currentState.current.y
      )

      uniforms.current.u_prevMouse.value.set(
        prevState.current.x, 
        1.0 - prevState.current.y
      )

      uniforms.current.u_abberationIntensity.value = abberationIntensity
    }
    
  })

  // LISTENERS
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {

    setEaseFactor(0.02)
    prevState.current.x = targetState.x
    prevState.current.y = targetState.y
    setTargetState({
      x: e.point.x,
      y: e.point.y,
    })
    setAbberationIntensity(1)
  }

  const handlePointerEnter = () => {
    setEaseFactor(0.02)
    currentState.current.x = targetState.x
    currentState.current.y = targetState.y
  }

  const handlePointerLeave = () => {
    setEaseFactor(0.5)
    setTargetState({
      x: prevState.current.x,
      y: prevState.current.y,
    })
  }

  return (
      <mesh
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[2,2]}/>
        <shaderMaterial
          uniforms={uniforms.current}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
  )
}

export const Shader = () => {
  return (
    <Canvas camera={{
        position: [0,0,1]
      }}
    >
      <ShaderPlane />
      <GizmoHelper
        alignment="bottom-right"
        margin={[80, 80]}
      >
        <GizmoViewport axisColors={['red', 'green', 'blue']} />
      </GizmoHelper>
      <OrbitControls makeDefault />
    </Canvas>
  )
}