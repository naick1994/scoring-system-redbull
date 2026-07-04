import { JumpParameters, PresetWeights, ScoringResult, AreaScore, ParameterScore, HeightAmplitudeThresholds } from '@/types/scoring';

export const DEFAULT_HEIGHT_AMPLITUDE_THRESHOLDS: HeightAmplitudeThresholds = {
  height: { t1: 10, t2: 15, t3: 20 },
  amplitude: { t1: 40, t2: 80, t3: 120 },
};

// Bracket ids are stable identifiers independent of the actual meter
// boundaries, which the chief judge can reconfigure per event.
export const HEIGHT_BRACKET_POINTS: Record<string, number> = { b1: 0, b2: 0.6, b3: 0.9, b4: 1.5 };
export const AMPLITUDE_BRACKET_POINTS: Record<string, number> = { b1: 0, b2: 0.33, b3: 0.67, b4: 1.0 };

export function heightBracketLabel(bracket: 'b1' | 'b2' | 'b3' | 'b4', t: HeightAmplitudeThresholds['height']): string {
  switch (bracket) {
    case 'b1': return `0-${t.t1}m`;
    case 'b2': return `${t.t1}-${t.t2}m`;
    case 'b3': return `${t.t2}-${t.t3}m`;
    case 'b4': return `+${t.t3}m`;
  }
}

export function amplitudeBracketLabel(bracket: 'b1' | 'b2' | 'b3' | 'b4', t: HeightAmplitudeThresholds['amplitude']): string {
  switch (bracket) {
    case 'b1': return `0-${t.t1}m`;
    case 'b2': return `${t.t1}-${t.t2}m`;
    case 'b3': return `${t.t2}-${t.t3}m`;
    case 'b4': return `+${t.t3}m`;
  }
}

// Maps a raw sensor value (meters) to the bracket it falls into under the
// currently configured thresholds — recomputes automatically when the
// chief judge changes the thresholds. Each threshold is the minimum value
// that earns the next tier, so reaching t3 exactly already scores max (b4).
export function heightBracketForValue(value: number, t: HeightAmplitudeThresholds['height']): 'b1' | 'b2' | 'b3' | 'b4' {
  if (value < t.t1) return 'b1';
  if (value < t.t2) return 'b2';
  if (value < t.t3) return 'b3';
  return 'b4';
}

export function amplitudeBracketForValue(value: number, t: HeightAmplitudeThresholds['amplitude']): 'b1' | 'b2' | 'b3' | 'b4' {
  if (value < t.t1) return 'b1';
  if (value < t.t2) return 'b2';
  if (value < t.t3) return 'b3';
  return 'b4';
}

// Display label for the HEIGHT area — it covers both height and amplitude
// sub-parameters, so it's always shown as "HEIGHT & AMPLITUDE" to the user.
export const AREA_DISPLAY_NAMES: Record<string, string> = {
  HEIGHT: 'HEIGHT & AMPLITUDE',
  EXTREMITY: 'EXTREMITY',
  TECHNICALITY: 'TECHNICALITY',
  EXECUTION: 'EXECUTION',
};

export const PRESET_WEIGHTS: Record<string, PresetWeights> = {
  GKA: { HEIGHT: 30, EXTREMITY: 30, TECHNICALITY: 20, EXECUTION: 20 },
  KOTA: { HEIGHT: 30, EXTREMITY: 30, TECHNICALITY: 25, EXECUTION: 15 },
  Megaloop: { HEIGHT: 45, EXTREMITY: 45, TECHNICALITY: 10, EXECUTION: 0 },
};

export const PRESET_CONFIG: Record<string, { weights: PresetWeights; hasOverallImpression: boolean }> = {
  GKA: {
    weights: { HEIGHT: 30, EXTREMITY: 30, TECHNICALITY: 20, EXECUTION: 20 },
    hasOverallImpression: false
  },
  KOTA: { 
    weights: { HEIGHT: 30, EXTREMITY: 30, TECHNICALITY: 25, EXECUTION: 15 },
    hasOverallImpression: true
  },
  Megaloop: { 
    weights: { HEIGHT: 45, EXTREMITY: 45, TECHNICALITY: 10, EXECUTION: 0 },
    hasOverallImpression: false
  },
  Custom: {
    weights: { HEIGHT: 25, EXTREMITY: 25, TECHNICALITY: 25, EXECUTION: 25 },
    hasOverallImpression: false
  }
};

export const OVERALL_IMPRESSION_CONFIG = {
  variety: { 
    label: 'Variety',
    description: 'Diversity and range of tricks',
    max: 10 
  },
  technical_difficulty: { 
    label: 'Technical Difficulty',
    description: 'Complexity of maneuvers',
    max: 10 
  },
  height: { 
    label: 'Height',
    description: 'Altitude achieved',
    max: 10 
  },
  power: { 
    label: 'Power',
    description: 'Strength and explosiveness',
    max: 10 
  },
  risk: { 
    label: 'Risk',
    description: 'Level of danger taken',
    max: 10 
  },
  commitment: { 
    label: 'Commitment',
    description: 'Full dedication to execution',
    max: 10 
  },
  execution: { 
    label: 'Execution',
    description: 'Quality of performance',
    max: 10 
  },
  style: { 
    label: 'Style',
    description: 'Aesthetic quality and flair',
    max: 10 
  },
  smoothness: { 
    label: 'Smoothness',
    description: 'Flow and fluidity',
    max: 10 
  },
  show_wow_factor: { 
    label: 'Show/Wow Factor',
    description: 'Entertainment and impact',
    max: 10 
  },
  innovation: { 
    label: 'Innovation',
    description: 'Creativity and originality',
    max: 10 
  },
};

export const PARAMETER_CONFIG = {
  HEIGHT: {
    height: {
      label: 'Height',
      max: 1.5,
      map: HEIGHT_BRACKET_POINTS,
    },
    amplitude: {
      label: 'Amplitude',
      max: 1.0,
      map: AMPLITUDE_BRACKET_POINTS,
    },
  },
  EXTREMITY: {
    kite_angle: {
      label: 'Kite Angle',
      max: 0.75,
      map: { 
        high: 0,        // 0° - 30°
        average: 0.25,  // 31° - 50°
        low: 0.5,       // 51° - 70°
        super_low: 0.75 // 71° - 90°+
      },
    },
    yank_power: {
      label: 'Yank Power',
      max: 0.75,
      map: { none: 0, low: 0.25, medium: 0.5, bomb: 0.75 },
    },
    free_fall: {
      label: 'Free Fall',
      max: 0.5,
      map: { poor: 0, medium: 0.25, high: 0.5 },
    },
  },
  TECHNICALITY: {
    rotations: {
      label: 'Rotations',
      max: 1.0,
      map: { '1': 0.25, '2': 0.50, '3': 0.75, '4+': 1.0 },
    },
    rotation_axis: {
      label: 'Rotation Axis',
      max: 0.5,
      map: { horizontal: 0.5, vertical: 0.2 },
    },
    board_off: {
      label: 'Board Off',
      max: 1.0,
      map: { yes: 1.0, no: 0 },
    },
    board_flip: {
      label: 'Board Flip',
      max: 0.3,
      map: { '0': 0, '1': 0.10, '2': 0.20, '3+': 0.30 },
    },
    board_spin: {
      label: 'Board Spin',
      max: 0.2,
      map: { '0': 0, '1': 0.07, '2': 0.14, '3+': 0.20 },
    },
  },
  EXECUTION: {
    style: { label: 'Style', max: 0.4 },
    stability_control: { label: 'Stability & Control', max: 0.4 },
    landing_control: { label: 'Landing Control', max: 0.4 },
    board_control: { label: 'Board Control', max: 0.4 },
    kite_control: { label: 'Kite Control', max: 0.4 },
  },
};

export function calculateScore(
  parameters: JumpParameters,
  weights: PresetWeights,
  preset: string = 'Custom'
): ScoringResult {
  // Crash = automatic 0
  if (parameters.landingOutcome === 'crash') {
    return {
      totalScore: 0,
      areaScores: [],
      penalty: 1,
      penaltyReason: 'Crash: total score set to zero',
      jumpParameters: parameters,
      preset: preset as any,
      weights,
    };
  }

  const areaScores: AreaScore[] = [];

  // Calculate HEIGHT
  const heightParams: ParameterScore[] = [];
  let heightSubtotal = 0;
  let heightMax = 0;

  const heightPoints = PARAMETER_CONFIG.HEIGHT.height.map[parameters.HEIGHT.height as keyof typeof PARAMETER_CONFIG.HEIGHT.height.map] || 0;
  heightParams.push({
    label: PARAMETER_CONFIG.HEIGHT.height.label,
    value: parameters.HEIGHT.height,
    points: heightPoints,
    max: PARAMETER_CONFIG.HEIGHT.height.max,
  });
  heightSubtotal += heightPoints;
  heightMax += PARAMETER_CONFIG.HEIGHT.height.max;

  const amplitudePoints = PARAMETER_CONFIG.HEIGHT.amplitude.map[parameters.HEIGHT.amplitude as keyof typeof PARAMETER_CONFIG.HEIGHT.amplitude.map] || 0;
  heightParams.push({
    label: PARAMETER_CONFIG.HEIGHT.amplitude.label,
    value: parameters.HEIGHT.amplitude,
    points: amplitudePoints,
    max: PARAMETER_CONFIG.HEIGHT.amplitude.max,
  });
  heightSubtotal += amplitudePoints;
  heightMax += PARAMETER_CONFIG.HEIGHT.amplitude.max;

  const heightNormalized = heightMax > 0 ? heightSubtotal / heightMax : 0;
  const heightWeight = weights.HEIGHT / 100;
  if (weights.HEIGHT > 0) {
    areaScores.push({
      area: 'HEIGHT',
      subtotal: heightSubtotal,
      max: heightMax,
      normalized: heightNormalized,
      weight: heightWeight,
      finalScore: heightNormalized * 10 * heightWeight,
      parameters: heightParams,
    });
  }

  // Calculate EXTREMITY
  const extremityParams: ParameterScore[] = [];
  let extremitySubtotal = 0;
  let extremityMax = 0;

  const kiteAnglePoints = PARAMETER_CONFIG.EXTREMITY.kite_angle.map[parameters.EXTREMITY.kite_angle as keyof typeof PARAMETER_CONFIG.EXTREMITY.kite_angle.map] || 0;
  extremityParams.push({
    label: PARAMETER_CONFIG.EXTREMITY.kite_angle.label,
    value: parameters.EXTREMITY.kite_angle,
    points: kiteAnglePoints,
    max: PARAMETER_CONFIG.EXTREMITY.kite_angle.max,
  });
  extremitySubtotal += kiteAnglePoints;
  extremityMax += PARAMETER_CONFIG.EXTREMITY.kite_angle.max;

  const yankPowerPoints = PARAMETER_CONFIG.EXTREMITY.yank_power.map[parameters.EXTREMITY.yank_power as keyof typeof PARAMETER_CONFIG.EXTREMITY.yank_power.map] || 0;
  extremityParams.push({
    label: PARAMETER_CONFIG.EXTREMITY.yank_power.label,
    value: parameters.EXTREMITY.yank_power,
    points: yankPowerPoints,
    max: PARAMETER_CONFIG.EXTREMITY.yank_power.max,
  });
  extremitySubtotal += yankPowerPoints;
  extremityMax += PARAMETER_CONFIG.EXTREMITY.yank_power.max;

  const freeFallPoints = PARAMETER_CONFIG.EXTREMITY.free_fall.map[parameters.EXTREMITY.free_fall as keyof typeof PARAMETER_CONFIG.EXTREMITY.free_fall.map] || 0;
  extremityParams.push({
    label: PARAMETER_CONFIG.EXTREMITY.free_fall.label,
    value: parameters.EXTREMITY.free_fall,
    points: freeFallPoints,
    max: PARAMETER_CONFIG.EXTREMITY.free_fall.max,
  });
  extremitySubtotal += freeFallPoints;
  extremityMax += PARAMETER_CONFIG.EXTREMITY.free_fall.max;

  const extremityNormalized = extremityMax > 0 ? extremitySubtotal / extremityMax : 0;
  const extremityWeight = weights.EXTREMITY / 100;
  if (weights.EXTREMITY > 0) {
    areaScores.push({
      area: 'EXTREMITY',
      subtotal: extremitySubtotal,
      max: extremityMax,
      normalized: extremityNormalized,
      weight: extremityWeight,
      finalScore: extremityNormalized * 10 * extremityWeight,
      parameters: extremityParams,
    });
  }

  // Calculate TECHNICALITY
  const technicalityParams: ParameterScore[] = [];
  let technicalitySubtotal = 0;
  let technicalityMax = 0;

  const rotationsPoints = PARAMETER_CONFIG.TECHNICALITY.rotations.map[parameters.TECHNICALITY.rotations as keyof typeof PARAMETER_CONFIG.TECHNICALITY.rotations.map] || 0;
  technicalityParams.push({
    label: PARAMETER_CONFIG.TECHNICALITY.rotations.label,
    value: parameters.TECHNICALITY.rotations,
    points: rotationsPoints,
    max: PARAMETER_CONFIG.TECHNICALITY.rotations.max,
  });
  technicalitySubtotal += rotationsPoints;
  technicalityMax += PARAMETER_CONFIG.TECHNICALITY.rotations.max;

  const rotationAxisPoints = PARAMETER_CONFIG.TECHNICALITY.rotation_axis.map[parameters.TECHNICALITY.rotation_axis as keyof typeof PARAMETER_CONFIG.TECHNICALITY.rotation_axis.map] || 0;
  technicalityParams.push({
    label: PARAMETER_CONFIG.TECHNICALITY.rotation_axis.label,
    value: parameters.TECHNICALITY.rotation_axis,
    points: rotationAxisPoints,
    max: PARAMETER_CONFIG.TECHNICALITY.rotation_axis.max,
  });
  technicalitySubtotal += rotationAxisPoints;
  technicalityMax += PARAMETER_CONFIG.TECHNICALITY.rotation_axis.max;

  const boardOffPoints = PARAMETER_CONFIG.TECHNICALITY.board_off.map[parameters.TECHNICALITY.board_off as keyof typeof PARAMETER_CONFIG.TECHNICALITY.board_off.map] || 0;
  technicalityParams.push({
    label: PARAMETER_CONFIG.TECHNICALITY.board_off.label,
    value: parameters.TECHNICALITY.board_off,
    points: boardOffPoints,
    max: PARAMETER_CONFIG.TECHNICALITY.board_off.max,
  });
  technicalitySubtotal += boardOffPoints;
  technicalityMax += PARAMETER_CONFIG.TECHNICALITY.board_off.max;

  if (parameters.TECHNICALITY.board_off === 'yes') {
    if (parameters.TECHNICALITY.board_flip) {
      const boardFlipPoints = PARAMETER_CONFIG.TECHNICALITY.board_flip.map[parameters.TECHNICALITY.board_flip as keyof typeof PARAMETER_CONFIG.TECHNICALITY.board_flip.map] || 0;
      technicalityParams.push({
        label: PARAMETER_CONFIG.TECHNICALITY.board_flip.label,
        value: parameters.TECHNICALITY.board_flip,
        points: boardFlipPoints,
        max: PARAMETER_CONFIG.TECHNICALITY.board_flip.max,
      });
      technicalitySubtotal += boardFlipPoints;
      technicalityMax += PARAMETER_CONFIG.TECHNICALITY.board_flip.max;
    }

    if (parameters.TECHNICALITY.board_spin) {
      const boardSpinPoints = PARAMETER_CONFIG.TECHNICALITY.board_spin.map[parameters.TECHNICALITY.board_spin as keyof typeof PARAMETER_CONFIG.TECHNICALITY.board_spin.map] || 0;
      technicalityParams.push({
        label: PARAMETER_CONFIG.TECHNICALITY.board_spin.label,
        value: parameters.TECHNICALITY.board_spin,
        points: boardSpinPoints,
        max: PARAMETER_CONFIG.TECHNICALITY.board_spin.max,
      });
      technicalitySubtotal += boardSpinPoints;
      technicalityMax += PARAMETER_CONFIG.TECHNICALITY.board_spin.max;
    }
  }

  const technicalityNormalized = technicalityMax > 0 ? technicalitySubtotal / technicalityMax : 0;
  const technicalityWeight = weights.TECHNICALITY / 100;
  if (weights.TECHNICALITY > 0) {
    areaScores.push({
      area: 'TECHNICALITY',
      subtotal: technicalitySubtotal,
      max: technicalityMax,
      normalized: technicalityNormalized,
      weight: technicalityWeight,
      finalScore: technicalityNormalized * 10 * technicalityWeight,
      parameters: technicalityParams,
    });
  }

  // Calculate EXECUTION
  const executionParams: ParameterScore[] = [];
  let executionSubtotal = 0;
  let executionMax = 0;

  Object.entries(parameters.EXECUTION).forEach(([key, value]) => {
    const config = PARAMETER_CONFIG.EXECUTION[key as keyof typeof PARAMETER_CONFIG.EXECUTION];
    const points = value;
    executionParams.push({
      label: config.label,
      value: value,
      points: points,
      max: config.max,
    });
    executionSubtotal += points;
    executionMax += config.max;
  });

  const executionNormalized = executionMax > 0 ? executionSubtotal / executionMax : 0;
  const executionWeight = weights.EXECUTION / 100;
  if (weights.EXECUTION > 0) {
    areaScores.push({
      area: 'EXECUTION',
      subtotal: executionSubtotal,
      max: executionMax,
      normalized: executionNormalized,
      weight: executionWeight,
      finalScore: executionNormalized * 10 * executionWeight,
      parameters: executionParams,
    });
  }

  let totalScore = areaScores.reduce((sum, area) => sum + area.finalScore, 0);
  let penalty = 0;
  let penaltyReason = 'Clean landing: no penalty';

  if (parameters.landingOutcome === 'butt') {
    penalty = 0.5;
    totalScore *= 0.5;
    penaltyReason = 'Butt landing: 50% penalty applied';
  }

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    areaScores,
    penalty,
    penaltyReason,
    jumpParameters: parameters,
    preset: preset as any,
    weights,
  };
}
