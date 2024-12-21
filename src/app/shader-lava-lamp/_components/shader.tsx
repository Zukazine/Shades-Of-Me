import React, { useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "../shaders";
import * as THREE from "three";
import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";

const myPalettes = ['#FFF9F5', '#7AAABC', '#FFF9F5', '#FFF9F5', '#39515A']

type shaderMaterial = {
  u_time: { value: number }
  u_color: { value: THREE.ColorRepresentation[]}
}

const ShaderPlane = () => {
  const colorsPlane = myPalettes.map((color: THREE.ColorRepresentation) => new THREE.Color(color))
  console.log(colorsPlane)
    
  const uniforms = useRef<shaderMaterial>({
    u_time: { value: 0 },
    u_color: { value: colorsPlane }
  })
  
  const clock = useRef(new THREE.Clock());

  useFrame(() => {
    if (uniforms.current) {
      uniforms.current.u_time.value = clock.current.getElapsedTime() * 0.01
    }
  })

  return (
    <mesh>
      <planeGeometry args={[4,4,600,600]}/>
      <shaderMaterial 
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe={false}
        side={2}
      />
    </mesh>
  )
} 

export const Shader = () => {
  return (
    <div className="w-full h-full border border-red-500">
      <Canvas
        camera={{
          position: [0, 0, 1],
        }}
      >
        <ShaderPlane />
        <GizmoHelper>
          <GizmoViewport />
        </GizmoHelper>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}