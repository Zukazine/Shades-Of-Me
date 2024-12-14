  import React, { useRef, useState } from "react";
  import { Canvas, useFrame } from "@react-three/fiber";
  import * as THREE from "three";

  const ANIMATION_CONFIG = {
    transitionSpeed: 0.03,
    baseIntensity: 0.005,
    hoverIntensity: 0.009,
  };

  type TargetState = {
    mousePosition: { x: number; y: number };
    waveIntensity: number;
  };

  type ShaderUniforms = {
    u_time: { value: number };
    u_mouse: { value: THREE.Vector2 };
    u_intensity: { value: number };
    u_texture: { value: THREE.Texture };
  };

  const ShaderPlane: React.FC<{ texture: THREE.Texture }> = ({ texture }) => {
    const planeRef = useRef<THREE.Mesh>(null);

    const uniforms = useRef<ShaderUniforms>({
      u_time: { value: 1.0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_intensity: { value: ANIMATION_CONFIG.baseIntensity },
      u_texture: { value: texture },
    });

    const [targetState, setTargetState] = useState<TargetState>({
      mousePosition: { x: 0, y: 0 },
      waveIntensity: ANIMATION_CONFIG.baseIntensity,
    });

    const currentState = useRef<TargetState>({
      mousePosition: { x: 0, y: 0 },
      waveIntensity: ANIMATION_CONFIG.baseIntensity,
    });

    const updateValue = (target: number, current: number, speed: number): number => {
      return current + (target - current) * speed;
    };

    useFrame(() => {
      // Smoothly interpolate state
      currentState.current.mousePosition.x = updateValue(
        targetState.mousePosition.x,
        currentState.current.mousePosition.x,
        ANIMATION_CONFIG.transitionSpeed
      );
      currentState.current.mousePosition.y = updateValue(
        targetState.mousePosition.y,
        currentState.current.mousePosition.y,
        ANIMATION_CONFIG.transitionSpeed
      );
      currentState.current.waveIntensity = updateValue(
        targetState.waveIntensity,
        currentState.current.waveIntensity,
        ANIMATION_CONFIG.transitionSpeed
      );

      // Update uniforms
      if (uniforms.current) {
        uniforms.current.u_time.value += 0.005;
        uniforms.current.u_mouse.value.set(
          currentState.current.mousePosition.x,
          currentState.current.mousePosition.y
        );
        uniforms.current.u_intensity.value = currentState.current.waveIntensity;
      }
    });

    return (
      <mesh
        ref={planeRef}
        onPointerMove={(event) => {
          setTargetState((prev) => ({
            ...prev,
            mousePosition: {
              x: event.point.x,
              y: event.point.y,
            },
          }));
        }}
        onPointerOver={() =>
          setTargetState((prev) => ({
            ...prev,
            waveIntensity: ANIMATION_CONFIG.hoverIntensity,
          }))
        }
        onPointerOut={() =>
          setTargetState((prev) => ({
            ...prev,
            waveIntensity: ANIMATION_CONFIG.baseIntensity,
            mousePosition: { x: 0, y: 0 },
          }))
        }
      >
        <planeGeometry args={[6, 6, 3, 3]}/>
        <shaderMaterial
          uniforms={uniforms.current}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_intensity;
            uniform sampler2D u_texture;
            varying vec2 vUv;

            void main() {
              vec2 uv = vUv;
              float wave1 = sin(uv.x * 10.0 + u_time * 0.5 + u_mouse.x * 5.0) * u_intensity;
              float wave2 = sin(uv.y * 12.0 + u_time * 0.8 + u_mouse.y * 4.0) * u_intensity;
              float wave3 = cos(uv.x * 8.0 + u_time * 0.5 + u_mouse.x * 3.0) * u_intensity;
              float wave4 = cos(uv.y * 9.0 + u_time * 0.7 + u_mouse.y * 3.5) * u_intensity;

              uv.y += wave1 + wave2;
              uv.x += wave3 + wave4;

              gl_FragColor = texture2D(u_texture, uv);
            }
          `}
        />
      </mesh>
    );
  };

  const App: React.FC = () => {
    const texture = new THREE.TextureLoader().load(
      "https://assets.codepen.io/9051928/retro.jpg"
    );

    return (
      <div 
        id="wave-imageContainer"
        className="relative size-[700px] overflow-hidden flex justify-center items-center rounded-lg"
      >
        <Canvas className="wave-canvas filter saturate-[.3] transition-all duration-500 ease-in-out hover:saturate-100">
          <ShaderPlane texture={texture} />
        </Canvas>
      </div>  
    );
  };

  export default App;
