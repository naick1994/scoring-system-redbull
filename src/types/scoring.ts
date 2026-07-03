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
    speed_in_out: number;
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
