import { useMemo } from 'react';
import { useScoring } from '@/contexts/ScoringContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { heightBracketLabel, amplitudeBracketLabel, AREA_DISPLAY_NAMES } from '@/lib/scoring';
import { DEMO_JUMPS_BASE, buildDemoJumpResult } from '@/data/demoJumps';
import { HeightAmplitudeThresholds } from '@/types/scoring';

const VALUE_LABELS: Record<string, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'super_low': 'Super Low',
  'none': 'None',
  'bomb': 'Bomb',
  'poor': 'Poor',
};

const formatValue = (paramLabel: string, value: string | number, thresholds: HeightAmplitudeThresholds): string => {
  if (typeof value === 'number') return value.toFixed(2);
  if (paramLabel === 'Height') return heightBracketLabel(value as 'b1' | 'b2' | 'b3' | 'b4', thresholds.height);
  if (paramLabel === 'Amplitude') return amplitudeBracketLabel(value as 'b1' | 'b2' | 'b3' | 'b4', thresholds.amplitude);
  return VALUE_LABELS[value] || value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
};

const getPointsColor = (points: number, max: number): string => {
  const percentage = (points / max) * 100;
  if (percentage <= 25) return 'text-red-400/80';
  if (percentage <= 50) return 'text-amber-400/80';
  if (percentage <= 75) return 'text-lime-400/80';
  return 'text-green-400/80';
};

const getProgressGradient = (finalScore: number, maxScore: number): string => {
  const percentage = (finalScore / maxScore) * 100;
  if (percentage < 50) return 'from-red-500 to-amber-500';
  if (percentage < 75) return 'from-amber-500 to-lime-500';
  return 'from-lime-500 to-green-500';
};

export default function RiderResults() {
  const { heightAmplitudeThresholds } = useScoring();

  const results = useMemo(
    () => DEMO_JUMPS_BASE.map((_, i) => buildDemoJumpResult(i, heightAmplitudeThresholds)),
    [heightAmplitudeThresholds]
  );

  const totalJumpsScore = results.reduce((sum, r) => sum + r.totalScore, 0);
  const realTotal = DEMO_JUMPS_BASE.reduce((sum, j) => sum + j.realScore, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
        <h2 className="text-3xl font-bold">My Results</h2>
        <Button onClick={() => window.print()} variant="outline" className="gap-2 no-print">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Capital.com GKA Big Air World Cup Mykonos 2026</p>

      <Card className="p-8 mb-6 shadow-[var(--shadow-card)] text-center bg-gradient-to-br from-card to-primary/5 print-avoid-break">
        <h3 className="text-lg text-muted-foreground mb-2">Total Score</h3>
        <div className="text-7xl font-bold text-primary mb-4">
          {totalJumpsScore.toFixed(2)}
          <span className="text-4xl text-muted-foreground"> / 30</span>
        </div>
        <div className="text-sm text-muted-foreground">
          vs real total {realTotal.toFixed(2)}{' '}
          <span className={`font-bold ${totalJumpsScore - realTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ({totalJumpsScore - realTotal >= 0 ? '+' : ''}{(totalJumpsScore - realTotal).toFixed(2)})
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {DEMO_JUMPS_BASE.map((jump, idx) => (
          <Card key={jump.id} className="p-6 shadow-[var(--shadow-card)] print-avoid-break">
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-bold">{jump.label}</h3>
                <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                  {jump.category}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-amber-400 mt-1">{jump.trick}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {results[idx].totalScore.toFixed(2)}
                <span className="text-xl text-muted-foreground"> / 10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Real judges' score: {jump.realScore.toFixed(2)}</p>
            </div>
          </Card>
        ))}
      </div>

      {DEMO_JUMPS_BASE.map((jump, idx) => (
        <Card key={jump.id} className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{jump.label} - Detailed Breakdown</h3>
              <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                {jump.category}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-amber-400">{jump.trick}</p>
          </div>

          <div className="space-y-4 mb-6">
            {results[idx].areaScores.map((area, areaIdx) => (
              <div key={areaIdx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{AREA_DISPLAY_NAMES[area.area] ?? area.area}</span>
                  <span className="font-semibold text-primary">
                    {area.finalScore.toFixed(2)} / {(area.weight * 10).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressGradient(area.finalScore, area.weight * 10)} transition-all duration-500`}
                    style={{ width: `${(area.finalScore / (area.weight * 10)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold">Area</th>
                  <th className="text-left py-3 px-4 font-semibold">Parameter</th>
                  <th className="text-left py-3 px-4 font-semibold">Value</th>
                  <th className="text-center py-3 px-4 font-semibold">Points</th>
                  <th className="text-center py-3 px-4 font-semibold">Max</th>
                </tr>
              </thead>
              <tbody>
                {results[idx].areaScores.map((area, areaIdx) => (
                  area.parameters.map((param, paramIdx) => (
                    <tr key={`${areaIdx}-${paramIdx}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                      {paramIdx === 0 && (
                        <td rowSpan={area.parameters.length} className="py-3 px-4 font-medium border-r border-border">
                          {AREA_DISPLAY_NAMES[area.area] ?? area.area}
                        </td>
                      )}
                      <td className="py-3 px-4">{param.label}</td>
                      <td className="py-3 px-4">{formatValue(param.label, param.value, heightAmplitudeThresholds)}</td>
                      <td className={`text-center py-3 px-4 font-semibold ${getPointsColor(param.points, param.max)}`}>{param.points.toFixed(2)}</td>
                      <td className="text-center py-3 px-4 text-muted-foreground">{param.max.toFixed(2)}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
