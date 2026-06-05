"use client";

/**
 * Hero 3D scene — a glowing wireframe envelope made of cyan light,
 * floating in a particle field, slowly rotating. Mouse-look parallax.
 * Bloom post-processing for the premium "trillion dollar" glow.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Envelope built from line segments — wireframe of light. */
function Envelope() {
  const group = useRef<THREE.Group>(null);

  // Build the geometry once
  const { lineGeom, fillGeom, boltGeom } = useMemo(() => {
    // Envelope corners (centered at origin, in XY plane)
    const w = 3.2;
    const h = 2.0;
    const x0 = -w / 2;
    const y0 = -h / 2;
    const x1 = w / 2;
    const y1 = h / 2;
    const mid = 0;

    // Envelope wireframe segments — outer rect + flap V
    const points: number[] = [];
    const seg = (a: [number, number], b: [number, number]) => {
      points.push(a[0], a[1], 0, b[0], b[1], 0);
    };
    seg([x0, y0], [x1, y0]); // bottom
    seg([x1, y0], [x1, y1]); // right
    seg([x1, y1], [x0, y1]); // top
    seg([x0, y1], [x0, y0]); // left
    // Flap V
    seg([x0, y1], [mid, y1 - 1.1]);
    seg([mid, y1 - 1.1], [x1, y1]);

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );

    // Solid back panel of envelope (very subtle, almost transparent)
    const fillGeom = new THREE.PlaneGeometry(w * 0.99, h * 0.99);

    // Lightning bolt — extruded shape
    const boltShape = new THREE.Shape();
    boltShape.moveTo(0.12, 0.7);
    boltShape.lineTo(-0.25, 0);
    boltShape.lineTo(0, 0);
    boltShape.lineTo(-0.12, -0.7);
    boltShape.lineTo(0.25, 0.05);
    boltShape.lineTo(0, 0.05);
    boltShape.lineTo(0.12, 0.7);
    const boltGeom = new THREE.ExtrudeGeometry(boltShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    boltGeom.center();

    return { lineGeom, fillGeom, boltGeom };
  }, []);

  // Animation — slow rotation + subtle parallax
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    // Mouse parallax
    const mx = state.mouse.x;
    const my = state.mouse.y;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -my * 0.25,
      0.06
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      mx * 0.05,
      0.06
    );
  });

  return (
    <group ref={group}>
      {/* Subtle dark fill panel inside envelope */}
      <mesh geometry={fillGeom} position={[0, 0, -0.02]}>
        <meshBasicMaterial color="#04080F" transparent opacity={0.5} />
      </mesh>

      {/* Glowing wireframe envelope */}
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial
          color={new THREE.Color("#00E5FF")}
          linewidth={2}
          transparent
          opacity={0.95}
        />
      </lineSegments>

      {/* Bolt inside */}
      <mesh geometry={boltGeom} position={[0, -0.05, 0.2]} scale={1.3}>
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={2.2}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>

      {/* Subtle accent point on the bolt tip */}
      <pointLight position={[0, -0.6, 0.4]} intensity={1.6} color="#00E5FF" distance={3} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 3, 5]} intensity={0.5} color="#9eeaff" />
      <pointLight position={[-4, -2, 2]} intensity={0.8} color="#7c4dff" distance={10} />

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Envelope />
      </Float>

      {/* Particle field behind */}
      <Sparkles
        count={140}
        scale={[10, 6, 4]}
        size={2.4}
        speed={0.35}
        color="#00E5FF"
        opacity={0.65}
      />
      <Sparkles
        count={60}
        scale={[14, 8, 6]}
        size={3.5}
        speed={0.2}
        color="#7C4DFF"
        opacity={0.4}
      />

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
