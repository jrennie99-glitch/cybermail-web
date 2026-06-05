"use client";

/**
 * Animated WebGL gradient mesh — Vercel/Linear/Arc-style background.
 * A full-screen plane with a custom GLSL fragment shader that paints
 * a slowly-drifting multi-color radial gradient with noise dithering.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform float uTime;
  uniform vec2  uRes;
  varying vec2 vUv;

  // 2D noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }

  // Color palette
  vec3 cyan    = vec3(0.0,  0.898, 1.0);
  vec3 violet  = vec3(0.486, 0.302, 1.0);
  vec3 magenta = vec3(1.0,  0.0,   0.784);
  vec3 dark    = vec3(0.016, 0.027, 0.051);

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    // Three drifting blobs
    vec2 c1 = vec2(0.3 + 0.15 * sin(t * 1.2), 0.35 + 0.10 * cos(t * 0.9));
    vec2 c2 = vec2(0.7 + 0.12 * sin(t * 0.7 + 2.0), 0.45 + 0.18 * cos(t * 1.1 + 1.0));
    vec2 c3 = vec2(0.5 + 0.18 * cos(t * 0.5 + 3.0), 0.75 + 0.12 * sin(t * 1.3));

    float d1 = smoothstep(0.55, 0.0, distance(uv, c1));
    float d2 = smoothstep(0.55, 0.0, distance(uv, c2));
    float d3 = smoothstep(0.55, 0.0, distance(uv, c3));

    vec3 col = dark;
    col = mix(col, cyan    * 0.85, d1 * 0.7);
    col = mix(col, violet  * 0.85, d2 * 0.55);
    col = mix(col, magenta * 0.7,  d3 * 0.35);

    // Subtle noise dithering to avoid banding
    float n = noise(uv * 1200.0 + t * 60.0);
    col += (n - 0.5) * 0.015;

    // Vignette
    float v = smoothstep(1.1, 0.4, distance(uv, vec2(0.5, 0.5)));
    col *= mix(0.55, 1.0, v);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Plane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );
  useFrame((state) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
      />
    </mesh>
  );
}

export default function GradientMesh() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Plane />
      </Canvas>
    </div>
  );
}
