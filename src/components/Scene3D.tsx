import { useRef, useEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import type { Group } from 'three';
import type { TransformControls as TransformControlsImpl } from 'three-stdlib';
import { useChipletStore } from '../store/chipletStore';
import { Chiplet } from './Chiplet';
import { AlignmentLines } from './AlignmentLines';

export function Scene3D() {
  const chiplets = useChipletStore((state) => state.chiplets);
  const selectedChipletId = useChipletStore((state) => state.selectedChipletId);
  const setChipletPosition = useChipletStore((state) => state.setChipletPosition);
  const setIsDragging = useChipletStore((state) => state.setIsDragging);
  const showAlignment = useChipletStore((state) => state.showAlignment);

  // Map chiplet id -> group ref
  const groupRefs = useRef<Map<string, Group>>(new Map());
  const transformRef = useRef<TransformControlsImpl>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Update selected group when selection changes
  useEffect(() => {
    if (selectedChipletId) {
      const group = groupRefs.current.get(selectedChipletId);
      setSelectedGroup(group || null);
    } else {
      setSelectedGroup(null);
    }
  }, [selectedChipletId, chiplets]);

  // Handle drag end to update store
  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    const onDraggingChanged = (e: { value: boolean }) => {
      setIsDragging(e.value);
      if (!e.value && selectedGroup) {
        // Drag ended, update store with final position
        const pos = selectedGroup.position.toArray() as [number, number, number];
        const id = selectedChipletId;
        if (id) {
          setChipletPosition(id, pos);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (controls as any).addEventListener('dragging-changed', onDraggingChanged);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (controls as any).removeEventListener('dragging-changed', onDraggingChanged);
    };
  }, [selectedGroup, selectedChipletId, setChipletPosition, setIsDragging]);

  return (
    <group>
      {chiplets.map((chiplet) => (
        <Chiplet
          key={chiplet.id}
          data={chiplet}
          ref={(el) => {
            if (el) {
              groupRefs.current.set(chiplet.id, el);
            } else {
              groupRefs.current.delete(chiplet.id);
            }
          }}
        />
      ))}
      {showAlignment && <AlignmentLines />}

      {/* TransformControls for the selected chiplet */}
      {selectedGroup && (
        <TransformControls
          ref={transformRef}
          object={selectedGroup}
          mode="translate"
          showX={true}
          showY={true}
          showZ={true}
          translationSnap={0.01}
        />
      )}
    </group>
  );
}
