import { create } from 'zustand';
import { ChipletData, AlignmentResult, DEFAULT_CHIPLET } from '../types';

const GAP = 0.15; // Gap between stacked chiplets

interface ChipletState {
  chiplets: ChipletData[];
  selectedChipletId: string | null;
  baseChipletId: string | null;
  alignmentResults: AlignmentResult[];
  showAlignment: boolean;
  tolerance: number;
  // History stack for restore (push before each stack/fold)
  history: ChipletData[][];
  canRestore: boolean;
  // Drag state
  isDragging: boolean;

  saveSnapshot: () => void;
  restore: () => void;
  setIsDragging: (isDragging: boolean) => void;

  addChiplet: () => void;
  removeChiplet: (id: string) => void;
  selectChiplet: (id: string | null) => void;
  setBaseChiplet: (id: string) => void;
  updateChiplet: (id: string, updates: Partial<ChipletData>) => void;
  setChipletPosition: (id: string, position: [number, number, number]) => void;
  setChipletRotation: (id: string, rotation: [number, number, number]) => void;
  setChipletScale: (id: string, scale: [number, number, number]) => void;
  mirrorChiplet: (id: string, axis: 'x' | 'y' | 'z') => void;
  addBump: (chipletId: string, position: [number, number, number]) => void;
  removeBump: (chipletId: string, bumpId: string) => void;
  addTSV: (chipletId: string, position: [number, number]) => void;
  removeTSV: (chipletId: string, tsvId: string) => void;
  updateBump: (chipletId: string, bumpId: string, position: [number, number, number]) => void;
  updateTSV: (chipletId: string, tsvId: string, position: [number, number]) => void;
  stackChiplets: () => void;
  xfoldStack: () => void;
  yfoldStack: () => void;
  checkAlignment: () => void;
  setShowAlignment: (show: boolean) => void;
  setTolerance: (tolerance: number) => void;
  loadProject: (chiplets: ChipletData[]) => void;
  clearAll: () => void;
}

let idCounter = 0;
const generateId = () => `chiplet_${++idCounter}`;
const generateBumpId = () => `bump_${++idCounter}`;
const generateTSVId = () => `tsv_${++idCounter}`;

function deepCloneChiplets(chiplets: ChipletData[]): ChipletData[] {
  return JSON.parse(JSON.stringify(chiplets));
}

function getTopY(chiplet: ChipletData): number {
  // Top surface Y = center Y + half height
  return chiplet.position[1] + chiplet.height / 2;
}

export const useChipletStore = create<ChipletState>((set, get) => ({
  chiplets: [],
  selectedChipletId: null,
  baseChipletId: null,
  alignmentResults: [],
  showAlignment: false,
  tolerance: 0.05,
  history: [],
  canRestore: false,
  isDragging: false,

  saveSnapshot: () => {
    const { chiplets, history } = get();
    set({ 
      history: [...history, deepCloneChiplets(chiplets)], 
      canRestore: true 
    });
  },

  restore: () => {
    const { history } = get();
    if (history.length === 0) return;
    const lastSnapshot = history[history.length - 1];
    set({
      chiplets: deepCloneChiplets(lastSnapshot),
      history: history.slice(0, -1),
      canRestore: history.length > 1,
      alignmentResults: [],
      showAlignment: false,
    });
  },

  setIsDragging: (isDragging: boolean) => set({ isDragging }),

  addChiplet: () => {
    const id = generateId();
    const newChiplet: ChipletData = {
      ...DEFAULT_CHIPLET,
      id,
      name: `Chiplet ${get().chiplets.length + 1}`,
      position: [
        (Math.random() - 0.5) * 8,
        get().chiplets.length * (DEFAULT_CHIPLET.height + GAP),
        (Math.random() - 0.5) * 6,
      ],
    };
    set((state) => {
      const newChiplets = [...state.chiplets, newChiplet];
      return {
        chiplets: newChiplets,
        selectedChipletId: id,
        baseChipletId: state.baseChipletId || newChiplets[0]?.id || null,
      };
    });
  },

  removeChiplet: (id) => {
    set((state) => {
      const newChiplets = state.chiplets.filter((c) => c.id !== id);
      return {
        chiplets: newChiplets,
        selectedChipletId: state.selectedChipletId === id ? null : state.selectedChipletId,
        baseChipletId: state.baseChipletId === id ? (newChiplets[0]?.id || null) : state.baseChipletId,
      };
    });
  },

  selectChiplet: (id) => set({ selectedChipletId: id }),

  setBaseChiplet: (id) => set({ baseChipletId: id }),

  updateChiplet: (id, updates) => {
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  setChipletPosition: (id, position) => {
    get().updateChiplet(id, { position });
  },

  setChipletRotation: (id, rotation) => {
    get().updateChiplet(id, { rotation });
  },

  setChipletScale: (id, scale) => {
    get().updateChiplet(id, { scale });
  },

  mirrorChiplet: (id, axis) => {
    const chiplet = get().chiplets.find((c) => c.id === id);
    if (!chiplet) return;
    const newScale: [number, number, number] = [...chiplet.scale] as [number, number, number];
    if (axis === 'x') newScale[0] *= -1;
    if (axis === 'y') newScale[1] *= -1;
    if (axis === 'z') newScale[2] *= -1;
    get().updateChiplet(id, { scale: newScale });
  },

  addBump: (chipletId, position) => {
    const bumpId = generateBumpId();
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === chipletId
          ? { ...c, bumps: [...c.bumps, { id: bumpId, position, radius: 0.08, color: '#e74c3c' }] }
          : c
      ),
    }));
  },

  removeBump: (chipletId, bumpId) => {
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === chipletId
          ? { ...c, bumps: c.bumps.filter((b) => b.id !== bumpId) }
          : c
      ),
    }));
  },

  addTSV: (chipletId, position) => {
    const tsvId = generateTSVId();
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === chipletId
          ? { ...c, tsvs: [...c.tsvs, { id: tsvId, position, radius: 0.05, color: '#3498db' }] }
          : c
      ),
    }));
  },

  removeTSV: (chipletId, tsvId) => {
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === chipletId
          ? { ...c, tsvs: c.tsvs.filter((t) => t.id !== tsvId) }
          : c
      ),
    }));
  },

  updateBump: (chipletId, bumpId, position) => {
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === chipletId
          ? { ...c, bumps: c.bumps.map((b) => b.id === bumpId ? { ...b, position } : b) }
          : c
      ),
    }));
  },

  updateTSV: (chipletId, tsvId, position) => {
    set((state) => ({
      chiplets: state.chiplets.map((c) =>
        c.id === chipletId
          ? { ...c, tsvs: c.tsvs.map((t) => t.id === tsvId ? { ...t, position } : t) }
          : c
      ),
    }));
  },

  stackChiplets: () => {
    const { chiplets, selectedChipletId, baseChipletId } = get();
    if (!selectedChipletId || !baseChipletId || chiplets.length < 2) return;
    if (selectedChipletId === baseChipletId) return;

    get().saveSnapshot();

    const base = chiplets.find((c) => c.id === baseChipletId)!;
    const target = chiplets.find((c) => c.id === selectedChipletId)!;
    
    // Find all chiplets already stacked at base X/Z (excluding target)
    const stacked = chiplets
      .filter((c) => c.id !== target.id && 
        Math.abs(c.position[0] - base.position[0]) < 0.01 &&
        Math.abs(c.position[2] - base.position[2]) < 0.01
      )
      .sort((a, b) => a.position[1] - b.position[1]);
    
    // Calculate target Y: place on top of the highest stacked chiplet
    let targetY: number;
    if (stacked.length === 0) {
      // No other stacked chiplets, place directly above base
      targetY = getTopY(base) + GAP + target.height / 2;
    } else {
      const highest = stacked[stacked.length - 1];
      targetY = getTopY(highest) + GAP + target.height / 2;
    }

    get().updateChiplet(target.id, {
      position: [base.position[0], targetY, base.position[2]] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [Math.abs(target.scale[0]), target.scale[1], target.scale[2]] as [number, number, number],
    });
    get().checkAlignment();
  },

  xfoldStack: () => {
    const { chiplets, selectedChipletId, baseChipletId } = get();
    if (!selectedChipletId || !baseChipletId || chiplets.length < 2) return;
    if (selectedChipletId === baseChipletId) return;

    get().saveSnapshot();

    const base = chiplets.find((c) => c.id === baseChipletId)!;
    const target = chiplets.find((c) => c.id === selectedChipletId)!;
    
    // Find all chiplets already stacked at base X/Z (excluding target)
    const stacked = chiplets
      .filter((c) => c.id !== target.id && 
        Math.abs(c.position[0] - base.position[0]) < 0.01 &&
        Math.abs(c.position[2] - base.position[2]) < 0.01
      )
      .sort((a, b) => a.position[1] - b.position[1]);
    
    // Calculate target Y
    let targetY: number;
    if (stacked.length === 0) {
      targetY = getTopY(base) + GAP + target.height / 2;
    } else {
      const highest = stacked[stacked.length - 1];
      targetY = getTopY(highest) + GAP + target.height / 2;
    }

    // X-fold: flip around X axis (like turning a page)
    // This puts the back face up
    const newScale: [number, number, number] = [Math.abs(target.scale[0]), target.scale[1], target.scale[2]];

    get().updateChiplet(target.id, {
      position: [base.position[0], targetY, base.position[2]] as [number, number, number],
      rotation: [Math.PI, 0, 0] as [number, number, number],
      scale: newScale,
    });
    get().checkAlignment();
  },

  yfoldStack: () => {
    const { chiplets, selectedChipletId, baseChipletId } = get();
    if (!selectedChipletId || !baseChipletId || chiplets.length < 2) return;
    if (selectedChipletId === baseChipletId) return;

    get().saveSnapshot();

    const base = chiplets.find((c) => c.id === baseChipletId)!;
    const target = chiplets.find((c) => c.id === selectedChipletId)!;
    
    // Find all chiplets already stacked at base X/Z (excluding target)
    const stacked = chiplets
      .filter((c) => c.id !== target.id && 
        Math.abs(c.position[0] - base.position[0]) < 0.01 &&
        Math.abs(c.position[2] - base.position[2]) < 0.01
      )
      .sort((a, b) => a.position[1] - b.position[1]);
    
    // Calculate target Y
    let targetY: number;
    if (stacked.length === 0) {
      targetY = getTopY(base) + GAP + target.height / 2;
    } else {
      const highest = stacked[stacked.length - 1];
      targetY = getTopY(highest) + GAP + target.height / 2;
    }

    // Y-fold: rotate 180° around Y axis (like spinning on a table)
    // This swaps left-right and front-back
    const newScale: [number, number, number] = [Math.abs(target.scale[0]), target.scale[1], target.scale[2]];

    get().updateChiplet(target.id, {
      position: [base.position[0], targetY, base.position[2]] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
      scale: newScale,
    });
    get().checkAlignment();
  },

  checkAlignment: () => {
    const { chiplets, tolerance } = get();
    const results: AlignmentResult[] = [];

    for (let i = 0; i < chiplets.length; i++) {
      for (let j = i + 1; j < chiplets.length; j++) {
        const c1 = chiplets[i];
        const c2 = chiplets[j];

        for (const bump1 of c1.bumps) {
          for (const bump2 of c2.bumps) {
            const dx = (c1.position[0] + bump1.position[0]) - (c2.position[0] + bump2.position[0]);
            const dz = (c1.position[2] + bump1.position[2]) - (c2.position[2] + bump2.position[2]);
            const distance = Math.sqrt(dx * dx + dz * dz);
            results.push({
              aligned: distance <= tolerance,
              distance,
              chipletId1: c1.id,
              chipletId2: c2.id,
              featureType: 'bump',
              featureId1: bump1.id,
              featureId2: bump2.id,
            });
          }
        }

        for (const tsv1 of c1.tsvs) {
          for (const tsv2 of c2.tsvs) {
            const dx = (c1.position[0] + tsv1.position[0]) - (c2.position[0] + tsv2.position[0]);
            const dz = (c1.position[2] + tsv1.position[1]) - (c2.position[2] + tsv2.position[1]);
            const distance = Math.sqrt(dx * dx + dz * dz);
            results.push({
              aligned: distance <= tolerance,
              distance,
              chipletId1: c1.id,
              chipletId2: c2.id,
              featureType: 'tsv',
              featureId1: tsv1.id,
              featureId2: tsv2.id,
            });
          }
        }
      }
    }

    set({ alignmentResults: results, showAlignment: true });
  },

  setShowAlignment: (show) => set({ showAlignment: show }),
  setTolerance: (tolerance) => set({ tolerance }),
  loadProject: (chiplets) => {
    set({ 
      chiplets: deepCloneChiplets(chiplets), 
      selectedChipletId: null, 
      baseChipletId: chiplets[0]?.id || null,
      history: [], 
      canRestore: false 
    });
  },
  clearAll: () => {
    set({ chiplets: [], selectedChipletId: null, baseChipletId: null, alignmentResults: [], history: [], canRestore: false });
  },
}));
