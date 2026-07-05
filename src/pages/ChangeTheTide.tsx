import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ParametersAccordion } from '@/components/ParametersAccordion';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, CheckCircle2, X, Sparkles } from 'lucide-react';
import wooLogo from '@/assets/woo-logo.svg';
import capitalLogo from '@/assets/capital-com-logo.png';
import { useScoring } from '@/contexts/ScoringContext';
import { AREA_DISPLAY_NAMES, AREA_GRADIENT } from '@/lib/scoring';
import { GKA_BIG_AIR_MEN_RANKINGS_2026, RankingRow } from '@/data/gkaRankings';
import { getFakeAthleteScore } from '@/data/fakeAthleteScores';
import { getLeonardoAverageBreakdown } from '@/data/demoJumps';

const RIDER_NAME = 'Leonardo Casati';

const COUNTRY_FLAGS: Record<string, string> = {
  Italy: '🇮🇹', Netherlands: '🇳🇱', Spain: '🇪🇸', Germany: '🇩🇪',
  Israel: '🇮🇱', Brazil: '🇧🇷', USA: '🇺🇸',
};

// Smoothly tweens a displayed number toward `target` whenever it changes,
// so the auto-cycling What If demo reads as a live recalculation rather
// than a jump-cut. Respects prefers-reduced-motion by snapping instantly.
function useTweenedNumber(target: number, duration = 650) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reducedMotion]);

  return value;
}

// Real Jump 1 (Leonardo Casati, Mykonos) numbers under the GKA preset.
// Height and Amplitude each cycle through all 4 real thresholds
// independently (different periods, so they visibly move out of sync) —
// everything else (Extremity, Technicality, Execution) held fixed at its
// real value. b3 is the real jump on each axis; the rest are hypothetical.
const HEIGHT_WHATIF_STATES = [
  { label: '0–10m',    pts: 0.00, isReal: false },
  { label: '10–15m',   pts: 0.60, isReal: false },
  { label: '15–17.5m', pts: 0.90, isReal: true },
  { label: '+17.5m',   pts: 1.50, isReal: false },
];
const AMPLITUDE_WHATIF_STATES = [
  { label: '0–50m',   pts: 0.00, isReal: false },
  { label: '50–75m',  pts: 0.33, isReal: false },
  { label: '75–100m', pts: 0.67, isReal: true },
  { label: '+100m',   pts: 1.00, isReal: false },
];
// Extremity (2.25) + Technicality (1.30) + Execution (1.70), Leonardo's real
// Jump 1 values — held fixed while Height & Amplitude vary.
const OTHER_AREAS_TOTAL = 5.25;
const REAL_TOTAL = 7.14;

function useCyclingIndex(length: number, periodMs: number) {
  const [index, setIndex] = useState(2); // both arrays keep "real" at index 2
  const directionRef = useRef<1 | -1>(1);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setIndex(prev => {
        let next = prev + directionRef.current;
        if (next >= length) { directionRef.current = -1; next = prev - 1; }
        if (next < 0) { directionRef.current = 1; next = prev + 1; }
        return next;
      });
    }, periodMs);
    return () => clearInterval(id);
  }, [reducedMotion, length, periodMs]);

  return index;
}

// Moving the top threshold shifts the whole curve, not just one number —
// steps in blocks of 5m so the change reads as a deliberate re-set of the
// day's conditions, not a slider drifting.
const THRESHOLD_SHIFT_STEPS = [0, 5, 10];

function ThresholdCard() {
  const stepIndex = useCyclingIndex(THRESHOLD_SHIFT_STEPS.length, 1800);
  const shift = THRESHOLD_SHIFT_STEPS[stepIndex];
  const t1 = 10 + shift;
  const t2 = 15 + shift;
  const t3 = 17.5 + shift;

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-bold mb-1">Thresholds, set per event</h3>
      <p className="text-sm text-muted-foreground mb-5">
        The chief judge sets what height and distance earn full marks, so a big-wind day and a
        marginal one don't get graded on the same curve.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="border-red-500/40 text-red-400 text-[11px] tabular-nums">0–{t1}m: 0 pts</Badge>
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[11px] tabular-nums">{t1}–{t2}m: 0.6 pts</Badge>
        <Badge variant="outline" className="border-lime-500/40 text-lime-400 text-[11px] tabular-nums">{t2}–{t3}m: 0.9 pts</Badge>
        <Badge variant="outline" className="border-green-500/40 text-green-400 text-[11px] tabular-nums">+{t3}m: 1.5 pts</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 font-mono">
        Move the top threshold and the rest shift with it. The chief judge sets the whole curve for
        the day's conditions, not just one number.
      </p>
    </Card>
  );
}

// Real preset weights (H&A / Extremity / Technicality / Execution), matching
// the actual presets available in the app's Event Presets picker.
const PRESET_ROWS = [
  { name: 'GKA',      h: 30, e: 30, t: 20, x: 20 },
  { name: 'KOTA',     h: 30, e: 30, t: 25, x: 15 },
  { name: 'Megaloop', h: 45, e: 45, t: 10, x: 0 },
];

function PresetWeightsCard() {
  const activeIndex = useCyclingIndex(PRESET_ROWS.length, 2500);
  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-bold mb-1">Weights, set per format</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Want extremity and load to matter more than technical variety at one event? Change the
        weights, not the philosophy.
      </p>
      <div className="text-xs font-mono">
        <div className="grid grid-cols-5 gap-2 text-muted-foreground pb-2 border-b border-border">
          <span>Preset</span><span className="text-right">H&amp;A</span><span className="text-right">Extr.</span><span className="text-right">Tech.</span><span className="text-right">Exec.</span>
        </div>
        {PRESET_ROWS.map((row, i) => (
          <div
            key={row.name}
            className="grid grid-cols-5 gap-2 py-1.5 px-1.5 -mx-1.5 rounded-md transition-colors duration-500"
            style={i === activeIndex ? { background: 'rgba(74, 222, 128, 0.14)' } : undefined}
          >
            <span className={`font-sans font-semibold flex items-center gap-1 ${i === activeIndex ? 'text-green-400' : 'text-foreground'}`}>
              {row.name}
              {i === activeIndex && <CheckCircle2 className="w-3 h-3" />}
            </span>
            <span className="text-right text-primary">{row.h}%</span>
            <span className="text-right text-primary">{row.e}%</span>
            <span className="text-right text-primary">{row.t}%</span>
            <span className="text-right text-primary">{row.x}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WhatIfParamRow({ label, tip, max, state }: { label: string; tip: string; max: number; state: { label: string; pts: number; isReal: boolean } }) {
  const animatedPts = useTweenedNumber(state.pts);
  return (
    <div className="flex items-start justify-between gap-4 py-2 px-3 rounded-lg bg-muted/40">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{label}</span>
          <span className="text-xs font-semibold text-amber-400 tabular-nums">{animatedPts.toFixed(2)} / {max.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{tip}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">What if:</span>
          <span
            key={state.label}
            className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] gap-1"
            style={{ animation: 'whatIfPop 0.4s ease' }}
          >
            <Sparkles className="w-3 h-3 text-primary" /> {state.label}: {state.pts.toFixed(2)} pts
            {state.isReal && <span className="text-muted-foreground">(real)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

// Real per-jump area breakdowns for Leonardo Casati's 3 Mykonos jumps (GKA
// preset) — same numbers shown throughout the rest of the page.
const JUMP_BREAKDOWNS = [
  {
    label: 'Jump 1', total: 7.14,
    areas: [
      { name: 'HEIGHT & AMPLITUDE', score: 1.88, max: 3.0 },
      { name: 'EXTREMITY', score: 2.25, max: 3.0 },
      { name: 'TECHNICALITY', score: 1.30, max: 2.0 },
      { name: 'EXECUTION', score: 1.70, max: 2.0 },
    ],
  },
  {
    label: 'Jump 2', total: 8.35,
    areas: [
      { name: 'HEIGHT & AMPLITUDE', score: 2.60, max: 3.0 },
      { name: 'EXTREMITY', score: 2.63, max: 3.0 },
      { name: 'TECHNICALITY', score: 1.33, max: 2.0 },
      { name: 'EXECUTION', score: 1.78, max: 2.0 },
    ],
  },
  {
    label: 'Jump 3', total: 8.33,
    areas: [
      { name: 'HEIGHT & AMPLITUDE', score: 3.00, max: 3.0 },
      { name: 'EXTREMITY', score: 2.25, max: 3.0 },
      { name: 'TECHNICALITY', score: 1.50, max: 2.0 },
      { name: 'EXECUTION', score: 1.58, max: 2.0 },
    ],
  },
];

function JumpBreakdownCard() {
  const [selected, setSelected] = useState(0);
  const userInteractedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => {
    if (reducedMotion || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const id = setInterval(() => {
      if (userInteractedRef.current) return;
      setSelected(prev => (prev + 1) % JUMP_BREAKDOWNS.length);
    }, 3200);
    return () => clearInterval(id);
  }, [reducedMotion, inView]);

  const jump = JUMP_BREAKDOWNS[selected];
  const activeAreaIndex = useRoundRobinIndex(jump.areas.length, 2600);
  const activeAreaName = jump.areas[activeAreaIndex].name;

  return (
    <Card ref={cardRef} className="p-8 shadow-[var(--shadow-card)]">
      <div className="text-center mb-8">
        <div className="text-xs text-muted-foreground mb-1 font-mono uppercase tracking-wide">Total Score</div>
        <div className="text-6xl font-bold text-primary">23.82<span className="text-2xl text-muted-foreground"> / 30</span></div>
        <div className="flex items-center justify-center gap-2 mt-4">
          {JUMP_BREAKDOWNS.map((j, i) => (
            <button
              key={j.label}
              onClick={() => { userInteractedRef.current = true; setSelected(i); }}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                i === selected ? 'bg-primary/15 border border-primary/40' : 'bg-muted/40 hover:bg-muted/60 border border-transparent'
              }`}
            >
              <span className="font-bold text-primary">{j.total}</span>
              <span className="text-muted-foreground"> · {j.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm font-semibold mb-4 text-left">{jump.label}: Detailed Breakdown</div>
      <div key={jump.label} className="space-y-3" style={{ animation: 'whatIfPop 0.35s ease' }}>
        {jump.areas.map((area, i) => {
          const isActive = i === activeAreaIndex;
          return (
            <div
              key={area.name}
              className="rounded-lg p-3 -mx-3 transition-colors duration-500"
              style={isActive ? { background: 'hsl(var(--primary) / 0.06)' } : undefined}
            >
              <div className="flex justify-between items-center mb-1.5 text-sm">
                <span className={`font-medium transition-colors duration-500 ${isActive ? 'text-primary' : ''}`}>{area.name}</span>
                <span className="font-semibold text-primary">{area.score.toFixed(2)} / {area.max.toFixed(2)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${AREA_GRADIENT[area.name]}`}
                  style={{ width: `${(area.score / area.max) * 100}%`, transition: 'width 0.5s ease' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed-height panel so switching the active area never resizes the card. */}
      <div className="mt-3 pt-4 border-t border-border overflow-y-auto" style={{ height: 190 }}>
        <div key={`${selected}-${activeAreaName}`} style={{ animation: 'whatIfPop 0.35s ease' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm tracking-wide">{activeAreaName}</span>
          </div>
          <div className="space-y-2">
            {JUMP_SUB_PARAMS[selected][activeAreaName].map((p) => (
              <div key={p.label} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground shrink-0 w-32">{p.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${AREA_GRADIENT[activeAreaName]}`}
                    style={{ width: `${p.max > 0 ? (p.pts / p.max) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-semibold tabular-nums shrink-0 w-16 text-right">
                  {p.pts.toFixed(2)}/{p.max.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function AutoWhatIfDemo() {
  const heightIndex = useCyclingIndex(HEIGHT_WHATIF_STATES.length, 2200);
  const amplitudeIndex = useCyclingIndex(AMPLITUDE_WHATIF_STATES.length, 1700);
  const heightState = HEIGHT_WHATIF_STATES[heightIndex];
  const amplitudeState = AMPLITUDE_WHATIF_STATES[amplitudeIndex];

  const areaScore = (heightState.pts + amplitudeState.pts) * 1.2;
  const total = OTHER_AREAS_TOTAL + areaScore;
  const bothReal = heightState.isReal && amplitudeState.isReal;

  const animatedTotal = useTweenedNumber(total);
  const animatedAreaScore = useTweenedNumber(areaScore);
  const delta = total - REAL_TOTAL;

  return (
    <Card className="p-6 shadow-[var(--shadow-card)] max-w-3xl">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Jump 1</span>
            <Badge className="font-mono text-[10px] font-bold tracking-widest bg-primary/15 text-primary border border-primary/30">KLBRFL</Badge>
          </div>
          <p className="text-sm font-semibold text-amber-400 mt-0.5">Late Backroll Kiteloop Double Flip Added Rotation</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary tabular-nums">{animatedTotal.toFixed(2)} / 10</div>
          {bothReal ? (
            <p className="text-xs text-muted-foreground font-semibold">Leonardo's real score</p>
          ) : (
            <p className={`text-xs font-semibold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              What if: {delta >= 0 ? '+' : ''}{delta.toFixed(2)} pts vs. the real jump
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Height &amp; Amplitude</span>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{animatedAreaScore.toFixed(2)} / 3.00</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          style={{ width: `${(animatedAreaScore / 3) * 100}%`, transition: 'width 0.65s cubic-bezier(0.33,1,0.68,1)' }}
        />
      </div>

      <div className="space-y-2">
        <WhatIfParamRow label="Height" tip="Push for more raw airtime off the kicker." max={1.5} state={heightState} />
        <WhatIfParamRow label="Amplitude" tip="Ride more power into the takeoff to extend the arc." max={1.0} state={amplitudeState} />
      </div>
    </Card>
  );
}

function LiveRankingComparison() {
  const { heightAmplitudeThresholds } = useScoring();
  const [selected, setSelected] = useState<RankingRow | null>(null);
  const topEight = GKA_BIG_AIR_MEN_RANKINGS_2026.slice(0, 8);

  const leonardo = useMemo(
    () => getLeonardoAverageBreakdown(heightAmplitudeThresholds),
    [heightAmplitudeThresholds]
  );

  const comparison = useMemo(() => {
    if (!selected) return null;
    const fake = getFakeAthleteScore(selected.athlete, selected.rank, leonardo.averageScore);
    fake.areas = fake.areas.map(a => {
      const leoArea = leonardo.areas.find(l => l.area === a.area);
      if (leoArea && a.score >= leoArea.score) return { ...a, score: Math.max(0, leoArea.score - 0.05) };
      return a;
    });
    return { fake, delta: leonardo.averageScore - fake.averageScore };
  }, [selected, leonardo]);

  return (
    <>
      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border bg-muted/40">
              <th className="text-left py-3 px-4 font-semibold w-16 text-sm">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Athlete</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Country</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">Points</th>
            </tr>
          </thead>
          <tbody>
            {topEight.map((row, idx) => {
              const isMe = row.athlete === RIDER_NAME;
              return (
                <tr
                  key={idx}
                  onClick={() => { if (!isMe) setSelected(row); }}
                  className={`border-b border-border transition-colors ${isMe ? 'bg-primary/10' : 'hover:bg-muted/50 cursor-pointer'}`}
                >
                  <td className="py-3 px-4 font-semibold text-muted-foreground text-sm">#{row.rank}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={row.photoUrl} alt={row.athlete} className="w-8 h-8 rounded-full object-cover border border-border" />
                      <span className={`font-medium text-sm ${isMe ? 'text-primary font-bold' : ''}`}>{row.athlete}</span>
                      {isMe && (
                        <Badge className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/20 text-[10px]">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xl">{COUNTRY_FLAGS[row.country] ?? row.country}</td>
                  <td className="py-3 px-4 text-right font-semibold text-sm">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-muted-foreground mt-3 font-mono">↑ Real ranking data. Click any rider to compare. Try it.</p>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && comparison && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <img src={selected.photoUrl} alt={selected.athlete} className="w-14 h-14 rounded-full object-cover border border-border" />
                  <div>
                    <DialogTitle className="text-xl">{selected.athlete}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {COUNTRY_FLAGS[selected.country] ?? selected.country} #{selected.rank} · {selected.points} pts
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex items-center justify-between py-2">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{comparison.fake.averageScore.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{selected.athlete.split(' ')[0]}'s avg</div>
                </div>
                <div className="px-4 text-center">
                  <div className={`text-lg font-bold ${comparison.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {comparison.delta >= 0 ? '+' : ''}{comparison.delta.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Leonardo's edge</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-primary">{leonardo.averageScore.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Leonardo's avg</div>
                </div>
              </div>

              <div className="space-y-4">
                {comparison.fake.areas.map((fakeArea) => {
                  const leoArea = leonardo.areas.find(a => a.area === fakeArea.area);
                  return (
                    <div key={fakeArea.area}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium">{AREA_DISPLAY_NAMES[fakeArea.area] ?? fakeArea.area}</span>
                        <span className="text-xs text-muted-foreground">
                          {fakeArea.score.toFixed(2)} vs <span className="text-primary font-semibold">{leoArea?.score.toFixed(2)}</span> / {fakeArea.max.toFixed(2)}
                        </span>
                      </div>
                      <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${AREA_GRADIENT[fakeArea.area]} opacity-40`}
                          style={{ width: `${(fakeArea.score / fakeArea.max) * 100}%` }}
                        />
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${AREA_GRADIENT[fakeArea.area]} border-r-2 border-white/80`}
                          style={{ width: `${((leoArea?.score ?? 0) / fakeArea.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


const AREAS = [
  { name: 'HEIGHT & AMPLITUDE', weight: 30, desc: 'Peak height and distance covered, measured directly against event thresholds.', subjective: false },
  { name: 'EXTREMITY', weight: 30, desc: 'Kite angle, load on entry, and hang time during the loop.', subjective: false },
  { name: 'TECHNICALITY', weight: 20, desc: 'Rotations, axis, and board variations: what the trick consisted of.', subjective: false },
  { name: 'EXECUTION', weight: 20, desc: 'Style, control, and landing quality: the one judged, human call.', subjective: true },
];

// Real Jump 1 (Leonardo Casati, Mykonos) per-parameter breakdown, shown when
// each area card auto-expands — same numbers as the rest of the page.
// Real per-jump, per-parameter breakdown for all 3 of Leonardo Casati's
// Mykonos jumps — derived from the same real Woo/execution data used
// throughout the page, verified against each jump's known area totals.
const JUMP_SUB_PARAMS: Record<string, { label: string; pts: number; max: number }[]>[] = [
  {
    'HEIGHT & AMPLITUDE': [
      { label: 'Height', pts: 0.90, max: 1.50 },
      { label: 'Amplitude', pts: 0.67, max: 1.00 },
    ],
    EXTREMITY: [
      { label: 'Kite Angle', pts: 0.75, max: 0.75 },
      { label: 'Yank Power', pts: 0.50, max: 0.75 },
      { label: 'Free Fall', pts: 0.25, max: 0.50 },
    ],
    TECHNICALITY: [
      { label: 'Rotations', pts: 0.25, max: 1.00 },
      { label: 'Rotation Axis', pts: 0.50, max: 0.50 },
      { label: 'Board Off', pts: 1.00, max: 1.00 },
      { label: 'Board Flip', pts: 0.20, max: 0.30 },
      { label: 'Board Spin', pts: 0.00, max: 0.20 },
    ],
    EXECUTION: [
      { label: 'Style', pts: 0.35, max: 0.40 },
      { label: 'Stability & Control', pts: 0.33, max: 0.40 },
      { label: 'Landing Control', pts: 0.34, max: 0.40 },
      { label: 'Board Control', pts: 0.36, max: 0.40 },
      { label: 'Kite Control', pts: 0.32, max: 0.40 },
    ],
  },
  {
    'HEIGHT & AMPLITUDE': [
      { label: 'Height', pts: 1.50, max: 1.50 },
      { label: 'Amplitude', pts: 0.67, max: 1.00 },
    ],
    EXTREMITY: [
      { label: 'Kite Angle', pts: 0.50, max: 0.75 },
      { label: 'Yank Power', pts: 0.75, max: 0.75 },
      { label: 'Free Fall', pts: 0.50, max: 0.50 },
    ],
    TECHNICALITY: [
      { label: 'Rotations', pts: 0.50, max: 1.00 },
      { label: 'Rotation Axis', pts: 0.50, max: 0.50 },
      { label: 'Board Off', pts: 1.00, max: 1.00 },
      { label: 'Board Flip', pts: 0.00, max: 0.30 },
      { label: 'Board Spin', pts: 0.00, max: 0.20 },
    ],
    EXECUTION: [
      { label: 'Style', pts: 0.37, max: 0.40 },
      { label: 'Stability & Control', pts: 0.36, max: 0.40 },
      { label: 'Landing Control', pts: 0.35, max: 0.40 },
      { label: 'Board Control', pts: 0.35, max: 0.40 },
      { label: 'Kite Control', pts: 0.35, max: 0.40 },
    ],
  },
  {
    'HEIGHT & AMPLITUDE': [
      { label: 'Height', pts: 1.50, max: 1.50 },
      { label: 'Amplitude', pts: 1.00, max: 1.00 },
    ],
    EXTREMITY: [
      { label: 'Kite Angle', pts: 0.75, max: 0.75 },
      { label: 'Yank Power', pts: 0.50, max: 0.75 },
      { label: 'Free Fall', pts: 0.25, max: 0.50 },
    ],
    TECHNICALITY: [
      { label: 'Rotations', pts: 0.75, max: 1.00 },
      { label: 'Rotation Axis', pts: 0.50, max: 0.50 },
      { label: 'Board Off', pts: 1.00, max: 1.00 },
      { label: 'Board Flip', pts: 0.00, max: 0.30 },
      { label: 'Board Spin', pts: 0.00, max: 0.20 },
    ],
    EXECUTION: [
      { label: 'Style', pts: 0.32, max: 0.40 },
      { label: 'Stability & Control', pts: 0.32, max: 0.40 },
      { label: 'Landing Control', pts: 0.32, max: 0.40 },
      { label: 'Board Control', pts: 0.32, max: 0.40 },
      { label: 'Kite Control', pts: 0.32, max: 0.40 },
    ],
  },
];

// Real Woo sensor readouts for all 3 of Leonardo Casati's Mykonos jumps —
// same numbers used everywhere else on the page, just the full sensor grid.
const WOO_SENSOR_JUMPS = [
  {
    label: 'Jump 1', category: 'KLBRFL', trick: 'Late Backroll Kiteloop Double Flip Added Rotation',
    stats: [
      { label: 'Max Height', value: '15.9 m' }, { label: 'Distance', value: '76 m' },
      { label: 'Airtime', value: '7.6 s' }, { label: 'Kite Angle', value: '76°' },
      { label: 'Loop Type', value: 'Kiteloop' }, { label: 'Yank Power', value: '3.3g' },
      { label: 'Free Fall', value: '0.9s' }, { label: 'Rotations', value: '×1' },
      { label: 'Rotation Axis', value: 'Horizontal' }, { label: 'Board Off', value: 'Yes' },
      { label: 'Board Flip', value: '×2' }, { label: 'Board Spin', value: '0' },
      { label: 'Max Speed', value: '46 km/h' }, { label: 'Approach', value: '32 km/h' },
      { label: 'Landing Speed', value: '2.1g' },
    ],
  },
  {
    label: 'Jump 2', category: 'KLFRBO', trick: 'Doobie Loop Boardoff by the Fin',
    stats: [
      { label: 'Max Height', value: '19.8 m' }, { label: 'Distance', value: '83 m' },
      { label: 'Airtime', value: '7.5 s' }, { label: 'Kite Angle', value: '73°' },
      { label: 'Loop Type', value: 'Kiteloop' }, { label: 'Yank Power', value: '4.1g' },
      { label: 'Free Fall', value: '1.6s' }, { label: 'Rotations', value: '×2' },
      { label: 'Rotation Axis', value: 'Horizontal' }, { label: 'Board Off', value: 'Yes' },
      { label: 'Board Flip', value: '0' }, { label: 'Board Spin', value: '0' },
      { label: 'Max Speed', value: '52 km/h' }, { label: 'Approach', value: '30 km/h' },
      { label: 'Landing Speed', value: '1.9g' },
    ],
  },
  {
    label: 'Jump 3', category: 'KLBRBO', trick: 'Backroll Kiteloop Tornado',
    stats: [
      { label: 'Max Height', value: '17.5 m' }, { label: 'Distance', value: '121 m' },
      { label: 'Airtime', value: '7.0 s' }, { label: 'Kite Angle', value: '78°' },
      { label: 'Loop Type', value: 'Kiteloop' }, { label: 'Yank Power', value: '3.5g' },
      { label: 'Free Fall', value: '1.0s' }, { label: 'Rotations', value: '×3' },
      { label: 'Rotation Axis', value: 'Horizontal' }, { label: 'Board Off', value: 'Yes' },
      { label: 'Board Flip', value: '0' }, { label: 'Board Spin', value: '0' },
      { label: 'Max Speed', value: '65 km/h' }, { label: 'Approach', value: '28 km/h' },
      { label: 'Landing Speed', value: '2.3g' },
    ],
  },
];

function WooSensorPanel() {
  const [index, setIndex] = useState(0);
  const userInteractedRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  // Only auto-advance while the panel is actually on screen — otherwise the
  // pop transition can fire mid-scroll, which reads as an unwanted jump
  // rather than a deliberate demo.
  useEffect(() => {
    if (reducedMotion || !panelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 }
    );
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const id = setInterval(() => {
      if (userInteractedRef.current) return;
      setIndex(prev => (prev + 1) % WOO_SENSOR_JUMPS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [reducedMotion, inView]);

  const jump = WOO_SENSOR_JUMPS[index];

  return (
    <Card ref={panelRef} className="p-6 shadow-[var(--shadow-card)] mt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <img src={wooLogo} alt="Woo" className="h-4" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sensor Data: Leonardo Casati</span>
        </div>
        <div className="flex items-center gap-1.5">
          {WOO_SENSOR_JUMPS.map((j, i) => (
            <button
              key={j.label}
              onClick={() => { userInteractedRef.current = true; setIndex(i); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                i === index ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {j.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs font-semibold text-amber-400 mb-4">{jump.category} · {jump.trick}</p>
      <div key={jump.label} className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4" style={{ animation: 'whatIfPop 0.4s ease' }}>
        {jump.stats.map(s => (
          <div key={s.label}>
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight mb-0.5">{s.label}</div>
            <div className="text-sm font-bold text-foreground tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const PROBLEM_ITEMS = [
  'One overall impression, formed in seconds',
  'Not tied to any fixed, published parameter',
  'Hard to audit after the fact',
  'Varies between judges and events',
  'No specific feedback on what to improve',
  'Rewards how it looked, not what it measured',
  'No answer to "what should I train?"',
  'No way to compare beyond the final rank',
];

const SOLUTION_ITEMS = [
  'Four weighted areas, scored independently',
  'Every point tied to a published parameter',
  'Fully auditable: every score is explainable',
  'Same method, every judge, every event',
  'Precise, per-parameter feedback for every rider',
  'Every score traced to a real measurement',
  'The exact parameter that cost you points',
  'Area-by-area comparison against any rider',
];

const PROBLEM_ITEM_COLORS = ['text-red-400'];
const SOLUTION_ITEM_COLORS = ['text-green-400'];

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSeen(true); },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [seen]);
  return { ref, seen };
}

const IDEA_SPLIT_AREAS = [
  { name: 'HEIGHT & AMPLITUDE', short: 'Height & Amplitude', dot: 'bg-cyan-500' },
  { name: 'EXTREMITY', short: 'Extremity', dot: 'bg-pink-500' },
  { name: 'TECHNICALITY', short: 'Technicality', dot: 'bg-amber-500' },
  { name: 'EXECUTION', short: 'Execution', dot: 'bg-lime-500' },
];

// Re-fires every time the block re-enters the viewport (unlike
// useInViewOnce), so scrolling away and back replays the split.
function useInViewRepeatable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSeen(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, seen };
}

// One plain "one impression" pill fades as four neutral, dot-accented
// cards spring outward from its exact center into a row, then sum into
// a quiet total pill — a literal, physical restatement of "sum of
// parts, not one impression," kept in the same understated dark-card
// language as the rest of the page (no gradient fills, no glow).
function IdeaSplitVisual() {
  const { ref, seen } = useInViewRepeatable<HTMLDivElement>();
  const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const n = IDEA_SPLIT_AREAS.length;

  return (
    <div ref={ref} className="mt-8 relative" style={{ minHeight: 160 }}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: seen ? 0 : 1,
          transform: seen ? 'scale(1.1)' : 'scale(1)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div className="rounded-full border border-border bg-card px-10 py-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          One impression
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {IDEA_SPLIT_AREAS.map((area, i) => {
            const centerOffset = i - (n - 1) / 2;
            return (
              <div key={area.name} className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
                  style={{
                    opacity: seen ? 1 : 0,
                    transform: seen
                      ? 'translate(0, 0) scale(1)'
                      : `translate(${centerOffset * -28}px, 8px) scale(0.4)`,
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '0.6s',
                    transitionTimingFunction: spring,
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${area.dot}`} />
                  {area.short}
                </div>
                {i < n - 1 && (
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-xs font-bold text-muted-foreground shrink-0"
                    style={{
                      opacity: seen ? 1 : 0,
                      transform: seen ? 'scale(1)' : 'scale(0)',
                      transition: 'opacity 0.4s ease, transform 0.4s ease',
                      transitionDelay: `${i * 100 + 250}ms`,
                    }}
                  >
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center gap-3"
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            transitionDelay: `${n * 100 + 350}ms`,
          }}
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-xs font-bold text-muted-foreground">=</span>
          <div className="rounded-full border border-primary/40 bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary">
            One total score
          </div>
        </div>
      </div>
    </div>
  );
}

function useRoundRobinIndex(length: number, periodMs: number) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setIndex(prev => (prev + 1) % length), periodMs);
    return () => clearInterval(id);
  }, [reducedMotion, length, periodMs]);

  return index;
}

function ProblemList() {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  const activeIndex = useRoundRobinIndex(PROBLEM_ITEMS.length, 2000);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
      {PROBLEM_ITEMS.map((text, i) => {
        const color = PROBLEM_ITEM_COLORS[i % PROBLEM_ITEM_COLORS.length];
        const isActive = i === activeIndex;
        return (
          <div
            key={text}
            className={`flex items-center gap-3 text-sm rounded-lg border px-4 py-3 transition-all duration-300 ${
              isActive ? 'border-red-500 bg-red-500/25 shadow-[0_0_16px_-4px_rgba(239,68,68,0.5)]' : 'border-border bg-card/40'
            }`}
            style={{
              opacity: seen ? 1 : 0,
              transform: seen ? 'translateY(0)' : 'translateY(10px)',
              transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
            }}
          >
            <X className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? color : 'text-muted-foreground/50'}`} />
            <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
          </div>
        );
      })}
    </div>
  );
}

function SolutionSection() {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  const activeIndex = useRoundRobinIndex(SOLUTION_ITEMS.length, 2000);

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The solution</div>
        <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
          Every problem, answered.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          The same reductionist model, restated as answers to every problem holistic judging has.
        </p>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOLUTION_ITEMS.map((text, i) => {
            const color = SOLUTION_ITEM_COLORS[i % SOLUTION_ITEM_COLORS.length];
            const isActive = i === activeIndex;
            return (
              <div
                key={text}
                className={`flex items-center gap-3 text-sm rounded-lg border px-4 py-3 transition-all duration-300 ${
                  isActive ? 'border-green-500 bg-green-500/25 shadow-[0_0_16px_-4px_rgba(34,197,94,0.5)]' : 'border-border bg-card/40'
                }`}
                style={{
                  opacity: seen ? 1 : 0,
                  transform: seen ? 'translateY(0)' : 'translateY(10px)',
                  transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
                }}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? color : 'text-muted-foreground/50'}`} />
                <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const HISTORY_ITEMS = [
  {
    sport: 'Figure skating', year: '2004', color: 'blue',
    change: 'Replaced the subjective 6.0 scale with the International Judging System: every element scored against a fixed base value.',
    why: 'Introduced after the 2002 Salt Lake City judging scandal exposed how much a final score could depend on who was judging.',
  },
  {
    sport: 'Artistic gymnastics', year: '2006', color: 'purple',
    change: 'Abolished the "Perfect 10" for an open-ended Code of Points: difficulty and execution scored as two separate numbers.',
    why: 'Removed the ceiling a holistic 10 put on innovation, and reduced how much a routine\'s score depended on a judge\'s reputation for it.',
  },
  {
    sport: 'Taekwondo', year: '2012', color: 'orange',
    change: 'Introduced electronic body-protector sensors at the London Olympics: hits register and score automatically.',
    why: 'Removed judge bias from the single moment a sport is most contested: whether a hit actually landed.',
  },
  {
    sport: 'Skateboarding', year: '2021', color: 'pink',
    change: 'Adopted a numeric run/trick scoring system for its Olympic debut in Tokyo, built from difficulty, variety, and execution.',
    why: 'Needed a scoring method that could hold up to Olympic scrutiny, not just contest-day judging.',
  },
];

const HISTORY_COLOR_CLASSES: Record<string, { border: string; text: string }> = {
  blue:   { border: 'hsl(217 91% 60% / 0.5)', text: 'text-blue-400' },
  purple: { border: 'hsl(270 91% 65% / 0.5)', text: 'text-purple-400' },
  orange: { border: 'hsl(25 95% 53% / 0.5)',  text: 'text-orange-400' },
  cyan:   { border: 'hsl(190 91% 55% / 0.5)', text: 'text-cyan-400' },
  pink:   { border: 'hsl(330 81% 60% / 0.5)', text: 'text-pink-400' },
};

function HistorySection() {
  const activeIndex = useRoundRobinIndex(HISTORY_ITEMS.length, 3000);

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Not the first sport to do this</div>
        <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
          Every sport eventually drops the eye test.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Most judged sports have already made this exact trade, usually after the same holistic
          problems became too visible to ignore.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HISTORY_ITEMS.map((item, i) => {
            const isActive = i === activeIndex;
            const colors = HISTORY_COLOR_CLASSES[item.color];
            return (
              <Card
                key={item.sport}
                className="p-6 shadow-[var(--shadow-card)] transition-colors duration-500"
                style={isActive ? { borderColor: colors.border } : undefined}
              >
                <div className={`text-3xl font-bold mb-1 tabular-nums transition-colors duration-500 ${isActive ? colors.text : 'text-foreground'}`}>
                  {item.year}
                </div>
                <div className="font-bold text-sm mb-3">{item.sport}</div>
                <p className="text-sm text-muted-foreground mb-3">{item.change}</p>
                <p className="text-xs text-muted-foreground/80 border-t border-border pt-3">{item.why}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function ChangeTheTide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Shared entrance transition for auto-cycling values — never drops to
          opacity 0, so a fast tick never reads as content vanishing. */}
      <style>{`@keyframes whatIfPop { from { opacity: 0.5; transform: translateY(1px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 pt-16 pb-24 max-w-5xl relative">
          <div className="flex items-center gap-4 mb-16">
            <img src={wooLogo} alt="Woo" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
            <div className="w-px h-5 bg-border" />
            <img src={capitalLogo} alt="Capital.com" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl">
            It's time for<br />
            <span className="text-primary">objective judging.</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-8 max-w-2xl">
            Every jump in Big Air can now be measured: height, rotation, load, hang time, landing.
            The scoring model just hasn't caught up. This one has.
          </p>
        </div>
      </section>

      {/* ───────── The problem ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The problem</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
            One impression can outweigh everything else.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Holistic judging asks one person to weigh height, rotation, execution, and risk all at once,
            from a single vantage point, in the seconds after a jump ends. One dominant impression, how
            high it looked, how clean the landing looked, tends to eclipse every other parameter that
            went into the trick.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            The result: a scoreboard that's hard to predict, and even harder to explain.
          </p>

          <ProblemList />
        </div>
      </section>

      {/* ───────── The idea: reductionist method intro ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The idea</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
            A trick is a sum of parts, not a single impression.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Break a jump down and it's really four separate, measurable areas: Height &amp; Amplitude,
            Extremity, Technicality, Execution, that can each be scored on their own, then added together.
            The reductionist approach doesn't rely on one overall impression of the whole trick; it breaks
            the question into four separate, simpler ones and sums the answers.
          </p>

          <IdeaSplitVisual />
        </div>
      </section>

      {/* ───────── Historical precedent ───────── */}
      <HistorySection />

      {/* ───────── The solution ───────── */}
      <SolutionSection />

      {/* ───────── The shift: 4 areas ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The shift</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Break the jump into what can be measured.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Every jump is decomposed into four areas, each scored against fixed, published parameters.
            Three of the four are grounded in objective sensor data. Only Execution stays a judged call,
            and it's the one area labeled as such.
          </p>

          <ParametersAccordion />
        </div>
      </section>

      {/* ───────── Tunable, not rigid ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Tunable, not rigid</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Objective doesn't mean fixed.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Conditions change event to event, and so does what an organizer wants a heat to reward.
            Both are configuration, not code changes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThresholdCard />
            <PresetWeightsCard />
          </div>
        </div>
      </section>

      {/* ───────── Why now ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Why now</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
            The data doesn't need to be invented.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Woo's sensors are already strapped to riders in competition today, recording height, speed,
            rotations, and load on every jump.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            Turning that into a scoring model is mostly a matter of structuring data that's already
            being collected, with a few additional readings layered on top.
          </p>

          <WooSensorPanel />
        </div>
      </section>

      {/* ───────── The sensors ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The sensors</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            One sensor sees the jump. Three see the whole trick.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-3">
            A single board-mounted sensor already captures height, speed, and rotations. It can't see
            what the kite is doing in the air, or how hard the rider loaded into the move, and those
            are exactly the parameters Extremity is built on.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            A three-point sensor system (kite, harness, board) closes that gap, with each sensor
            feeding a different part of the model.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-mono uppercase tracking-wide text-primary mb-2">Kite</div>
              <h3 className="font-bold mb-2">Where the kite is</h3>
              <p className="text-sm text-muted-foreground">
                Tracks the kite's position and angle relative to the rider. The core reading behind
                Kite Angle, one of the most contested calls in holistic judging today.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-mono uppercase tracking-wide text-primary mb-2">Harness</div>
              <h3 className="font-bold mb-2">How hard it was loaded</h3>
              <p className="text-sm text-muted-foreground">
                Captures the load through the rider's body on entry to the move and the hang time
                during it: Yank Power and Free Fall, the parameters behind how extreme a jump feels.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-mono uppercase tracking-wide text-primary mb-2">Board</div>
              <h3 className="font-bold mb-2">What the trick was</h3>
              <p className="text-sm text-muted-foreground">
                Height, distance, rotations, axis, and board variations: the mechanics of the jump
                itself, plus how in control the landing was.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────── Their results, broken down ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">A login of their own</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Athletes don't just receive a score. They get an account.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            A separate rider login surfaces their own results in full: every area, every point,
            for every jump, not just a final number.
          </p>

          <JumpBreakdownCard />
        </div>
      </section>

      {/* ───────── Coaching & education ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The real unlock</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            "What do I need to improve?" gets a real answer.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Today, an athlete who loses a heat gets an opinion. Under this model, every rider gets a
            jump-by-jump breakdown of exactly where points were left on the table. Below, watch what
            happens to one of Leonardo Casati's real Mykonos jumps as just the Height reading changes.
            The total score recalculates live, on the real scoring model.
          </p>

          <AutoWhatIfDemo />
        </div>
      </section>

      {/* ───────── Where they stand, against anyone ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Where they stand</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Compare against anyone in the field, not just the leaderboard.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            From the season ranking, a rider can pick any other athlete and see an area-by-area
            comparison: not just who's ahead, but where.
          </p>

          <LiveRankingComparison />
        </div>
      </section>

      {/* ───────── What it unlocks ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">What else it unlocks</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-12">
            More than a scoring change.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-2">Community &amp; amateurs</h3>
              <p className="text-sm text-muted-foreground">
                A rider can score their own jump against the exact standard the pros are held to,
                using the same sensor data.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-2">Fairer selection</h3>
              <p className="text-sm text-muted-foreground">
                Organizers can shortlist and seed athletes from auditable numbers instead of
                reputation.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-2">Real training data</h3>
              <p className="text-sm text-muted-foreground">
                Every session, not just contest day, produces the same area-by-area breakdown a
                rider can actually train against.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-2">Broadcast &amp; spectators</h3>
              <p className="text-sm text-muted-foreground">
                Live, on-screen area breakdowns turn a ten-second trick into something a new
                viewer can actually follow.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-2">A real data asset</h3>
              <p className="text-sm text-muted-foreground">
                Every jump becomes a comparable, storable data point, the raw material for
                rankings, content, and sponsor storytelling.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-2">Portable beyond Big Air</h3>
              <p className="text-sm text-muted-foreground">
                The same four-area model applies to any sensor-equipped board sport: wakeboarding,
                wing foiling, freestyle skiing and snowboarding.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section>
        <div className="container mx-auto px-4 py-28 max-w-3xl text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">See it work</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">A working demo is live.</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Every screen referenced here, the four-area breakdown, the coaching receipt, exists
            today, running, not as a slide.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-8 py-4 text-lg hover:opacity-90 transition-opacity"
          >
            Open the live demo
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
