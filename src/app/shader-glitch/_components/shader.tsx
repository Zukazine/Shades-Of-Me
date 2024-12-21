import React, { useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "../shaders";
import * as THREE from "three";
import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";

type ShaderUniforms = {
  tDiffuse: { value: THREE.Texture}
  glitchIntensity: { value: number}
}

const ANIMATION_CONFIG = {
  updateFrequency: 0.1,
  glitchIntensityMod: 0.5
}

const ShaderPlane = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [hoverDuration, setHoverDuration] = useState<number>(0) 

  const uniforms = useRef<ShaderUniforms>({
    tDiffuse: {
      value: new THREE.TextureLoader().load("https://assets.codepen.io/9051928/glitch.png")
    },
    glitchIntensity: { value: 0.0 }
  })

  useFrame(() => {
    if (isHovered) {
      setHoverDuration((prev) => 
        prev + ANIMATION_CONFIG.updateFrequency)
      
      if (hoverDuration >= 0.5) {
        setHoverDuration(0)
        uniforms.current.glitchIntensity.value = Math.random()
      }
    } 
  })

  return (
    <mesh
      onPointerOver={() => {
        setIsHovered(true)
      }}
      onPointerOut={() => {
        setIsHovered(false)
        uniforms.current.glitchIntensity.value = 0
      }}
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
    <div className="w-[600px] h-[600px] border border-white">
      <Canvas
        camera={{
          position: [0, 0, 1],
        }}
      >
        <ShaderPlane />  
      </Canvas>
    </div>
  )
}