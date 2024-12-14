'use client'

import { useRef, useEffect } from "react";
import * as THREE from "three";

const AnimatedImage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let planeMesh: THREE.Mesh;
    let animationFrameId: number;

    const currentState = { mousePosition: { x: 0, y: 0 }, waveIntensity: 0.005 };
    const targetState = { mousePosition: { x: 0, y: 0 }, waveIntensity: 0.005 };

    const ANIMATION_CONFIG = {
      transitionSpeed: 0.03,
      baseIntensity: 0.005,
      hoverIntensity: 0.009,
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
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
    `;

    const initializeScene = (texture: THREE.Texture) => {
      // Set up camera
      camera = new THREE.PerspectiveCamera(
        80,
        containerRef.current!.offsetWidth / containerRef.current!.offsetHeight,
        0.01,
        10
      );
      camera.position.z = 1;

      // Set up scene
      scene = new THREE.Scene();

      // Shader uniforms
      const shaderUniforms = {
        u_time: { value: 1.0 },
        u_mouse: { value: new THREE.Vector2() },
        u_intensity: { value: currentState.waveIntensity },
        u_texture: { value: texture },
      };

      // Create plane mesh
      planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: shaderUniforms,
          vertexShader,
          fragmentShader,
        })
      );
      scene.add(planeMesh);

      // Set up renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(
        containerRef.current!.offsetWidth,
        containerRef.current!.offsetHeight
      );
      renderer.domElement.className = "wave-canvas"; // Add the class to the canvas
      containerRef.current!.appendChild(renderer.domElement);

      containerRef.current!.addEventListener("mousemove", handleMouseMove);
    };

    const animateScene = () => {
      animationFrameId = requestAnimationFrame(animateScene);

      currentState.mousePosition.x = updateValue(
        targetState.mousePosition.x,
        currentState.mousePosition.x,
        ANIMATION_CONFIG.transitionSpeed
      );

      currentState.mousePosition.y = updateValue(
        targetState.mousePosition.y,
        currentState.mousePosition.y,
        ANIMATION_CONFIG.transitionSpeed
      );

      currentState.waveIntensity = updateValue(
        targetState.waveIntensity,
        currentState.waveIntensity,
        ANIMATION_CONFIG.transitionSpeed
      );

      const uniforms = (planeMesh.material as THREE.ShaderMaterial).uniforms;
      uniforms.u_intensity.value = currentState.waveIntensity;
      uniforms.u_time.value += 0.005;
      uniforms.u_mouse.value.set(
        currentState.mousePosition.x,
        currentState.mousePosition.y
      );

      renderer.render(scene, camera);
    };

    const updateValue = (
      target: number,
      current: number,
      speed: number
    ): number => current + (target - current) * speed;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      targetState.mousePosition.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetState.mousePosition.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseOver = () => {
      targetState.waveIntensity = ANIMATION_CONFIG.hoverIntensity;
    };

    const handleMouseOut = () => {
      targetState.waveIntensity = ANIMATION_CONFIG.baseIntensity;
      targetState.mousePosition = { x: 0, y: 0 };
    };

    // Load texture from the existing image element
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageRef.current!.src, () => {
      initializeScene(texture);
      animateScene();
    });

    containerRef.current!.addEventListener("mouseover", handleMouseOver);
    containerRef.current!.addEventListener("mouseout", handleMouseOut);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      containerRef.current!.removeEventListener("mousemove", handleMouseMove);
      containerRef.current!.removeEventListener("mouseover", handleMouseOver);
      containerRef.current!.removeEventListener("mouseout", handleMouseOut);
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      id="wave-imageContainer"
      ref={containerRef} 
      className="relative w-[600px] h-[800px] overflow-hidden flex justify-center items-center rounded-lg filter saturate-[.3] transition-all duration-500 ease-in-out hover:saturate-100">
      <img
        ref={imageRef}
        src="https://assets.codepen.io/9051928/retro.jpg"
        alt="Wave"
        className="hidden"
      />
    </div>
  );
};

export default AnimatedImage;
