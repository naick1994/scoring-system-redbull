import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, CheckCircle2, X, Gavel, Sparkles, TrendingUp } from 'lucide-react';
import wooLogo from '@/assets/woo-logo.svg';
import capitalLogo from '@/assets/capital-com-logo.png';

const AREA_GRADIENT: Record<string, string> = {
  'HEIGHT & AMPLITUDE': 'from-blue-500 to-cyan-400',
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

export default function ChangeTheTide() {
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

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-7 py-3.5 text-base hover:opacity-90 transition-opacity"
            >
              See it live
              <ArrowUpRight className="w-5 h-5" />
            </Link>
            <span className="text-sm text-muted-foreground font-mono">Everything below is the real, running product — not a mockup.</span>
          </div>
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
            {AREAS.map((area) => (
              <Card key={area.name} className="p-6 shadow-[var(--shadow-card)]">
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
              </Card>
            ))}
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
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-1">Thresholds, set per event</h3>
              <p className="text-sm text-muted-foreground mb-5">
                The chief judge sets what height and distance earn full marks — a big-wind day and a
                marginal one don't get graded on the same curve.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-red-500/40 text-red-400 text-[11px]">0–10m: 0 pts</Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[11px]">10–15m: 0.6 pts</Badge>
                <Badge variant="outline" className="border-lime-500/40 text-lime-400 text-[11px]">15–17.5m: 0.9 pts</Badge>
                <Badge variant="outline" className="border-green-500/40 text-green-400 text-[11px]">+17.5m: 1.5 pts</Badge>
              </div>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold mb-1">Weights, set per format</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Want extremity and load to matter more than technical variety at one event? Change the
                weights, not the philosophy.
              </p>
              <div className="text-xs font-mono">
                <div className="grid grid-cols-4 gap-2 text-muted-foreground pb-2 border-b border-border">
                  <span>Preset</span><span className="text-right">H&amp;A</span><span className="text-right">Extr.</span><span className="text-right">Tech.</span>
                </div>
                {[
                  ['Standard', 30, 30, 20],
                  ['Technical', 30, 30, 25],
                  ['Power', 45, 45, 10],
                ].map(([name, a, b, c]) => (
                  <div key={name as string} className="grid grid-cols-4 gap-2 py-1.5">
                    <span className="font-sans font-semibold text-foreground">{name}</span>
                    <span className="text-right text-primary">{a}%</span>
                    <span className="text-right text-primary">{b}%</span>
                    <span className="text-right text-primary">{c}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────── Judge Override ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Room for judgment, on the record</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            Some jumps break the formula. That's allowed.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-10">
            A chief judge can still override a jump's final score for something the parameters didn't
            anticipate — but never silently. The calculated number stays visible next to it, with a
            reason on record.
          </p>

          <Card className="p-6 shadow-[var(--shadow-card)] max-w-md">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm">Jump 1 · KLBRFL</span>
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 gap-1 text-[10px]">
                <Gavel className="w-3 h-3" /> Overridden
              </Badge>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold text-primary">9.90</div>
              <div className="text-sm text-muted-foreground mb-1">calculated: 7.03</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              "Reason: an extraordinary, once-a-season execution the parameter model wasn't built to
              reward on its own."
            </p>
          </Card>
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

      {/* ───────── Coaching & education ───────── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">The real unlock</div>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-4">
            "What do I need to improve?" gets a real answer.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Today, an athlete who loses a heat gets an opinion. Under this model, every rider gets a
            jump-by-jump breakdown of exactly where points were left on the table — and a live
            simulator to see what closing that gap would have been worth.
          </p>

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
                <div className="text-xl font-bold text-primary">7.14 / 10</div>
                <p className="text-xs text-red-400 font-semibold">Lost 2.86 pts — mostly on Height &amp; Amplitude</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Height &amp; Amplitude</span>
              <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 gap-1">
                <TrendingUp className="w-3 h-3" /> Biggest opportunity
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4 py-2 px-3 rounded-lg bg-muted/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Height</span>
                    <span className="text-xs font-semibold text-amber-400">0.90 / 1.50</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Push for more raw airtime off the kicker.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">What if:</span>
                    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-[11px] gap-1">
                      <Sparkles className="w-3 h-3 text-primary" /> +17.5m — 1.50 pts
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-red-400 shrink-0">-0.60</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-2 px-3 rounded-lg bg-muted/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Amplitude</span>
                    <span className="text-xs font-semibold text-amber-400">0.67 / 1.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ride more power into the takeoff to extend the arc.</p>
                </div>
                <span className="text-xs font-semibold text-red-400 shrink-0">-0.33</span>
              </div>
            </div>
          </Card>
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

          <Card className="p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">JO</div>
              <div>
                <div className="font-bold">Jamie Overbeek</div>
                <div className="text-xs text-muted-foreground">🇳🇱 #2 · 1700 pts</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 mb-6">
              <div className="text-center flex-1">
                <div className="text-2xl font-bold">7.76</div>
                <div className="text-xs text-muted-foreground">Jamie's avg</div>
              </div>
              <div className="px-4 text-center">
                <div className="text-lg font-bold text-green-500">+0.13</div>
                <div className="text-[10px] text-muted-foreground uppercase">edge</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-primary">7.89</div>
                <div className="text-xs text-muted-foreground">Your avg</div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'HEIGHT & AMPLITUDE', rival: 2.04, you: 2.5, max: 3.0 },
                { name: 'EXTREMITY', rival: 2.33, you: 2.38, max: 3.0 },
                { name: 'TECHNICALITY', rival: 1.33, you: 1.38, max: 2.0 },
                { name: 'EXECUTION', rival: 1.48, you: 1.64, max: 2.0 },
              ].map((row) => (
                <div key={row.name}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.rival.toFixed(2)} vs <span className="text-primary font-semibold">{row.you.toFixed(2)}</span> / {row.max.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${AREA_GRADIENT[row.name]} opacity-40`} style={{ width: `${(row.rival / row.max) * 100}%` }} />
                    <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${AREA_GRADIENT[row.name]} border-r-2 border-white/80`} style={{ width: `${(row.you / row.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
