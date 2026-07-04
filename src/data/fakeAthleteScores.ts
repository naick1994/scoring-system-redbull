// Illustrative-only score breakdowns for athletes other than Leonardo, since
// we don't have their real Woo/jump data. Deterministic (seeded by name) so
// the same rider always shows the same numbers on reload, and loosely
// correlated with GKA ranking position so it still tells a coherent story.
// NOT real data — used purely to demo what a cross-athlete comparison view
// could look like once real sensor data exists for the whole field.

export interface FakeAreaBreakdown {
  area: 'HEIGHT' | 'EXTREMITY' | 'TECHNICALITY' | 'EXECUTION';
  score: number; // out of 10 * weight
  max: number;
}

export interface FakeAthleteScore {
  averageScore: number; // out of 10
  areas: FakeAreaBreakdown[];
}

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 10000) / 10000;
}

// GKA preset weights: 30/30/20/20
const AREA_WEIGHTS: { area: FakeAreaBreakdown['area']; weight: number }[] = [
  { area: 'HEIGHT', weight: 0.30 },
  { area: 'EXTREMITY', weight: 0.30 },
  { area: 'TECHNICALITY', weight: 0.20 },
  { area: 'EXECUTION', weight: 0.20 },
];

// `capBelow` keeps every illustrative score strictly under Leonardo's real
// average — he's the reigning #1, so the comparison tool should never make
// someone else look objectively stronger than him.
export function getFakeAthleteScore(athlete: string, rank: number, capBelow?: number): FakeAthleteScore {
  // Higher rank (lower number) -> higher baseline, with per-athlete jitter.
  const baseline = Math.max(5.5, 8.8 - (rank - 1) * 0.14);
  const jitter = (seededRandom(athlete) - 0.5) * 0.8;
  let averageScore = Math.max(4.5, Math.min(9.6, baseline + jitter));

  const cap = capBelow !== undefined ? capBelow - 0.1 - seededRandom(`${athlete}-gap`) * 0.6 : undefined;
  if (cap !== undefined && averageScore > cap) {
    averageScore = cap;
  }

  const areas = AREA_WEIGHTS.map(({ area, weight }, i) => {
    // Each area wobbles independently around the athlete's average, seeded
    // per area so a rider can be relatively stronger/weaker in one area.
    const areaJitter = (seededRandom(`${athlete}-${area}-${i}`) - 0.5) * 2.2;
    const areaAvgOutOf10 = Math.max(3, Math.min(10, averageScore + areaJitter));
    const max = weight * 10;
    return { area, score: (areaAvgOutOf10 / 10) * max, max };
  });

  return { averageScore, areas };
}
