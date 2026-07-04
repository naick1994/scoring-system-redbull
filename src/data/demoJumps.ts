import type { JumpParameters, HeightAmplitudeThresholds, ScoringResult } from '@/types/scoring';
import { calculateScore, heightBracketForValue, amplitudeBracketForValue, PRESET_WEIGHTS } from '@/lib/scoring';

// ─── Shared demo data for Leonardo Casati's 3 real GKA jumps ──────────────────
// Used by both the Demo page (Live Demo, judge-scored Execution) and the
// Rider access area (Results/Feedback, fixed Execution values since there's
// no live judge session to read from there).

export interface WooData {
  maxHeight: number;
  airtime: number;
  distance: number;
  maxSpeed: number;
  approachSpeed: number;
  windAngle: number;
  quality: 'Good' | 'OK';
  peakTimeRatio: number;
  takeoffOffset: number;
  yankForce: number;      // peak IMU acceleration at loading moment, g-force
  freeFallTime: number;   // time spent near 0g during the jump, seconds
  kiteAngleDeg: number;   // angle from zenith, degrees (0=overhead, 180=level with rider)
  landingSpeedG: number;  // impact g-force at touchdown — informational only, doesn't affect scoring
}

export interface JumpDemoBase {
  id: number;
  label: string;
  athlete: string;
  trick: string;
  category: string;
  videoSrc?: string;
  woo: WooData;
  realScore: number;
  realScoreEvent: string;
}

export const DEMO_JUMPS_BASE: JumpDemoBase[] = [
  {
    id: 1, label: 'Jump 1', athlete: 'Leonardo Casati',
    trick: 'Late Backroll Kiteloop Double Flip Added Rotation',
    category: 'KLBRFL',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_7.33.mp4`,
    woo: { maxHeight: 15.9, airtime: 7.6, distance: 76,  maxSpeed: 46, approachSpeed: 32, windAngle: 18, quality: 'OK',   peakTimeRatio: 0.30, takeoffOffset: 0, yankForce: 3.3, freeFallTime: 0.9, kiteAngleDeg: 76, landingSpeedG: 2.1 },
    realScore: 7.33, realScoreEvent: 'Capital.com GKA Big Air World Cup Mykonos 2026',
  },
  {
    id: 2, label: 'Jump 2', athlete: 'Leonardo Casati',
    trick: 'Doobie Loop Boardoff by the Fin',
    category: 'KLFRBO',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.37.mp4`,
    woo: { maxHeight: 19.8, airtime: 7.5, distance: 83,  maxSpeed: 52, approachSpeed: 30, windAngle: 11, quality: 'Good', peakTimeRatio: 0.33, takeoffOffset: 0, yankForce: 4.1, freeFallTime: 1.6, kiteAngleDeg: 73, landingSpeedG: 1.9 },
    realScore: 8.37, realScoreEvent: 'Capital.com GKA Big Air World Cup Mykonos 2026',
  },
  {
    id: 3, label: 'Jump 3', athlete: 'Leonardo Casati',
    trick: 'Backroll Kiteloop Tornado',
    category: 'KLBRBO',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.07.mp4`,
    woo: { maxHeight: 17.5, airtime: 7.0, distance: 121, maxSpeed: 65, approachSpeed: 28, windAngle: 6,  quality: 'Good', peakTimeRatio: 0.30, takeoffOffset: 0, yankForce: 3.5, freeFallTime: 1.0, kiteAngleDeg: 78, landingSpeedG: 2.3 },
    realScore: 8.07, realScoreEvent: 'Capital.com GKA Big Air World Cup Mykonos 2026',
  },
];

// HEIGHT is derived from each jump's real Woo numbers against the currently
// configured thresholds — see heightBracketForValue/amplitudeBracketForValue.
export type DemoParamsCore = Omit<JumpParameters, 'HEIGHT' | 'EXECUTION'>;

export const DEMO_SCORING_PARAMS: [DemoParamsCore, DemoParamsCore, DemoParamsCore] = [
  {
    landingOutcome: 'clean',
    EXTREMITY:    { kite_angle: 'super_low', yank_power: 'medium', free_fall: 'medium' },
    TECHNICALITY: { rotations: '1', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '2', board_spin: '0' },
  },
  {
    landingOutcome: 'clean',
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '2', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '0', board_spin: '0' },
  },
  {
    landingOutcome: 'clean',
    EXTREMITY:    { kite_angle: 'super_low', yank_power: 'medium', free_fall: 'medium' },
    TECHNICALITY: { rotations: '3', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '0', board_spin: '0' },
  },
];

// Fixed Execution values (0-10 scale per slider) for the Rider area, which has
// no live judge session to read Execution from — these represent Leonardo's
// actual style/control level on each jump, consistent with a top-tier rider.
export const DEMO_EXECUTION_VALUES: [Record<string, number>, Record<string, number>, Record<string, number>] = [
  { style: 8, stability_control: 8, landing_control: 9, board_control: 7, kite_control: 8 },
  { style: 9, stability_control: 8, landing_control: 8, board_control: 8, kite_control: 9 },
  { style: 8, stability_control: 9, landing_control: 8, board_control: 8, kite_control: 8 },
];

// Builds the full JumpParameters + computed ScoringResult for demo jump
// `index` (0-2), using the GKA preset — shared by the Rider Results/Feedback
// pages, which have no live judge session to read Execution from.
export function buildDemoJumpResult(index: number, thresholds: HeightAmplitudeThresholds): ScoringResult {
  const base = DEMO_JUMPS_BASE[index];
  const execValues = DEMO_EXECUTION_VALUES[index];
  const params: JumpParameters = {
    ...DEMO_SCORING_PARAMS[index],
    HEIGHT: {
      height: heightBracketForValue(base.woo.maxHeight, thresholds.height),
      amplitude: amplitudeBracketForValue(base.woo.distance, thresholds.amplitude),
    },
    EXECUTION: {
      style: (execValues.style * 0.4) / 10,
      stability_control: (execValues.stability_control * 0.4) / 10,
      landing_control: (execValues.landing_control * 0.4) / 10,
      board_control: (execValues.board_control * 0.4) / 10,
      kite_control: (execValues.kite_control * 0.4) / 10,
    },
  };
  return calculateScore(params, PRESET_WEIGHTS.GKA, 'GKA');
}

// Leonardo's real average score and per-area breakdown across his 3 GKA
// jumps — used as the "real data" side of any athlete comparison view.
export function getLeonardoAverageBreakdown(thresholds: HeightAmplitudeThresholds): {
  averageScore: number;
  areas: { area: string; score: number; max: number }[];
} {
  const results = DEMO_JUMPS_BASE.map((_, i) => buildDemoJumpResult(i, thresholds));
  const averageScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;

  const areaTotals = new Map<string, { score: number; max: number }>();
  results.forEach(r => {
    r.areaScores.forEach(a => {
      const entry = areaTotals.get(a.area) ?? { score: 0, max: 0 };
      entry.score += a.finalScore;
      entry.max += a.weight * 10;
      areaTotals.set(a.area, entry);
    });
  });

  const areas = Array.from(areaTotals.entries()).map(([area, { score, max }]) => ({
    area,
    score: score / results.length,
    max: max / results.length,
  }));

  return { averageScore, areas };
}
