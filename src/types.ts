export interface Bump {
  id: string;
  position: [number, number, number];
  radius: number;
  color?: string;
}

export interface TSV {
  id: string;
  position: [number, number];
  radius: number;
  color?: string;
}

export interface ChipletData {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  bumps: Bump[];
  tsvs: TSV[];
  frontColor: string;
  backColor: string;
  opacity: number;
}

export interface AlignmentResult {
  aligned: boolean;
  distance: number;
  chipletId1: string;
  chipletId2: string;
  featureType: 'bump' | 'tsv';
  featureId1: string;
  featureId2: string;
}

export interface ProjectData {
  chiplets: ChipletData[];
  version: string;
}

export const DEFAULT_CHIPLET: Omit<ChipletData, 'id'> = {
  name: 'Chiplet',
  width: 4,      // X axis: long edge (left-right)
  height: 0.15,  // Y axis: thickness (up-down, very thin)
  depth: 2.5,    // Z axis: short edge (front-back)
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  bumps: [],
  tsvs: [],
  frontColor: '#2c3e50',
  backColor: '#95a5a6',
  opacity: 0.7,
};
