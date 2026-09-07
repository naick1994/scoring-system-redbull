/**
 * Dati e calcoli condivisi per le pagine /kota (indice + una per ogni
 * combinazione). Dati reali: Cold Hawaii, finale maschile, Heat 22.
 * L'Impression giudici non cambia in nessuna proposta, resta fissa al
 * valore reale della gara.
 */

export interface RiderHeat {
  name: string;
  jumps: number[];
  impression: number;
  officialResult: number;
}

export const HEAT22: RiderHeat[] = [
  { name: 'Leonardo Casati', jumps: [7.6, 7.43, 7.47, 7.2, 7.05, 6.87, 7.23, 7.6, 8.2, 8.47], impression: 2.33, officialResult: 24.27 },
  { name: 'Lorenzo Casati', jumps: [6.9, 7.5, 7.3, 7, 7.47, 5.8, 6.97, 7.03, 8.13, 7.77, 0, 0, 0], impression: 2.6, officialResult: 23.4 },
  { name: 'Stijn Mul', jumps: [7.25, 7, 6.77, 0, 7, 7.1, 7.1, 7.27, 6.87, 7.2, 0, 0], impression: 1.53, officialResult: 21.72 },
];

export function fmt(n: number, d = 2) {
  return n.toFixed(d);
}

export function topN(values: number[], n: number) {
  return [...values].sort((a, b) => b - a).slice(0, n);
}

export function topNSum(values: number[], n: number) {
  return topN(values, n).reduce((a, b) => a + b, 0);
}

export type MechanicKey = 'A' | 'B' | 'C' | 'D' | 'E';
const THRESHOLD = 6.5;

const STEPS: [min: number, pts: number][] = [
  [9.0, 1.4], [8.5, 1.25], [8.0, 1.1], [7.5, 1.0], [7.0, 0.9], [6.5, 0.8], [6.0, 0.55], [5.5, 0.3], [5.0, 0.15],
];
function stepLookup(vote: number) {
  for (const [min, pts] of STEPS) if (vote >= min) return pts;
  return 0;
}

export const MECHANICS: Record<MechanicKey, {
  label: string;
  shortLabel: string;
  explain: string;
  usesSoglia: boolean;
  points: (v: number) => number;
}> = {
  A: {
    label: 'Binaria (soglia 6.5)',
    shortLabel: 'Come oggi',
    explain: 'Tutto o niente: sopra voto 6.5 vale 1 punto pieno, sotto vale zero.',
    usesSoglia: true,
    points: (v) => (v >= THRESHOLD ? 1 : 0),
  },
  B: {
    label: 'Progressivo a scalini con soglia',
    shortLabel: 'A scalini',
    explain: 'Sotto voto 6.5 vale zero. Sopra, più il voto è alto, più punti dà, a scaglioni.',
    usesSoglia: true,
    points: (v) => (v < THRESHOLD ? 0 : stepLookup(v)),
  },
  C: {
    label: 'Progressivo a scalini senza soglia',
    shortLabel: 'A scalini, senza minimo',
    explain: 'Come la regola a scalini, ma anche un trick sotto voto 6.5 vale qualcosa, anche se poco: azzera la zona morta sotto soglia.',
    usesSoglia: false,
    points: (v) => stepLookup(v),
  },
  D: {
    label: 'Proporzionale con soglia',
    shortLabel: 'Proporzionale',
    explain: 'Sotto voto 6.5 vale zero. Sopra, i punti crescono in modo continuo col voto: una retta invece di scaglioni.',
    usesSoglia: true,
    points: (v) => (v < THRESHOLD ? 0 : ((v - THRESHOLD) / (10 - THRESHOLD)) * 1.4),
  },
  E: {
    label: 'Proporzionale senza soglia',
    shortLabel: 'Proporzionale, senza minimo',
    explain: 'Come sopra, ma senza un voto minimo: una retta pura dal primo decimo, nessuna zona morta.',
    usesSoglia: false,
    points: (v) => (v / 10) * 1.4,
  },
};
export const MECHANIC_KEYS: MechanicKey[] = ['A', 'B', 'C', 'D', 'E'];

/** Somma dei punti trick-nuovo per un rider, con cap a 7 e freno anti-spam per le meccaniche senza soglia effettiva (C, E). */
export function bonusBucketTotal(votes: number[], mechanic: MechanicKey): number {
  const per = votes.map((v) => MECHANICS[mechanic].points(v));
  let total: number;
  if (mechanic === 'C' || mechanic === 'E') {
    let subSum = 0;
    let supSum = 0;
    votes.forEach((v, i) => {
      if (v < 6.5) subSum += per[i];
      else supSum += per[i];
    });
    total = Math.min(subSum, 2.0) + supSum;
  } else {
    total = per.reduce((a, b) => a + b, 0);
  }
  return Math.min(total, 7.0);
}

export type JumpCount = 3 | 5 | 7;

export interface Combo {
  id: string;
  mechanic: MechanicKey;
  jumps: JumpCount;
  isBaseline: boolean;
  note: string;
}

export const COMBOS: Combo[] = [
  { id: 'attuale', mechanic: 'A', jumps: 3, isBaseline: true, note: 'Sistema in uso oggi, baseline: non è una proposta.' },
  { id: 'a5', mechanic: 'A', jumps: 5, isBaseline: false, note: 'Solo più salti contati, la meccanica del trick nuovo resta invariata.' },
  { id: 'a7', mechanic: 'A', jumps: 7, isBaseline: false, note: 'Solo più salti contati, la meccanica del trick nuovo resta invariata.' },
  { id: 'b3', mechanic: 'B', jumps: 3, isBaseline: false, note: "Il documento di proposta ricevuto da altri giudici (WindGames), così com'è." },
  { id: 'b5', mechanic: 'B', jumps: 5, isBaseline: false, note: 'La proposta WindGames, ma contando più salti.' },
  { id: 'b7', mechanic: 'B', jumps: 7, isBaseline: false, note: 'La proposta WindGames, ma contando ancora più salti.' },
  { id: 'c3', mechanic: 'C', jumps: 3, isBaseline: false, note: "Come la proposta WindGames, ma azzera la zona morta sotto soglia." },
  { id: 'c5', mechanic: 'C', jumps: 5, isBaseline: false, note: '' },
  { id: 'c7', mechanic: 'C', jumps: 7, isBaseline: false, note: '' },
  { id: 'd3', mechanic: 'D', jumps: 3, isBaseline: false, note: 'Una retta lineare invece di scaglioni, sopra soglia.' },
  { id: 'd5', mechanic: 'D', jumps: 5, isBaseline: false, note: '' },
  { id: 'd7', mechanic: 'D', jumps: 7, isBaseline: false, note: '' },
  { id: 'e3', mechanic: 'E', jumps: 3, isBaseline: false, note: 'Una retta pura, nessuna zona morta sotto soglia.' },
  { id: 'e5', mechanic: 'E', jumps: 5, isBaseline: false, note: '' },
  { id: 'e7', mechanic: 'E', jumps: 7, isBaseline: false, note: '' },
];

export function comboById(id: string): Combo | undefined {
  return COMBOS.find((c) => c.id === id);
}

export function denomFor(jumps: JumpCount) {
  return jumps * 10 + 10;
}

export interface ComboRiderResult {
  name: string;
  jumpsSum: number;
  bonus: number;
  impression: number;
  total: number;
}

export function computeCombo(combo: Combo): ComboRiderResult[] {
  return HEAT22.map((r) => {
    const jumpsSum = topNSum(r.jumps, combo.jumps);
    const clean = r.jumps.filter((v) => v > 0);
    const bonus = bonusBucketTotal(clean, combo.mechanic);
    const total = jumpsSum + bonus + r.impression;
    return { name: r.name, jumpsSum, bonus, impression: r.impression, total };
  });
}

export function rankOf(results: ComboRiderResult[]) {
  const sorted = [...results].sort((a, b) => b.total - a.total);
  return results.map((r) => sorted.findIndex((s) => s.name === r.name) + 1);
}
