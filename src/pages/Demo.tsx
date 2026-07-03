import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Film, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logo from '@/assets/gka-logo.svg';
import { useScoring } from '@/contexts/ScoringContext';
import type { JumpParameters } from '@/types/scoring';

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

interface JumpDemo {
  id: number;
  label: string;
  athlete: string;
  trick: string;
  videoSrc?: string;
  score: number;
  areas: AreaScore[];
  woo: WooData;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEMO_JUMPS: JumpDemo[] = [
  {
    id: 1,
    label: 'Jump 1',
    athlete: 'Leonardo Casati',
    trick: 'Backroll Kiteloop Tornado',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.07.mp4`,
    score: 7.18,
    areas: [
      {
        name: 'HEIGHT', score: 2.21, maxScore: 3.00, weight: 30,
        gradient: 'from-blue-500 to-cyan-400',
        params: [
          { label: 'Height',    detail: '16–20 m',  pts: 0.90, maxPts: 1.50 },
          { label: 'Amplitude', detail: '>121 m',   pts: 1.00, maxPts: 1.00 },
        ],
      },
      {
        name: 'EXTREMITY', score: 2.22, maxScore: 3.00, weight: 30,
        gradient: 'from-purple-500 to-pink-400',
        params: [
          { label: 'Kite Angle', detail: 'Low (51–70°)', pts: 0.50, maxPts: 0.75 },
          { label: 'Yank Power', detail: 'Bomb',         pts: 0.75, maxPts: 0.75 },
          { label: 'Free Fall',  detail: 'Medium',       pts: 0.25, maxPts: 0.50 },
        ],
      },
      {
        name: 'TECHNICALITY', score: 1.13, maxScore: 2.00, weight: 20,
        gradient: 'from-amber-500 to-yellow-400',
        params: [
          { label: 'Rotations', detail: '×3',          pts: 0.80, maxPts: 0.80 },
          { label: 'Axis',      detail: 'Horizontal',  pts: 0.50, maxPts: 0.50 },
          { label: 'Board Off', detail: 'No',          pts: 0.00, maxPts: 1.00 },
        ],
      },
      {
        name: 'EXECUTION', score: 1.62, maxScore: 2.00, weight: 20,
        gradient: 'from-green-500 to-lime-400',
        params: [
          { label: 'Speed In/Out',   detail: '', pts: 0.32, maxPts: 0.40 },
          { label: 'Stability',      detail: '', pts: 0.32, maxPts: 0.40 },
          { label: 'Landing',        detail: '', pts: 0.32, maxPts: 0.40 },
          { label: 'Board Control',  detail: '', pts: 0.32, maxPts: 0.40 },
          { label: 'Kite Control',   detail: '', pts: 0.32, maxPts: 0.40 },
        ],
      },
    ],
    woo: { maxHeight: 17.5, airtime: 7.0, distance: 121, maxSpeed: 65, approachSpeed: 28, windAngle: 6, quality: 'Good', peakTimeRatio: 0.30, takeoffOffset: 0 },
  },
  {
    id: 2,
    label: 'Jump 2',
    athlete: 'Leonardo Casati',
    trick: 'Dobbie Boardoff from the Fin',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.37.mp4`,
    score: 7.98,
    areas: [
      {
        name: 'HEIGHT', score: 2.70, maxScore: 3.00, weight: 30,
        gradient: 'from-blue-500 to-cyan-400',
        params: [
          { label: 'Height',    detail: '16–20 m',  pts: 0.90, maxPts: 1.50 },
          { label: 'Amplitude', detail: '81–120 m', pts: 0.67, maxPts: 1.00 },
        ],
      },
      {
        name: 'EXTREMITY', score: 2.28, maxScore: 3.00, weight: 30,
        gradient: 'from-purple-500 to-pink-400',
        params: [
          { label: 'Kite Angle', detail: 'Low (51–70°)', pts: 0.50, maxPts: 0.75 },
          { label: 'Yank Power', detail: 'Bomb',         pts: 0.75, maxPts: 0.75 },
          { label: 'Free Fall',  detail: 'High',         pts: 0.50, maxPts: 0.50 },
        ],
      },
      {
        name: 'TECHNICALITY', score: 1.43, maxScore: 2.00, weight: 20,
        gradient: 'from-amber-500 to-yellow-400',
        params: [
          { label: 'Rotations', detail: '×2',          pts: 0.50, maxPts: 0.80 },
          { label: 'Axis',      detail: 'Horizontal',  pts: 0.50, maxPts: 0.50 },
          { label: 'Board Off', detail: 'Yes',         pts: 1.00, maxPts: 1.00 },
          { label: 'Board Flip',detail: '0',           pts: 0.00, maxPts: 0.30 },
          { label: 'Tic Tac',   detail: '0',           pts: 0.00, maxPts: 0.20 },
        ],
      },
      {
        name: 'EXECUTION', score: 1.57, maxScore: 2.00, weight: 20,
        gradient: 'from-green-500 to-lime-400',
        params: [
          { label: 'Speed In/Out',  detail: '', pts: 0.30, maxPts: 0.40 },
          { label: 'Stability',     detail: '', pts: 0.28, maxPts: 0.40 },
          { label: 'Landing',       detail: '', pts: 0.30, maxPts: 0.40 },
          { label: 'Board Control', detail: '', pts: 0.30, maxPts: 0.40 },
          { label: 'Kite Control',  detail: '', pts: 0.28, maxPts: 0.40 },
        ],
      },
    ],
    woo: { maxHeight: 19.8, airtime: 7.5, distance: 83, maxSpeed: 52, approachSpeed: 30, windAngle: 11, quality: 'Good', peakTimeRatio: 0.33, takeoffOffset: 0 },
  },
  {
    id: 3,
    label: 'Jump 3',
    athlete: 'Lorenzo Casati',
    trick: 'Backroll Kiteloop Flip Late Back Added Rotation',
    videoSrc: `${import.meta.env.BASE_URL}videos/LORE_9.40.mp4`,
    score: 8.96,
    areas: [
      {
        name: 'HEIGHT', score: 2.47, maxScore: 3.00, weight: 30,
        gradient: 'from-blue-500 to-cyan-400',
        params: [
          { label: 'Height',    detail: '16–20 m',  pts: 0.90, maxPts: 1.50 },
          { label: 'Amplitude', detail: '81–120 m', pts: 0.67, maxPts: 1.00 },
        ],
      },
      {
        name: 'EXTREMITY', score: 2.85, maxScore: 3.00, weight: 30,
        gradient: 'from-purple-500 to-pink-400',
        params: [
          { label: 'Kite Angle', detail: 'Low (51–70°)', pts: 0.50, maxPts: 0.75 },
          { label: 'Yank Power', detail: 'Bomb',         pts: 0.75, maxPts: 0.75 },
          { label: 'Free Fall',  detail: 'High',         pts: 0.50, maxPts: 0.50 },
        ],
      },
      {
        name: 'TECHNICALITY', score: 1.72, maxScore: 2.00, weight: 20,
        gradient: 'from-amber-500 to-yellow-400',
        params: [
          { label: 'Rotations', detail: '×3',          pts: 0.80, maxPts: 0.80 },
          { label: 'Axis',      detail: 'Horizontal',  pts: 0.50, maxPts: 0.50 },
          { label: 'Board Off', detail: 'Yes',         pts: 1.00, maxPts: 1.00 },
          { label: 'Board Flip',detail: '×1',          pts: 0.10, maxPts: 0.30 },
          { label: 'Tic Tac',   detail: '0',           pts: 0.00, maxPts: 0.20 },
        ],
      },
      {
        name: 'EXECUTION', score: 1.92, maxScore: 2.00, weight: 20,
        gradient: 'from-green-500 to-lime-400',
        params: [
          { label: 'Speed In/Out',  detail: '', pts: 0.38, maxPts: 0.40 },
          { label: 'Stability',     detail: '', pts: 0.38, maxPts: 0.40 },
          { label: 'Landing',       detail: '', pts: 0.38, maxPts: 0.40 },
          { label: 'Board Control', detail: '', pts: 0.38, maxPts: 0.40 },
          { label: 'Kite Control',  detail: '', pts: 0.38, maxPts: 0.40 },
        ],
      },
    ],
    woo: { maxHeight: 18.4, airtime: 6.8, distance: 94, maxSpeed: 56, approachSpeed: 28, windAngle: 19, quality: 'OK', peakTimeRatio: 0.29, takeoffOffset: 0 },
  },
];

// ─── Hardcoded scoring params ─────────────────────────────────────────────────

const DEMO_SCORING_PARAMS: [JumpParameters, JumpParameters, JumpParameters] = [
  {
    landingOutcome: 'clean',
    HEIGHT:       { height: '16_20m', amplitude: 'gt121m'  },
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '3', rotation_axis: 'horizontal', board_off: 'no' },
    EXECUTION:    { speed_in_out: 0.32, stability_control: 0.32, landing_control: 0.32, board_control: 0.32, kite_control: 0.32 },
  },
  {
    landingOutcome: 'clean',
    HEIGHT:       { height: '16_20m', amplitude: '81_120m' },
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '2', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '0', board_tic_tac: '0' },
    EXECUTION:    { speed_in_out: 0.30, stability_control: 0.28, landing_control: 0.30, board_control: 0.30, kite_control: 0.28 },
  },
  {
    landingOutcome: 'clean',
    HEIGHT:       { height: '16_20m', amplitude: '81_120m' },
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb', free_fall: 'high' },
    TECHNICALITY: { rotations: '3', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '1', board_tic_tac: '0' },
    EXECUTION:    { speed_in_out: 0.38, stability_control: 0.38, landing_control: 0.38, board_control: 0.38, kite_control: 0.38 },
  },
];

// ─── Recap screen ─────────────────────────────────────────────────────────────

function ParamRow({ p }: { p: AreaParam }) {
  const pct = p.maxPts > 0 ? (p.pts / p.maxPts) * 100 : 0;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
      <span className="text-zinc-500 text-[10px] tracking-wide min-w-[6rem]">{p.label}</span>
      {p.detail && <span className="text-zinc-400 text-[10px] font-semibold">{p.detail}</span>}
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[2rem]">
        <div className="h-full bg-white/30 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-zinc-400 text-[10px] tabular-nums shrink-0">
        {p.pts.toFixed(2)}<span className="text-zinc-700">/{p.maxPts.toFixed(2)}</span>
      </span>
    </div>
  );
}

function RecapScreen({ jump, onClose }: { jump: JumpDemo; onClose: () => void }) {
  const wooStats = [
    { label: 'Max Height', value: `${jump.woo.maxHeight} m`        },
    { label: 'Airtime',    value: `${jump.woo.airtime} s`          },
    { label: 'Distance',   value: `${jump.woo.distance} m`         },
    { label: 'Max Speed',  value: `${jump.woo.maxSpeed} km/h`      },
    { label: 'Approach',   value: `${jump.woo.approachSpeed} km/h` },
    { label: 'Wind Angle', value: `${jump.woo.windAngle}°`         },
    { label: 'Quality',    value: jump.woo.quality                  },
  ];

  return (
    <div
      className="absolute inset-0 bg-zinc-950 flex flex-col overflow-hidden"
      style={{ animation: 'fadeIn 0.4s ease' }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="GKA" className="w-8 h-8" />
          <div>
            <div className="font-mono text-white text-xs font-bold tracking-[0.2em]">CAPITAL.COM GKA</div>
            <div className="font-mono text-zinc-500 text-[9px] tracking-widest">BIG AIR WORLD TOUR</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── Athlete + score ── */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0">
        <div>
          <div className="font-mono text-white text-lg font-black tracking-widest leading-tight">
            {jump.athlete.toUpperCase()}
          </div>
          <div className="text-orange-400 text-xs font-semibold tracking-wide mt-0.5">{jump.trick}</div>
          <div className="font-mono text-zinc-600 text-[9px] tracking-widest mt-0.5">{jump.label.toUpperCase()}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-zinc-500 text-[9px] tracking-widest uppercase mb-0.5">Score</div>
          <div className="text-white font-black tabular-nums leading-none" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
            {jump.score.toFixed(2)}
          </div>
          <div className="text-zinc-500 text-xs mt-0.5">/ 10</div>
        </div>
      </div>

      <div className="h-px bg-white/10 mx-6 shrink-0" />

      {/* ── Main content ── */}
      <div className="flex-1 grid grid-cols-5 gap-0 min-h-0">

        {/* ── Score breakdown (3/5 width) ── */}
        <div className="col-span-3 border-r border-white/10 px-6 py-4 overflow-y-auto flex flex-col gap-3">
          <div className="font-mono text-zinc-500 text-[9px] tracking-widest uppercase">Score Breakdown</div>

          {jump.areas.map(area => {
            const pct = (area.score / area.maxScore) * 100;
            const subtotal = area.params.reduce((s, p) => s + p.pts, 0);
            const subtotalMax = area.params.reduce((s, p) => s + p.maxPts, 0);
            const norm = subtotalMax > 0 ? (subtotal / subtotalMax) * 100 : 0;
            return (
              <div key={area.name}>
                {/* Area header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white text-[10px] font-bold tracking-widest">{area.name}</span>
                    <span className="bg-white/10 text-zinc-400 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      ×{area.weight}%
                    </span>
                  </div>
                  <span className="text-white text-xs font-bold tabular-nums">
                    {area.score.toFixed(2)}
                    <span className="text-zinc-600 font-normal">/{area.maxScore.toFixed(2)}</span>
                  </span>
                </div>
                {/* Area bar */}
                <div className="w-full h-1.5 rounded-full mb-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${area.gradient}`} style={{ width: `${pct}%` }} />
                </div>
                {/* Formula line */}
                <div className="font-mono text-zinc-600 text-[9px] mb-2">
                  {subtotal.toFixed(2)}/{subtotalMax.toFixed(2)} = {norm.toFixed(0)}% &nbsp;×&nbsp;
                  10 &nbsp;×&nbsp; {area.weight}% weight &nbsp;=&nbsp;
                  <span className="text-zinc-400">{area.score.toFixed(2)} pts</span>
                </div>
                {/* Sub-params */}
                <div className="pl-2 border-l border-white/10">
                  {area.params.map((p, i) => <ParamRow key={i} p={p} />)}
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex justify-between items-baseline pt-3 border-t border-white/10 mt-1">
            <span className="font-mono text-zinc-400 text-[10px] tracking-widest uppercase">Total Score</span>
            <span className="text-white font-black text-lg tabular-nums">
              {jump.score.toFixed(2)}
              <span className="text-zinc-600 text-sm font-normal"> / 10</span>
            </span>
          </div>
        </div>

        {/* ── Woo sensor data (2/5 width) ── */}
        <div className="col-span-2 px-6 py-4 flex flex-col gap-4">
          <div className="font-mono text-zinc-500 text-[9px] tracking-widest uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Woo Sensor Data
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {wooStats.map(stat => (
              <div key={stat.label}>
                <div className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase leading-tight">{stat.label}</div>
                <div className="text-white font-bold text-sm tabular-nums mt-0.5">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* GKA weights legend */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-2">GKA Weights</div>
            {[
              { label: 'Height',       pct: 30, color: 'bg-cyan-500' },
              { label: 'Extremity',    pct: 30, color: 'bg-pink-500' },
              { label: 'Technicality', pct: 20, color: 'bg-yellow-500' },
              { label: 'Execution',    pct: 20, color: 'bg-lime-500' },
            ].map(w => (
              <div key={w.label} className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${w.color} shrink-0`} />
                <span className="text-zinc-500 text-[9px] tracking-wide flex-1">{w.label}</span>
                <span className="font-mono text-zinc-400 text-[9px] font-bold">{w.pct}%</span>
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

function VideoPlayer({ jump }: { jump: JumpDemo }) {
  const [open, setOpen]     = useState(false);
  const [vState, setVState] = useState<VState>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  const openModal = () => {
    if (!jump.videoSrc) return;
    setOpen(true);
    setVState('playing');
  };

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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
          <Film className="w-10 h-10 mb-2" />
          <span className="text-xs font-medium tracking-widest uppercase">Click to play</span>
        </div>
        {jump.videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {vState === 'playing' && (
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div
            className="relative w-full"
            style={{ aspectRatio: '16/9', maxHeight: '100vh', maxWidth: 'calc(100vh * 16 / 9)' }}
          >
            <video
              ref={videoRef}
              src={jump.videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={() => setVState('recap')}
              playsInline
              autoPlay
            />
            {vState === 'recap' && <RecapScreen jump={jump} onClose={closeModal} />}
          </div>
        </div>
      )}
    </>
  );
}

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
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Woo Sensor Data</span>
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

function JumpCard({ jump }: { jump: JumpDemo }) {
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-card to-primary/5">
        <div>
          <h3 className="text-lg font-bold text-foreground">{jump.label} · {jump.athlete}</h3>
          <p className="text-sm font-semibold text-orange-500">{jump.trick}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Capital.com GKA Big Air</p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-4xl font-black text-primary leading-none">{jump.score.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">/ 10</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pb-4">
        <VideoPlayer jump={jump} />
        <div className="flex flex-col justify-center gap-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Score Breakdown</h4>
          <div className="space-y-4">
            {jump.areas.map(area => <ScoreBar key={area.name} area={area} />)}
          </div>
          <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-black text-primary">
              {jump.score.toFixed(2)}<span className="text-base font-normal text-muted-foreground"> / 10</span>
            </span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-5">
        <WooPanel woo={jump.woo} />
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  const navigate = useNavigate();
  const { setActivePreset, setJump1Params, setJump2Params, setJump3Params } = useScoring();

  const loadDemoSession = () => {
    setActivePreset('GKA');
    setJump1Params(DEMO_SCORING_PARAMS[0]);
    setJump2Params(DEMO_SCORING_PARAMS[1]);
    setJump3Params(DEMO_SCORING_PARAMS[2]);
    navigate('/');
  };

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
          <Button onClick={loadDemoSession} className="gap-2 font-semibold">
            Load Demo in Scorer
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        {DEMO_JUMPS.map(jump => <JumpCard key={jump.id} jump={jump} />)}
      </div>
    </div>
  );
}
