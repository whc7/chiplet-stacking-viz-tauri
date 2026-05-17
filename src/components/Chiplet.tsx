import { useRef, useState, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, DoubleSide, Vector3, Euler, Group } from 'three';
import { ChipletData } from '../types';
import { useChipletStore } from '../store/chipletStore';

interface ChipletProps {
  data: ChipletData;
}

export const Chiplet = forwardRef<Group, ChipletProps>(function Chiplet({ data }, ref) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectedChipletId = useChipletStore((state) => state.selectedChipletId);
  const selectChiplet = useChipletStore((state) => state.selectChiplet);
  const isDraggingGlobal = useChipletStore((state) => state.isDragging);
  const isSelected = selectedChipletId === data.id;

  // Merge refs so parent can access the group
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(groupRef.current);
    } else if (ref) {
      ref.current = groupRef.current;
    }
  }, [ref]);

  // Animation state (lerp targets)
  const anim = useRef({
    position: new Vector3(...data.position),
    rotation: new Euler(...data.rotation),
    scale: new Vector3(...data.scale),
  });

  useFrame(() => {
    if (!groupRef.current) return;

    // When dragging the selected chiplet, pause lerp so TransformControls can control the position
    if (isDraggingGlobal && isSelected) {
      // Sync anim state to current group position to prevent jump after drag ends
      anim.current.position.copy(groupRef.current.position);
      anim.current.rotation.copy(groupRef.current.rotation);
      anim.current.scale.copy(groupRef.current.scale);
      return;
    }

    const targetPos = new Vector3(...data.position);
    const targetRot = new Euler(...data.rotation);
    const targetScale = new Vector3(...data.scale);

    anim.current.position.lerp(targetPos, 0.12);
    anim.current.scale.lerp(targetScale, 0.12);

    anim.current.rotation.x += (targetRot.x - anim.current.rotation.x) * 0.12;
    anim.current.rotation.y += (targetRot.y - anim.current.rotation.y) * 0.12;
    anim.current.rotation.z += (targetRot.z - anim.current.rotation.z) * 0.12;

    groupRef.current.position.copy(anim.current.position);
    groupRef.current.rotation.copy(anim.current.rotation);
    groupRef.current.scale.copy(anim.current.scale);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectChiplet(data.id);
  };

  return (
    <group ref={groupRef}>
      {/* Main chiplet body: width(X) x height(Y/thickness) x depth(Z) */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[data.width, data.height, data.depth]} />
        <meshPhysicalMaterial
          color={data.frontColor}
          transparent
          opacity={data.opacity}
          side={DoubleSide}
          roughness={0.3}
          metalness={0.1}
          transmission={0.2}
          thickness={0.1}
        />
      </mesh>

      {/* Top face indicator (active side / front) - flat on X-Z plane */}
      <mesh position={[0, data.height / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[data.width * 0.9, data.depth * 0.9]} />
        <meshStandardMaterial color={data.frontColor} transparent opacity={0.3} side={DoubleSide} />
      </mesh>

      {/* Bottom face indicator (backside) - flat on X-Z plane */}
      <mesh position={[0, -data.height / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[data.width * 0.9, data.depth * 0.9]} />
        <meshStandardMaterial color={data.backColor} transparent opacity={0.3} side={DoubleSide} />
      </mesh>

      {/* Selection highlight */}
      {(isSelected || hovered) && (
        <mesh>
          <boxGeometry args={[data.width + 0.05, data.height + 0.05, data.depth + 0.05]} />
          <meshBasicMaterial color={isSelected ? '#fbbf24' : '#60a5fa'} wireframe transparent opacity={0.5} />
        </mesh>
      )}

      {/* Bumps: on the top surface (Y+) */}
      {data.bumps.map((bump) => (
        <mesh key={bump.id} position={bump.position} onClick={(e) => e.stopPropagation()}>
          <sphereGeometry args={[bump.radius, 16, 16]} />
          <meshStandardMaterial
            color={bump.color || '#e74c3c'}
            emissive={bump.color || '#e74c3c'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* TSVs: vertical cylinders along Y axis */}
      {data.tsvs.map((tsv) => (
        <group key={tsv.id}>
          <mesh position={[tsv.position[0], 0, tsv.position[1]]} onClick={(e) => e.stopPropagation()}>
            <cylinderGeometry args={[tsv.radius, tsv.radius, data.height + 0.04, 16]} />
            <meshStandardMaterial
              color={tsv.color || '#3498db'}
              emissive={tsv.color || '#3498db'}
              emissiveIntensity={0.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[tsv.position[0], data.height / 2 + 0.02, tsv.position[1]]} onClick={(e) => e.stopPropagation()}>
            <cylinderGeometry args={[tsv.radius * 1.5, tsv.radius * 1.5, 0.02, 16]} />
            <meshStandardMaterial color={tsv.color || '#3498db'} emissive={tsv.color || '#3498db'} emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[tsv.position[0], -data.height / 2 - 0.02, tsv.position[1]]} onClick={(e) => e.stopPropagation()}>
            <cylinderGeometry args={[tsv.radius * 1.5, tsv.radius * 1.5, 0.02, 16]} />
            <meshStandardMaterial color={tsv.color || '#3498db'} emissive={tsv.color || '#3498db'} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Label */}
      <Html position={[0, data.height / 2 + 0.3, 0]} center>
        <div style={{
          background: isSelected ? '#fbbf24' : 'rgba(0,0,0,0.7)',
          color: isSelected ? '#000' : '#fff',
          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
          whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
        }}>
          {data.name}
        </div>
      </Html>
    </group>
  );
});
