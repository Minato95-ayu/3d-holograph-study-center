import { create } from 'zustand';

interface StudoState {
  // Gesture State
  gestures: {
    active: boolean;
    type: string | null;
    confidence: number;
    handPosition: { x: number; y: number; z: number } | null;
  };
  setGestures: (gestures: StudoState['gestures']) => void;

  // Scene State
  scene: {
    modelLoaded: boolean;
    currentModel: string | null;
    isExploded: boolean;
  };
  setScene: (scene: Partial<StudoState['scene']>) => void;

  // Knowledge State
  knowledge: {
    query: string | null;
    summary: string | null;
    loading: boolean;
  };
  setKnowledge: (knowledge: Partial<StudoState['knowledge']>) => void;

  // UI State
  ui: {
    showHUD: boolean;
    activePanel: string | null;
  };
  setUI: (ui: Partial<StudoState['ui']>) => void;
}

export const useStudoStore = create<StudoState>((set) => ({
  gestures: {
    active: false,
    type: null,
    confidence: 0,
    handPosition: null,
  },
  setGestures: (gestures) => set({ gestures }),

  scene: {
    modelLoaded: false,
    currentModel: null,
    isExploded: false,
  },
  setScene: (scene) => set((state) => ({ scene: { ...state.scene, ...scene } })),

  knowledge: {
    query: null,
    summary: null,
    loading: false,
  },
  setKnowledge: (knowledge) => set((state) => ({ knowledge: { ...state.knowledge, ...knowledge } })),

  ui: {
    showHUD: true,
    activePanel: null,
  },
  setUI: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } })),
}));
