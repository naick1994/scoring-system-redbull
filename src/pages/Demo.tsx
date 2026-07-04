import { useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Play, Film, ChevronRight, BarChart2, Gauge, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import logo from '@/assets/gka-logo.svg';
import wooLogo from '@/assets/woo-logo.svg';
import capitalLogo from '@/assets/capital-com-logo.png';
import { useScoring } from '@/contexts/ScoringContext';
import { calculateScore, heightBracketLabel, amplitudeBracketLabel, heightBracketForValue, amplitudeBracketForValue, PARAMETER_CONFIG, AREA_DISPLAY_NAMES } from '@/lib/scoring';
import type { JumpParameters, ScoringResult, HeightAmplitudeThresholds } from '@/types/scoring';

const EXECUTION_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PARAMETER_CONFIG.EXECUTION).map(([key, cfg]) => [key, cfg.label])
);

interface ExecutionJudgeState {
  values: Record<string, number>;
  revealed: boolean;
}

const DEFAULT_EXECUTION_JUDGE_STATE: ExecutionJudgeState = {
  values: { style: 0, stability_control: 0, landing_control: 0, board_control: 0, kite_control: 0 },
  revealed: false,
};

const EXECUTION_SCORES_STORAGE_KEY = 'demoExecutionScores';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WooData {
  maxHeight: number;
  airtime: number;
  distance: number;
  maxSpeed: number;
  approachSpeed: number;
  windAngle: number;
  quality: 'Good' | 'OK';
  peakTimeRatio: number;
  takeoffOffset: number;
}

interface AreaParam {
  label: string;
  detail: string;
  pts: number;
  maxPts: number;
}

interface AreaScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  gradient: string;
  params: AreaParam[];
}

interface JumpDemoBase {
  id: number;
  label: string;
  athlete: string;
  trick: string;
  category: string;
  videoSrc?: string;
  woo: WooData;
  realScore: number;
  realScoreEvent: string;
}

interface JumpDemo extends JumpDemoBase {
  score: number;
  areas: AreaScore[];
}

// ─── Static data (no scores — computed live) ──────────────────────────────────

const DEMO_JUMPS_BASE: JumpDemoBase[] = [
  {
    id: 1, label: 'Jump 1', athlete: 'Leonardo Casati',
    trick: 'Late Backroll Kiteloop Doppio Flip Added Rotation',
    category: 'KLBRFL',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_7.33.mp4`,
    woo: { maxHeight: 15.9, airtime: 7.6, distance: 76,  maxSpeed: 46, approachSpeed: 32, windAngle: 18, quality: 'OK',   peakTimeRatio: 0.30, takeoffOffset: 0 },
    realScore: 7.33, realScoreEvent: 'Capital.com GKA Big Air World Cup Mykonos 2026',
  },
  {
    id: 2, label: 'Jump 2', athlete: 'Leonardo Casati',
    trick: 'Doobie Loop Boardoff by the Fin',
    category: 'KLFRBO',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.37.mp4`,
    woo: { maxHeight: 19.8, airtime: 7.5, distance: 83,  maxSpeed: 52, approachSpeed: 30, windAngle: 11, quality: 'Good', peakTimeRatio: 0.33, takeoffOffset: 0 },
    realScore: 8.37, realScoreEvent: 'Capital.com GKA Big Air World Cup Mykonos 2026',
  },
  {
    id: 3, label: 'Jump 3', athlete: 'Leonardo Casati',
    trick: 'Backroll Kiteloop Tornado',
    category: 'KLBRBO',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.07.mp4`,
    woo: { maxHeight: 17.5, airtime: 7.0, distance: 121, maxSpeed: 65, approachSpeed: 28, windAngle: 6,  quality: 'Good', peakTimeRatio: 0.30, takeoffOffset: 0 },
    realScore: 8.07, realScoreEvent: 'Capital.com GKA Big Air World Cup Mykonos 2026',
  },
];

// ─── Default scoring params (used when scorer hasn't been loaded) ─────────────
// HEIGHT is derived live from each jump's real Woo numbers (maxHeight/distance)
// against the currently configured thresholds, and EXECUTION comes from the
// judge's own slider input (executionByJump) — see effectiveParams in Demo().

type DemoParamsCore = Omit<JumpParameters, 'HEIGHT' | 'EXECUTION'>;

const DEMO_SCORING_PARAMS: [DemoParamsCore, DemoParamsCore, DemoParamsCore] = [
  {
    landingOutcome: 'clean',
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '1', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '2', board_tic_tac: '0' },
  },
  {
    landingOutcome: 'clean',
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '2', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '0', board_tic_tac: '0' },
  },
  {
    landingOutcome: 'clean',
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '3', rotation_axis: 'horizontal', board_off: 'no' },
  },
];

// ─── Score computation helpers ────────────────────────────────────────────────

const AREA_GRADIENT: Record<string, string> = {
  HEIGHT:       'from-blue-500 to-cyan-400',
  EXTREMITY:    'from-purple-500 to-pink-400',
  TECHNICALITY: 'from-amber-500 to-yellow-400',
  EXECUTION:    'from-green-500 to-lime-400',
};

const VALUE_DISPLAY: Record<string, string> = {
  'super_low': 'Super Low (71°+)', 'low': 'Low (51–70°)', 'average': 'Average (31–50°)', 'high': 'High (0–30°)',
  'none': 'None', 'medium': 'Medium', 'bomb': 'Bomb', 'poor': 'Poor',
  'horizontal': 'Horizontal', 'vertical': 'Vertical',
  'yes': 'Yes', 'no': 'No',
  '0': '0', '1': '×1', '2': '×2', '3': '×3', '3+': '3+',
};

// Splits the 4 computed areas into the objective ones (HEIGHT/EXTREMITY/
// TECHNICALITY, always visible) and EXECUTION (hidden until the judge
// confirms it) — shared by JumpCard's static summary and RecapScreen.
function splitObjectiveAndExecution(areas: AreaScore[]) {
  const objectiveAreas = areas.filter(a => a.name !== 'EXECUTION');
  const executionMeta = areas.find(a => a.name === 'EXECUTION');
  const objectiveSubtotal = objectiveAreas.reduce((s, a) => s + a.score, 0);
  const objectiveMax = objectiveAreas.reduce((s, a) => s + a.maxScore, 0);
  return { objectiveAreas, executionMeta, objectiveSubtotal, objectiveMax };
}

function resultToAreas(result: ScoringResult, thresholds: HeightAmplitudeThresholds): AreaScore[] {
  return result.areaScores.map(as => ({
    name: AREA_DISPLAY_NAMES[as.area] ?? as.area,
    score: Math.round(as.finalScore * 100) / 100,
    maxScore: Math.round(as.weight * 10 * 100) / 100,
    weight: Math.round(as.weight * 100),
    gradient: AREA_GRADIENT[as.area] ?? 'from-gray-500 to-gray-400',
    params: as.parameters.map(p => {
      let detail = VALUE_DISPLAY[String(p.value)] ?? String(p.value);
      if (p.label === 'Height') detail = heightBracketLabel(p.value as 'b1' | 'b2' | 'b3' | 'b4', thresholds.height);
      if (p.label === 'Amplitude') detail = amplitudeBracketLabel(p.value as 'b1' | 'b2' | 'b3' | 'b4', thresholds.amplitude);
      return { label: p.label, detail, pts: p.points, maxPts: p.max };
    }),
  }));
}

// ─── Recap screen ─────────────────────────────────────────────────────────────

function ParamRow({ p }: { p: AreaParam }) {
  const pct = p.maxPts > 0 ? (p.pts / p.maxPts) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
      <span className="text-zinc-400 text-[11px] tracking-wide min-w-[7.5rem]">{p.label}</span>
      {p.detail && <span className="text-zinc-300 text-[11px] font-semibold min-w-[5rem]">{p.detail}</span>}
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[2rem]">
        <div className="h-full bg-white/30 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-zinc-300 text-[11px] tabular-nums shrink-0">
        {p.pts.toFixed(2)}<span className="text-zinc-600">/{p.maxPts.toFixed(2)}</span>
      </span>
    </div>
  );
}

function RecapScreen({
  jump, onClose, execution, onExecutionChange,
}: {
  jump: JumpDemo;
  onClose: () => void;
  execution: ExecutionJudgeState;
  onExecutionChange: (state: ExecutionJudgeState) => void;
}) {
  const wooStats = [
    { label: 'Max Height', value: `${jump.woo.maxHeight} m`        },
    { label: 'Airtime',    value: `${jump.woo.airtime} s`          },
    { label: 'Distance',   value: `${jump.woo.distance} m`         },
    { label: 'Max Speed',  value: `${jump.woo.maxSpeed} km/h`      },
    { label: 'Approach',   value: `${jump.woo.approachSpeed} km/h` },
    { label: 'Wind Angle', value: `${jump.woo.windAngle}°`         },
    { label: 'Quality',    value: jump.woo.quality                  },
  ];

  const executionValues = execution.values;
  const executionRevealed = execution.revealed;

  const { objectiveAreas, executionMeta, objectiveSubtotal, objectiveMax } = splitObjectiveAndExecution(jump.areas);

  const executionSliderFraction = Object.values(executionValues).reduce((a, b) => a + b, 0) / 5 / 10;
  const executionScore = executionMeta ? executionSliderFraction * executionMeta.maxScore : 0;

  const showFull = !executionMeta || executionRevealed;
  // Live projection: recomputes on every slider drag, before Execution is confirmed.
  const projectedTotal = objectiveSubtotal + executionScore;
  // Reference point: what Execution would need to score to match the objective
  // areas' average, so the judge has an anchor instead of guessing blind.
  const objectiveNormalized = objectiveMax > 0 ? objectiveSubtotal / objectiveMax : 0;
  const consistentProjection = objectiveNormalized * 10;

  const executionParams: AreaParam[] = Object.entries(executionValues).map(([key, v]) => ({
    label: EXECUTION_LABELS[key] ?? key,
    detail: '',
    pts: (v / 10) * 0.4,
    maxPts: 0.4,
  }));

  return (
    <div
      className="absolute inset-0 bg-black flex flex-col overflow-hidden"
      style={{ animation: 'fadeIn 0.4s ease' }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-5">
          <img src={logo}        alt="GKA"        className="h-8" />
          <div className="w-px h-5 bg-white/15" />
          <img src={wooLogo}     alt="Woo"        className="h-5" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="w-px h-5 bg-white/15" />
          <img src={capitalLogo} alt="Capital.com" className="h-5" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── Athlete + score ── */}
      <div className="flex items-center justify-between px-8 py-5 shrink-0">
        <div>
          <div className="font-mono text-white text-lg font-black tracking-widest leading-tight">
            {jump.athlete.toUpperCase()}
          </div>
          <div className="text-orange-400 text-xs font-semibold tracking-wide mt-1">{jump.trick}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-mono text-zinc-500 text-[10px] tracking-widest">{jump.label.toUpperCase()}</span>
            <span className="font-mono text-cyan-300 text-xs font-bold tracking-widest bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">
              {jump.category}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase mb-1">
            {showFull ? 'Score' : 'Projected Total'}
          </div>
          <div
            className={`font-black tabular-nums leading-none ${showFull ? 'text-white' : 'text-cyan-300'}`}
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
          >
            {projectedTotal.toFixed(2)}
          </div>
          <div className="text-zinc-500 text-xs mt-1">/ 10.00</div>
          {!showFull && (
            <div className="text-amber-400 text-[9px] font-semibold tracking-widest uppercase mt-1">Live — execution not confirmed</div>
          )}
        </div>
      </div>

      <div className="h-px bg-white/10 mx-8 shrink-0" />

      {/* ── Main content ── */}
      <div className="flex-1 grid grid-cols-5 gap-0 min-h-0">

        {/* ── Score breakdown (3/5 width) ── */}
        <div className="col-span-3 border-r border-white/10 px-8 py-6 overflow-y-auto flex flex-col gap-5">
          <div className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase">Score Breakdown</div>

          {objectiveAreas.map(area => {
            const pct = (area.score / area.maxScore) * 100;
            const subtotal = area.params.reduce((s, p) => s + p.pts, 0);
            const subtotalMax = area.params.reduce((s, p) => s + p.maxPts, 0);
            const norm = subtotalMax > 0 ? (subtotal / subtotalMax) * 100 : 0;
            return (
              <div key={area.name}>
                {/* Area header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-white text-xs font-bold tracking-widest">{area.name}</span>
                    <span className="bg-white/10 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded">
                      ×{area.weight}%
                    </span>
                  </div>
                  <span className="text-white text-sm font-bold tabular-nums">
                    {area.score.toFixed(2)}
                    <span className="text-zinc-500 font-normal">/{area.maxScore.toFixed(2)}</span>
                  </span>
                </div>
                {/* Area bar */}
                <div className="w-full h-2 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${area.gradient}`} style={{ width: `${pct}%` }} />
                </div>
                {/* Formula line */}
                <div className="font-mono text-zinc-500 text-[10px] mb-3 leading-relaxed">
                  {subtotal.toFixed(2)}/{subtotalMax.toFixed(2)} = {norm.toFixed(0)}% &nbsp;×&nbsp;
                  10 &nbsp;×&nbsp; {area.weight}% weight &nbsp;=&nbsp;
                  <span className="text-zinc-300">{area.score.toFixed(2)} pts</span>
                </div>
                {/* Sub-params */}
                <div className="pl-3 border-l border-white/10">
                  {area.params.map((p, i) => <ParamRow key={i} p={p} />)}
                </div>
              </div>
            );
          })}

          {/* EXECUTION — judge input or revealed breakdown */}
          {executionMeta && (executionRevealed ? (
            (() => {
              const pct = (executionScore / executionMeta.maxScore) * 100;
              const subtotal = executionParams.reduce((s, p) => s + p.pts, 0);
              const subtotalMax = executionParams.reduce((s, p) => s + p.maxPts, 0);
              const norm = subtotalMax > 0 ? (subtotal / subtotalMax) * 100 : 0;
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-white text-xs font-bold tracking-widest">EXECUTION</span>
                      <span className="bg-white/10 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded">
                        ×{executionMeta.weight}%
                      </span>
                    </div>
                    <span className="text-white text-sm font-bold tabular-nums">
                      {executionScore.toFixed(2)}
                      <span className="text-zinc-500 font-normal">/{executionMeta.maxScore.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className={`h-full rounded-full bg-gradient-to-r ${executionMeta.gradient}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="font-mono text-zinc-500 text-[10px] mb-3 leading-relaxed">
                    {subtotal.toFixed(2)}/{subtotalMax.toFixed(2)} = {norm.toFixed(0)}% &nbsp;×&nbsp;
                    10 &nbsp;×&nbsp; {executionMeta.weight}% weight &nbsp;=&nbsp;
                    <span className="text-zinc-300">{executionScore.toFixed(2)} pts</span>
                  </div>
                  <div className="pl-3 border-l border-white/10">
                    {executionParams.map((p, i) => <ParamRow key={i} p={p} />)}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="border border-dashed border-white/15 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-white text-xs font-bold tracking-widest">EXECUTION</span>
                <span className="bg-white/10 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  ×{executionMeta.weight}%
                </span>
              </div>
              <p className="text-zinc-500 text-[10px] mb-4">Scored live by the judge — drag each slider, then confirm.</p>
              <div className="space-y-4">
                {Object.entries(executionValues).map(([key, v]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-zinc-400 text-[11px]">{EXECUTION_LABELS[key] ?? key}</span>
                      <span className="text-zinc-300 text-[11px] font-semibold tabular-nums">{v.toFixed(1)}</span>
                    </div>
                    <Slider
                      min={0}
                      max={10}
                      step={0.1}
                      value={[v]}
                      onValueChange={([nv]) => onExecutionChange({ values: { ...executionValues, [key]: nv }, revealed: false })}
                    />
                  </div>
                ))}
              </div>

              {/* Live projection + consistency reference */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-500 text-[10px] tracking-wide">Projected total (live)</span>
                  <span className="text-cyan-300 text-sm font-bold tabular-nums">
                    {projectedTotal.toFixed(2)}<span className="text-zinc-600 font-normal text-xs"> / 10.00</span>
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-500 text-[10px] tracking-wide">
                    If Execution matches objective avg ({(objectiveNormalized * 100).toFixed(0)}%)
                  </span>
                  <span className="text-zinc-300 text-sm font-bold tabular-nums">
                    {consistentProjection.toFixed(2)}<span className="text-zinc-600 font-normal text-xs"> / 10.00</span>
                  </span>
                </div>
              </div>

              <Button className="w-full mt-5" size="sm" onClick={() => onExecutionChange({ values: executionValues, revealed: true })}>
                Confirm Execution Score
              </Button>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-baseline pt-4 border-t border-white/10 mt-2">
            <span className="font-mono text-zinc-400 text-[11px] tracking-widest uppercase">
              {showFull ? 'Total Score' : 'Projected Total (live)'}
            </span>
            <span className={`font-black text-lg tabular-nums ${showFull ? 'text-white' : 'text-cyan-300'}`}>
              {projectedTotal.toFixed(2)}
              <span className="text-zinc-500 text-sm font-normal"> / 10.00</span>
            </span>
          </div>

          {/* Real judges' score reference */}
          <div className="flex justify-between items-baseline pt-2">
            <span className="font-mono text-zinc-600 text-[10px] tracking-wide">
              {jump.realScoreEvent}
            </span>
            <span className="text-zinc-500 text-xs tabular-nums">
              Real judges' score: <span className="text-zinc-300 font-semibold">{jump.realScore.toFixed(2)}</span>
              {showFull && (
                <span className="text-zinc-600">
                  {' '}({projectedTotal - jump.realScore >= 0 ? '+' : ''}{(projectedTotal - jump.realScore).toFixed(2)})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ── Woo sensor data (2/5 width) ── */}
        <div className="col-span-2 px-8 py-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <img src={wooLogo} alt="Woo" className="h-4" style={{ filter: 'brightness(0) invert(1)' }} />
            <span className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase">Sensor Data</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {wooStats.map(stat => (
              <div key={stat.label}>
                <div className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase leading-tight">{stat.label}</div>
                <div className="text-white font-bold text-base tabular-nums mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* GKA weights legend */}
          <div className="mt-auto pt-5 border-t border-white/10">
            <div className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase mb-3">GKA Weights</div>
            {[
              { label: 'Height',       pct: 30, color: 'bg-cyan-500' },
              { label: 'Extremity',    pct: 30, color: 'bg-pink-500' },
              { label: 'Technicality', pct: 20, color: 'bg-yellow-500' },
              { label: 'Execution',    pct: 20, color: 'bg-lime-500' },
            ].map(w => (
              <div key={w.label} className="flex items-center gap-2.5 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${w.color} shrink-0`} />
                <span className="text-zinc-400 text-[10px] tracking-wide flex-1">{w.label}</span>
                <span className="font-mono text-zinc-300 text-[10px] font-bold">{w.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Video player ─────────────────────────────────────────────────────────────

type VState = 'idle' | 'playing' | 'recap';

export interface VideoPlayerHandle {
  open: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, {
  jump: JumpDemo;
  execution: ExecutionJudgeState;
  onExecutionChange: (state: ExecutionJudgeState) => void;
}>(({ jump, execution, onExecutionChange }, ref) => {
  const [open, setOpen]     = useState(false);
  const [vState, setVState] = useState<VState>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  const openModal = () => {
    if (!jump.videoSrc) return;
    setOpen(true);
    setVState('playing');
  };

  useImperativeHandle(ref, () => ({ open: openModal }));

  const closeModal = () => {
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
    setOpen(false);
    setVState('idle');
  };

  return (
    <>
      <div
        className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden group cursor-pointer"
        onClick={openModal}
      >
        {jump.videoSrc ? (
          <>
            <video
              src={jump.videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/70 group-hover:bg-black/85 group-hover:scale-105 rounded-full p-5 transition-all">
                <Play className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
            <Film className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium tracking-widest uppercase">No video</span>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
          {vState === 'playing' && (
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="relative w-full h-full" style={{ background: '#000' }}>
            <video
              ref={videoRef}
              src={jump.videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={() => setVState('recap')}
              playsInline
              autoPlay
            />
            {vState === 'recap' && (
              <RecapScreen jump={jump} onClose={closeModal} execution={execution} onExecutionChange={onExecutionChange} />
            )}
          </div>
        </div>
      )}
    </>
  );
});
VideoPlayer.displayName = 'VideoPlayer';

// ─── Score bar (card) ─────────────────────────────────────────────────────────

function ScoreBar({ area }: { area: AreaScore }) {
  const pct = area.maxScore > 0 ? (area.score / area.maxScore) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">{area.name}</span>
        <span className="text-xs font-bold text-foreground">
          {area.score.toFixed(2)}
          <span className="text-muted-foreground font-normal"> / {area.maxScore.toFixed(2)}</span>
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${area.gradient} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Woo panel (card) ────────────────────────────────────────────────────────

function WooPanel({ woo }: { woo: WooData }) {
  const stats = [
    { label: 'Max Height', value: `${woo.maxHeight} m`        },
    { label: 'Airtime',    value: `${woo.airtime} s`          },
    { label: 'Distance',   value: `${woo.distance} m`         },
    { label: 'Max Speed',  value: `${woo.maxSpeed} km/h`      },
    { label: 'Approach',   value: `${woo.approachSpeed} km/h` },
    { label: 'Wind Angle', value: `${woo.windAngle}°`         },
    { label: 'Quality',    value: woo.quality                  },
  ];
  return (
    <div className="border-t border-border pt-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <img src={wooLogo} alt="Woo" className="h-4" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sensor Data</span>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight mb-0.5">{s.label}</div>
            <div className="text-sm font-bold text-foreground tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Jump card ────────────────────────────────────────────────────────────────

function JumpCard({
  jump, execution, onExecutionChange,
}: {
  jump: JumpDemo;
  execution: ExecutionJudgeState;
  onExecutionChange: (state: ExecutionJudgeState) => void;
}) {
  const [showRecap, setShowRecap] = useState(false);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const { objectiveAreas, objectiveSubtotal, objectiveMax } = splitObjectiveAndExecution(jump.areas);
  const revealed = execution.revealed;
  const displayScore = revealed ? jump.score : objectiveSubtotal;
  const displayMax = revealed ? 10 : objectiveMax;
  const displayAreas = revealed ? jump.areas : objectiveAreas;
  const hasExecutionInput = execution.revealed || Object.values(execution.values).some(v => v !== 0);

  return (
    <>
      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-card to-primary/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{jump.label} · {jump.athlete}</h3>
              <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                {jump.category}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-orange-500">{jump.trick}</p>
            <p className="text-xs text-muted-foreground">
              Real judges' score: <span className="font-semibold text-foreground">{jump.realScore.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowRecap(true)}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Score Breakdown
              </Button>
              {!revealed && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 text-xs animate-pulse"
                  onClick={() => videoPlayerRef.current?.open()}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  Score Execution
                </Button>
              )}
              {hasExecutionInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => onExecutionChange(DEFAULT_EXECUTION_JUDGE_STATE)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Execution
                </Button>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className={`text-4xl font-black leading-none ${revealed ? 'text-primary' : 'text-amber-600'}`}>
                {displayScore.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">/ {displayMax.toFixed(2)}</div>
              {!revealed && (
                <Badge className="bg-amber-600 hover:bg-amber-600 mt-1.5 text-[10px] tracking-wide">PARTIAL</Badge>
              )}
              {revealed && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  vs real {jump.realScore.toFixed(2)} ({displayScore - jump.realScore >= 0 ? '+' : ''}{(displayScore - jump.realScore).toFixed(2)})
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pb-4">
          <VideoPlayer ref={videoPlayerRef} jump={jump} execution={execution} onExecutionChange={onExecutionChange} />
          <div className="flex flex-col justify-center gap-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Score Breakdown</h4>
              {!revealed && (
                <Badge variant="outline" className="border-amber-600 text-amber-600 text-[10px]">Execution pending</Badge>
              )}
            </div>
            <div className="space-y-4">
              {displayAreas.map(area => <ScoreBar key={area.name} area={area} />)}
            </div>
            <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{revealed ? 'Total' : 'Partial Total'}</span>
              <span className={`text-2xl font-black ${revealed ? 'text-primary' : 'text-amber-600'}`}>
                {displayScore.toFixed(2)}<span className="text-base font-normal text-muted-foreground"> / {displayMax.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5">
          <WooPanel woo={jump.woo} />
        </div>
      </Card>

      {showRecap && createPortal(
        <div className="fixed inset-0 z-[200] bg-black">
          <div className="relative w-full h-full" style={{ background: '#000' }}>
            <RecapScreen
              jump={jump}
              onClose={() => setShowRecap(false)}
              execution={execution}
              onExecutionChange={onExecutionChange}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  const navigate = useNavigate();
  const { weights, activePreset, setActivePreset, setJump1Params, setJump2Params, setJump3Params,
          jump1Params, jump2Params, jump3Params, heightAmplitudeThresholds } = useScoring();

  // Judge's Execution slider input per jump, persisted so reopening a jump's
  // recap (or reloading the page) doesn't wipe out scoring already entered.
  const [executionByJump, setExecutionByJump] = useState<Record<number, ExecutionJudgeState>>(() => {
    try {
      const saved = localStorage.getItem(EXECUTION_SCORES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateExecutionForJump = (jumpId: number, state: ExecutionJudgeState) => {
    setExecutionByJump(prev => {
      const next = { ...prev, [jumpId]: state };
      localStorage.setItem(EXECUTION_SCORES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // HEIGHT is derived from each jump's real Woo numbers against the currently
  // configured thresholds; EXECUTION comes from whatever the judge has
  // entered so far — both stay correct as thresholds/scoring change live.
  const demoDefaults = useMemo<[JumpParameters, JumpParameters, JumpParameters]>(() =>
    DEMO_JUMPS_BASE.map((base, i) => {
      const execValues = executionByJump[base.id]?.values ?? DEFAULT_EXECUTION_JUDGE_STATE.values;
      return {
        ...DEMO_SCORING_PARAMS[i],
        HEIGHT: {
          height: heightBracketForValue(base.woo.maxHeight, heightAmplitudeThresholds.height),
          amplitude: amplitudeBracketForValue(base.woo.distance, heightAmplitudeThresholds.amplitude),
        },
        EXECUTION: {
          style: (execValues.style * 0.4) / 10,
          stability_control: (execValues.stability_control * 0.4) / 10,
          landing_control: (execValues.landing_control * 0.4) / 10,
          board_control: (execValues.board_control * 0.4) / 10,
          kite_control: (execValues.kite_control * 0.4) / 10,
        },
      };
    }) as [JumpParameters, JumpParameters, JumpParameters],
    [heightAmplitudeThresholds, executionByJump]
  );

  // Only let the chief judge load this into the real scorer once Execution
  // has actually been confirmed for all 3 jumps — otherwise it'd carry over
  // an incomplete/zeroed Execution score as if it were final.
  const allExecutionConfirmed = DEMO_JUMPS_BASE.every(base => executionByJump[base.id]?.revealed);

  const loadDemoSession = () => {
    setActivePreset('GKA');
    setJump1Params(demoDefaults[0]);
    setJump2Params(demoDefaults[1]);
    setJump3Params(demoDefaults[2]);
    navigate('/');
  };

  // Use params from scorer if loaded, otherwise fall back to demo defaults
  const effectiveParams = useMemo<[JumpParameters, JumpParameters, JumpParameters]>(() => [
    jump1Params ?? demoDefaults[0],
    jump2Params ?? demoDefaults[1],
    jump3Params ?? demoDefaults[2],
  ], [jump1Params, jump2Params, jump3Params, demoDefaults]);

  // Compute scores live from current weights and effective params
  const computedJumps: JumpDemo[] = useMemo(() =>
    DEMO_JUMPS_BASE.map((base, i) => {
      const result = calculateScore(effectiveParams[i], weights, activePreset);
      return {
        ...base,
        score: result.totalScore,
        areas: resultToAreas(result, heightAmplitudeThresholds),
      };
    }),
    [effectiveParams, weights, activePreset, heightAmplitudeThresholds]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">Live Demo</h2>
          <p className="text-muted-foreground">
            3 real competition jumps · objective Woo sensor data · no judge subjectivity.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Woo Sensor Data</span>
          </div>
          {allExecutionConfirmed ? (
            <Button onClick={loadDemoSession} className="gap-2 font-semibold">
              Load Demo in Scorer
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Confirm Execution for all 3 jumps to load this session into the Scorer.
            </p>
          )}
        </div>
      </div>
      <div className="space-y-8">
        {computedJumps.map(jump => (
          <JumpCard
            key={jump.id}
            jump={jump}
            execution={executionByJump[jump.id] ?? DEFAULT_EXECUTION_JUDGE_STATE}
            onExecutionChange={(state) => updateExecutionForJump(jump.id, state)}
          />
        ))}
      </div>
    </div>
  );
}
