import React from 'react';
import {spring} from 'remotion';
import {Part} from './toon';
import {COLORS} from './config';

type Props = {frame: number; fps: number; level: number; speaking: number};

export const Anchor: React.FC<Props> = ({frame, fps, level, speaking}) => {
  const t = frame / fps;
  const intro = spring({frame, fps, config: {damping: 11, stiffness: 120, mass: 0.8}});
  const s = 0.55 + 0.45 * intro;

  // Mulut mengikuti volume suara
  const open = Math.min(1, level * 1.5);
  const vowel = 0.5 + 0.5 * Math.sin(frame * 1.15);
  const mw = 0.24 - 0.09 * open * (0.4 + 0.6 * vowel);
  const mh = 0.035 + 0.27 * open;

  // Kedip
  const bl = (p: number) => (p < 6 ? Math.sin((p / 6) * Math.PI) : 0);
  const blink = 1 - 0.92 * Math.max(bl(frame % 96), bl((frame + 40) % 151));

  // Gerak kepala & badan
  const sway = Math.sin(t * 0.9) * 0.14 * speaking + Math.sin(t * 0.4) * 0.04;
  const nod = Math.sin(t * 2.1) * 0.025 * speaking + level * 0.05;
  const tilt = Math.sin(t * 0.7) * 0.03;
  const breathe = Math.sin(t * 2) * 0.015;
  const lift =
    Math.pow(0.5 + 0.5 * Math.sin(t * 1.5 + 1), 1.4) * (0.3 + 0.7 * speaking) + level * 0.1;
  const browUp = 0.04 * level + 0.03 * Math.max(0, Math.sin(t * 2.6)) * speaking;
  const look = Math.sin(t * 0.7) * 0.03;

  const skin = COLORS.skin;
  const hairCol = '#2a1d2e';

  const eye = (side: number) => (
    <group position={[side * 0.33, 0.12, 0.77]} rotation={[0, side * 0.37, 0]} scale={[1, blink, 1]}>
      <Part
        geo={<sphereGeometry args={[0.2, 20, 20]} />}
        color="#ffffff"
        scale={[1, 1.2, 0.5]}
        outline={0.1}
      >
        <Part
          geo={<sphereGeometry args={[0.11, 16, 16]} />}
          color="#2b1b3a"
          noOutline
          position={[look, 0, 0.1]}
          scale={[1, 1.15, 0.5]}
        >
          <mesh position={[0.04, 0.05, 0.1]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </Part>
      </Part>
    </group>
  );

  const brow = (side: number) => (
    <Part
      geo={<boxGeometry args={[0.3, 0.07, 0.08]} />}
      color={hairCol}
      outline={0.12}
      position={[side * 0.33, 0.42 + browUp, 0.73]}
      rotation={[0, side * 0.4, side * (0.12 + browUp * 2)]}
    />
  );

  const arm = (side: number) => {
    const isRight = side > 0;
    const a1 = isRight ? -0.45 - 0.35 * lift : -0.45;
    const zr = isRight ? 0.15 + 0.45 * lift : -0.1;
    const a2 = isRight ? -1.1 - 0.7 * lift : -1.1;
    const wave = isRight ? Math.sin(t * 5) * 0.12 * lift : 0;
    return (
      <group position={[side * 1.15, 0.3, 0.1]} rotation={[a1, 0, zr]}>
        <Part
          geo={<capsuleGeometry args={[0.2, 0.8, 6, 12]} />}
          color={COLORS.suit}
          position={[0, -0.5, 0]}
        />
        <group position={[0, -1.0, 0]} rotation={[a2, 0, wave]}>
          <Part
            geo={<capsuleGeometry args={[0.17, 0.6, 6, 12]} />}
            color={COLORS.suit}
            position={[0, -0.45, 0]}
          />
          <Part
            geo={<sphereGeometry args={[0.23, 16, 16]} />}
            color={skin}
            position={[0, -0.95, 0]}
            scale={[1, 1.1, 0.8]}
          />
        </group>
      </group>
    );
  };

  return (
    <group position={[0, -0.9 * (1 - intro) + breathe, 0]} scale={s}>
      {/* badan & jas */}
      <Part
        geo={<sphereGeometry args={[1, 28, 24]} />}
        color={COLORS.suit}
        position={[0, -0.4, 0]}
        scale={[1.25, 1.1, 0.75]}
      />
      {/* kemeja, dasi */}
      <Part
        geo={<sphereGeometry args={[1, 16, 16]} />}
        color="#ffffff"
        position={[0, 0.2, 0.64]}
        scale={[0.4, 0.55, 0.15]}
        outline={0.08}
      />
      <Part
        geo={<boxGeometry args={[0.15, 0.6, 0.06]} />}
        color={COLORS.red}
        position={[0, -0.1, 0.76]}
        outline={0.15}
      />
      <Part
        geo={<sphereGeometry args={[0.1, 12, 12]} />}
        color={COLORS.red}
        position={[0, 0.2, 0.76]}
        outline={0.15}
      />
      {arm(-1)}
      {arm(1)}

      {/* leher */}
      <Part
        geo={<cylinderGeometry args={[0.28, 0.3, 0.5, 16]} />}
        color={skin}
        position={[0, 0.55, 0]}
      />

      {/* kepala */}
      <group position={[0, 1.45, 0]} rotation={[nod, sway, tilt]}>
        <Part geo={<sphereGeometry args={[0.9, 32, 28]} />} color={skin} scale={[1, 0.95, 1]} />
        {/* telinga */}
        <Part
          geo={<sphereGeometry args={[0.16, 12, 12]} />}
          color={skin}
          position={[-0.9, 0, 0.05]}
          scale={[0.5, 1, 0.8]}
        />
        <Part
          geo={<sphereGeometry args={[0.16, 12, 12]} />}
          color={skin}
          position={[0.9, 0, 0.05]}
          scale={[0.5, 1, 0.8]}
        />
        {/* rambut */}
        <Part
          geo={
            <sphereGeometry args={[0.96, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          }
          color={hairCol}
          position={[0, 0.05, -0.02]}
          rotation={[-0.35, 0, 0]}
          outline={0.04}
        />
        <Part
          geo={<sphereGeometry args={[0.5, 16, 16]} />}
          color={hairCol}
          position={[0.15, 0.98, 0.5]}
          rotation={[0.3, 0, -0.25]}
          scale={[1.5, 0.7, 0.8]}
        />
        {/* wajah */}
        {eye(-1)}
        {eye(1)}
        {brow(-1)}
        {brow(1)}
        <Part
          geo={<sphereGeometry args={[0.09, 12, 12]} />}
          color="#f0a67e"
          position={[0, -0.08, 0.87]}
          scale={[1, 0.9, 0.9]}
          outline={0.15}
        />
        {/* pipi merona */}
        <mesh position={[-0.52, -0.22, 0.66]} rotation={[0, -0.7, 0]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshBasicMaterial color="#ff8fa3" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.52, -0.22, 0.66]} rotation={[0, 0.7, 0]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshBasicMaterial color="#ff8fa3" transparent opacity={0.75} />
        </mesh>
        {/* mulut */}
        <group position={[0, -0.36, 0.76]}>
          <Part
            geo={<sphereGeometry args={[1, 20, 16]} />}
            color="#7a1230"
            scale={[mw, mh, 0.15]}
            outline={0.12}
          />
          <mesh
            position={[0, mh * 0.55, 0.14]}
            scale={[1, Math.min(1, open * 3), 1]}
          >
            <boxGeometry args={[mw * 1.5, 0.07, 0.05]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh
            position={[0, -mh * 0.5, 0.1]}
            scale={[mw * 0.55, Math.max(0.001, mh * 0.4), 0.12]}
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#ff7a95" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

