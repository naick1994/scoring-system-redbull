/**
 * The 4 King of the Air scoring reform proposals, explaining only how
 * each one works (no real competition data here).
 */

export function fmt(n: number, d = 2) {
  return n.toFixed(d);
}

const STEPS: [min: number, pts: number][] = [
  [9.0, 1.4], [8.5, 1.25], [8.0, 1.1], [7.5, 1.0], [7.0, 0.9], [6.5, 0.8], [6.0, 0.55], [5.5, 0.3], [5.0, 0.15],
];

/** The WindGames table tiers, with the name they gave each vote level. */
const TIERS: [min: number, label: string][] = [
  [9.0, 'Elite'], [8.5, 'Excellent'], [8.0, 'Very Strong'], [7.5, 'Strong'], [7.0, 'Good'],
  [6.5, 'Solid'], [6.0, 'Acceptable'], [5.5, 'Marginal'], [5.0, 'Weak'],
];

/** Binary Auto Impression: all or nothing, like today's system. */
export function binaryPoints(vote: number, threshold: number) {
  return vote >= threshold ? 1 : 0;
}

/** Progressive Auto Impression (Marijn's Progressive Variety Model): zero below threshold, tiered points above. */
export function steppedPoints(vote: number, threshold: number) {
  if (vote < threshold) return 0;
  for (const [min, pts] of STEPS) if (vote >= min) return pts;
  return 0;
}

/** The WindGames tier name for a vote (independent of the proposal's threshold). */
export function tierLabel(vote: number): string {
  for (const [min, label] of TIERS) if (vote >= min) return label;
  return '–';
}

export type JumpCount = 3 | 5 | 7;

export const EXAMPLE_JUMPS: Record<JumpCount, number[]> = {
  3: [8, 7, 6],
  5: [8, 7, 6, 5, 4],
  7: [8, 7, 6, 5, 4, 3, 2],
};

export const EXAMPLE_VOTES = [5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5];

/**
 * The problems with today's system. The index in this array is the id
 * each proposal's `solves` uses to declare which ones it solves.
 */
export const PROBLEMS = [
  'A trick just below the threshold set by the head judge (today between 5.0 and 6.5) earns zero Auto Impression points. One a single tenth above earns a full point.',
  'A spectacular trick is worth exactly the same as one just above threshold: one point, no more, no reward for excellence.',
  'Only the 3 best jumps count: every other jump landed in the heat, even a great one, is worth nothing.',
  'The threshold can change during the event if conditions change: riders in different heats can end up judged against different thresholds, even on the same day.',
  'A slightly stricter vote, if it drops the trick below threshold, removes a full point: a judge\'s error carries the maximum possible weight, with no middle ground.',
  'A crashed jump counts zero: it often pays to repeat a safe trick instead of risking something more extreme for the show. Today, the only thing that rewards risk is the Judges Impression, discretionary and a minor share of the score.',
  'Even just understanding the Auto Impression is complicated: threshold, "unique" tricks defined by four different criteria, a hard cap. Too many moving parts for judges, riders and spectators to follow.',
];

/** A problem (index 0-7 in PROBLEMS) solved by a proposal, with a line on how. */
export interface Solve {
  id: number;
  how: string;
}

interface ProposalBase {
  id: string;
  title: string;
  note: string;
  /** Problems this proposal solves, with a line on how it solves each one. */
  solves: Solve[];
  /** Note on trade-offs or new effects introduced, not among the original problems. */
  tradeoff?: string;
  /** The proposal recommended by the team: only one. */
  recommended?: boolean;
  /** Why we recommend it, only on the proposal with recommended: true. */
  whyRecommended?: { title: string; text: string }[];
  /** Who originally proposed this version, if known. */
  proposedBy?: string;
}

/** Only jumps that are different-category tricks count (up to N): no separate Auto Impression. */
export interface UniqueOnlyProposal extends ProposalBase {
  kind: 'unique-only';
  jumps: JumpCount;
  impressionMax: number;
}

/** Like today: the best N jumps count toward the score, plus an Auto Impression. */
export interface StandardProposal extends ProposalBase {
  kind: 'standard';
  jumps: JumpCount;
  autoImpMechanic: 'binary' | 'stepped';
  autoImpThreshold: number;
  autoImpMax: number;
  impressionMax: number;
}

export type Proposal = UniqueOnlyProposal | StandardProposal;

export const PROPOSALS: Proposal[] = [
  {
    id: '1',
    kind: 'standard',
    jumps: 3,
    autoImpMechanic: 'stepped',
    autoImpThreshold: 5.0,
    autoImpMax: 7,
    impressionMax: 3,
    title: 'Top 3 jumps + progressive Auto Impression from a vote of 5.0',
    note: 'The proposal closest to today: same 3 jumps, no new rules to learn. Only the Auto Impression becomes progressive (no longer all or nothing) and starts counting from a minimum vote of 5.0 instead of 6.5.',
    proposedBy: 'Marijn',
    solves: [
      { id: 1, how: 'Above threshold, points grow with the vote instead of always being 1: a trick scored 9 is worth more than one scored 6.5.' },
      { id: 3, how: 'Being fixed, the threshold stays the same in every heat, from the start of the event to the end.' },
      { id: 4, how: 'A slightly stricter vote shifts the trick down one tier in the table, it doesn\'t zero it out entirely (unless it drops below 5.0).' },
    ],
    tradeoff: 'The cliff-edge remains, just moved lower (to 5.0 instead of 6.5): a trick scored 4.9 is still worth zero.',
  },
  {
    id: '2',
    kind: 'standard',
    jumps: 5,
    autoImpMechanic: 'stepped',
    autoImpThreshold: 5.0,
    autoImpMax: 7,
    impressionMax: 3,
    title: 'Top 5 jumps + progressive Auto Impression from a vote of 5.0',
    note: 'Like proposal 1, but with 5 jumps counted instead of 3.',
    solves: [
      { id: 1, how: 'Above threshold, points grow with the vote instead of always being 1: a trick scored 9 is worth more than one scored 6.5.' },
      { id: 2, how: 'The best 5 jumps count instead of 3.' },
      { id: 3, how: 'Being fixed, the threshold stays the same in every heat, from the start of the event to the end.' },
      { id: 4, how: 'A slightly stricter vote shifts the trick down one tier in the table, it doesn\'t zero it out entirely (unless it drops below 5.0).' },
    ],
    tradeoff: 'The cliff-edge remains, just moved lower (to 5.0 instead of 6.5): a trick scored 4.9 is still worth zero.',
  },
  {
    id: '3',
    kind: 'unique-only',
    jumps: 7,
    impressionMax: 5,
    title: 'Top 7 unique jumps + Judges Impression',
    note: 'Only jumps that are different-category tricks count, up to 7. There\'s no more separate Auto Impression: variety is already built into the jump scores themselves.',
    solves: [
      { id: 0, how: 'There\'s no more vote threshold for the bonus: every jump is worth its full score from 0 to 10, whatever it is.' },
      { id: 1, how: 'The jump score is already continuous from 0 to 10: a spectacular trick is worth more than a mediocre one, with no need for a separate bonus.' },
      { id: 2, how: 'Up to 7 jumps count, not just 3.' },
      { id: 3, how: 'Without a threshold, there\'s nothing that can change round to round.' },
      { id: 4, how: 'A slightly stricter vote changes the jump score by a little, it doesn\'t zero it out.' },
      { id: 5, how: 'The Judges Impression, which already evaluates risk and showmanship today, weighs more on the total (5 points instead of 3): taking risks counts for more in the final score.' },
      { id: 6, how: 'There\'s nothing left to explain about the Auto Impression: every jump is worth the score the judges give it, full stop.' },
    ],
    tradeoff: 'There\'s no more vote threshold, but a new cliff-edge appears: a trick in a category already landed is worth zero, no matter how well it\'s executed.',
  },
  {
    id: '4',
    kind: 'unique-only',
    jumps: 5,
    impressionMax: 3,
    title: 'Top 5 unique jumps + Judges Impression',
    note: 'Only jumps that are different-category tricks count, up to 5. There\'s no more separate Auto Impression: variety is already built into the jump scores. Judges Impression up to 3 points.',
    recommended: true,
    whyRecommended: [
      {
        title: 'Easy, for everyone and everything',
        text: 'No threshold, no separate Auto Impression, no hidden math: a jump either lands in a new category or it doesn\'t, and its score is exactly what the judges vote. Riders, judges and spectators can all follow it live, without a rulebook.',
      },
      {
        title: '7 is hard to pull off, 5 is within reach',
        text: 'Landing 7 genuinely different-category tricks in one heat is a real challenge, few riders pull it off every time. At 5, the bar stays ambitious but matches what more riders can realistically achieve heat after heat.',
      },
      {
        title: 'More spectacle per jump',
        text: 'With 5 jumps to complete instead of 7, every attempt carries more weight: less need to chase variety at all costs, more room to really go for the biggest, most extreme jump. Viewers see better jumps, not just more of them.',
      },
      {
        title: 'The math rewards risk, not the judges',
        text: 'Repeating a trick in the same category scores zero: the structure itself pushes riders toward variety, not a bonus left to the judges\' discretion. Same result as the 7-jump version, with less riding on discretion.',
      },
      {
        title: 'A natural step from today',
        text: 'Today the best 3 jumps count. Moving to 5 is already a decisive change, but it stays a natural step. Moving to 7 means more than doubling today\'s base in one go: a bigger leap for whoever has to approve it to swallow.',
      },
      {
        title: 'Same problems solved',
        text: 'It\'s not a trade-off: this proposal solves all 7 problems identified, exactly like the 7-jump version. Same result, reached with a number riders can actually hit heat after heat.',
      },
    ],
    solves: [
      { id: 0, how: 'There\'s no more vote threshold for the bonus: every jump is worth its full score from 0 to 10, whatever it is.' },
      { id: 1, how: 'The jump score is already continuous from 0 to 10: a spectacular trick is worth more than a mediocre one, with no need for a separate bonus.' },
      { id: 2, how: 'Up to 5 jumps count, not just 3.' },
      { id: 3, how: 'Without a threshold, there\'s nothing that can change round to round.' },
      { id: 4, how: 'A slightly stricter vote changes the jump score by a little, it doesn\'t zero it out.' },
      { id: 5, how: 'Repeating a trick in the same category is worth zero: playing it safe no longer pays, you need to risk variety to keep earning points.' },
      { id: 6, how: 'There\'s nothing left to explain about the Auto Impression: every jump is worth the score the judges give it, full stop.' },
    ],
    tradeoff: 'There\'s no more vote threshold, but a new cliff-edge appears: a trick in a category already landed is worth zero, no matter how well it\'s executed.',
  },
];

export function proposalById(id: string): Proposal | undefined {
  return PROPOSALS.find((p) => p.id === id);
}

export function denomForStandard(p: StandardProposal) {
  return p.jumps * 10 + p.autoImpMax + p.impressionMax;
}

export function denomForUniqueOnly(p: UniqueOnlyProposal) {
  return p.jumps * 10 + p.impressionMax;
}
