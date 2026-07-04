import { useMemo, useEffect } from 'react';
import { useScoring } from '@/contexts/ScoringContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, TrendingUp, Download } from 'lucide-react';
import { AREA_DISPLAY_NAMES } from '@/lib/scoring';
import { DEMO_JUMPS_BASE, buildDemoJumpResult } from '@/data/demoJumps';
import { IMPROVEMENT_TIPS } from '@/data/improvementTips';

export default function RiderFeedback() {
  const { heightAmplitudeThresholds } = useScoring();

  const results = useMemo(
    () => DEMO_JUMPS_BASE.map((_, i) => buildDemoJumpResult(i, heightAmplitudeThresholds)),
    [heightAmplitudeThresholds]
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
        Jump-by-jump breakdown vs a perfect 10 — every point you didn't earn, and what it would take to earn it.
      </p>

      {/* Print-only cover header — hidden on screen, shown at the top of the PDF */}
      <div className="hidden print-only mb-8 pb-6 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leonardo Casati — Performance Feedback</h1>
            <p className="text-sm text-muted-foreground mt-1">Capital.com GKA Big Air World Cup Mykonos 2026</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalScore.toFixed(2)} <span className="text-base font-normal text-muted-foreground">/ 30</span></div>
            <p className="text-xs text-muted-foreground">
              {totalLost.toFixed(2)} pts to gain — priority: {AREA_DISPLAY_NAMES[overallPriority[0]] ?? overallPriority[0]}
            </p>
          </div>
        </div>
      </div>

      {DEMO_JUMPS_BASE.map((jump, idx) => {
        const result = results[idx];
        const totalGap = 10 - result.totalScore;

        // Biggest-impact area = most points lost, weighted by that area's share of the total.
        const areaGaps = result.areaScores.map(area => ({
          area,
          lost: (area.max - area.subtotal) / area.max * (area.weight * 10),
        }));
        const priorityArea = areaGaps.reduce((max, cur) => (cur.lost > max.lost ? cur : max), areaGaps[0]);

        return (
          <Card key={jump.id} className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
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
      })}
    </div>
  );
}
