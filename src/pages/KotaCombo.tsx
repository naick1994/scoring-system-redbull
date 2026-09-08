import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/FadeIn';
import { AmbientDataDots } from '@/components/AmbientDataDots';
import { DeployTag } from '@/components/DeployTag';
import {
  proposalById,
  denomForStandard,
  denomForUniqueOnly,
  binaryPoints,
  steppedPoints,
  tierLabel,
  fmt,
  EXAMPLE_JUMPS,
  EXAMPLE_VOTES,
  PROPOSALS,
  PROBLEMS,
  type JumpCount,
} from '@/data/kotaScoring';
import kotaLogo from '@/assets/kota-logo.png';

const TODAY_TOTAL = 40; // 3 jumps × 10 + 7 Auto Impression + 3 Judges Impression, today's maximum score
const TODAY_JUDGE_PCT = 7.5; // 3 Judges Impression points out of 40 total, today

function ScoreLedger({ rows, total, note }: { rows: { value: number; label: string; sub?: string }[]; total: number; note?: string }) {
  const delta =
    total === TODAY_TOTAL ? 'stays 40: only how you get there changes' : total > TODAY_TOTAL ? `rises to ${total}` : `drops to ${total}`;
  return (
    <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] mb-8">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">How the score is built</p>
      <dl className="space-y-2 mb-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-6 text-[14.5px]">
            <dt className="text-foreground/75 leading-snug">
              {r.label}
              {r.sub && <span className="block text-[11.5px] text-muted-foreground/70 mt-0.5">{r.sub}</span>}
            </dt>
            <dd className="font-mono tabular-nums text-foreground shrink-0">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-[14.5px] font-medium">Total</span>
        <span className="font-mono text-3xl font-semibold text-primary tabular-nums">{total}</span>
      </div>
      <p className="text-[13px] text-muted-foreground mt-4">Today the maximum is 40 points. With this proposal it {delta}.</p>
      {note && <p className="text-[13px] text-muted-foreground mt-2">{note}</p>}
    </Card>
  );
}

// Cycles through 0..length-1 on its own, so a list of cards can spotlight
// one item at a time without any user interaction.
function useRoundRobinIndex(length: number, periodMs: number) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    if (length === 0 || reducedMotion) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % length), periodMs);
    return () => clearInterval(id);
  }, [reducedMotion, length, periodMs]);

  return index;
}

function SolvesSection({ solves, tradeoff }: { solves: { id: number; how: string }[]; tradeoff?: string }) {
  const solvedIds = new Set(solves.map((s) => s.id));
  const unsolved = PROBLEMS.map((_, i) => i).filter((i) => !solvedIds.has(i));
  const sorted = [...solves].sort((a, b) => a.id - b.id);
  const activeUnsolvedIndex = useRoundRobinIndex(unsolved.length, 2000);
  return (
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-1">
        Problems it solves: <span className="text-primary">{solves.length} of {PROBLEMS.length}.</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Why, not just which.</p>
      <div className="grid grid-cols-1 gap-3 mb-3">
        {sorted.map(({ id, how }) => (
          <div key={id} className="flex items-start gap-3 rounded-lg border border-green-500/25 bg-green-500/[0.06] px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
            <div className="text-[13.5px] leading-relaxed">
              <p className="text-foreground/60">{PROBLEMS[id]}</p>
              <p className="text-foreground/95 mt-1">→ {how}</p>
            </div>
          </div>
        ))}
      </div>
      {unsolved.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground/70 mb-2">
            Doesn&apos;t solve ({unsolved.length})
          </p>
          <div className="grid grid-cols-1 gap-2">
            {unsolved.map((i, idx) => {
              const isActive = idx === activeUnsolvedIndex;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-2.5 text-[13px] leading-relaxed transition-all duration-300 ${
                    isActive ? 'border-red-500/60 bg-red-500/[0.08] shadow-[0_0_14px_-5px_rgba(239,68,68,0.45)]' : 'border-border bg-card/30'
                  }`}
                >
                  <X className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors duration-300 ${isActive ? 'text-red-400' : 'text-muted-foreground/40'}`} />
                  <span className={isActive ? 'text-foreground/80' : 'text-muted-foreground/60'}>{PROBLEMS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tradeoff && (
        <p className="text-[13.5px] leading-relaxed text-muted-foreground mt-6 pt-4 border-t border-border">
          <strong className="text-foreground/80 font-semibold">Trade-off: </strong>
          {tradeoff}
        </p>
      )}
    </div>
  );
}

function JudgePowerNote({ pct }: { pct: number }) {
  const sameAsToday = Math.abs(pct - TODAY_JUDGE_PCT) < 0.05;
  return (
    <>
      That&apos;s <strong className="text-primary font-semibold">{fmt(pct, 1)}%</strong> of the total score
      {sameAsToday ? (
        ', same as today (3 points out of 40).'
      ) : (
        <>
          . Today the judges&apos; discretionary power (Judges Impression) is{' '}
          <strong className="text-foreground font-semibold">{fmt(TODAY_JUDGE_PCT, 1)}%</strong> (3 points out of 40).
        </>
      )}
    </>
  );
}

// Marijn's own stated reasons for his Progressive Variety Model, from his original proposal document.
const PROGRESSIVE_RATIONALE = [
  {
    title: 'Rewards excellence',
    text: 'An 8.5 trick now earns 56% more than a 6.5 (1.25 vs 0.80 points). Riders pushing for exceptional execution get rewarded for it, not just for clearing a bar.',
  },
  {
    title: 'Protects against conditions',
    text: 'A clean trick landed in dying wind that scores 6.2 still contributes 0.55 points instead of zero. A rider isn\'t erased from the score just because conditions dropped.',
  },
  {
    title: 'Rewards quality over quantity',
    text: 'With the anti-spam cap, ten mediocre tricks max out at 2.0 points combined. Four excellent tricks easily beat that.',
  },
  {
    title: 'One less call for judges to make',
    text: 'Judges score tricks purely on execution. The variety math happens automatically in the background, so there\'s no threshold to manually lower when the wind drops.',
  },
];

function HighlightedTitle({ title }: { title: string }) {
  const parts = title.split(/(\d+(?:\.\d+)?)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\d+(?:\.\d+)?$/.test(part) ? (
          <span key={i} className="text-primary">{part}</span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function JumpsExample({ jumps }: { jumps: JumpCount }) {
  const example = EXAMPLE_JUMPS[jumps];
  const sum = example.reduce((a, b) => a + b, 0);
  return (
    <p className="text-[14.5px] leading-relaxed text-foreground/80">
      Example: a rider lands{' '}
      <span className="font-mono">{example.join(', ')}{jumps === 3 ? ', 5, 4' : ''}</span>. Score ={' '}
      <span className="font-mono text-foreground">{example.join(' + ')} = <strong className="text-primary font-semibold">{sum}</strong></span>.
    </p>
  );
}

export default function KotaCombo() {
  const { combo: proposalId } = useParams<{ combo: string }>();
  const proposal = proposalId ? proposalById(proposalId) : undefined;

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 max-w-5xl py-16">
          <p className="text-muted-foreground mb-4">Proposal not found.</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/kota"><ArrowLeft className="w-4 h-4" /> Back to all proposals</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AmbientDataDots />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        <div
          className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.14) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative py-16 md:py-20">
          <Button asChild variant="outline" size="sm" className="mb-8">
            <Link to="/kota"><ArrowLeft className="w-3.5 h-3.5" /> All proposals</Link>
          </Button>

          <img src={kotaLogo} alt="Red Bull King of the Air" className="h-20 md:h-24 mb-7" />
          {proposal.recommended && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 mb-5">
              <Sparkles className="w-4 h-4" /> The proposal we recommend
            </div>
          )}
          <p className="text-xs font-mono tracking-widest uppercase text-primary mb-4">Proposal {proposal.id}</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight max-w-4xl" style={{ textWrap: 'balance' }}>
            <HighlightedTitle title={proposal.title} />
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl">{proposal.note}</p>
          {proposal.proposedBy && (
            <p className="text-sm text-muted-foreground/70 mt-4">Originally proposed by {proposal.proposedBy}.</p>
          )}
        </div>
      </section>

      {proposal.whyRecommended && (
        <section className="border-b border-border bg-primary/[0.04]">
          <div className="container mx-auto px-4 max-w-5xl py-16 md:py-20">
            <FadeIn y={30}>
              <div className="text-xs font-mono tracking-widest uppercase text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Why we recommend it
              </div>
              <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mb-10">
                Why it&apos;s the <span className="text-primary">best proposal.</span>
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {proposal.whyRecommended.map((reason, i) => (
                <FadeIn key={reason.title} y={30} delay={i * 0.08}>
                  <Card className="p-6 shadow-[var(--shadow-card)] border-primary/20 h-full">
                    <h3 className="font-bold text-base mb-2 text-primary">{reason.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason.text}</p>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 max-w-5xl py-16 md:py-20">
        {proposal.kind === 'standard' && (
          <>
            <FadeIn y={30}>
              <ScoreLedger
                total={denomForStandard(proposal)}
                rows={[
                  {
                    value: proposal.jumps * 10,
                    label: `${proposal.jumps} jumps, up to 10 points each`,
                    sub: 'best score, any trick, category doesn\'t matter',
                  },
                  { value: proposal.autoImpMax, label: 'Auto Impression, the maximum possible' },
                  {
                    value: proposal.impressionMax,
                    label: 'Judges Impression, the maximum possible',
                    sub: `${fmt((proposal.impressionMax / denomForStandard(proposal)) * 100, 1)}% of the total score (today ${fmt(TODAY_JUDGE_PCT, 1)}%)`,
                  },
                ]}
                note="Auto Impression (automatic, on unique tricks) + Judges Impression (manual) = Overall Impression Score."
              />
            </FadeIn>

            <FadeIn y={30} delay={0.05}>
              <SolvesSection solves={proposal.solves} tradeoff={proposal.tradeoff} />
            </FadeIn>

            <FadeIn y={30} delay={0.1}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3">How the Auto Impression works</h2>
                <p className="text-[15px] leading-relaxed text-foreground/85 mb-3">
                  A trick is &quot;unique&quot; if it changes at least one of: direction (in/out), hook, kite motion
                  type, rotation direction, compared to other tricks already landed in the heat. Rotation count and
                  board technicality don&apos;t count: those are already rewarded in the individual jump score.
                </p>
                <p className="text-[15px] leading-relaxed text-foreground/85 mb-6">
                  {proposal.autoImpMechanic === 'binary'
                    ? `All or nothing: above a vote of ${fmt(proposal.autoImpThreshold, 1)} a full point, below zero. Same as today.`
                    : `Below a vote of ${fmt(proposal.autoImpThreshold, 1)}, zero points. Above it, the higher the vote, the more points it gives: in tiers, no longer all or nothing.`}
                </p>

                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-[13.5px] min-w-[360px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium py-2 px-1">Vote</th>
                        {proposal.autoImpMechanic === 'stepped' && (
                          <th className="text-left font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium py-2 px-1">Tier</th>
                        )}
                        <th className="text-right font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium py-2 px-1">Today</th>
                        <th className="text-right font-mono text-[10.5px] uppercase tracking-wide text-primary font-medium py-2 px-1">This proposal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EXAMPLE_VOTES.map((v) => (
                        <tr key={v} className="border-b border-border/60">
                          <td className="py-2 px-1 font-mono tabular-nums text-muted-foreground">{fmt(v, 1)}</td>
                          {proposal.autoImpMechanic === 'stepped' && (
                            <td className="py-2 px-1 text-muted-foreground">{tierLabel(v)}</td>
                          )}
                          <td className="py-2 px-1 text-right font-mono tabular-nums text-muted-foreground">{fmt(binaryPoints(v, 6.5))}</td>
                          <td className="py-2 px-1 text-right font-mono tabular-nums text-foreground font-medium">
                            {fmt(proposal.autoImpMechanic === 'binary' ? binaryPoints(v, proposal.autoImpThreshold) : steppedPoints(v, proposal.autoImpThreshold))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-3">
                  &quot;Today&quot; uses 6.5 as an example: in reality today the threshold isn&apos;t fixed, the
                  head judge picks it between 5.0 and 6.5.
                </p>

                <p className="text-[14px] leading-relaxed text-foreground/80 mt-6">
                  <strong className="text-foreground font-semibold">Hard cap:</strong> the Auto Impression never
                  exceeds {proposal.autoImpMax} points, even adding up every unique trick in the heat.
                </p>
                {proposal.autoImpMechanic === 'stepped' && (
                  <p className="text-[14px] leading-relaxed text-foreground/80 mt-2">
                    <strong className="text-foreground font-semibold">Anti-spam brake:</strong> tricks scored below
                    6.5 can&apos;t contribute more than 2.0 points combined, so spamming mediocre tricks
                    doesn&apos;t pay off.
                  </p>
                )}
              </Card>
            </FadeIn>

            {proposal.autoImpMechanic === 'stepped' && (
              <FadeIn y={30} delay={0.12}>
                <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-6">
                    The reasoning behind the <span className="text-primary">Progressive Variety Model.</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PROGRESSIVE_RATIONALE.map((r) => (
                      <div key={r.title}>
                        <h3 className="font-bold text-sm mb-1.5 text-primary">{r.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeIn>
            )}

            <FadeIn y={30} delay={0.15}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  How many jumps count: <span className="text-primary">{proposal.jumps}</span>
                </h2>
                <p className="text-[15px] leading-relaxed text-foreground/85 mb-4">
                  {proposal.jumps === 3
                    ? 'Same as today: the 3 highest-voted jumps count (best score). They don\'t need to be different tricks from each other.'
                    : `Instead of the usual 3, the best ${proposal.jumps} jumps by vote count (best score): it takes more consistency, a single lucky jump matters less. They don't need to be different tricks from each other.`}
                </p>
                <JumpsExample jumps={proposal.jumps} />
              </Card>
            </FadeIn>

            <FadeIn y={30} delay={0.2}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)]">
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  Judges Impression: <span className="text-primary">up to {proposal.impressionMax} points.</span>
                </h2>
                <p className="text-[15px] leading-relaxed text-foreground/85">
                  {proposal.impressionMax !== 3
                    ? `Instead of the usual 3, the Judges Impression (flow, execution, risk, showmanship, conditions management) is worth up to ${proposal.impressionMax} points. `
                    : 'The Judges Impression (flow, execution, risk, showmanship, conditions management) stays at up to 3 points. '}
                  <JudgePowerNote pct={(proposal.impressionMax / denomForStandard(proposal)) * 100} />
                </p>
              </Card>
            </FadeIn>
          </>
        )}

        {proposal.kind === 'unique-only' && (
          <>
            <FadeIn y={30}>
              <ScoreLedger
                total={denomForUniqueOnly(proposal)}
                rows={[
                  {
                    value: proposal.jumps * 10,
                    label: `up to ${proposal.jumps} unique jumps, 10 points each`,
                    sub: 'only different-category tricks count, repeats don\'t',
                  },
                  {
                    value: proposal.impressionMax,
                    label: 'Judges Impression, the maximum possible',
                    sub: `${fmt((proposal.impressionMax / denomForUniqueOnly(proposal)) * 100, 1)}% of the total score (today ${fmt(TODAY_JUDGE_PCT, 1)}%)`,
                  },
                ]}
                note="No separate Auto Impression: variety is already built into the jump scores."
              />
            </FadeIn>

            <FadeIn y={30} delay={0.05}>
              <SolvesSection solves={proposal.solves} tradeoff={proposal.tradeoff} />
            </FadeIn>

            <FadeIn y={30} delay={0.1}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  There&apos;s no more separate <span className="text-primary">Auto Impression.</span>
                </h2>
                <p className="text-[15px] leading-relaxed text-foreground/85 mb-3">
                  A trick is &quot;unique&quot; if it changes at least one of: direction (in/out), hook, kite motion
                  type, rotation direction, compared to other tricks already landed in the heat. Rotation count and
                  board technicality don&apos;t count: those are already rewarded in the individual jump score.
                </p>
                <p className="text-[15px] leading-relaxed text-foreground/85 mb-6">
                  Today: the 3 highest-voted jumps (whatever tricks they are) + an Auto Impression up to 7 points
                  for unique tricks. Here the two merge into one: for each category, only the highest-voted jump
                  counts, using the same categories that define &quot;unique&quot; above. Other jumps in the same
                  category don&apos;t count, even with a higher vote than the first.
                </p>
                <p className="text-[14.5px] leading-relaxed text-foreground/80">
                  Example: Trick A (vote 8), Trick B different (vote 7), another trick in A&apos;s category (vote
                  7.5, doesn&apos;t count because 8 is already the best in that category), Trick C different (vote
                  6). Score ={' '}
                  <span className="font-mono">8 + 7 + 6 = <strong className="text-primary font-semibold">21</strong></span>.
                </p>
              </Card>
            </FadeIn>

            <FadeIn y={30} delay={0.15}>
              <Card className="p-6 md:p-8 shadow-[var(--shadow-card)]">
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  Up to <span className="text-primary">{proposal.jumps} unique jumps</span> count
                </h2>
                <p className="text-[15px] leading-relaxed text-foreground/85">
                  If the rider lands {proposal.jumps} or more tricks all different from each other, only the best{' '}
                  {proposal.jumps} count. If they land fewer, all of them count.
                </p>
              </Card>
            </FadeIn>
          </>
        )}

        <div className="border-t border-border pt-6 mt-8">
          <span className="text-[12.5px] text-muted-foreground">Other proposals&nbsp; </span>
          {PROPOSALS.filter((p) => p.id !== proposal.id).map((p, i, arr) => (
            <span key={p.id}>
              <Link to={`/kota/${p.id}`} className="text-[12.5px] text-foreground/80 hover:text-primary underline underline-offset-4 decoration-border">
                {p.id}
              </Link>
              {i < arr.length - 1 && <span className="text-muted-foreground/50 mx-1.5">·</span>}
            </span>
          ))}
        </div>
      </div>
      <DeployTag />
    </div>
  );
}
