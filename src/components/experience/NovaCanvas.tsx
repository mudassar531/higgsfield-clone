"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  Color,
  DoubleSide,
  SphereGeometry,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
} from "three";
import type { SceneMotion } from "./types";

const IDEA_COLORS = ["#e9a980", "#bdcdb8", "#dfb2ae"];

function NovaCore({
  motion,
  idea,
}: {
  motion: RefObject<SceneMotion>;
  idea: number;
}) {
  const whole = useRef<Group>(null);
  const upper = useRef<Mesh>(null);
  const lower = useRef<Mesh>(null);
  const orbit = useRef<Group>(null);
  const fragments = useRef<Group>(null);
  const shellMaterial = useRef<MeshPhysicalMaterial>(null);
  const elapsed = useRef(0);
  const targetColor = useMemo(
    () => new Color(idea < 0 ? "#deb091" : IDEA_COLORS[idea] ?? IDEA_COLORS[0]),
    [idea],
  );

  // A small, deliberately imperfect surface; no texture requests or large model.
  const shell = useMemo(() => {
    const geometry = new SphereGeometry(1.13, 64, 40);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const ripple =
        1 +
        Math.sin(x * 4.8 + z * 3.1) * 0.085 +
        Math.cos(y * 5.3 - x * 2.4) * 0.055 +
        Math.sin(z * 8.1 + y * 3.2) * 0.025;
      position.setXYZ(i, x * ripple * 1.03, y * ripple * 0.9, z * ripple * 0.78);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => shell.dispose(), [shell]);

  useFrame((_, delta) => {
    const state = motion.current;
    elapsed.current += Math.min(delta, 0.05);
    const t = elapsed.current;
    const damping = 1 - Math.exp(-Math.min(delta, 0.05) * 2.7);
    const open = Math.max(0, (state.scroll - 0.14) / 0.58);
    if (whole.current) {
      whole.current.rotation.y +=
        (state.x * 0.17 + t * 0.11 + open * 0.7 - whole.current.rotation.y) *
        damping;
      whole.current.rotation.x +=
        (state.y * -0.1 + open * 0.24 - whole.current.rotation.x) * damping;
      whole.current.position.y +=
        (Math.sin(t * 0.58) * 0.09 - open * 0.13 - whole.current.position.y) *
        damping;
      const size = 1 + open * 0.34;
      whole.current.scale.setScalar(
        whole.current.scale.x + (size - whole.current.scale.x) * damping,
      );
    }
    if (upper.current) upper.current.position.y = 0.23 + open * 0.6;
    if (lower.current) lower.current.position.y = -0.26 - open * 0.66;
    if (orbit.current) {
      orbit.current.rotation.z = t * -0.08 + open * 0.45;
      orbit.current.scale.setScalar(1 + open * 0.22);
    }
    if (fragments.current) {
      fragments.current.children.forEach((child, index) => {
        const sign = index === 0 ? -1 : index === 1 ? 1 : 0.2;
        child.position.x = sign * (1.58 + open * (index === 2 ? 0.7 : 1.8));
        child.position.y =
          (index === 1 ? 0.77 : index === 2 ? -0.98 : -0.48) +
          open * (index === 0 ? -0.6 : 0.5);
        child.rotation.z = sign * (0.4 - open * 0.28);
      });
    }
    shellMaterial.current?.color.lerp(targetColor, damping * 1.3);
  });

  return (
    <group ref={whole}>
      <mesh geometry={shell} rotation={[0.2, 0.3, -0.2]}>
        <meshPhysicalMaterial
          ref={shellMaterial}
          color="#deb091"
          metalness={0.42}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.1}
          iridescence={0.65}
          iridescenceIOR={1.3}
          transparent
          opacity={0.76}
        />
      </mesh>
      <mesh ref={upper} geometry={shell} scale={[0.68, 0.32, 0.68]}>
        <meshPhysicalMaterial
          color="#f6d5b0"
          metalness={0.14}
          roughness={0.18}
          transparent
          opacity={0.5}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={lower} geometry={shell} scale={[0.74, 0.31, 0.74]}>
        <meshPhysicalMaterial
          color="#7faca0"
          metalness={0.24}
          roughness={0.19}
          transparent
          opacity={0.52}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={0.46}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#ffbd7b"
          emissive="#ba633a"
          emissiveIntensity={0.36}
          metalness={0.46}
          roughness={0.3}
        />
      </mesh>
      <group ref={orbit}>
        <mesh rotation={[0.47, 0.06, -0.36]}>
          <torusGeometry args={[1.63, 0.012, 5, 92, Math.PI * 1.42]} />
          <meshBasicMaterial color="#f4d5b2" transparent opacity={0.68} />
        </mesh>
        <mesh rotation={[-0.38, 0.35, 1.1]}>
          <torusGeometry args={[1.49, 0.009, 5, 92, Math.PI * 1.12]} />
          <meshBasicMaterial color="#a7c6b4" transparent opacity={0.6} />
        </mesh>
      </group>
      <group ref={fragments}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} scale={index === 2 ? 0.68 : 1}>
            <planeGeometry args={[0.28, 0.46]} />
            <meshPhysicalMaterial
              color={index === 1 ? "#f7d2a7" : "#aecbc0"}
              side={DoubleSide}
              metalness={0.32}
              roughness={0.24}
              transparent
              opacity={0.62}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function NovaCanvas({
  motion,
  visible,
  idea,
}: {
  motion: RefObject<SceneMotion>;
  visible: boolean;
  idea: number;
}) {
  return (
    <Canvas
      className="nova-canvas"
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 36 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      <ambientLight intensity={1.2} color="#f9e3c9" />
      <directionalLight position={[2, 3, 4]} color="#ffe6b8" intensity={2.4} />
      <pointLight position={[-3, -1, 3]} color="#9acfc5" intensity={17} distance={8} />
      <NovaCore motion={motion} idea={idea} />
    </Canvas>
  );
}
