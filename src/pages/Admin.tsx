import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useScoring } from '@/contexts/ScoringContext';
import { DEMO_JUMPS_BASE, DEMO_EXECUTION_VALUES, buildDemoJumpResult } from '@/data/demoJumps';

// Internal utility page (not linked from the nav) — lets the chief judge
// instantly reset both Result and Demo to the canonical Leonardo Casati
// snapshot (matching "Salti Leo.csv"), clearing any Judge Overrides. Useful
// for quickly resetting to a known-good state before/during a live pitch demo.
export default function Admin() {
  const navigate = useNavigate();
  const {
    setActivePreset, setJump1Params, setJump2Params, setJump3Params,
    setJump1Result, setJump2Result, setJump3Result,
    setRealTotalReference, setJumpMeta, heightAmplitudeThresholds,
  } = useScoring();

  const resetEverything = () => {
    const results = DEMO_JUMPS_BASE.map((_, i) => buildDemoJumpResult(i, heightAmplitudeThresholds));

    // Result page
    setActivePreset('GKA');
    setJump1Params(results[0].jumpParameters);
    setJump2Params(results[1].jumpParameters);
    setJump3Params(results[2].jumpParameters);
    setJump1Result(results[0]);
    setJump2Result(results[1]);
    setJump3Result(results[2]);
    setRealTotalReference(DEMO_JUMPS_BASE.reduce((sum, j) => sum + j.realScore, 0));
    setJumpMeta(DEMO_JUMPS_BASE.map(j => ({ trick: j.trick, category: j.category, athlete: j.athlete })));

    // Demo page — write its persisted state directly so it also comes back
    // to this exact snapshot (Execution confirmed, not "pending"), with any
    // Judge Overrides cleared.
    const executionByJump: Record<number, { values: Record<string, number>; revealed: boolean }> = {};
    DEMO_JUMPS_BASE.forEach((base, i) => {
      executionByJump[base.id] = { values: DEMO_EXECUTION_VALUES[i], revealed: true };
    });
    localStorage.setItem('demoExecutionScores', JSON.stringify(executionByJump));
    localStorage.removeItem('demoJudgeOverrides');

    navigate('/result');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-1">Admin</h2>
      <p className="text-muted-foreground mb-8">Utilities for pitch/demo prep — not part of the normal judging flow.</p>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold mb-2">Reset Everything to Real Demo Scores</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Instantly loads Leonardo Casati's canonical 3-jump snapshot (matching Salti Leo.csv) into both Result and
          Demo — Execution already confirmed on Demo, any Judge Overrides cleared on both.
        </p>
        <Button onClick={resetEverything} className="gap-2">
          <Wrench className="w-4 h-4" />
          Reset to Real Scores
        </Button>
      </Card>
    </div>
  );
}
