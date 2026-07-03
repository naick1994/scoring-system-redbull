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

interface AreaScore {
  name: string;
  score: number;
  maxScore: number;
  gradient: string;
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
    score: 6.78,
    areas: [
      { name: 'HEIGHT',       score: 1.47, maxScore: 2.00, gradient: 'from-blue-500 to-cyan-400' },
      { name: 'EXTREMITY',    score: 0.74, maxScore: 1.00, gradient: 'from-purple-500 to-pink-400' },
      { name: 'TECHNICALITY', score: 2.54, maxScore: 4.50, gradient: 'from-amber-500 to-yellow-400' },
      { name: 'EXECUTION',    score: 2.03, maxScore: 2.50, gradient: 'from-green-500 to-lime-400' },
    ],
    woo: { maxHeight: 17.5, airtime: 7.0, distance: 121, maxSpeed: 65, approachSpeed: 28, windAngle: 6,  quality: 'Good', peakTimeRatio: 0.30, takeoffOffset: 0 },
  },
  {
    id: 2,
    label: 'Jump 2',
    athlete: 'Leonardo Casati',
    trick: 'Dobbie Boardoff from the Fin',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.37.mp4`,
    score: 7.73,
    areas: [
      { name: 'HEIGHT',       score: 1.80, maxScore: 2.00, gradient: 'from-blue-500 to-cyan-400' },
      { name: 'EXTREMITY',    score: 0.76, maxScore: 1.00, gradient: 'from-purple-500 to-pink-400' },
      { name: 'TECHNICALITY', score: 3.21, maxScore: 4.50, gradient: 'from-amber-500 to-yellow-400' },
      { name: 'EXECUTION',    score: 1.96, maxScore: 2.50, gradient: 'from-green-500 to-lime-400' },
    ],
    woo: { maxHeight: 19.8, airtime: 7.5, distance: 83,  maxSpeed: 52, approachSpeed: 30, windAngle: 11, quality: 'Good', peakTimeRatio: 0.33, takeoffOffset: 0 },
  },
  {
    id: 3,
    label: 'Jump 3',
    athlete: 'Lorenzo Casati',
    trick: 'Backroll Kiteloop Flip Late Back Added Rotation',
    videoSrc: `${import.meta.env.BASE_URL}videos/LORE_9.40.mp4`,
    score: 8.86,
    areas: [
      { name: 'HEIGHT',       score: 1.65, maxScore: 2.00, gradient: 'from-blue-500 to-cyan-400' },
      { name: 'EXTREMITY',    score: 0.95, maxScore: 1.00, gradient: 'from-purple-500 to-pink-400' },
      { name: 'TECHNICALITY', score: 3.86, maxScore: 4.50, gradient: 'from-amber-500 to-yellow-400' },
      { name: 'EXECUTION',    score: 2.40, maxScore: 2.50, gradient: 'from-green-500 to-lime-400' },
    ],
    woo: { maxHeight: 18.4, airtime: 6.8, distance: 94,  maxSpeed: 56, approachSpeed: 28, windAngle: 19, quality: 'OK',   peakTimeRatio: 0.29, takeoffOffset: 0 },
  },
];

// ─── Hardcoded scoring params for the demo session ───────────────────────────
// These pre-fill the NewJump form so the scorer can run the demo live.

const DEMO_SCORING_PARAMS: [JumpParameters, JumpParameters, JumpParameters] = [
  // Jump 1 — Leo 8.07 · Backroll Kiteloop Tornado · 17.5m · 121m
  {
    landingOutcome: 'clean',
    HEIGHT:       { height: '16_20m',  amplitude: 'gt121m'   },
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb',   free_fall: 'high'   },
    TECHNICALITY: { rotations: '3', rotation_axis: 'horizontal', board_off: 'no' },
    EXECUTION:    { speed_in_out: 0.32, stability_control: 0.32, landing_control: 0.32, board_control: 0.32, kite_control: 0.32 },
  },
  // Jump 2 — Leo 8.37 · Dobbie Boardoff from the Fin · 19.8m · 83m
  {
    landingOutcome: 'clean',
    HEIGHT:       { height: '16_20m',  amplitude: '81_120m'  },
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb',   free_fall: 'high'   },
    TECHNICALITY: { rotations: '2', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '0', board_tic_tac: '0' },
    EXECUTION:    { speed_in_out: 0.30, stability_control: 0.28, landing_control: 0.30, board_control: 0.30, kite_control: 0.28 },
  },
  // Jump 3 — Lorenzo 9.40 · Backroll Kiteloop Flip Late Back Added Rotation · 18.4m · 94m
  {
    landingOutcome: 'clean',
    HEIGHT:       { height: '16_20m',  amplitude: '81_120m'  },
    EXTREMITY:    { kite_angle: 'low', yank_power: 'bomb',   free_fall: 'high'   },
    TECHNICALITY: { rotations: '3', rotation_axis: 'horizontal', board_off: 'yes', board_flip: '1', board_tic_tac: '0' },
    EXECUTION:    { speed_in_out: 0.38, stability_control: 0.38, landing_control: 0.38, board_control: 0.38, kite_control: 0.38 },
  },
];

// ─── GKA broadcast HUD (no curve — text overlay only) ────────────────────────

function GKAReplayHUD({ jump, currentTime }: { jump: JumpDemo; currentTime: number }) {
  const { woo } = jump;
  const elapsed  = Math.max(0, currentTime - woo.takeoffOffset);
  const progress = Math.min(elapsed / woo.airtime, 1);

  const airSecs   = Math.floor(Math.min(elapsed, woo.airtime));
  const distNow   = Math.round(woo.distance * progress);
  const hRatio    = Math.min(progress / woo.peakTimeRatio, 1);
  const heightNow = (woo.maxHeight * hRatio).toFixed(1);

  const sh = (s: string) => ({ textShadow: s });

  return (
    <div className="absolute inset-0 pointer-events-none select-none">

      {/* ── Top-left: athlete + trick + REPLAY badge ── */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/65 px-3 py-2 mb-2.5 inline-block">
          <div className="font-mono text-white text-sm font-bold tracking-widest leading-tight"
               style={sh('0 1px 4px rgba(0,0,0,0.9)')}>
            {jump.athlete.toUpperCase()}
          </div>
          <div className="font-mono text-orange-300 text-[11px] tracking-wide leading-tight mt-0.5">
            {jump.trick.toUpperCase()}
          </div>
          <div className="font-mono text-zinc-400 text-[11px] tracking-wider leading-tight mt-0.5">
            CAPITAL.COM GKA BIG AIR · {jump.label.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="GKA" className="w-9 h-9" />
          <span className="font-bold text-white text-xl tracking-[0.22em]"
                style={sh('0 1px 6px rgba(0,0,0,0.9)')}>
            REPLAY
          </span>
        </div>
      </div>

      {/* ── Top-right: score ── */}
      <div className="absolute top-4 right-4 text-right">
        <div className="font-mono text-zinc-300 text-[11px] tracking-widest uppercase"
             style={sh('0 1px 4px rgba(0,0,0,0.9)')}>Score</div>
        <div className="text-white font-black text-6xl leading-none tabular-nums"
             style={sh('0 2px 8px rgba(0,0,0,0.9)')}>
          {jump.score.toFixed(2)}
        </div>
        <div className="text-zinc-400 text-sm">/ 10</div>
      </div>

      {/* ── Bottom stats row ── */}
      <div className="absolute bottom-12 inset-x-4 flex items-end justify-between">
        <div>
          <div className="font-mono text-zinc-200 text-[10px] tracking-widest uppercase mb-0.5"
               style={sh('0 1px 4px rgba(0,0,0,0.9)')}>AIR, s</div>
          <div className="text-orange-400 font-black text-5xl leading-none tabular-nums"
               style={sh('0 2px 6px rgba(0,0,0,0.9)')}>
            {airSecs}
          </div>
        </div>
        <div className="text-center">
          <div className="font-mono text-zinc-200 text-[10px] tracking-widest uppercase mb-0.5"
               style={sh('0 1px 4px rgba(0,0,0,0.9)')}>DISTANCE</div>
          <div className="text-orange-400 font-black text-5xl leading-none tabular-nums"
               style={sh('0 2px 6px rgba(0,0,0,0.9)')}>
            {distNow}<span className="text-2xl font-bold ml-0.5">m</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-zinc-200 text-[10px] tracking-widest uppercase mb-0.5"
               style={sh('0 1px 4px rgba(0,0,0,0.9)')}>MAX HEIGHT, m</div>
          <div className="text-orange-400 font-black text-5xl leading-none tabular-nums"
               style={sh('0 2px 6px rgba(0,0,0,0.9)')}>
            {heightNow}
          </div>
        </div>
      </div>

      {/* ── Progress timeline ── */}
      <div className="absolute bottom-4 inset-x-4 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        <div className="flex-1 h-px bg-white/25">
          <div className="h-full bg-white/70 transition-none" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>
    </div>
  );
}

// ─── Replay prompt ────────────────────────────────────────────────────────────

function ReplayPrompt({ jump, onReplay }: { jump: JumpDemo; onReplay: () => void }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-4 left-4">
        <div className="bg-black/65 px-3 py-2 inline-block">
          <div className="font-mono text-white text-sm font-bold tracking-widest">{jump.athlete.toUpperCase()}</div>
          <div className="font-mono text-orange-300 text-[11px] tracking-wide mt-0.5">{jump.trick.toUpperCase()}</div>
          <div className="font-mono text-zinc-400 text-[11px] tracking-wider mt-0.5">
            CAPITAL.COM GKA BIG AIR · {jump.label.toUpperCase()}
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-4">
        <button onClick={onReplay} className="pointer-events-auto flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping" />
            <img src={logo} alt="GKA" className="relative w-11 h-11" />
          </div>
          <span className="font-bold text-white text-2xl tracking-[0.22em] group-hover:text-orange-300 transition-colors"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.95)' }}>
            REPLAY WITH DATA
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Video player ─────────────────────────────────────────────────────────────

type VState = 'idle' | 'playing' | 'replay-prompt' | 'replaying';

function VideoPlayer({ jump }: { jump: JumpDemo }) {
  const [open, setOpen]       = useState(false);
  const [vState, setVState]   = useState<VState>('idle');
  const [curTime, setCurTime] = useState(0);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const firstPlay = useRef(true);

  const openModal = () => {
    if (!jump.videoSrc) return;
    firstPlay.current = true;
    setCurTime(0);
    setOpen(true);
    setVState('playing');
  };

  const closeModal = () => {
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
    setOpen(false);
    setVState('idle');
    setCurTime(0);
  };

  const handleEnded = () => {
    if (!firstPlay.current) return;
    firstPlay.current = false;
    setVState('replay-prompt');
  };

  const startReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setCurTime(0);
    setVState('replaying');
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
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            className="relative w-full"
            style={{ aspectRatio: '16/9', maxHeight: '100vh', maxWidth: 'calc(100vh * 16 / 9)' }}
          >
            <video
              ref={videoRef}
              src={jump.videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={handleEnded}
              onTimeUpdate={() => setCurTime(videoRef.current?.currentTime ?? 0)}
              playsInline
              autoPlay
            />
            {vState === 'replaying'     && <GKAReplayHUD jump={jump} currentTime={curTime} />}
            {vState === 'replay-prompt' && <ReplayPrompt jump={jump} onReplay={startReplay} />}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

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
        <div
          className={`h-full bg-gradient-to-r ${area.gradient} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Woo sensor data panel ────────────────────────────────────────────────────

function WooPanel({ woo }: { woo: WooData }) {
  const stats: { label: string; value: string }[] = [
    { label: 'Max Height', value: `${woo.maxHeight} m` },
    { label: 'Airtime',    value: `${woo.airtime} s` },
    { label: 'Distance',   value: `${woo.distance} m` },
    { label: 'Max Speed',  value: `${woo.maxSpeed} km/h` },
    { label: 'Approach',   value: `${woo.approachSpeed} km/h` },
    { label: 'Wind Angle', value: `${woo.windAngle}°` },
    { label: 'Quality',    value: woo.quality },
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
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight mb-0.5">
              {s.label}
            </div>
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
