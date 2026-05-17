import { useChipletStore } from '../store/chipletStore';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export function AlignmentLines() {
  const alignmentResults = useChipletStore((state) => state.alignmentResults);
  const chiplets = useChipletStore((state) => state.chiplets);

  const lines: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];

  for (const result of alignmentResults) {
    const c1 = chiplets.find((c) => c.id === result.chipletId1);
    const c2 = chiplets.find((c) => c.id === result.chipletId2);
    if (!c1 || !c2) continue;

    let pos1: THREE.Vector3;
    let pos2: THREE.Vector3;

    if (result.featureType === 'bump') {
      const bump1 = c1.bumps.find((b) => b.id === result.featureId1);
      const bump2 = c2.bumps.find((b) => b.id === result.featureId2);
      if (!bump1 || !bump2) continue;
      pos1 = new THREE.Vector3(c1.position[0] + bump1.position[0], c1.position[1] + bump1.position[1], c1.position[2] + bump1.position[2]);
      pos2 = new THREE.Vector3(c2.position[0] + bump2.position[0], c2.position[1] + bump2.position[1], c2.position[2] + bump2.position[2]);
    } else {
      const tsv1 = c1.tsvs.find((t) => t.id === result.featureId1);
      const tsv2 = c2.tsvs.find((t) => t.id === result.featureId2);
      if (!tsv1 || !tsv2) continue;
      pos1 = new THREE.Vector3(c1.position[0] + tsv1.position[0], c1.position[1] + tsv1.position[1], c1.position[2]);
      pos2 = new THREE.Vector3(c2.position[0] + tsv2.position[0], c2.position[1] + tsv2.position[1], c2.position[2]);
    }

    lines.push({ start: pos1, end: pos2, color: result.aligned ? '#22c55e' : '#ef4444' });
  }

  return (
    <>
      {lines.map((line, index) => (
        <Line key={index} points={[line.start, line.end]} color={line.color} lineWidth={2} />
      ))}
    </>
  );
}
