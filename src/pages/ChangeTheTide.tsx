import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, CheckCircle2, X, Sparkles } from 'lucide-react';
import wooLogo from '@/assets/woo-logo.svg';
import capitalLogo from '@/assets/capital-com-logo.png';
import { useScoring } from '@/contexts/ScoringContext';
import { AREA_DISPLAY_NAMES } from '@/lib/scoring';
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
        The chief judge sets what height and distance earn full marks — a big-wind day and a
        marginal one don't get graded on the same curve.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="border-red-500/40 text-red-400 text-[11px] tabular-nums">0–{t1}m: 0 pts</Badge>
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[11px] tabular-nums">{t1}–{t2}m: 0.6 pts</Badge>
        <Badge variant="outline" className="border-lime-500/40 text-lime-400 text-[11px] tabular-nums">{t2}–{t3}m: 0.9 pts</Badge>
        <Badge variant="outline" className="border-green-500/40 text-green-400 text-[11px] tabular-nums">+{t3}m: 1.5 pts</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 font-mono">
        Move the top threshold and the rest shift with it — the chief judge sets the whole curve for
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
            <Sparkles className="w-3 h-3 text-primary" /> {state.label} — {state.pts.toFixed(2)} pts
            {state.isReal && <span className="text-muted-foreground">(real)</span>}
          </span>
        </div>
      </div>
    </div>
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

      <p className="text-[11px] text-muted-foreground mt-4 pt-4 border-t border-border font-mono">
        Auto-playing — Height and Amplitude cycling independently through their real thresholds, live on
        the actual scoring model. Two separate data streams, one combined score.
      </p>
      <style>{`@keyframes whatIfPop { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Card>
  );
}

const AUTO_COMPARE_NAMES = ['Jamie Overbeek', 'Lorenzo Casati', 'Finn Flügel'];

function LiveRankingComparison() {
  const { heightAmplitudeThresholds } = useScoring();
  const [selected, setSelected] = useState<RankingRow | null>(null);
  const topEight = GKA_BIG_AIR_MEN_RANKINGS_2026.slice(0, 8);
  const userInteractedRef = useRef(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  // Don't auto-play until this section actually scrolls into view — firing
  // immediately on mount would pop a fullscreen dialog over the hero before
  // anyone has scrolled anywhere near it.
  useEffect(() => {
    if (reducedMotion || !tableRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Auto-plays a rotating comparison (Jamie, Lorenzo, Finn) so the feature
  // is visible without anyone touching the page — stops for good the
  // moment a visitor clicks a row or closes the dialog themselves.
  useEffect(() => {
    if (reducedMotion || !inView) return;
    let i = 0;
    const applySelection = () => {
      if (userInteractedRef.current) return;
      const name = AUTO_COMPARE_NAMES[i % AUTO_COMPARE_NAMES.length];
      const row = GKA_BIG_AIR_MEN_RANKINGS_2026.find(r => r.athlete === name) ?? null;
      setSelected(row);
      i += 1;
    };
    applySelection();
    const id = setInterval(applySelection, 4000);
    return () => clearInterval(id);
  }, [reducedMotion, inView]);

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
      <Card ref={tableRef} className="overflow-hidden shadow-[var(--shadow-card)]">
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
              const isSelected = selected?.athlete === row.athlete;
              return (
                <tr
                  key={idx}
                  onClick={() => { if (!isMe) { userInteractedRef.current = true; setSelected(row); } }}
                  className={`border-b border-border transition-colors ${isMe ? 'bg-primary/10' : isSelected ? 'bg-primary/5' : 'hover:bg-muted/50 cursor-pointer'}`}
                >
                  <td className="py-3 px-4 font-semibold text-muted-foreground text-sm">#{row.rank}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={row.photoUrl} alt={row.athlete} className="w-8 h-8 rounded-full object-cover border border-border" />
                      <span className={`font-medium text-sm ${isMe ? 'text-primary font-bold' : ''}`}>{row.athlete}</span>
                      {isMe && (
                        <Badge className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/20 text-[10px]">You</Badge>
                      )}
                      {isSelected && !isMe && (
                        <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Comparing</Badge>
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

        <div
          className="overflow-hidden transition-all duration-500 ease-out border-t border-border"
          style={{ maxHeight: selected && comparison ? 520 : 0, opacity: selected && comparison ? 1 : 0 }}
        >
          {selected && comparison && (
            <div key={selected.athlete} className="p-5" style={{ animation: 'whatIfPop 0.45s ease' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={selected.photoUrl} alt={selected.athlete} className="w-12 h-12 rounded-full object-cover border border-border" />
                  <div>
                    <div className="font-bold">{selected.athlete}</div>
                    <p className="text-xs text-muted-foreground">
                      {COUNTRY_FLAGS[selected.country] ?? selected.country} #{selected.rank} · {selected.points} pts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { userInteractedRef.current = true; setSelected(null); }}
                  className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0"
                  aria-label="Close comparison"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 mb-4">
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
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${AREA_GRADIENT[fakeArea.area]} opacity-40 transition-all duration-700`}
                          style={{ width: `${(fakeArea.score / fakeArea.max) * 100}%` }}
                        />
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${AREA_GRADIENT[fakeArea.area]} border-r-2 border-white/80 transition-all duration-700`}
                          style={{ width: `${((leoArea?.score ?? 0) / fakeArea.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
      <p className="text-xs text-muted-foreground mt-3 font-mono">↑ Real ranking data, auto-playing a few comparisons — click any rider to try your own.</p>
    </>
  );
}

const AREA_GRADIENT: Record<string, string> = {
  'HEIGHT & AMPLITUDE': 'from-blue-500 to-cyan-400',
  HEIGHT: 'from-blue-500 to-cyan-400', // raw scoring-engine key, used by real computed area data
  EXTREMITY: 'from-purple-500 to-pink-400',
  TECHNICALITY: 'from-amber-500 to-yellow-400',
  EXECUTION: 'from-green-500 to-lime-400',
};

const AREAS = [
  { name: 'HEIGHT & AMPLITUDE', weight: 30, desc: 'Peak height and distance covered, measured directly against event thresholds.', subjective: false },
  { name: 'EXTREMITY', weight: 30, desc: 'Kite angle, load on entry, and hang time during the loop.', subjective: false },
  { name: 'TECHNICALITY', weight: 20, desc: 'Rotations, axis, and board variations — what the trick consisted of.', subjective: false },
  { name: 'EXECUTION', weight: 20, desc: 'Style, control, and landing quality — the one judged, human call.', subjective: true },
];

// Real Jump 1 (Leonardo Casati, Mykonos) per-parameter breakdown, shown when
// each area card auto-expands — same numbers as the rest of the page.
const AREA_SUB_PARAMS: Record<string, { label: string; pts: number; max: number }[]> = {
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
};

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

export default function ChangeTheTide() {
  const activeShiftIndex = useRoundRobinIndex(AREAS.length, 3200);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            Every jump in Big Air can now be measured — height, rotation, load, hang time, landing.
            The scoring model just hasn't caught up. This one has.
          </p>
        </div>
      </section>

      {/* ───────── The problem ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The problem</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
            One impression can outweigh everything else.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Holistic judging asks one person to weigh height, rotation, execution, and risk all at once,
            from a single vantage point, in the seconds after a jump ends. One dominant impression — how
            high it looked, how clean the landing looked — tends to eclipse every other parameter that
            went into the trick.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            The result: a scoreboard that's hard to predict, and even harder to explain.
          </p>
        </div>
      </section>

      {/* ───────── The shift: 4 areas ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The shift</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Break the jump into what can be measured.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Every jump is decomposed into four areas, each scored against fixed, published parameters.
            Three of the four are grounded in objective sensor data. Only Execution stays a judged call
            — and it's the one area labeled as such.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AREAS.map((area, i) => {
              const isActive = i === activeShiftIndex;
              return (
                <Card
                  key={area.name}
                  className="p-6 shadow-[var(--shadow-card)] transition-colors duration-500"
                  style={isActive ? { borderColor: 'hsl(var(--primary) / 0.4)' } : undefined}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm tracking-wide">{area.name}</span>
                    <span className="font-mono text-primary font-semibold">{area.weight}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{area.desc}</p>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${AREA_GRADIENT[area.name]}`}
                      style={{ width: `${area.weight * 2}%` }}
                    />
                  </div>
                  {area.subjective && (
                    <Badge variant="outline" className="mt-4 border-amber-500/40 text-amber-400 text-[10px] tracking-wide">
                      SUBJECTIVE BY DESIGN
                    </Badge>
                  )}

                  <div
                    className="overflow-hidden transition-all duration-500 ease-out"
                    style={{ maxHeight: isActive ? 260 : 0, opacity: isActive ? 1 : 0, marginTop: isActive ? '1rem' : 0 }}
                  >
                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                        Jump 1 breakdown (Leonardo Casati)
                      </div>
                      {AREA_SUB_PARAMS[area.name].map((p) => (
                        <div key={p.label} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-muted-foreground shrink-0 w-28">{p.label}</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${AREA_GRADIENT[area.name]}`}
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
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Reductionist vs Holistic ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The comparison</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-12">
            Holistic vs. reductionist, side by side.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-7 shadow-[var(--shadow-card)]">
              <div className="text-sm font-mono uppercase tracking-wide text-muted-foreground mb-5">Holistic (today)</div>
              <ul className="space-y-4">
                {[
                  'One overall impression, formed in seconds',
                  'Not tied to any fixed, published parameter',
                  'Hard to audit after the fact',
                  'Varies between judges and events',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/70" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-7 shadow-[var(--shadow-card)] border-primary/30">
              <div className="text-sm font-mono uppercase tracking-wide text-primary mb-5">Reductionist (this system)</div>
              <ul className="space-y-4">
                {[
                  'Four weighted areas, scored independently',
                  'Every point tied to a published parameter',
                  'Fully auditable — every score is explainable',
                  'Same method, every judge, every event',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
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
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Why now</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6">
            The data doesn't need to be invented.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Woo's sensors are already strapped to riders in competition today, recording height, speed,
            rotations, and load on every jump. This demo isn't running on live sensor feeds yet — but
            every parameter it scores is something already being measured on the water, jump after jump.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            Turning that into a scoring model isn't a hardware problem. It's a matter of structuring
            data that's already being collected.
          </p>
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
            what the kite is doing in the air, or how hard the rider loaded into the move — and those
            are exactly the parameters Extremity is built on.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            A three-point sensor system — kite, harness, board — closes that gap, with each sensor
            feeding a different part of the model.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-mono uppercase tracking-wide text-primary mb-2">Kite</div>
              <h3 className="font-bold mb-2">Where the kite is</h3>
              <p className="text-sm text-muted-foreground">
                Tracks the kite's position and angle relative to the rider — the core reading behind
                Kite Angle, one of the most contested calls in holistic judging today.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-mono uppercase tracking-wide text-primary mb-2">Harness</div>
              <h3 className="font-bold mb-2">How hard it was loaded</h3>
              <p className="text-sm text-muted-foreground">
                Captures the load through the rider's body on entry to the move and the hang time
                during it — Yank Power and Free Fall, the parameters behind how extreme a jump feels.
              </p>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs font-mono uppercase tracking-wide text-primary mb-2">Board</div>
              <h3 className="font-bold mb-2">What the trick was</h3>
              <p className="text-sm text-muted-foreground">
                Height, distance, rotations, axis, and board variations — the mechanics of the jump
                itself, plus how in control the landing was.
              </p>
            </Card>
          </div>
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
            happens to one of Leonardo Casati's real Mykonos jumps as just the Height reading changes —
            the total score recalculates live, on the real scoring model.
          </p>

          <AutoWhatIfDemo />
        </div>
      </section>

      {/* ───────── Their results, broken down ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">A login of their own</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Athletes don't just receive a score. They get an account.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            A separate rider login surfaces their own results in full — every area, every point,
            for every jump — not just a final number.
          </p>

          <Card className="p-8 shadow-[var(--shadow-card)]">
            <div className="text-center mb-8">
              <div className="text-xs text-muted-foreground mb-1 font-mono uppercase tracking-wide">Total Score</div>
              <div className="text-6xl font-bold text-primary">23.82<span className="text-2xl text-muted-foreground"> / 30</span></div>
              <div className="flex items-center justify-center gap-2 mt-4">
                {[
                  { label: 'Jump 1', score: 7.14 },
                  { label: 'Jump 2', score: 8.35 },
                  { label: 'Jump 3', score: 8.33 },
                ].map((j) => (
                  <span key={j.label} className="bg-muted/40 rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-primary">{j.score}</span>
                    <span className="text-muted-foreground"> · {j.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="text-sm font-semibold mb-4 text-left">Jump 1 — Detailed Breakdown</div>
            <div className="space-y-4">
              {[
                { name: 'HEIGHT & AMPLITUDE', score: 1.88, max: 3.0 },
                { name: 'EXTREMITY', score: 2.25, max: 3.0 },
                { name: 'TECHNICALITY', score: 1.3, max: 2.0 },
                { name: 'EXECUTION', score: 1.7, max: 2.0 },
              ].map((area) => (
                <div key={area.name}>
                  <div className="flex justify-between items-center mb-1.5 text-sm">
                    <span className="font-medium">{area.name}</span>
                    <span className="font-semibold text-primary">{area.score.toFixed(2)} / {area.max.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${AREA_GRADIENT[area.name]}`} style={{ width: `${(area.score / area.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ───────── Where they stand, against anyone ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Where they stand</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Compare against anyone in the field, not just the leaderboard.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            From the season ranking, a rider can pick any other athlete and see an area-by-area
            comparison — not just who's ahead, but where.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section>
        <div className="container mx-auto px-4 py-28 max-w-3xl text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">See it work</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">A working demo is live.</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Every screen referenced here — the four-area breakdown, the coaching receipt — exists
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
