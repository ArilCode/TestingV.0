import React from 'react';
import * as THREE from 'three';

export type V3 = [number, number, number];

let gradient: THREE.DataTexture | null = null;
// Gradasi 3 tingkat -> efek bayangan ala kartun (cel shading)
export const getGradient = (): THREE.DataTexture => {
  if (!gradient) {
    const data = new Uint8Array([70, 150, 255]);
    const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    gradient = tex;
  }
  return gradient;
};

type PartProps = {
  geo: React.ReactNode;
  color: string;
  outline?: number;
  noOutline?: boolean;
  outlineColor?: string;
  emissive?: string;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  children?: React.ReactNode;
};

// Satu bagian benda: material toon + garis tepi tebal (inverted hull)
export const Part: React.FC<PartProps> = ({
  geo,
  color,
  outline = 0.05,
  noOutline = false,
  outlineColor = '#1c1147',
  emissive,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  children,
}) => {
  const grad = getGradient();
  const extra = emissive ? {emissive, emissiveIntensity: 0.7} : {};
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        {geo}
        <meshToonMaterial color={color} gradientMap={grad} {...extra} />
      </mesh>
      {!noOutline && (
        <mesh scale={1 + outline}>
          {geo}
          <meshBasicMaterial color={outlineColor} side={THREE.BackSide} />
        </mesh>
      )}
      {children}
    </group>
  );
};
