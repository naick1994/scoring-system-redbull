import { useState, useMemo, useEffect, useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ParametersAccordion } from '@/components/ParametersAccordion';
import { FadeIn } from '@/components/FadeIn';
import { DeployTag } from '@/components/DeployTag';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, CheckCircle2, X, Sparkles, ChevronDown, RotateCcw, TrendingUp, Mic, Users, Share2, Radio } from 'lucide-react';
import wooLogo from '@/assets/woo-logo.svg';
import capitalLogo from '@/assets/capital-com-logo.png';
import nickAvatar from '@/assets/nick-avatar.jpg';
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
      <div className="text-xs font-mono overflow-x-auto">
        <div className="grid grid-cols-5 gap-2 text-muted-foreground pb-2 border-b border-border min-w-[280px]">
          <span>Preset</span><span className="text-right">H&amp;A</span><span className="text-right">Extr.</span><span className="text-right">Tech.</span><span className="text-right">Exec.</span>
        </div>
        {PRESET_ROWS.map((row, i) => (
          <div
            key={row.name}
            className="grid grid-cols-5 gap-2 py-1.5 px-1.5 -mx-1.5 rounded-md transition-colors duration-500 min-w-[280px]"
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
    <Card ref={cardRef} className="p-6 shadow-[var(--shadow-card)]">
      <div className="text-center mb-6">
        <div className="text-xs text-muted-foreground mb-1 font-mono uppercase tracking-wide">Total Score</div>
        <div className="text-4xl font-bold text-primary">23.82<span className="text-lg text-muted-foreground"> / 30</span></div>
        <div className="flex items-center justify-center gap-2 mt-3">
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
        <div className="overflow-x-auto">
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
        </div>
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
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_7.33.mp4`,
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
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.37.mp4`,
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
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.07.mp4`,
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

// Stats only start streaming in once the trick is mostly done (most
// readings, like kite angle, can only be derived after the loop
// completes), and arrive in a shuffled order rather than top-to-bottom.
const REVEAL_START_PCT = 0.55;

function shuffledIndices(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function WooSensorPanel() {
  const [index, setIndex] = useState(0);
  const userInteractedRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
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

  const [paused, setPaused] = useState(false);

  const handleVideoEnded = () => {
    if (userInteractedRef.current || reducedMotion) return;
    setPaused(true);
  };

  // Hold on a blank beat with just the brand logos once a jump's video
  // ends, so the fully-revealed data is actually readable before the
  // panel auto-advances to the next jump.
  useEffect(() => {
    if (!paused) return;
    const id = setTimeout(() => {
      setPaused(false);
      if (userInteractedRef.current) return;
      setIndex(prev => (prev + 1) % WOO_SENSOR_JUMPS.length);
    }, 5000);
    return () => clearTimeout(id);
  }, [paused]);

  const jump = WOO_SENSOR_JUMPS[index];

  const revealOrder = useMemo(() => shuffledIndices(jump.stats.length), [jump]);

  // Once the trick is mostly done, stats stream in with irregular,
  // unpredictable gaps (sometimes two nearly together, sometimes a longer
  // wait) rather than a metronomic tick, to read like live telemetry
  // arriving on its own schedule rather than a scripted reveal. Allowed to
  // keep ticking into the post-video pause screen, so a short clip doesn't
  // force multiple reveals into the same instant.
  const revealStartedRef = useRef(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startReveal = () => {
    if (revealStartedRef.current) return;
    revealStartedRef.current = true;
    const scheduleNext = () => {
      // Mostly quick, irregular gaps (100-650ms), occasionally a longer
      // pause (up to ~1.4s) so it never settles into a predictable rhythm.
      const delay = Math.random() < 0.2
        ? 700 + Math.random() * 700
        : 100 + Math.random() * 550;
      revealTimeoutRef.current = setTimeout(() => {
        setRevealedCount(prev => {
          // Every so often two land in the same beat, like independent
          // sensor packets that just happened to arrive together.
          const batch = Math.random() < 0.2 ? 2 : 1;
          const next = Math.min(jump.stats.length, prev + batch);
          if (next < jump.stats.length) scheduleNext();
          return next;
        });
      }, delay);
    };
    scheduleNext();
  };

  // Reset when the jump changes.
  useEffect(() => {
    revealStartedRef.current = false;
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    setRevealedCount(reducedMotion ? jump.stats.length : 0);
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, [jump, reducedMotion]);

  // Fallback: also start once paused (post-video screen), in case the clip
  // ends before crossing the reveal threshold during playback.
  useEffect(() => {
    if (!paused || reducedMotion) return;
    startReveal();
  }, [paused, reducedMotion]);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (reducedMotion) return;
    const video = e.currentTarget;
    if (!video.duration) return;
    if (video.currentTime / video.duration >= REVEAL_START_PCT) startReveal();
  };

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
              onClick={() => { userInteractedRef.current = true; setPaused(false); setIndex(i); }}
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
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {inView && (
          <div className="rounded-lg overflow-hidden border border-border bg-black w-full lg:w-3/5 shrink-0" style={{ animation: 'whatIfPop 0.4s ease' }}>
            {paused ? (
              <div className="w-full h-full flex items-center justify-center gap-4 aspect-video">
                <img src={wooLogo} alt="Woo" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                <div className="w-px h-5 bg-border" />
                <img src={capitalLogo} alt="Capital.com" className="h-5" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
            ) : (
              <video
                key={jump.videoSrc}
                src={jump.videoSrc}
                className="w-full h-full object-cover"
                muted
                autoPlay
                playsInline
                preload="none"
                onEnded={handleVideoEnded}
                onTimeUpdate={handleVideoTimeUpdate}
              />
            )}
          </div>
        )}
        <div
          key={jump.label}
          className="flex-1 rounded-lg border border-border bg-muted/20 p-4 grid grid-cols-3 content-center gap-x-4 gap-y-5"
          style={{ animation: 'whatIfPop 0.4s ease' }}
        >
        {jump.stats.map((s, i) => {
          const arrived = revealOrder.indexOf(i) < revealedCount;
          return (
            <div key={s.label}>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight mb-0.5">{s.label}</div>
              <div
                className="text-sm font-bold text-foreground tabular-nums transition-all duration-300"
                style={arrived ? undefined : { filter: 'blur(4px)', opacity: 0.4 }}
              >
                {arrived ? s.value : '••••'}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </Card>
  );
}

// Same colors used for these 4 areas everywhere else on the page (idea
// split visual, parameters accordion dots), reused here for consistency.
const LIVE_AREA_STYLES = [
  { dot: 'bg-cyan-500', bar: 'bg-cyan-500', text: 'text-cyan-400' },
  { dot: 'bg-pink-500', bar: 'bg-pink-500', text: 'text-pink-400' },
  { dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-400' },
  { dot: 'bg-lime-500', bar: 'bg-lime-500', text: 'text-lime-400' },
];

// The 3 Woo readings most legible to a live viewer at a glance — how big,
// how long, how extreme — out of the full 15-field sensor readout.
const LIVE_TRICK_STAT_LABELS = ['Max Height', 'Airtime', 'Kite Angle', 'Distance', 'Yank Power', 'Free Fall'];

// This reel's own natural cut points: trick ID graphic while the jump
// footage plays, score builds in as it wraps up, comparison takes over
// right where the footage itself cuts to a different shot (~23s in).
const LIVE_DEMO_VIDEO_SRC = `${import.meta.env.BASE_URL}videos/mykonos-highlight.mp4`;
const LIVE_DEMO_TRICK_START_SEC = 2;
const LIVE_DEMO_SCORE_START_SEC = 12;
// Timecodes given as HH:MM:SS:FF at 30fps: 00:00:20:24 -> 20 + 24/30 = 20.8s,
// 00:00:22:18 -> 22 + 18/30 = 22.6s.
const LIVE_DEMO_SCORE_DISAPPEAR_SEC = 20.8;
const LIVE_DEMO_COMPARE_SEC = 22.6;
// 00:00:20:27 at 30fps -> 20 + 27/30 = 20.9s.
const LIVE_DEMO_REPLAY_LABEL_HIDE_SEC = 20.9;

// Broadcast-style overlay demo: real trick ID graphic, then a live-built
// score breakdown, layered directly on the jump footage — showing what a
// spectator (not just a judge) could see while the trick is still live.
// Illustrative rival for the post-jump comparison screen — same convention
// used by the ranking comparison tool elsewhere on this page: a seeded,
// deterministic breakdown clamped below Leonardo's real score, since we
// only have real Woo data for him. Rank/name picked to match the heat
// already shown in the broadcast graphic baked into this footage.
const LIVE_RIVAL_NAME = 'Jamie Overbeek';
const LIVE_RIVAL_RANK = 2;

// Deterministic, illustrative-only Woo readings for the rival — same
// spirit as getFakeAthleteScore (we only have real Woo data for Leonardo).
// Scaled off his real numbers by the rival's relative area performance:
// Height & Amplitude ratio drives Max Height/Distance/Airtime, Extremity
// ratio drives Kite Angle/Yank Power/Free Fall (lower Extremity reads as a
// less extreme, higher kite angle — matching the real scoring logic
// explained elsewhere on the page).
function getFakeRivalWooStats(jumpMeta: typeof WOO_SENSOR_JUMPS[number], heightRatio: number, extremityRatio: number) {
  const get = (label: string) => parseFloat(jumpMeta.stats.find(s => s.label === label)!.value);
  return {
    'Max Height': `${(get('Max Height') * (0.82 + heightRatio * 0.18)).toFixed(1)} m`,
    'Distance': `${Math.round(get('Distance') * (0.85 + heightRatio * 0.15))} m`,
    'Airtime': `${(get('Airtime') * (0.88 + heightRatio * 0.12)).toFixed(1)} s`,
    'Kite Angle': `${Math.round(Math.min(88, get('Kite Angle') + (1 - extremityRatio) * 22))}°`,
    'Yank Power': `${(get('Yank Power') * (0.7 + extremityRatio * 0.3)).toFixed(1)}g`,
    'Free Fall': `${(get('Free Fall') * (0.7 + extremityRatio * 0.3)).toFixed(1)}s`,
  };
}

function LiveSpectatorDemo() {
  const jumpMeta = WOO_SENSOR_JUMPS[0];
  const breakdown = JUMP_BREAKDOWNS[0];
  const rival = useMemo(
    () => getFakeAthleteScore(LIVE_RIVAL_NAME, LIVE_RIVAL_RANK, breakdown.total),
    [breakdown]
  );
  const rivalWoo = useMemo(() => {
    const heightRatio = rival.areas[0].score / rival.areas[0].max;
    const extremityRatio = rival.areas[1].score / rival.areas[1].max;
    return getFakeRivalWooStats(jumpMeta, heightRatio, extremityRatio);
  }, [rival, jumpMeta]);

  const [phase, setPhase] = useState<'idle' | 'trick' | 'score' | 'compare'>('idle');
  const [revealedAreas, setRevealedAreas] = useState(0);
  const [showReplayLabel, setShowReplayLabel] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Every phase change is driven directly by the video's own currentTime, and
  // the video is never paused or looped early — it plays straight through to
  // its real end (still visibly moving during the comparison screen), then
  // onEnded resets and replays it. Since there's no separate wall-clock timer
  // racing the video's own clock, every loop lands on the exact same cut
  // points, not just the first one.
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const t = e.currentTarget.currentTime;
    setShowReplayLabel(t < LIVE_DEMO_REPLAY_LABEL_HIDE_SEC);
    if (t < LIVE_DEMO_TRICK_START_SEC) {
      setPhase('idle');
      setRevealedAreas(0);
    } else if (t < LIVE_DEMO_SCORE_START_SEC) {
      setPhase('trick');
    } else if (t < LIVE_DEMO_SCORE_DISAPPEAR_SEC) {
      setPhase('score');
      const revealT = (t - LIVE_DEMO_SCORE_START_SEC) / (LIVE_DEMO_SCORE_DISAPPEAR_SEC - LIVE_DEMO_SCORE_START_SEC);
      setRevealedAreas(Math.min(4, Math.floor(revealT * 5)));
    } else if (t < LIVE_DEMO_COMPARE_SEC) {
      // Score has disappeared, comparison hasn't taken over yet — plain
      // footage, no overlay, matching the gap between the two cut points.
      setPhase('idle');
    } else {
      setPhase('compare');
    }
  };

  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setPhase('idle');
    setRevealedAreas(0);
    video.currentTime = 0;
    video.play();
  };

  return (
    <div ref={cardRef} className="relative rounded-xl overflow-hidden border border-border bg-black shadow-[var(--shadow-card)] aspect-video">
      {inView && (
        <video
          key={LIVE_DEMO_VIDEO_SRC}
          src={LIVE_DEMO_VIDEO_SRC}
          className="w-full h-full object-cover"
          muted
          autoPlay
          playsInline
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />
      )}

      {showReplayLabel && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
          <RotateCcw className="w-2.5 h-2.5 text-white/70" />
          <span className="text-[10px] font-bold tracking-widest text-white">REPLAY</span>
        </div>
      )}

      <div
        className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-md transition-all duration-500 ease-out"
        style={{
          opacity: phase === 'trick' ? 1 : 0,
          transform: phase === 'trick' ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <div className="bg-black/75 backdrop-blur-sm border-l-2 border-primary rounded-r-lg px-4 py-3">
          <div className="text-[10px] font-mono tracking-widest text-primary uppercase mb-1">{jumpMeta.category}</div>
          <div className="text-white font-bold text-lg leading-tight mb-2.5">{jumpMeta.trick}</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 border-t border-white/10 pt-2">
            {LIVE_TRICK_STAT_LABELS.map(label => {
              const stat = jumpMeta.stats.find(s => s.label === label);
              if (!stat) return null;
              return (
                <div key={label}>
                  <div className="text-[9px] font-medium text-white/50 uppercase tracking-wider leading-tight">{label}</div>
                  <div className="text-sm font-bold text-white tabular-nums">{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-6 right-6 md:left-auto md:w-80 transition-all duration-500 ease-out"
        style={{
          opacity: phase === 'score' ? 1 : 0,
          transform: phase === 'score' ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: phase === 'score' ? 'auto' : 'none',
        }}
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 p-4 space-y-2.5">
          {breakdown.areas.map((area, i) => {
            const areaVisible = revealedAreas > i;
            const style = LIVE_AREA_STYLES[i];
            return (
              <div key={area.name} className="transition-opacity duration-300" style={{ opacity: areaVisible ? 1 : 0.2 }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-white/80 font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {area.name}
                  </span>
                  <span className={`font-bold tabular-nums ${style.text}`}>{areaVisible ? area.score.toFixed(2) : '—'}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${style.bar} transition-all duration-700 ease-out`}
                    style={{ width: areaVisible ? `${(area.score / area.max) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
          <div
            className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between transition-opacity duration-500"
            style={{ opacity: revealedAreas >= 4 ? 1 : 0 }}
          >
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Total</span>
            <span className="text-2xl font-bold text-primary tabular-nums">{breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-black/30 flex flex-col justify-center px-6 md:px-10 py-6 transition-opacity duration-500 ease-out"
        style={{ opacity: phase === 'compare' ? 1 : 0, pointerEvents: phase === 'compare' ? 'auto' : 'none' }}
      >
        <div className="flex items-center justify-center gap-3 mb-5 bg-black/70 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 mx-auto">
          <img src={wooLogo} alt="Woo" className="h-4" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="w-px h-4 bg-white/20" />
          <img src={capitalLogo} alt="Capital.com" className="h-3.5" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto w-full">
          {[
            {
              name: 'Leonardo Casati', total: breakdown.total, areas: breakdown.areas.map(a => a.score),
              woo: Object.fromEntries(LIVE_TRICK_STAT_LABELS.map(l => [l, jumpMeta.stats.find(s => s.label === l)!.value])),
              photoUrl: GKA_BIG_AIR_MEN_RANKINGS_2026.find(r => r.athlete === 'Leonardo Casati')?.photoUrl,
            },
            {
              name: LIVE_RIVAL_NAME, total: rival.averageScore, areas: rival.areas.map(a => a.score),
              woo: rivalWoo,
              photoUrl: GKA_BIG_AIR_MEN_RANKINGS_2026.find(r => r.athlete === LIVE_RIVAL_NAME)?.photoUrl,
            },
          ].map((rider, riderIdx) => {
            const isWinner = riderIdx === 0;
            return (
              <div key={rider.name} className={`rounded-lg border p-4 bg-black/90 backdrop-blur-sm ${isWinner ? 'border-primary/50' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {rider.photoUrl && (
                    <img src={rider.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  )}
                  <div className="text-xs font-semibold text-white truncate">{rider.name}</div>
                </div>
                <div className={`text-3xl font-bold tabular-nums mb-3 ${isWinner ? 'text-primary' : 'text-white/70'}`}>
                  {rider.total.toFixed(2)}
                </div>
                <div className="space-y-1.5 mb-3">
                  {breakdown.areas.map((area, i) => (
                    <div key={area.name} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <span className={`w-1.5 h-1.5 rounded-full ${LIVE_AREA_STYLES[i].dot}`} />
                        {area.name.split(' ')[0]}
                      </span>
                      <span className={`font-bold tabular-nums ${LIVE_AREA_STYLES[i].text}`}>{rider.areas[i].toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-white/10 pt-2">
                  {LIVE_TRICK_STAT_LABELS.map(label => (
                    <div key={label}>
                      <div className="text-[9px] font-medium text-white/40 uppercase tracking-wider leading-tight">{label}</div>
                      <div className="text-xs font-bold text-white tabular-nums">{rider.woo[label]}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SPECTATOR_BENEFIT_CARDS = [
  {
    icon: TrendingUp, title: 'Live score, not a verdict', color: 'cyan',
    desc: "The total builds area by area while the trick is still fresh, not as a single number dropped minutes later.",
  },
  {
    icon: Mic, title: 'Commentary with receipts', color: 'pink',
    desc: 'Broadcasters explain a call with real numbers, live, instead of an opinion no one can check.',
  },
  {
    icon: Users, title: 'Easy for new fans', color: 'orange',
    desc: 'Four simple areas anyone can follow, not a scoring system only insiders understand.',
  },
  {
    icon: Share2, title: 'Built for content', color: 'green',
    desc: 'Every jump becomes a stat-backed clip, ready for replays, comparisons, and social.',
  },
];

const SPECTATOR_TICKER_ITEMS = [
  'No dead air waiting for a score',
  "Follow who's winning in real time",
  'Rider-vs-rider graphics, ready to air',
  'Every controversy settled with data, live',
  'Four areas anyone can learn in one heat',
  'Real stats for every highlight clip',
  'Commentary backed by real numbers',
  'A scoreboard fans can actually read',
];

function SpectatorBenefitsSection() {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  const activeIndex = useRoundRobinIndex(SPECTATOR_BENEFIT_CARDS.length, 2400);
  return (
    <div ref={ref}>
      <style>{`
        @keyframes spectatorTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .spectator-ticker-track { animation: spectatorTicker 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .spectator-ticker-track { animation: none; }
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SPECTATOR_BENEFIT_CARDS.map((card, i) => {
          const isActive = i === activeIndex;
          const colors = CARD_ACCENT_COLORS[card.color];
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="p-5 shadow-[var(--shadow-card)] transition-all duration-500"
              style={{
                opacity: seen ? 1 : 0,
                transform: `${seen ? 'translateY(0)' : 'translateY(16px)'} ${isActive ? 'scale(1.03)' : 'scale(1)'}`,
                borderColor: isActive ? colors.border : undefined,
                transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms, border-color 0.5s ease`,
              }}
            >
              <Icon className={`w-5 h-5 mb-3 ${colors.text}`} />
              <h3 className="font-bold mb-1.5">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </Card>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-card/60 py-3">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
        <div className="spectator-ticker-track flex items-center gap-8 whitespace-nowrap w-max">
          {[...SPECTATOR_TICKER_ITEMS, ...SPECTATOR_TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Radio className="w-3.5 h-3.5 text-primary shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const PROBLEM_ITEMS = [
  'No insight for the viewer into why a score was given',
  'One overall impression, formed in seconds',
  'Not tied to any fixed, published parameter',
  'Hard to audit after the fact',
  'Varies between judges and events',
  'No specific feedback on what to improve',
  'Rewards how it looked, not what it measured',
  'No way to compare beyond the final rank',
];

const SOLUTION_ITEMS = [
  'Live, on-screen breakdown of why a trick scored what it did',
  'Four weighted areas, scored independently',
  'Every point tied to a published parameter',
  'Fully auditable: every score is explainable',
  'Same method, every judge, every event',
  'Precise, per-parameter feedback for every rider',
  'Every score traced to a real measurement',
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

// A quiet pause between the page's 5 parts — a big number and a name, no
// further explanation. Not a full-screen slide (that was tried and reverted
// for regular sections earlier), just enough height to read as a breath
// between parts rather than another content section.
// Fade-and-rise reveal for a section's heading block, so every section
// on the page animates in on scroll, not just the interactive widgets.
type RevealDirection = 'up' | 'down' | 'left' | 'right';

const REVEAL_TRANSFORMS: Record<RevealDirection, string> = {
  up: 'translateY(64px)',
  down: 'translateY(-64px)',
  left: 'translateX(72px)',
  right: 'translateX(-72px)',
};

// Fade-and-slide reveal for a section's content, entering from a chosen
// direction, so sections don't all animate in the same way down the page.
function RevealOnScroll({
  children, className, direction = 'up', delay = 0,
}: { children: ReactNode; className?: string; direction?: RevealDirection; delay?: number }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translate(0, 0) scale(1)' : `${REVEAL_TRANSFORMS[direction]} scale(0.94)`,
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
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

const SENSOR_CARDS = [
  {
    label: 'Kite', title: 'Where the kite is', color: 'cyan',
    desc: "Tracks the kite's position and angle relative to the rider. The core reading behind Kite Angle, one of the most contested calls in holistic judging today.",
  },
  {
    label: 'Harness', title: 'How hard it was loaded', color: 'purple',
    desc: 'Captures the load on entry and the hang time after it: Yank Power and Free Fall, the parameters behind how extreme a jump feels.',
  },
  {
    label: 'Board', title: 'What the trick was', color: 'orange',
    desc: 'Height, distance, rotations, axis, and board variations: the mechanics of the jump itself, plus how in control the landing was.',
  },
];

function SensorCardsGrid() {
  const activeIndex = useRoundRobinIndex(SENSOR_CARDS.length, 3000);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {SENSOR_CARDS.map((card, i) => {
        const isActive = i === activeIndex;
        const colors = CARD_ACCENT_COLORS[card.color];
        return (
          <FadeIn key={card.label} y={40} delay={i * 0.12}>
            <Card
              className={`p-6 shadow-[var(--shadow-card)] transition-transform duration-500 ${isActive ? 'scale-[1.03]' : 'scale-100'}`}
              style={{ borderColor: isActive ? colors.border : undefined }}
            >
              <div className={`text-3xl font-bold mb-1 transition-colors duration-500 ${isActive ? colors.text : 'text-foreground'}`}>
                {card.label}
              </div>
              <h3 className="font-bold text-sm mb-3">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </Card>
          </FadeIn>
        );
      })}
    </div>
  );
}

const UNLOCK_CARDS = [
  {
    label: 'Broadcast', title: 'Broadcast & spectators', color: 'pink',
    desc: 'The live breakdown you just saw turns a ten-second trick into something a new viewer can actually follow, and enjoy.',
  },
  {
    label: 'Community', title: 'Community & amateurs', color: 'cyan',
    desc: 'A rider can score their own jump against the exact standard the pros are held to, using the same sensor data.',
  },
  {
    label: 'Selection', title: 'Fairer selection', color: 'purple',
    desc: 'Organizers can shortlist and seed athletes from auditable numbers instead of reputation.',
  },
  {
    label: 'Training', title: 'Real training data', color: 'orange',
    desc: 'Every session, not just contest day, produces the same area-by-area breakdown a rider can actually train against.',
  },
  {
    label: 'Data', title: 'A real data asset', color: 'blue',
    desc: 'Every jump becomes a comparable, storable data point, the raw material for rankings, content, and sponsor storytelling.',
  },
  {
    label: 'Scale', title: 'Portable beyond Big Air', color: 'green',
    desc: 'The same four-area model applies to any sensor-equipped board sport: wakeboarding, wing foiling, freestyle skiing and snowboarding.',
  },
];

function UnlockCardsGrid() {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  const activeIndex = useRoundRobinIndex(UNLOCK_CARDS.length, 2600);
  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {UNLOCK_CARDS.map((card, i) => {
        const isActive = i === activeIndex;
        const colors = CARD_ACCENT_COLORS[card.color];
        return (
          <Card
            key={card.title}
            className={`p-6 shadow-[var(--shadow-card)] transition-transform duration-500 ${isActive ? 'scale-[1.03]' : 'scale-100'}`}
            style={{
              opacity: seen ? 1 : 0,
              transform: `${seen ? 'translateY(0)' : 'translateY(16px)'} ${isActive ? 'scale(1.03)' : 'scale(1)'}`,
              borderColor: isActive ? colors.border : undefined,
              transition: `opacity 0.5s ease ${i * 90}ms, transform 0.5s ease ${i * 90}ms, border-color 0.5s ease`,
            }}
          >
            <h3 className={`font-bold mb-3 transition-colors duration-500 ${isActive ? colors.text : 'text-foreground'}`}>{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.desc}</p>
          </Card>
        );
      })}
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
  const activeIndex = useRoundRobinIndex(PROBLEM_ITEMS.length, 2000);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
      {PROBLEM_ITEMS.map((text, i) => {
        const color = PROBLEM_ITEM_COLORS[i % PROBLEM_ITEM_COLORS.length];
        const isActive = i === activeIndex;
        return (
          <FadeIn key={text} y={30} delay={i * 0.08}>
            <div
              className={`flex items-center gap-3 text-sm rounded-lg border px-4 py-3 transition-all duration-300 ${
                isActive ? 'border-red-500 bg-red-500/25 shadow-[0_0_16px_-4px_rgba(239,68,68,0.5)]' : 'border-border bg-card/40'
              }`}
            >
              <X className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? color : 'text-muted-foreground/50'}`} />
              <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}

function SolutionSection() {
  const activeIndex = useRoundRobinIndex(SOLUTION_ITEMS.length, 2000);

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <FadeIn y={50} duration={0.7}>
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The solution</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Every problem, <span className="text-primary">answered.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            The same reductionist model, restated as answers to every problem holistic judging has.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOLUTION_ITEMS.map((text, i) => {
              const color = SOLUTION_ITEM_COLORS[i % SOLUTION_ITEM_COLORS.length];
              const isActive = i === activeIndex;
              return (
                <FadeIn key={text} y={30} delay={i * 0.08}>
                  <div
                    className={`flex items-center gap-3 text-sm rounded-lg border px-4 py-3 transition-all duration-300 ${
                      isActive ? 'border-green-500 bg-green-500/25 shadow-[0_0_16px_-4px_rgba(34,197,94,0.5)]' : 'border-border bg-card/40'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? color : 'text-muted-foreground/50'}`} />
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </FadeIn>
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

const CARD_ACCENT_COLORS: Record<string, { border: string; text: string }> = {
  blue:   { border: 'hsl(217 91% 60% / 0.5)', text: 'text-blue-400' },
  purple: { border: 'hsl(270 91% 65% / 0.5)', text: 'text-purple-400' },
  orange: { border: 'hsl(25 95% 53% / 0.5)',  text: 'text-orange-400' },
  cyan:   { border: 'hsl(190 91% 55% / 0.5)', text: 'text-cyan-400' },
  pink:   { border: 'hsl(330 81% 60% / 0.5)', text: 'text-pink-400' },
  green:  { border: 'hsl(142 71% 45% / 0.5)', text: 'text-green-400' },
};

function HistorySection() {
  const activeIndex = useRoundRobinIndex(HISTORY_ITEMS.length, 3000);

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <FadeIn y={50} duration={0.7}>
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Not the first sport to do this</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Sooner or later, <span className="text-primary">every sport changes.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Most judged sports have already made this exact trade, usually after the same holistic
            problems became too visible to ignore.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HISTORY_ITEMS.map((item, i) => {
            const isActive = i === activeIndex;
            const colors = CARD_ACCENT_COLORS[item.color];
            return (
              <FadeIn key={item.sport} y={40} delay={i * 0.12}>
                <Card
                  className={`p-6 h-full shadow-[var(--shadow-card)] transition-all duration-500 ${
                    isActive ? 'scale-[1.03]' : 'scale-100'
                  }`}
                  style={isActive ? { borderColor: colors.border } : undefined}
                >
                  <div className={`text-3xl font-bold mb-1 tabular-nums transition-colors duration-500 ${isActive ? colors.text : 'text-foreground'}`}>
                    {item.year}
                  </div>
                  <div className="font-bold text-sm mb-3">{item.sport}</div>
                  <p className="text-sm text-muted-foreground mb-3">{item.change}</p>
                  <p className="text-xs text-muted-foreground/80 border-t border-border pt-3">{item.why}</p>
                </Card>
              </FadeIn>
            );
          })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

const DATA_DOTS = [
  { x: 6, y: 14, size: 2.5, delay: 0.2, duration: 7, dx: 90, dy: -50 },
  { x: 13, y: 32, size: 2, delay: 1.4, duration: 8.5, dx: -70, dy: 60 },
  { x: 9, y: 55, size: 2, delay: 2.6, duration: 6.5, dx: 110, dy: 30 },
  { x: 17, y: 74, size: 2.5, delay: 0.6, duration: 9, dx: -60, dy: -80 },
  { x: 4, y: 88, size: 2, delay: 1.9, duration: 7.5, dx: 80, dy: -40 },
  { x: 24, y: 18, size: 2, delay: 3.1, duration: 6, dx: -100, dy: 40 },
  { x: 28, y: 46, size: 2.5, delay: 0.3, duration: 8, dx: 60, dy: 90 },
  { x: 21, y: 62, size: 2, delay: 2.2, duration: 7.2, dx: -80, dy: -60 },
  { x: 33, y: 85, size: 2, delay: 1.1, duration: 6.8, dx: 100, dy: -30 },
  { x: 39, y: 10, size: 2, delay: 2.8, duration: 9.2, dx: -50, dy: 100 },
  { x: 45, y: 28, size: 2, delay: 0.8, duration: 6.3, dx: 70, dy: -70 },
  { x: 41, y: 92, size: 2.5, delay: 3.4, duration: 8.1, dx: -110, dy: -20 },
  { x: 52, y: 15, size: 2, delay: 1.6, duration: 7.7, dx: 40, dy: 110 },
  { x: 58, y: 40, size: 2, delay: 2.4, duration: 6.6, dx: -90, dy: 50 },
  { x: 55, y: 68, size: 2.5, delay: 0.5, duration: 8.9, dx: 100, dy: 40 },
  { x: 63, y: 85, size: 2, delay: 1.8, duration: 7.1, dx: -60, dy: -100 },
  { x: 68, y: 22, size: 2.5, delay: 3.0, duration: 6.4, dx: 80, dy: 60 },
  { x: 72, y: 50, size: 2, delay: 0.9, duration: 8.4, dx: -100, dy: -40 },
  { x: 76, y: 12, size: 2, delay: 2.1, duration: 7.4, dx: 50, dy: 90 },
  { x: 79, y: 64, size: 2.5, delay: 1.3, duration: 6.9, dx: -70, dy: 70 },
  { x: 83, y: 34, size: 2, delay: 2.7, duration: 8.6, dx: 90, dy: -50 },
  { x: 87, y: 78, size: 2, delay: 0.4, duration: 7.3, dx: -80, dy: -60 },
  { x: 91, y: 20, size: 2.5, delay: 1.7, duration: 6.2, dx: 60, dy: 100 },
  { x: 94, y: 48, size: 2, delay: 2.9, duration: 8.8, dx: -110, dy: 20 },
  { x: 96, y: 90, size: 2, delay: 0.7, duration: 7.6, dx: 70, dy: -80 },
  { x: 89, y: 58, size: 2, delay: 3.3, duration: 6.7, dx: -50, dy: 90 },
  { x: 62, y: 6, size: 2, delay: 1.0, duration: 9.1, dx: 100, dy: 30 },
  { x: 35, y: 65, size: 2, delay: 2.5, duration: 7.9, dx: -90, dy: -50 },
  { x: 47, y: 80, size: 2, delay: 0.2, duration: 6.1, dx: 80, dy: 60 },
  { x: 14, y: 44, size: 2, delay: 1.5, duration: 8.3, dx: -70, dy: -90 },
];

export default function ChangeTheTide() {
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const heroStep = (delay: number) => ({
    opacity: heroIn ? 1 : 0,
    transform: heroIn ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Shared entrance transition for auto-cycling values — never drops to
          opacity 0, so a fast tick never reads as content vanishing. */}
      <style>{`
        @keyframes whatIfPop { from { opacity: 0.5; transform: translateY(1px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroGlowDrift {
          0%, 100% { transform: translate(-8%, -6%) scale(1); opacity: 0.55; }
          50% { transform: translate(6%, 4%) scale(1.15); opacity: 0.85; }
        }
        .hero-glow { animation: heroGlowDrift 14s ease-in-out infinite; }
        @keyframes dataDrift {
          0% { opacity: 0.1; transform: translate(0, 0); }
          25% { opacity: 0.42; transform: translate(calc(var(--dx, 10px) * 0.6), calc(var(--dy, -10px) * -0.4)); }
          50% { opacity: 0.15; transform: translate(var(--dx, 10px), var(--dy, -10px)); }
          75% { opacity: 0.4; transform: translate(calc(var(--dx, 10px) * 0.3), calc(var(--dy, -10px) * 0.8)); }
          100% { opacity: 0.1; transform: translate(0, 0); }
        }
        .data-dot { animation-name: dataDrift; animation-timing-function: linear; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-glow { animation: none; }
          .data-dot { animation: none; opacity: 0.25; }
        }
      `}</style>
      {/* Ambient star-like data field, fixed behind the whole page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        {DATA_DOTS.map((d, i) => (
          <span
            key={i}
            className="data-dot absolute rounded-full"
            style={{
              left: `${d.x}%`, top: `${d.y}%`,
              width: d.size, height: d.size,
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 5px 1px hsl(var(--primary) / 0.5)',
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
              ['--dx' as string]: `${d.dx}px`,
              ['--dy' as string]: `${d.dy}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-border min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div
          className="hero-glow absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.16) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <div className="container mx-auto px-4 pt-10 max-w-5xl relative">
          <div className="flex items-center gap-4" style={heroStep(0)}>
            <img src={wooLogo} alt="Woo" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
            <div className="w-px h-5 bg-border" />
            <img src={capitalLogo} alt="Capital.com" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative flex-1 flex flex-col justify-center">
          <h1 className="text-6xl md:text-8xl font-bold leading-[1.05] tracking-tight max-w-5xl">
            <span className="block" style={heroStep(150)}>It's time for</span>
            <span className="block text-primary" style={heroStep(320)}>next level judging.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mt-8 max-w-2xl" style={heroStep(520)}>
            Big Air has objective data. It deserves objective judging.
          </p>
        </div>

        <div className="relative pb-10 flex justify-center" style={heroStep(750)}>
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </div>
      </section>

      {/* ───────── Live for the viewer, not just the judge ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <RevealOnScroll direction="up">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Watch it live</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Watch the <span className="text-primary">math land.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              The trick, how hard it was, and why it scored what it did, on screen the moment it
              lands. This is what it feels like to watch, not just to judge.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <LiveSpectatorDemo />
          </RevealOnScroll>
        </div>
      </section>

      {/* ───────── The problem ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <FadeIn y={50} duration={0.7}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The problem</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
              One impression can outweigh <span className="text-primary">everything else.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Holistic judging asks one person to weigh height, rotation, execution, and risk all at
              once. One dominant impression tends to eclipse everything else, leaving a scoreboard
              that's hard to predict, explain, or enjoy watching.
            </p>
            <ProblemList />
          </FadeIn>
        </div>
      </section>

      {/* ───────── The idea: reductionist method intro ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <FadeIn y={50} duration={0.7}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The idea</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
              A trick is a <span className="text-primary">sum of parts,</span> not a single impression.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Every jump breaks down into four areas: Height &amp; Amplitude, Extremity, Technicality,
              Execution. Each is scored on its own, then added together.
            </p>
            <IdeaSplitVisual />
          </FadeIn>
        </div>
      </section>

      {/* ───────── Historical precedent ───────── */}
      <HistorySection />

      {/* ───────── The solution ───────── */}
      <SolutionSection />

      {/* ───────── The shift: 4 areas ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <FadeIn y={50} duration={0.7}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The shift</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Break the jump into what can be <span className="text-primary">measured.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              Every jump is decomposed into four areas, each scored against fixed, published parameters.
              Three are grounded in sensor data. Only Execution stays a judged call.
            </p>

            <FadeIn y={40} delay={0.1}>
              <ParametersAccordion />
            </FadeIn>
          </FadeIn>
        </div>
      </section>

      {/* ───────── Tunable, not rigid ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <FadeIn y={50} duration={0.7}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Tunable, not rigid</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Objective doesn't mean <span className="text-primary">fixed.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              Conditions change event to event, and so does what an organizer wants a heat to reward.
              Both are configuration, not code changes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FadeIn y={40} delay={0}>
                <ThresholdCard />
              </FadeIn>
              <FadeIn y={40} delay={0.15}>
                <PresetWeightsCard />
              </FadeIn>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────── The sensors ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <FadeIn y={50} duration={0.7}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The sensors</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              One sensor sees the jump. Three see <span className="text-primary">the whole trick.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              A sensor on the board alone can't see what the kite is doing, or how hard the rider loaded
              into the move. Three sensors, one each on the kite, harness, and board, close that gap.
            </p>

            <SensorCardsGrid />
          </FadeIn>
        </div>
      </section>

      {/* ───────── Why now ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <FadeIn y={50} duration={0.7}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Why now</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
              The data doesn't need to be <span className="text-primary">invented.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Sensor technology like Woo's can already capture height, speed, and rotations on every jump.
              A few new measurements, like kite angle, yank, and free fall, complete the picture.
            </p>

            <FadeIn y={40} delay={0.1}>
              <WooSensorPanel />
            </FadeIn>
          </FadeIn>
        </div>
      </section>

      {/* ───────── Why fans win too ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <RevealOnScroll direction="up">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">For the fans</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Watching gets <span className="text-primary">better too.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              Objective scoring isn't just fairer for riders and judges. It changes what it feels
              like to watch a heat.
            </p>
          </RevealOnScroll>

          <SpectatorBenefitsSection />
        </div>
      </section>

      {/* ───────── Their results, broken down ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <RevealOnScroll direction="right">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">A login of their own</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Athletes don't just receive a score. They get <span className="text-primary">an account.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              A separate rider login surfaces every area, every point, for every jump, not just a
              final number.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <JumpBreakdownCard />
          </RevealOnScroll>
        </div>
      </section>

      {/* ───────── Coaching & education ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <RevealOnScroll direction="left">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The real unlock</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              "What do I need to improve?" gets <span className="text-primary">a real answer.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              Today, an athlete who loses a heat gets an opinion. This model gives every rider a
              jump-by-jump breakdown of exactly where points were left on the table.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <AutoWhatIfDemo />
          </RevealOnScroll>
        </div>
      </section>

      {/* ───────── Where they stand, against anyone ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <RevealOnScroll direction="right">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Where they stand</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Compare against anyone in the field, not just <span className="text-primary">the leaderboard.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              From the season ranking, a rider can pick any other athlete and see an area-by-area
              comparison: not just who's ahead, but where and why.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <LiveRankingComparison />
          </RevealOnScroll>
        </div>
      </section>

      {/* ───────── What it unlocks ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <RevealOnScroll direction="left">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">What else it unlocks</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              More than a <span className="text-primary">scoring change.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              The same data that decides a heat also opens doors for riders, organizers, and the
              sport itself.
            </p>
          </RevealOnScroll>

          <UnlockCardsGrid />
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section>
        <div className="container mx-auto px-4 py-28 max-w-3xl text-center">
          <RevealOnScroll direction="up">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">See it work</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">A working demo <span className="text-primary">is live.</span></h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Every screen referenced here, from the four-area breakdown to the coaching receipt,
              already exists as a working prototype.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-8 py-4 text-lg hover:opacity-90 transition-opacity"
            >
              Open the scoring system
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <Link
            to="/about-nick"
            className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <img src={nickAvatar} alt="Nicholas Baruffaldi" className="w-7 h-7 rounded-full object-cover border border-border" />
            Built and prototyped by Nicholas Baruffaldi
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <DeployTag />
      </footer>
    </div>
  );
}
