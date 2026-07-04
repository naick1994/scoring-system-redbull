export type LandingOutcome = 'crash' | 'butt' | 'clean';

export type EventPreset = 'GKA' | 'KOTA' | 'Megaloop' | 'Custom';

export interface PresetWeights {
  HEIGHT: number;
  EXTREMITY: number;
  TECHNICALITY: number;
  EXECUTION: number;
}

export interface OverallImpressionParams {
  variety: number;
  technical_difficulty: number;
  height: number;
  power: number;
  risk: number;
  commitment: number;
  execution: number;
  style: number;
  smoothness: number;
  show_wow_factor: number;
  innovation: number;
}

export interface PresetConfig {
  weights: PresetWeights;
  hasOverallImpression: boolean;
}

// Boundaries (in meters) between the 4 scoring brackets, set by the chief
// judge per event based on wind/conditions. Bracket 1 = [0, t1], bracket 2 =
// (t1, t2], bracket 3 = (t2, t3], bracket 4 = (t3, +inf).
export interface HeightAmplitudeThresholds {
  height: { t1: number; t2: number; t3: number };
  amplitude: { t1: number; t2: number; t3: number };
}

export interface JumpParameters {
  landingOutcome: LandingOutcome;
  HEIGHT: {
    height: string;
    amplitude: string;
    landing_speed?: string;
  };
  EXTREMITY: {
    kite_angle: string;
    yank_power: string;
    free_fall: string;
  };
  TECHNICALITY: {
    rotations: string;
    rotation_axis: string;
    board_off: string;
    board_flip?: string;
    board_tic_tac?: string;
  };
  EXECUTION: {
    style: number;
    stability_control: number;
    landing_control: number;
    board_control: number;
    kite_control: number;
  };
}

export interface ParameterScore {
  label: string;
  value: string | number;
  points: number;
  max: number;
}

export interface AreaScore {
  area: string;
  subtotal: number;
  max: number;
  normalized: number;
  weight: number;
  finalScore: number;
  parameters: ParameterScore[];
}

export interface ScoringResult {
  totalScore: number;
  areaScores: AreaScore[];
  penalty: number;
  penaltyReason: string;
  jumpParameters: JumpParameters;
  preset: EventPreset;
  weights: PresetWeights;
}
