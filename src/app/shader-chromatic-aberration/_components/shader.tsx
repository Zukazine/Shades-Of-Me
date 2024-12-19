import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "../shaders";
import * as THREE from "three";
import { GizmoHelper, GizmoViewport, OrbitControls, PerspectiveCamera } from "@react-three/drei";

type ShaderUniforms = {
  u_mouse: { value: THREE.Vector2 }
  u_prevMouse: { value: THREE.Vector2 }
  u_abberationIntensity : { value: number }
  u_texture: { value: THREE.Texture }
}

export const Shader = () => {
  const uniforms = useRef<ShaderUniforms>({
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_abberationIntensity: { value: 0 },
    u_texture: { value: new THREE.TextureLoader()
      .load("https://assets.codepen.io/9051928/palm-tree.jpg")
     },
  });

  return (
    <Canvas camera={{
      position: [0,0,1]
    }}>
      <mesh>
        <planeGeometry args={[2,2]}/>
        <shaderMaterial
          uniforms={uniforms.current}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
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

