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

  // Camera Status
  cameraStatus: 'idle' | 'loading' | 'active' | 'error';
  cameraError: string | null;
  setCameraStatus: (status: StudoState['cameraStatus'], error?: string | null) => void;

  // Scene State
  scene: {
    modelLoaded: boolean;
    currentModel: string | null;
    isExploded: boolean;
    hologramType: 'gltf' | 'molecule' | 'dna' | 'atom' | 'solar_system' | 'default';
  };
  setScene: (scene: Partial<StudoState['scene']>) => void;

  // Knowledge State
  knowledge: {
    query: string | null;
    title: string | null;
    summary: string | null;
    formulas: string[];
    components: string[];
    fun_fact: string;
    domain: string;
    loading: boolean;
    ario_intro: string;
  };
  setKnowledge: (knowledge: Partial<StudoState['knowledge']>) => void;

  // ARIO State
  ario: {
    state: 'idle' | 'listening' | 'thinking' | 'speaking';
    currentText: string | null;
    micActive: boolean;
  };
  setArio: (ario: Partial<StudoState['ario']>) => void;

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

  cameraStatus: 'idle',
  cameraError: null,
  setCameraStatus: (status, error = null) => set({ cameraStatus: status, cameraError: error }),

  scene: {
    modelLoaded: false,
    currentModel: null,
    isExploded: false,
    hologramType: 'default',
  },
  setScene: (scene) => set((state) => ({ scene: { ...state.scene, ...scene } })),

  knowledge: {
    query: null,
    title: null,
    summary: null,
    formulas: [],
    components: [],
    fun_fact: '',
    domain: 'general',
    loading: false,
    ario_intro: '',
  },
  setKnowledge: (knowledge) => set((state) => ({ knowledge: { ...state.knowledge, ...knowledge } })),

  ario: {
    state: 'idle',
    currentText: null,
    micActive: false,
  },
  setArio: (ario) => set((state) => ({ ario: { ...state.ario, ...ario } })),

  ui: {
    showHUD: true,
    activePanel: null,
  },
  setUI: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } })),
}));
