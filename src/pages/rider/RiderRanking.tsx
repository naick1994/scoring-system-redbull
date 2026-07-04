import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GKA_BIG_AIR_MEN_RANKINGS_2026, RankingRow } from '@/data/gkaRankings';
import { getFakeAthleteScore } from '@/data/fakeAthleteScores';
import { getLeonardoAverageBreakdown } from '@/data/demoJumps';
import { useScoring } from '@/contexts/ScoringContext';
import { AREA_DISPLAY_NAMES } from '@/lib/scoring';

const RIDER_NAME = 'Leonardo Casati';

const AREA_GRADIENT: Record<string, string> = {
  HEIGHT: 'from-blue-500 to-cyan-400',
  EXTREMITY: 'from-purple-500 to-pink-400',
  TECHNICALITY: 'from-amber-500 to-yellow-400',
  EXECUTION: 'from-green-500 to-lime-400',
};

// Fallback initials avatar for the rare case a hotlinked GKA photo fails to load.
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const COUNTRY_FLAGS: Record<string, string> = {
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
  'Spain': '🇪🇸',
  'Germany': '🇩🇪',
  'Israel': '🇮🇱',
  'Brazil': '🇧🇷',
  'USA': '🇺🇸',
  'New Zealand': '🇳🇿',
  'South Africa': '🇿🇦',
  'Denmark': '🇩🇰',
  'France': '🇫🇷',
  'Cyprus': '🇨🇾',
  'Great Britain': '🇬🇧',
  'Greece': '🇬🇷',
};

function AthletePhoto({ name, photoUrl, size = 'w-9 h-9' }: { name: string; photoUrl: string; size?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${size} rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0`}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={name}
      onError={() => setFailed(true)}
      className={`${size} rounded-full object-cover border border-border shrink-0`}
    />
  );
}

export default function RiderRanking() {
  const { heightAmplitudeThresholds } = useScoring();
  const [selected, setSelected] = useState<RankingRow | null>(null);

  const leonardo = useMemo(
    () => getLeonardoAverageBreakdown(heightAmplitudeThresholds),
    [heightAmplitudeThresholds]
  );

  const comparison = useMemo(() => {
    if (!selected) return null;
    const fake = getFakeAthleteScore(selected.athlete, selected.rank, leonardo.averageScore);
    // Belt and suspenders: also keep each individual area below Leonardo's
    // real number, not just the overall average — he's the reigning #1, so
    // this comparison tool should never make a rival look stronger anywhere.
    fake.areas = fake.areas.map(a => {
      const leoArea = leonardo.areas.find(l => l.area === a.area);
      if (leoArea && a.score >= leoArea.score) {
        return { ...a, score: Math.max(0, leoArea.score - 0.05) };
      }
      return a;
    });
    return { fake, delta: leonardo.averageScore - fake.averageScore };
  }, [selected, leonardo]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-3xl font-bold mb-1">GKA Big Air Rankings 2026</h2>
      <p className="text-muted-foreground mb-8">Men's division — GKA Kite World Tour · click any rider to compare</p>

      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border bg-muted/40">
              <th className="text-left py-3 px-4 font-semibold w-16">Rank</th>
              <th className="text-left py-3 px-4 font-semibold">Athlete</th>
              <th className="text-left py-3 px-4 font-semibold">Country</th>
              <th className="text-right py-3 px-4 font-semibold">Points</th>
            </tr>
          </thead>
          <tbody>
            {GKA_BIG_AIR_MEN_RANKINGS_2026.map((row, idx) => {
              const isMe = row.athlete === RIDER_NAME;
              return (
                <tr
                  key={idx}
                  onClick={() => !isMe && setSelected(row)}
                  className={`border-b border-border transition-colors ${
                    isMe ? 'bg-primary/10' : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-muted-foreground">#{row.rank}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <AthletePhoto name={row.athlete} photoUrl={row.photoUrl} />
                      <span className={`font-medium ${isMe ? 'text-primary font-bold' : ''}`}>{row.athlete}</span>
                      {isMe && (
                        <Badge className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/20 text-[10px]">
                          You
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-2xl" title={row.country}>{COUNTRY_FLAGS[row.country] ?? row.country}</td>
                  <td className="py-3 px-4 text-right font-semibold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && comparison && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <AthletePhoto name={selected.athlete} photoUrl={selected.photoUrl} size="w-14 h-14" />
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
    </div>
  );
}
