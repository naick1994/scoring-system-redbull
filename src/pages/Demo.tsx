import { useState, useRef } from 'react';
import { X, Play, Film } from 'lucide-react';
import { Card } from '@/components/ui/card';
import logo from '@/assets/gka-logo.svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WooData {
  jumpLabel: string;
  maxHeight: number;
  airtime: number;
  distance: number;
  maxSpeed: number;
  peakTimeRatio: number;   // fraction 0-1: when peak occurs in airtime
  takeoffOffset: number;   // seconds into the video when the jump starts
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
  videoSrc?: string;
  score: number;
  penaltyNote?: string;
  areas: AreaScore[];
  woo: WooData;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEMO_JUMPS: JumpDemo[] = [
  {
    id: 1,
    label: 'Jump 1',
    athlete: 'Leonardo Casati',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.07.mp4`,
    score: 8.07,
    areas: [
      { name: 'HEIGHT',       score: 1.47, maxScore: 2.00, gradient: 'from-blue-500 to-cyan-400' },
      { name: 'EXTREMITY',    score: 0.74, maxScore: 1.00, gradient: 'from-purple-500 to-pink-400' },
      { name: 'TECHNICALITY', score: 3.83, maxScore: 4.50, gradient: 'from-amber-500 to-yellow-400' },
      { name: 'EXECUTION',    score: 2.03, maxScore: 2.50, gradient: 'from-green-500 to-lime-400' },
    ],
    woo: { jumpLabel: 'Jump 22', maxHeight: 17.5, airtime: 7.0, distance: 121, maxSpeed: 65, peakTimeRatio: 0.27, takeoffOffset: 0 },
  },
  {
    id: 2,
    label: 'Jump 2',
    athlete: 'Leonardo Casati',
    videoSrc: `${import.meta.env.BASE_URL}videos/LEO_8.37.mp4`,
    score: 8.37,
    areas: [
      { name: 'HEIGHT',       score: 1.80, maxScore: 2.00, gradient: 'from-blue-500 to-cyan-400' },
      { name: 'EXTREMITY',    score: 0.76, maxScore: 1.00, gradient: 'from-purple-500 to-pink-400' },
      { name: 'TECHNICALITY', score: 3.85, maxScore: 4.50, gradient: 'from-amber-500 to-yellow-400' },
      { name: 'EXECUTION',    score: 1.96, maxScore: 2.50, gradient: 'from-green-500 to-lime-400' },
    ],
    woo: { jumpLabel: 'Jump 20', maxHeight: 19.8, airtime: 7.5, distance: 83, maxSpeed: 52, peakTimeRatio: 0.31, takeoffOffset: 0 },
  },
  {
    id: 3,
    label: 'Jump 3',
    athlete: 'Lorenzo Casati',
    videoSrc: `${import.meta.env.BASE_URL}videos/LORE_9.40.mp4`,
    score: 9.40,
    areas: [
      { name: 'HEIGHT',       score: 1.65, maxScore: 2.00, gradient: 'from-blue-500 to-cyan-400' },
      { name: 'EXTREMITY',    score: 0.95, maxScore: 1.00, gradient: 'from-purple-500 to-pink-400' },
      { name: 'TECHNICALITY', score: 4.40, maxScore: 4.50, gradient: 'from-amber-500 to-yellow-400' },
      { name: 'EXECUTION',    score: 2.40, maxScore: 2.50, gradient: 'from-green-500 to-lime-400' },
    ],
    woo: { jumpLabel: 'Jump 9', maxHeight: 18.4, airtime: 6.8, distance: 94, maxSpeed: 56, peakTimeRatio: 0.29, takeoffOffset: 0 },
  },
];

// ─── Bezier curve helpers ─────────────────────────────────────────────────────
// SVG viewBox: 0 0 1000 300  |  ground y=300, peak y=0

function bez(t: number, a: number, b: number, c: number, d: number): number {
  const m = 1 - t;
  return m*m*m*a + 3*m*m*t*b + 3*m*t*t*c + t*t*t*d;
}

function curvePath(r: number): string {
  const px = r * 1000;
  const dx1 = px, dx2 = 1000 - px;
  return [
    `M 0 300`,
    `C ${dx1 * 0.3} ${300 * 0.2}  ${px - dx1 * 0.1} 0  ${px} 0`,
    `C ${px + dx2 * 0.1} 0  ${1000 - dx2 * 0.3} ${300 * 0.2}  1000 300`,
  ].join(' ');
}

// Returns dot [x, y] in viewBox coordinates; freezes at peak once passed
function dotPos(progress: number, r: number): [number, number] {
  if (progress <= 0) return [0, 300];
  if (progress >= r) return [r * 1000, 0]; // frozen at peak
  const t = progress / r;
  const px = r * 1000, dx1 = px;
  return [
    bez(t, 0, dx1 * 0.3, px - dx1 * 0.1, px),
    bez(t, 300, 300 * 0.2, 0, 0),
  ];
}

// ─── GKA broadcast HUD (shown during replay) ──────────────────────────────────

function GKAReplayHUD({ jump, currentTime }: { jump: JumpDemo; currentTime: number }) {
  const { woo } = jump;
  const elapsed  = Math.max(0, currentTime - woo.takeoffOffset);
  const progress = Math.min(elapsed / woo.airtime, 1);
  const clipW    = progress * 1000;
  const [dotX, dotY] = dotPos(progress, woo.peakTimeRatio);

  const airSecs   = Math.floor(Math.min(elapsed, woo.airtime));
  const distNow   = Math.round(woo.distance * progress);
  const heightNow = (woo.maxHeight * Math.min(progress / woo.peakTimeRatio, 1)).toFixed(1);

  const path = curvePath(woo.peakTimeRatio);

  return (
    <div className="absolute inset-0 pointer-events-none select-none">

      {/* ── Curve SVG — bottom-anchored, rendered first so HUD text sits above ── */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '62%' }}
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={`jc${jump.id}`}>
            <rect x={0} y={0} width={clipW} height={300} />
          </clipPath>
        </defs>

        {/* White filled area under curve */}
        <path d={`${path} Z`} fill="rgba(255,255,255,0.78)" clipPath={`url(#jc${jump.id})`} />

        {/* Curve stroke */}
        <path d={path} fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="5" strokeLinecap="round" clipPath={`url(#jc${jump.id})`} />

        {/* Orange tracking dot */}
        {progress > 0.01 && (
          <circle cx={dotX} cy={dotY} r="14" fill="#f97316" />
        )}
      </svg>

      {/* ── Top-left: athlete name + REPLAY badge ── */}
      <div className="absolute top-5 left-5">
        <div className="bg-black/60 px-3 py-2 mb-3 inline-block">
          <div className="font-mono text-white text-sm font-bold tracking-widest leading-snug">
            {jump.athlete.toUpperCase()}
          </div>
          <div className="font-mono text-zinc-400 text-xs tracking-wider">CAPITAL.COM GKA BIG AIR</div>
          <div className="font-mono text-zinc-400 text-xs tracking-wider">{jump.label.toUpperCase()}</div>
        </div>
        <div className="flex items-center gap-3">
          <img src={logo} alt="GKA" className="w-10 h-10" />
          <span className="font-bold text-white text-xl tracking-[0.25em] drop-shadow-md">REPLAY</span>
        </div>
      </div>

      {/* ── Top-right: score ── */}
      <div className="absolute top-5 right-5 text-right">
        <div className="font-mono text-zinc-300 text-xs tracking-widest uppercase">Score</div>
        <div className="text-white font-black text-6xl leading-none tabular-nums drop-shadow-lg">
          {jump.score.toFixed(2)}
        </div>
        <div className="text-zinc-400 text-sm">/ 10</div>
      </div>

      {/* ── Bottom stats (above the curve) ── */}
      <div className="absolute bottom-12 inset-x-5 flex items-end justify-between">
        <div>
          <div className="font-mono text-zinc-200 text-[11px] tracking-widest uppercase mb-1">AIR, s</div>
          <div className="text-orange-400 font-black text-5xl leading-none tabular-nums drop-shadow-lg">{airSecs}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-zinc-200 text-[11px] tracking-widest uppercase mb-1">DISTANCE</div>
          <div className="text-orange-400 font-black text-5xl leading-none tabular-nums drop-shadow-lg">
            {distNow}<span className="text-2xl font-bold ml-0.5">m</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-zinc-200 text-[11px] tracking-widest uppercase mb-1">MAX HEIGHT, m</div>
          <div className="text-orange-400 font-black text-5xl leading-none tabular-nums drop-shadow-lg">{heightNow}</div>
        </div>
      </div>

      {/* ── Bottom thin line ── */}
      <div className="absolute bottom-4 inset-x-5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/60" />
        <div className="flex-1 h-px bg-white/25" />
        <div className="w-2 h-2 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

// ─── Replay prompt (between first play and replay) ────────────────────────────

function ReplayPrompt({ jump, onReplay }: { jump: JumpDemo; onReplay: () => void }) {
  return (
    <div className="absolute inset-0 flex items-end justify-start p-6 pointer-events-none">
      {/* Name tag stays visible */}
      <div className="absolute top-5 left-5">
        <div className="bg-black/60 px-3 py-2 mb-3 inline-block">
          <div className="font-mono text-white text-sm font-bold tracking-widest">{jump.athlete.toUpperCase()}</div>
          <div className="font-mono text-zinc-400 text-xs tracking-wider">CAPITAL.COM GKA BIG AIR</div>
          <div className="font-mono text-zinc-400 text-xs tracking-wider">{jump.label.toUpperCase()}</div>
        </div>
      </div>
      {/* Replay trigger */}
      <button
        onClick={onReplay}
        className="pointer-events-auto flex items-center gap-3 group"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping" />
          <img src={logo} alt="GKA" className="relative w-12 h-12" />
        </div>
        <span className="font-bold text-white text-2xl tracking-[0.25em] drop-shadow-md group-hover:text-orange-300 transition-colors">
          REPLAY WITH DATA
        </span>
      </button>
    </div>
  );
}

// ─── Video player ─────────────────────────────────────────────────────────────

type VState = 'idle' | 'playing' | 'replay-prompt' | 'replaying';

function VideoPlayer({ jump }: { jump: JumpDemo }) {
  const [open, setOpen]       = useState(false);
  const [vState, setVState]   = useState<VState>('idle');
  const [currentTime, setCT]  = useState(0);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const firstPlay  = useRef(true);

  const openModal = () => {
    if (!jump.videoSrc) return;
    firstPlay.current = true;
    setCT(0);
    setOpen(true);
    setVState('playing');
  };

  const closeModal = () => {
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
    setOpen(false);
    setVState('idle');
    setCT(0);
  };

  const handleEnded = () => {
    if (firstPlay.current) { firstPlay.current = false; setVState('replay-prompt'); }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setCT(0);
    setVState('replaying');
  };

  return (
    <>
      {/* Card thumbnail */}
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

      {/* Fullscreen modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 16:9 container */}
          <div
            className="relative w-full"
            style={{ aspectRatio: '16/9', maxHeight: '100vh', maxWidth: 'calc(100vh * 16 / 9)' }}
          >
            <video
              ref={videoRef}
              src={jump.videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={handleEnded}
              onTimeUpdate={() => setCT(videoRef.current?.currentTime ?? 0)}
              playsInline
              autoPlay
            />

            {vState === 'replaying' && (
              <GKAReplayHUD jump={jump} currentTime={currentTime} />
            )}

            {vState === 'replay-prompt' && (
              <ReplayPrompt jump={jump} onReplay={handleReplay} />
            )}
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
        <div className={`h-full bg-gradient-to-r ${area.gradient} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Jump card ────────────────────────────────────────────────────────────────

function JumpCard({ jump }: { jump: JumpDemo }) {
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-card to-primary/5">
        <div>
          <h3 className="text-lg font-bold text-foreground">{jump.label}</h3>
          <p className="text-sm text-muted-foreground">{jump.athlete} · Capital.com GKA Big Air</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-primary leading-none">{jump.score.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">/ 10</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <VideoPlayer jump={jump} />
        <div className="flex flex-col justify-center gap-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Score Breakdown</h4>
          <div className="space-y-4">
            {jump.areas.map(area => <ScoreBar key={area.name} area={area} />)}
          </div>
          {jump.penaltyNote && <p className="text-xs text-amber-600 font-medium mt-2">{jump.penaltyNote}</p>}
          <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-black text-primary">
              {jump.score.toFixed(2)}<span className="text-base font-normal text-muted-foreground"> / 10</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">Live Demo</h2>
          <p className="text-muted-foreground">
            3 real competition jumps · scored with objective Woo sensor data · no judge subjectivity.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">Woo Sensor Data</span>
        </div>
      </div>
      <div className="space-y-8">
        {DEMO_JUMPS.map(jump => <JumpCard key={jump.id} jump={jump} />)}
      </div>
    </div>
  );
}
