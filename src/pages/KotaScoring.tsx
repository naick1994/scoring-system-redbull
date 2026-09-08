import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/FadeIn';
import { AmbientDataDots } from '@/components/AmbientDataDots';
import { DeployTag } from '@/components/DeployTag';
import { CheckCircle2, X, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { PROPOSALS, PROBLEMS } from '@/data/kotaScoring';
import kotaLogo from '@/assets/kota-logo.png';

const VARIETY_CRITERIA = [
  ['Direction', 'in / out'],
  ['Hook', 'hooked / unhooked'],
  ['Kite motion', 'kiteloop, dirty loop, doubles, s-loop, superloop, innovation'],
  ['Rotation', 'front / back / rewind'],
] as const;

// Cycles through 0..length-1 on its own, so a list of cards can spotlight
// one item at a time without any user interaction.
function useRoundRobinIndex(length: number, periodMs: number) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % length), periodMs);
    return () => clearInterval(id);
  }, [reducedMotion, length, periodMs]);

  return index;
}

export default function KotaScoring() {
  const activeProblemIndex = useRoundRobinIndex(PROBLEMS.length, 2000);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AmbientDataDots />
      {/* Ambient glow, fixed behind the whole page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        <div
          className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.14) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative py-16 md:py-24">
          <img src={kotaLogo} alt="Red Bull King of the Air" className="h-24 md:h-28 mb-8" />
          <p className="text-xs font-mono tracking-widest uppercase text-primary mb-4">
            Internal document
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl">
            <span className="block">4 proposals to improve</span>
            <span className="block">the scoring of <span className="text-primary">Red Bull King of the Air.</span></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-8 max-w-2xl">
            Not just fairer: easier to explain, more spectacle, more content for anyone following the event.
          </p>
        </div>
      </section>

      {/* ───────── How it works today ───────── */}
      <section className="border-b border-border relative">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <FadeIn y={40}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">How it works today</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              The score is made of <span className="text-primary">3 pieces.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              The last two exist for a precise reason: to reward the most complete rider, not just the single
              highest jump.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FadeIn y={40} delay={0}>
              <Card className="p-6 shadow-[var(--shadow-card)] h-full">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-primary">30 pt</span>
                  <span className="text-sm font-mono text-muted-foreground">75%</span>
                </div>
                <h3 className="font-bold text-sm mb-3">Best 3 jumps</h3>
                <p className="text-sm text-muted-foreground">
                  Best score: only the 3 highest-scoring jumps of each rider count, they don&apos;t need to be
                  different tricks from each other.
                </p>
              </Card>
            </FadeIn>
            <FadeIn y={40} delay={0.12}>
              <Card className="p-6 shadow-[var(--shadow-card)] h-full">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-primary">10 pt</span>
                  <span className="text-sm font-mono text-muted-foreground">25%</span>
                </div>
                <h3 className="font-bold text-sm mb-4">Overall Impression Score</h3>
                <div className="space-y-2.5 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Auto Impression Score</span>
                    <span className="font-mono text-foreground">7 pt · 70%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Judges Impression</span>
                    <span className="font-mono text-foreground">3 pt · 30%</span>
                  </div>
                </div>
              </Card>
            </FadeIn>
          </div>

          <FadeIn y={40} delay={0.1}>
            <Card className="p-6 md:p-8 shadow-[var(--shadow-card)]">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                What makes a trick &quot;unique&quot;
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-5">
                {VARIETY_CRITERIA.map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground mb-1">{label}</dt>
                    <dd className="text-[13.5px] text-foreground/80 leading-snug">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[13px] text-muted-foreground mt-3">
                Changing at least one of these 4 aspects is enough for two tricks to count as different.
              </p>
              <p className="text-[13px] text-muted-foreground mt-2 mb-8">
                Rotation count and board technicality don&apos;t count toward variety: those are already rewarded
                in the individual jump score, not in the Auto Impression.
              </p>

              <p className="text-[15.5px] leading-relaxed text-foreground/85 mb-8">
                Auto Impression and Judges Impression together form the Overall Impression Score: the part of the
                total not decided by the individual jump scores.
              </p>

              <div className="flex items-baseline justify-between border-t border-border pt-5">
                <span className="font-mono text-[12.5px] text-muted-foreground">
                  30 jumps&nbsp;+&nbsp;7 Auto Impression&nbsp;+&nbsp;3 Judges Impression
                </span>
                <span className="font-mono text-2xl font-semibold text-primary tabular-nums">40 pt</span>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ───────── The paradox ───────── */}
      <section className="border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl relative">
          <FadeIn y={40}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">An example, hypothetical numbers</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              The paradox of the <span className="text-primary">complete rider.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              With the same level of skill, today&apos;s system can reward a rider who repeats one perfect trick
              over one who shows a much wider repertoire.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FadeIn y={40} delay={0}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] h-full flex flex-col">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Rider A</div>
                <h3 className="font-bold text-xl mb-4">The specialist</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Lands the exact same trick 3 times, always a 10. Zero variety.
                </p>
                <dl className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">3 jumps, same trick, score 10.0</dt>
                    <dd className="font-mono shrink-0">30</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Auto Impression (1 category only)</dt>
                    <dd className="font-mono shrink-0">1</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Judges Impression (zero variety)</dt>
                    <dd className="font-mono shrink-0">0</dd>
                  </div>
                </dl>
                <div className="flex items-baseline justify-between border-t border-border pt-4 mt-auto">
                  <span className="font-medium">Total</span>
                  <span className="font-mono text-3xl font-bold text-primary">31</span>
                </div>
              </Card>
            </FadeIn>
            <FadeIn y={40} delay={0.12}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] h-full flex flex-col">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Rider B</div>
                <h3 className="font-bold text-xl mb-4">The complete rider</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Lands 7 tricks, all different, score 7.0 each. A much wider repertoire, but less clean on any
                  single jump.
                </p>
                <dl className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">7 different jumps, score 7.0, only the best 3 count</dt>
                    <dd className="font-mono shrink-0">21</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Auto Impression (7 different categories, hard cap)</dt>
                    <dd className="font-mono shrink-0">7</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Judges Impression (lots of variety)</dt>
                    <dd className="font-mono shrink-0">2.5</dd>
                  </div>
                </dl>
                <div className="flex items-baseline justify-between border-t border-border pt-4 mt-auto">
                  <span className="font-medium">Total</span>
                  <span className="font-mono text-3xl font-bold text-foreground">30.5</span>
                </div>
              </Card>
            </FadeIn>
          </div>

          <FadeIn y={30} delay={0.2}>
            <div className="rounded-lg border border-primary/30 bg-primary/[0.06] px-6 py-5 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 shrink-0 text-primary mt-0.5" />
              <p className="text-[15px] leading-relaxed text-foreground/90">
                The specialist wins by <strong className="text-primary">0.5 points</strong>, despite showing zero
                variety, against a rider who landed more than double the jumps, all different and clean. It&apos;s
                an extreme case, but it shows the underlying problem: today&apos;s system doesn&apos;t actually
                manage to reward completeness.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────── The problem ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <FadeIn y={40}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The problem</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              {PROBLEMS.length} problems, <span className="text-primary">same system.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              Today&apos;s Auto Impression is a clean yes or no: full point above threshold, zero below. This
              creates several problems, ones even the earlier reform proposal recognized.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROBLEMS.map((text, i) => {
              const isActive = i === activeProblemIndex;
              return (
                <FadeIn key={text} y={30} delay={i * 0.06}>
                  <div
                    className={`flex items-start gap-3 text-sm rounded-lg border px-4 py-3 h-full transition-all duration-300 ${
                      isActive ? 'border-red-500 bg-red-500/[0.12] shadow-[0_0_16px_-4px_rgba(239,68,68,0.5)]' : 'border-border bg-card/40'
                    }`}
                  >
                    <X className={`w-4 h-4 shrink-0 mt-0.5 transition-colors duration-300 ${isActive ? 'text-red-400' : 'text-muted-foreground/50'}`} />
                    <span className={isActive ? 'text-foreground' : 'text-foreground/70'}>{text}</span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── The 4 proposals ───────── */}
      <section>
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <FadeIn y={40}>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The proposals</div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
              Same completeness, <span className="text-primary">less complication.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              You can reward the same rider completeness with less complication, more clarity for riders and
              spectators, and more spectacle. It just takes fixing how the scoring works. Click a proposal for the
              detail.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROPOSALS.map((p, i) => (
              <FadeIn key={p.id} y={40} delay={i * 0.1}>
                <Link to={`/kota/${p.id}`} className="group block h-full">
                  <Card
                    className={`p-6 shadow-[var(--shadow-card)] h-full flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                      p.recommended
                        ? 'border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-[0_0_28px_-6px_hsl(var(--primary)/0.5)]'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-3xl font-bold text-primary">{p.id}</span>
                      {p.recommended && (
                        <Badge className="bg-primary text-primary-foreground text-[11px] gap-1 px-3 py-1">
                          <Sparkles className="w-3.5 h-3.5" /> Recommended
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{p.note}</p>
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-4 mt-auto border-t border-border">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        Solves {p.solves.length} of {PROBLEMS.length} problems
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <p className="text-xs text-muted-foreground">Internal document</p>
      </div>
      <DeployTag />
    </div>
  );
}
