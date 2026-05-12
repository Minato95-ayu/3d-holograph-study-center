// Hologram Engine — Detects what 3D hologram to show based on query
// Then fetches real 3D data from PubChem (molecules) or maps to GLTF models

export type HologramType = 'molecule' | 'anatomy' | 'atom' | 'solar_system' | 'dna' | 'gltf' | 'default';

export interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
}

export interface BondData {
  atom1: number;
  atom2: number;
  order: number;
}

export interface MoleculeData {
  name: string;
  formula: string;
  cid: number;
  atoms: AtomData[];
  bonds: BondData[];
}

export interface HologramConfig {
  type: HologramType;
  query: string;
  moleculeData?: MoleculeData;
  gltfUrl?: string;
  label: string;
}

// CPK Color scheme for atoms
export const CPK_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#909090',
  N: '#3050f8',
  O: '#ff0d0d',
  F: '#90e050',
  S: '#ffff30',
  P: '#ff8000',
  Cl: '#1ff01f',
  Br: '#a62929',
  I: '#940094',
  Na: '#ab5cf2',
  Ca: '#3dff00',
  Fe: '#e06633',
  default: '#ff69b4',
};

// Atom radii in Angstroms (visual scale)
export const ATOM_RADII: Record<string, number> = {
  H: 0.25, C: 0.4, N: 0.38, O: 0.35, F: 0.32,
  S: 0.5, P: 0.48, Cl: 0.45, Br: 0.52, I: 0.6,
  Na: 0.55, Ca: 0.6, Fe: 0.55, default: 0.4,
};

// Known molecule keywords → PubChem name
const MOLECULE_KEYWORDS: Record<string, string> = {
  water: 'water', h2o: 'water',
  dna: 'deoxyadenosine', // simplified
  caffeine: 'caffeine',
  aspirin: 'aspirin',
  glucose: 'glucose',
  salt: 'sodium chloride', nacl: 'sodium chloride',
  co2: 'carbon dioxide', 'carbon dioxide': 'carbon dioxide',
  methane: 'methane', ch4: 'methane',
  ethanol: 'ethanol', alcohol: 'ethanol',
  ammonia: 'ammonia', nh3: 'ammonia',
  benzene: 'benzene',
  atp: 'adenosine triphosphate',
  vitamin: 'ascorbic acid', 'vitamin c': 'ascorbic acid',
  penicillin: 'penicillin',
  dopamine: 'dopamine',
  serotonin: 'serotonin',
  testosterone: 'testosterone',
  cholesterol: 'cholesterol',
  acetylsalicylic: 'aspirin',
  ibuprofen: 'ibuprofen',
  paracetamol: 'paracetamol', acetaminophen: 'paracetamol',
  oxygen: 'dioxygen', o2: 'dioxygen',
  nitrogen: 'dinitrogen', n2: 'dinitrogen',
  hydrogen: 'hydrogen', h2: 'hydrogen',
};

// Known anatomy/GLTF model keywords
const ANATOMY_KEYWORDS: Record<string, string> = {
  heart: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/anatomy-heart/model.gltf',
  engine: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/engine/model.gltf',
  drone: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/drone/model.gltf',
  helmet: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
};

// Classify the query into a hologram type
export function classifyQuery(query: string): { type: HologramType; key: string } {
  const q = query.toLowerCase().trim();

  // DNA special case
  if (q.includes('dna') || q.includes('double helix') || q.includes('rna')) {
    return { type: 'dna', key: 'dna' };
  }

  // Solar system
  if (q.includes('solar system') || q.includes('planet') || q.includes('orbit')) {
    return { type: 'solar_system', key: 'solar_system' };
  }

  // Atom / Bohr model
  if ((q.includes('atom') && !q.includes('atomic')) || q.includes('bohr') || q.includes('electron') || q.includes('proton') || q.includes('neutron')) {
    return { type: 'atom', key: q.includes('helium') ? 'helium' : q.includes('carbon') ? 'carbon' : 'hydrogen' };
  }

  // Anatomy models
  for (const [keyword] of Object.entries(ANATOMY_KEYWORDS)) {
    if (q.includes(keyword)) {
      return { type: 'anatomy', key: keyword };
    }
  }

  // Molecule check
  for (const [keyword, pubchemName] of Object.entries(MOLECULE_KEYWORDS)) {
    if (q.includes(keyword)) {
      return { type: 'molecule', key: pubchemName };
    }
  }

  // If query contains chemical formula pattern (e.g., H2O, CO2)
  if (/[A-Z][a-z]?\d*/.test(query) && query.length < 10) {
    return { type: 'molecule', key: query };
  }

  return { type: 'default', key: query };
}

// Fetch molecule 3D data from PubChem API
export async function fetchMolecule3D(name: string): Promise<MoleculeData | null> {
  try {
    // Step 1: Get CID
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`;
    const cidRes = await fetch(searchUrl);
    if (!cidRes.ok) return null;
    const cidData = await cidRes.json();
    const cid = cidData?.IdentifierList?.CID?.[0];
    if (!cid) return null;

    // Step 2: Get 3D conformer
    const conformerUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/JSON?record_type=3d`;
    const conformerRes = await fetch(conformerUrl);
    if (!conformerRes.ok) return null;
    const conformerData = await conformerRes.json();

    const compound = conformerData?.PC_Compounds?.[0];
    if (!compound) return null;

    // Extract atoms
    const elements = compound.atoms?.element || [];
    const xs = compound.coords?.[0]?.conformers?.[0]?.x || [];
    const ys = compound.coords?.[0]?.conformers?.[0]?.y || [];
    const zs = compound.coords?.[0]?.conformers?.[0]?.z || [];

    // Element number to symbol
    const elementMap: Record<number, string> = {
      1: 'H', 6: 'C', 7: 'N', 8: 'O', 9: 'F',
      15: 'P', 16: 'S', 17: 'Cl', 35: 'Br', 53: 'I',
      11: 'Na', 20: 'Ca', 26: 'Fe',
    };

    const atoms: AtomData[] = elements.map((el: number, i: number) => ({
      element: elementMap[el] || 'C',
      x: xs[i] || 0,
      y: ys[i] || 0,
      z: zs[i] || 0,
    }));

    // Extract bonds
    const bondAids1 = compound.bonds?.aid1 || [];
    const bondAids2 = compound.bonds?.aid2 || [];
    const bondOrders = compound.bonds?.order || [];

    const bonds: BondData[] = bondAids1.map((a1: number, i: number) => ({
      atom1: a1 - 1,
      atom2: bondAids2[i] - 1,
      order: bondOrders[i] || 1,
    }));

    // Get formula from properties
    const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula/JSON`;
    const propRes = await fetch(propUrl);
    const propData = await propRes.json();
    const formula = propData?.PropertyTable?.Properties?.[0]?.MolecularFormula || name;

    return {
      name,
      formula,
      cid,
      atoms,
      bonds,
    };
  } catch (e) {
    console.error('PubChem fetch error:', e);
    return null;
  }
}

// Main function: build hologram config from query
export async function buildHologram(query: string): Promise<HologramConfig> {
  const { type, key } = classifyQuery(query);

  if (type === 'molecule') {
    const moleculeData = await fetchMolecule3D(key);
    if (moleculeData) {
      return {
        type: 'molecule',
        query,
        moleculeData,
        label: `${moleculeData.name} — ${moleculeData.formula}`,
      };
    }
  }

  if (type === 'anatomy') {
    const url = ANATOMY_KEYWORDS[key];
    return { type: 'anatomy', query, gltfUrl: url, label: key };
  }

  if (type === 'dna') {
    return { type: 'dna', query, label: 'DNA Double Helix' };
  }

  if (type === 'solar_system') {
    return { type: 'solar_system', query, label: 'Solar System' };
  }

  if (type === 'atom') {
    return { type: 'atom', query, label: `${key} Atom` };
  }

  // Default: try to load anatomy or fall back to helmet
  return {
    type: 'default',
    query,
    gltfUrl: ANATOMY_KEYWORDS[key] || undefined,
    label: query,
  };
}
