import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GKA_BIG_AIR_MEN_RANKINGS_2026 } from '@/data/gkaRankings';

const RIDER_NAME = 'Leonardo Casati';

export default function RiderRanking() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-3xl font-bold mb-1">GKA Big Air Rankings 2026</h2>
      <p className="text-muted-foreground mb-8">Men's division — GKA Kite World Tour</p>

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
                  className={`border-b border-border transition-colors ${
                    isMe ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-muted-foreground">#{row.rank}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${isMe ? 'text-primary font-bold' : ''}`}>{row.athlete}</span>
                    {isMe && (
                      <Badge className="ml-2 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/20 text-[10px]">
                        You
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{row.country}</td>
                  <td className="py-3 px-4 text-right font-semibold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
