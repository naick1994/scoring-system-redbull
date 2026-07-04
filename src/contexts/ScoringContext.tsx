import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventPreset, PresetWeights, JumpParameters, ScoringResult, OverallImpressionParams, HeightAmplitudeThresholds } from '@/types/scoring';
import { PRESET_WEIGHTS, DEFAULT_HEIGHT_AMPLITUDE_THRESHOLDS } from '@/lib/scoring';

interface ScoringContextType {
  activePreset: EventPreset;
  setActivePreset: (preset: EventPreset) => void;
  weights: PresetWeights;
  setWeights: (weights: PresetWeights) => void;
  jump1Result: ScoringResult | null;
  setJump1Result: (result: ScoringResult | null) => void;
  jump2Result: ScoringResult | null;
  setJump2Result: (result: ScoringResult | null) => void;
  jump3Result: ScoringResult | null;
  setJump3Result: (result: ScoringResult | null) => void;
  jump1Params: JumpParameters | null;
  setJump1Params: (params: JumpParameters | null) => void;
  jump2Params: JumpParameters | null;
  setJump2Params: (params: JumpParameters | null) => void;
  jump3Params: JumpParameters | null;
  setJump3Params: (params: JumpParameters | null) => void;
  overallImpression: OverallImpressionParams | null;
  setOverallImpression: (params: OverallImpressionParams | null) => void;
  overallImpressionScore: number;
  setOverallImpressionScore: (score: number) => void;
  heightAmplitudeThresholds: HeightAmplitudeThresholds;
  setHeightAmplitudeThresholds: (thresholds: HeightAmplitudeThresholds) => void;
  realTotalReference: number | null;
  setRealTotalReference: (value: number | null) => void;
  jumpMeta: { trick: string; category: string; athlete: string }[] | null;
  setJumpMeta: (value: { trick: string; category: string; athlete: string }[] | null) => void;
}

const ScoringContext = createContext<ScoringContextType | undefined>(undefined);

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [activePreset, setActivePresetState] = useState<EventPreset>('KOTA');
  const [weights, setWeightsState] = useState<PresetWeights>(PRESET_WEIGHTS.KOTA);
  
  const [jump1Result, setJump1Result] = useState<ScoringResult | null>(null);
  const [jump2Result, setJump2Result] = useState<ScoringResult | null>(null);
  const [jump3Result, setJump3Result] = useState<ScoringResult | null>(null);
  
  const [jump1Params, setJump1Params] = useState<JumpParameters | null>(null);
  const [jump2Params, setJump2Params] = useState<JumpParameters | null>(null);
  const [jump3Params, setJump3Params] = useState<JumpParameters | null>(null);
  
  const [overallImpression, setOverallImpression] = useState<OverallImpressionParams | null>(null);
  const [overallImpressionScore, setOverallImpressionScore] = useState<number>(0);
  const [realTotalReference, setRealTotalReference] = useState<number | null>(null);
  const [jumpMeta, setJumpMeta] = useState<{ trick: string; category: string; athlete: string }[] | null>(null);
  // Lazy initializer so the very first render already has the persisted
  // value — an effect-based hydration would leave a one-render window where
  // this (and anything reading it on mount, like the thresholds form) sees
  // the hardcoded default instead of what was actually saved.
  const [heightAmplitudeThresholds, setHeightAmplitudeThresholdsState] = useState<HeightAmplitudeThresholds>(() => {
    const saved = localStorage.getItem('heightAmplitudeThresholds');
    return saved ? JSON.parse(saved) : DEFAULT_HEIGHT_AMPLITUDE_THRESHOLDS;
  });

  useEffect(() => {
    const saved = localStorage.getItem('activePreset');
    if (saved && saved in PRESET_WEIGHTS) {
      setActivePresetState(saved as EventPreset);
      setWeightsState(saved === 'Custom'
        ? JSON.parse(localStorage.getItem('customWeights') || JSON.stringify(PRESET_WEIGHTS.KOTA))
        : PRESET_WEIGHTS[saved as keyof typeof PRESET_WEIGHTS]);
    }
  }, []);

  const setHeightAmplitudeThresholds = (thresholds: HeightAmplitudeThresholds) => {
    setHeightAmplitudeThresholdsState(thresholds);
    localStorage.setItem('heightAmplitudeThresholds', JSON.stringify(thresholds));
  };

  const setActivePreset = (preset: EventPreset) => {
    setActivePresetState(preset);
    localStorage.setItem('activePreset', preset);
    if (preset !== 'Custom') {
      const newWeights = PRESET_WEIGHTS[preset];
      setWeightsState(newWeights);
    }
  };

  const setWeights = (newWeights: PresetWeights) => {
    setWeightsState(newWeights);
    if (activePreset === 'Custom') {
      localStorage.setItem('customWeights', JSON.stringify(newWeights));
    }
  };

  return (
    <ScoringContext.Provider value={{
      activePreset,
      setActivePreset,
      weights,
      setWeights,
      jump1Result,
      setJump1Result,
      jump2Result,
      setJump2Result,
      jump3Result,
      setJump3Result,
      jump1Params,
      setJump1Params,
      jump2Params,
      setJump2Params,
      jump3Params,
      setJump3Params,
      overallImpression,
      setOverallImpression,
      overallImpressionScore,
      setOverallImpressionScore,
      heightAmplitudeThresholds,
      setHeightAmplitudeThresholds,
      realTotalReference,
      setRealTotalReference,
      jumpMeta,
      setJumpMeta,
    }}>
      {children}
    </ScoringContext.Provider>
  );
}

export function useScoring() {
  const context = useContext(ScoringContext);
  if (!context) {
    throw new Error('useScoring must be used within ScoringProvider');
  }
  return context;
}
