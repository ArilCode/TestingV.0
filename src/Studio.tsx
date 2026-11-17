import React from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {spring} from 'remotion';
import {Anchor} from './Anchor';
import {Part, V3} from './toon';
import {COLORS} from './config';

type Shot = {pos: V3; look: V3};

// Sudut kamera yang bergantian tiap pergantian adegan
const SHOTS: Shot[] = [
  {pos: [0, 0.7, 11.5], look: [0, 0.15, 0]},
  {pos: [-1.2, 1.1, 8.2], look: [0, 1.0, 0]},
  {pos: [1.7, 0.5, 9.8], look: [0, 0.5, 0]},
  {pos: [0, 1.5, 7.0], look: [0, 1.25, 0]},
  {pos: [-1.9, 0.4, 10.2], look: [0, 0.3, 0]},
  {pos: [1.0, 1.2, 7.8], look: [0, 1.0, 0]},
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a: V3, b: V3, k: number): V3 => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
  a[2] + (b[2] - a[2]) * k,
];

const CameraRig: React.FC<{frame: number; fps: number; cuts: number[]}> = ({frame, fps, cuts}) => {
  const {camera} = useThree();
  let idx = 0;
  for (let i = 0; i < cuts.length; i++) if (frame >= cuts[i]) idx = i;
  const local = frame - cuts[idx];
  const cur = SHOTS[idx % SHOTS.length];
  const prev = SHOTS[(idx + SHOTS.length - 1) % SHOTS.length];
  const k = idx === 0 ? 1 : ease(Math.min(1, local / 16));
  const pos = mix(prev.pos, cur.pos, k);
  const look = mix(prev.look, cur.look, k);
  const t = frame / fps;
  const push = Math.min(local, 150) / 150;
  camera.position.set(
    pos[0] + Math.sin(t * 0.5) * 0.15,
    pos[1] + Math.sin(t * 0.4) * 0.08,
    pos[2] - push * 0.5,
  );
  camera.lookAt(look[0], look[1], look[2]);
  const punch = idx === 0 ? 0 : Math.max(0, 1 - local / 10);
  (camera as THREE.PerspectiveCamera).zoom = 1 + 0.05 * punch;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

const FLOAT_COLORS = [COLORS.pink, COLORS.yellow, COLORS.cyan, COLORS.violet, COLORS.orange];
const FLOATERS: {p: V3; size: number; speed: number}[] = [
  {p: [-2.0, 2.6, -2.5], size: 0.32, speed: 0.8},
  {p: [2.1, 2.9, -3.0], size: 0.28, speed: 1.1},
  {p: [-2.3, 0.4, -3.2], size: 0.36, speed: 0.6},
  {p: [2.3, 0.9, -2.2], size: 0.3, speed: 0.9},
  {p: [-1.7, -1.0, -1.6], size: 0.26, speed: 1.2},
  {p: [1.8, -1.2, -1.8], size: 0.3, speed: 0.7},
  {p: [-2.4, -2.0, -3.0], size: 0.34, speed: 1.0},
  {p: [2.4, -1.8, -3.4], size: 0.28, speed: 0.8},
  {p: [0.0, 3.5, -3.5], size: 0.34, speed: 0.9},
  {p: [-1.0, 3.1, -1.5], size: 0.22, speed: 1.3},
];

const geoFor = (k: number, s: number) => {
  switch (k % 5) {
    case 0:
      return <icosahedronGeometry args={[s, 0]} />;
    case 1:
      return <octahedronGeometry args={[s, 0]} />;
    case 2:
      return <torusGeometry args={[s, s * 0.35, 12, 24]} />;
    case 3:
      return <coneGeometry args={[s * 0.9, s * 1.6, 5]} />;
    default:
      return <boxGeometry args={[s * 1.3, s * 1.3, s * 1.3]} />;
  }
};

type StudioProps = {
  frame: number;
  fps: number;
  level: number;
  speaking: number;
  cuts: number[];
};

export const Studio: React.FC<StudioProps> = ({frame, fps, level, speaking, cuts}) => {
  const t = frame / fps;
  const intro = spring({frame, fps, config: {damping: 14}});
  const pulse = 1 + level * 0.25;

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 7]} intensity={2.2} />
      <directionalLight position={[-4, 2, 3]} intensity={0.8} color="#8fd8ff" />
      <CameraRig frame={frame} fps={fps} cuts={cuts} />

      {/* lingkaran cahaya di belakang presenter */}
      <group position={[0, 1.45, -1.8]} scale={intro * pulse} rotation={[Math.sin(t) * 0.12, Math.cos(t * 0.8) * 0.12, 0]}>
        <mesh rotation={[0, 0, t * 0.4]}>
          <torusGeometry args={[2.1, 0.09, 12, 64]} />
          <meshBasicMaterial color={COLORS.cyan} />
        </mesh>
        <mesh rotation={[0, 0, -t * 0.25]}>
          <torusGeometry args={[2.65, 0.05, 12, 64, Math.PI * 1.5]} />
          <meshBasicMaterial color={COLORS.pink} />
        </mesh>
      </group>

      {/* benda melayang */}
      {FLOATERS.map((f, i) => (
        <Part
          key={i}
          geo={geoFor(i, f.size)}
          color={FLOAT_COLORS[i % FLOAT_COLORS.length]}
          position={[
            f.p[0],
            f.p[1] + Math.sin(t * f.speed + i) * 0.22,
            f.p[2],
          ]}
          rotation={[t * f.speed * 0.8 + i, t * f.speed + i * 2, 0]}
          scale={intro * pulse}
        />
      ))}

      {/* confetti jatuh pelan */}
      {Array.from({length: 26}).map((_, i) => {
        const x = (((i * 37) % 100) / 100) * 5 - 2.5;
        const z = -0.5 - (i % 5) * 0.6;
        const sp = 0.5 + ((i * 13) % 10) / 20;
        const y = 3.8 - ((t * sp * 0.25 + i * 0.37) % 1) * 8;
        const sz = 0.06 + (i % 3) * 0.03;
        return (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={[t * (1 + (i % 3)), t * 1.3, i]}
          >
            <boxGeometry args={[sz, sz * 0.4, sz]} />
            <meshBasicMaterial color={FLOAT_COLORS[i % FLOAT_COLORS.length]} />
          </mesh>
        );
      })}

      <Anchor frame={frame} fps={fps} level={level} speaking={speaking} />

      {/* meja studio */}
      <Part
        geo={<boxGeometry args={[4.4, 0.2, 1.7]} />}
        color="#f4f1ff"
        position={[0, -0.76, 1.4]}
      />
      <Part
        geo={<boxGeometry args={[4.3, 2.0, 0.2]} />}
        color="#2a1b6e"
        position={[0, -1.75, 2.15]}
      />
      <mesh position={[0, -1.15, 2.27]}>
        <boxGeometry args={[3.7, 0.12, 0.04]} />
        <meshBasicMaterial color={COLORS.cyan} />
      </mesh>
      <mesh position={[0, -1.6, 2.27]}>
        <boxGeometry args={[1.2, 0.12, 0.04]} />
        <meshBasicMaterial color={COLORS.yellow} />
      </mesh>
      {/* mikrofon */}
      <Part
        geo={<cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />}
        color="#444"
        position={[-0.55, -0.4, 1.2]}
        outline={0.3}
      />
      <Part
        geo={<sphereGeometry args={[0.16, 16, 16]} />}
        color="#3a3a4a"
        position={[-0.55, 0.0, 1.2]}
      />
    </>
  );
};
