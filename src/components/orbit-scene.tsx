"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const VOLT = "#2f8cff";
const ICE = "#a9ccff";

/** The "4" from the m04 logo, drawn as a flat glyph and extruded. */
function createFourShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0.6, 1.0);
  shape.lineTo(0.6, -0.05);
  shape.lineTo(0.86, -0.05);
  shape.lineTo(0.86, -0.36);
  shape.lineTo(0.6, -0.36);
  shape.lineTo(0.6, -1.0);
  shape.lineTo(0.24, -1.0);
  shape.lineTo(0.24, -0.36);
  shape.lineTo(-0.86, -0.36);
  shape.lineTo(-0.86, -0.05);
  shape.lineTo(0.14, 1.0);
  shape.closePath();

  const counter = new THREE.Path();
  counter.moveTo(0.24, 0.62);
  counter.lineTo(-0.4, -0.05);
  counter.lineTo(0.24, -0.05);
  counter.closePath();
  shape.holes.push(counter);

  return shape;
}

type MarkProps = { progress: MotionValue<number>; still: boolean };

function OrbitMark({ progress, still }: MarkProps) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const orbit = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const glyph = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(createFourShape(), {
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.045,
      bevelSegments: 8,
      curveSegments: 8,
    });
    geometry.center();
    return geometry;
  }, []);

  useEffect(() => () => glyph.dispose(), [glyph]);

  useEffect(() => {
    if (still) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const scrolled = progress.get();
    const { damp } = THREE.MathUtils;

    const turnY = still ? -0.35 : pointer.current.x * 0.5 - 0.35 + scrolled * Math.PI * 1.15;
    const turnX = still ? 0.12 : pointer.current.y * 0.32 + 0.12 + scrolled * 0.5;
    node.rotation.y = damp(node.rotation.y, turnY, 3.5, delta);
    node.rotation.x = damp(node.rotation.x, turnX, 3.5, delta);
    node.scale.setScalar(damp(node.scale.x, 1 - scrolled * 0.38, 5, delta));
    node.position.y = damp(node.position.y, scrolled * 1.1, 5, delta);

    if (!still) {
      if (ring.current) ring.current.rotation.z += delta * 0.12;
      if (orbit.current) orbit.current.rotation.z -= delta * 0.4;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={ring}>
        <torusGeometry args={[1.62, 0.13, 64, 200]} />
        <meshPhysicalMaterial color="#eef2f8" metalness={1} roughness={0.14} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh geometry={glyph} scale={0.92}>
        <meshPhysicalMaterial
          color={VOLT}
          emissive="#0b4fd6"
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh ref={orbit} rotation={[1.2, 0.28, 0]}>
        <torusGeometry args={[2.28, 0.009, 8, 240]} />
        <meshBasicMaterial color={VOLT} transparent opacity={0.7} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function OrbitScene({
  progress,
  still,
  active,
}: MarkProps & { active: boolean }) {
  return (
    <Canvas
      className="orbit-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8.4], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      fallback={<div className="orbit-fallback" aria-hidden="true"><span>4</span></div>}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <pointLight position={[-3, -2, 2.5]} color={VOLT} intensity={18} />
      <Float speed={still ? 0 : 1.3} rotationIntensity={still ? 0 : 0.2} floatIntensity={still ? 0 : 0.55}>
        <OrbitMark progress={progress} still={still} />
      </Float>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.6} position={[0, 4, -3]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} color={VOLT} />
        <Lightformer form="ring" intensity={2.2} position={[4, -1, 3]} scale={2} color={ICE} />
        <Lightformer form="rect" intensity={1.4} position={[0, -4, 1]} rotation-x={-Math.PI / 2} scale={[8, 3, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
