import { useMemo, useEffect, useState } from 'react';
import { useScoring } from '@/contexts/ScoringContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, TrendingUp, Download, RotateCcw, Sparkles } from 'lucide-react';
import {
  AREA_DISPLAY_NAMES, PARAMETER_CONFIG, HEIGHT_BRACKET_POINTS, AMPLITUDE_BRACKET_POINTS,
  heightBracketLabel, amplitudeBracketLabel, KITE_ANGLE_RANGES, YANK_POWER_RANGES, FREE_FALL_RANGES,
} from '@/lib/scoring';
import { DEMO_JUMPS_BASE, JumpDemoBase, buildDemoJumpResult, buildDemoJumpResultWithOverrides, WhatIfOverrides } from '@/data/demoJumps';
import { IMPROVEMENT_TIPS } from '@/data/improvementTips';
import { HeightAmplitudeThresholds, ScoringResult } from '@/types/scoring';

const WHAT_IF_KEY: Record<string, keyof WhatIfOverrides> = {
  'Height': 'height', 'Amplitude': 'amplitude', 'Kite Angle': 'kite_angle', 'Yank Power': 'yank_power',
  'Free Fall': 'free_fall', 'Rotations': 'rotations', 'Rotation Axis': 'rotation_axis',
  'Board Off': 'board_off', 'Board Flip': 'board_flip', 'Board Spin': 'board_spin',
};

function formatTier(v: string): string {
  if (v === '0') return 'None';
  return v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ');
}

interface WhatIfOption { value: string; text: string; points: number }

function getWhatIfOptions(label: string, thresholds: HeightAmplitudeThresholds): WhatIfOption[] | null {
  switch (label) {
    case 'Height':
      return (['b1', 'b2', 'b3', 'b4'] as const).map(b => ({ value: b, text: heightBracketLabel(b, thresholds.height), points: HEIGHT_BRACKET_POINTS[b] }));
    case 'Amplitude':
      return (['b1', 'b2', 'b3', 'b4'] as const).map(b => ({ value: b, text: amplitudeBracketLabel(b, thresholds.amplitude), points: AMPLITUDE_BRACKET_POINTS[b] }));
    case 'Kite Angle':
      return Object.entries(PARAMETER_CONFIG.EXTREMITY.kite_angle.map).map(([k, pts]) => ({ value: k, text: `${formatTier(k)} (${KITE_ANGLE_RANGES[k]})`, points: pts as number }));
    case 'Yank Power':
      return Object.entries(PARAMETER_CONFIG.EXTREMITY.yank_power.map).map(([k, pts]) => ({ value: k, text: `${formatTier(k)} (${YANK_POWER_RANGES[k]})`, points: pts as number }));
    case 'Free Fall':
      return Object.entries(PARAMETER_CONFIG.EXTREMITY.free_fall.map).map(([k, pts]) => ({ value: k, text: `${formatTier(k)} (${FREE_FALL_RANGES[k]})`, points: pts as number }));
    case 'Rotations':
      return Object.entries(PARAMETER_CONFIG.TECHNICALITY.rotations.map).map(([k, pts]) => ({ value: k, text: k === '4+' ? '4+ rotations' : `${k} rotation${k === '1' ? '' : 's'}`, points: pts as number }));
    case 'Rotation Axis':
      return Object.entries(PARAMETER_CONFIG.TECHNICALITY.rotation_axis.map).map(([k, pts]) => ({ value: k, text: formatTier(k), points: pts as number }));
    case 'Board Off':
      return Object.entries(PARAMETER_CONFIG.TECHNICALITY.board_off.map).map(([k, pts]) => ({ value: k, text: formatTier(k), points: pts as number }));
    case 'Board Flip':
      return Object.entries(PARAMETER_CONFIG.TECHNICALITY.board_flip.map).map(([k, pts]) => ({ value: k, text: formatTier(k), points: pts as number }));
    case 'Board Spin':
      return Object.entries(PARAMETER_CONFIG.TECHNICALITY.board_spin.map).map(([k, pts]) => ({ value: k, text: formatTier(k), points: pts as number }));
    default:
      return null;
  }
}

function JumpFeedbackCard({
  jump, result, whatIfResult, hasWhatIf, thresholds, whatIfValues, onSetWhatIf, onResetWhatIf,
}: {
  jump: JumpDemoBase;
  result: ScoringResult;
  whatIfResult: ScoringResult;
  hasWhatIf: boolean;
  thresholds: HeightAmplitudeThresholds;
  whatIfValues: WhatIfOverrides | undefined;
  onSetWhatIf: (key: keyof WhatIfOverrides, value: string) => void;
  onResetWhatIf: () => void;
}) {
  const whatIfDelta = whatIfResult.totalScore - result.totalScore;
  const totalGap = 10 - result.totalScore;

  // Biggest-impact area = most points lost, weighted by that area's share of the total.
  const areaGaps = result.areaScores.map(area => ({
    area,
    lost: (area.max - area.subtotal) / area.max * (area.weight * 10),
  }));
  const priorityArea = areaGaps.reduce((max, cur) => (cur.lost > max.lost ? cur : max), areaGaps[0]);

  return (
    <Card className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{jump.label}</h3>
            <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
              {jump.category}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-amber-400">{jump.trick}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{result.totalScore.toFixed(2)} / 10</div>
          {totalGap > 0.01 ? (
            <p className="text-xs text-red-400 font-semibold">
              Lost {totalGap.toFixed(2)} pts — mostly on {AREA_DISPLAY_NAMES[priorityArea.area.area] ?? priorityArea.area.area}
            </p>
          ) : (
            <p className="text-xs text-green-500 font-semibold flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" /> Perfect score
            </p>
          )}
          {hasWhatIf && (
            <div className="mt-1.5 flex items-center justify-end gap-2 no-print">
              <span className="text-xs font-semibold flex items-center gap-1 text-primary">
                <Sparkles className="w-3 h-3" />
                What If: {whatIfResult.totalScore.toFixed(2)}
                <span className={whatIfDelta >= 0 ? 'text-green-500' : 'text-red-400'}>
                  ({whatIfDelta >= 0 ? '+' : ''}{whatIfDelta.toFixed(2)})
                </span>
              </span>
              <button onClick={onResetWhatIf} className="text-muted-foreground hover:text-destructive" title="Reset What If">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {result.areaScores.map((area, areaIdx) => (
          <div key={areaIdx}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                {AREA_DISPLAY_NAMES[area.area] ?? area.area}
              </span>
              {area === priorityArea.area && totalGap > 0.01 && (
                <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 gap-1">
                  <TrendingUp className="w-3 h-3" /> Biggest opportunity
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {area.parameters.map((param, paramIdx) => {
                const maxed = param.points >= param.max - 0.001;
                const whatIfKey = WHAT_IF_KEY[param.label];
                const options = whatIfKey ? getWhatIfOptions(param.label, thresholds) : null;
                const selectedValue = whatIfValues?.[whatIfKey] ?? String(param.value);
                return (
                  <div key={paramIdx} className="flex items-start justify-between gap-4 py-2 px-3 rounded-lg bg-muted/40">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{param.label}</span>
                        <span className={`text-xs font-semibold ${maxed ? 'text-green-500' : 'text-amber-400'}`}>
                          {param.points.toFixed(2)} / {param.max.toFixed(2)}
                        </span>
                      </div>
                      {!maxed && IMPROVEMENT_TIPS[param.label] && (
                        <p className="text-xs text-muted-foreground mt-1">{IMPROVEMENT_TIPS[param.label]}</p>
                      )}
                      {options && (
                        <div className="mt-2 flex items-center gap-2 no-print">
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">What if:</span>
                          <Select value={selectedValue} onValueChange={(v) => onSetWhatIf(whatIfKey, v)}>
                            <SelectTrigger className="h-7 text-xs w-auto min-w-[10rem]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                  {opt.text} — {opt.points.toFixed(2)} pts
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    {maxed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-xs font-semibold text-red-400 shrink-0">
                        -{(param.max - param.points).toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function RiderFeedback() {
  const { heightAmplitudeThresholds } = useScoring();
  const [whatIf, setWhatIf] = useState<Record<number, WhatIfOverrides>>({});

  const results = useMemo(
    () => DEMO_JUMPS_BASE.map((_, i) => buildDemoJumpResult(i, heightAmplitudeThresholds)),
    [heightAmplitudeThresholds]
  );

  const whatIfResults = useMemo(
    () => DEMO_JUMPS_BASE.map((_, i) => buildDemoJumpResultWithOverrides(i, heightAmplitudeThresholds, whatIf[i] ?? {})),
    [heightAmplitudeThresholds, whatIf]
  );

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Leonardo Casati - Feedback - Big Air Scoring System';
    return () => { document.title = previousTitle; };
  }, []);

  const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
  const totalLost = 30 - totalScore;

  const overallAreaGaps = new Map<string, number>();
  results.forEach(r => r.areaScores.forEach(area => {
    const lost = area.max - area.subtotal;
    overallAreaGaps.set(area.area, (overallAreaGaps.get(area.area) ?? 0) + lost * (area.weight * 10 / area.max));
  }));
  const overallPriority = Array.from(overallAreaGaps.entries()).reduce((max, cur) => (cur[1] > max[1] ? cur : max));

  const setJumpWhatIf = (idx: number, key: keyof WhatIfOverrides, value: string) => {
    setWhatIf(prev => ({ ...prev, [idx]: { ...prev[idx], [key]: value } }));
  };

  const resetJumpWhatIf = (idx: number) => {
    setWhatIf(prev => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
        <h2 className="text-3xl font-bold">Where You Lost Points</h2>
        <Button onClick={() => window.print()} variant="outline" className="gap-2 no-print">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">
        Jump-by-jump breakdown vs a perfect 10 — every point you didn't earn, what it would take to earn it, and a
        "What If" simulator to try a different level for yourself.
      </p>

      {/* Print-only cover header — hidden on screen, shown at the top of the PDF */}
      <div className="hidden print-only mb-8 pb-6 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leonardo Casati — Performance Feedback</h1>
            <p className="text-sm text-muted-foreground mt-1">Capital.com Red Bull Big Air World Cup Mykonos 2026</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalScore.toFixed(2)} <span className="text-base font-normal text-muted-foreground">/ 30</span></div>
            <p className="text-xs text-muted-foreground">
              {totalLost.toFixed(2)} pts to gain — priority: {AREA_DISPLAY_NAMES[overallPriority[0]] ?? overallPriority[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Screen view — one jump at a time */}
      <div className="no-print">
        <Tabs defaultValue="0">
          <TabsList className="mb-6">
            {DEMO_JUMPS_BASE.map((jump, idx) => (
              <TabsTrigger key={jump.id} value={String(idx)}>{jump.label}</TabsTrigger>
            ))}
          </TabsList>
          {DEMO_JUMPS_BASE.map((jump, idx) => (
            <TabsContent key={jump.id} value={String(idx)}>
              <JumpFeedbackCard
                jump={jump}
                result={results[idx]}
                whatIfResult={whatIfResults[idx]}
                hasWhatIf={!!whatIf[idx] && Object.keys(whatIf[idx]).length > 0}
                thresholds={heightAmplitudeThresholds}
                whatIfValues={whatIf[idx]}
                onSetWhatIf={(key, value) => setJumpWhatIf(idx, key, value)}
                onResetWhatIf={() => resetJumpWhatIf(idx)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Print view — all 3 jumps, one after another */}
      <div className="hidden print-only">
        {DEMO_JUMPS_BASE.map((jump, idx) => (
          <JumpFeedbackCard
            key={jump.id}
            jump={jump}
            result={results[idx]}
            whatIfResult={whatIfResults[idx]}
            hasWhatIf={false}
            thresholds={heightAmplitudeThresholds}
            whatIfValues={undefined}
            onSetWhatIf={() => {}}
            onResetWhatIf={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
