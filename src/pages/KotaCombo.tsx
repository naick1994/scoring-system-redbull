import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import {
  comboById,
  computeCombo,
  rankOf,
  denomFor,
  fmt,
  MECHANICS,
  type JumpCount,
  COMBOS,
} from '@/data/kotaScoring';

const EXAMPLE_JUMPS: Record<JumpCount, number[]> = {
  3: [8, 7, 6],
  5: [8, 7, 6, 5, 4],
  7: [8, 7, 6, 5, 4, 3, 2],
};

const EXAMPLE_VOTES = [5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5];

export default function KotaCombo() {
  const { combo: comboId } = useParams<{ combo: string }>();
  const combo = comboId ? comboById(comboId) : undefined;

  if (!combo) {
    return (
      <div className="min-h-screen bg-background text-foreground py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-muted-foreground mb-4">Combinazione non trovata.</p>
          <Link to="/kota" className="text-primary inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Torna a tutte le combinazioni
          </Link>
        </div>
      </div>
    );
  }

  const mech = MECHANICS[combo.mechanic];
  const baseline = COMBOS.find((c) => c.isBaseline)!;
  const results = computeCombo(combo);
  const ranks = rankOf(results);
  const baselineResults = combo.isBaseline ? results : computeCombo(baseline);
  const baselineRanks = rankOf(baselineResults);

  const example = EXAMPLE_JUMPS[combo.jumps];
  const exampleSum = example.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background text-foreground py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/kota" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Tutte le combinazioni
        </Link>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant={combo.isBaseline ? 'secondary' : 'outline'}>
            {combo.isBaseline ? 'Sistema di oggi, baseline' : 'Proposta'}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">{combo.id.toUpperCase()}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
          {mech.label}, <span className="text-primary">migliori {combo.jumps} salti</span>
        </h1>
        {combo.note && <p className="text-lg text-muted-foreground mb-4">{combo.note}</p>}
        <p className="text-sm text-muted-foreground mb-10">
          Punteggio totale su {denomFor(combo.jumps)} punti: {combo.jumps} salti (0-10 l&apos;uno) + fino a 7 punti
          bonus trick nuovo + fino a 3 punti voto giudici.
        </p>


        {/* Come funziona la regola del trick nuovo */}
        <h2 className="text-xl font-bold mb-2">Come premia un trick nuovo</h2>
        <p className="text-muted-foreground mb-6">{mech.explain}</p>

        <Card className="mb-12 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 text-xs font-semibold border-b border-border bg-muted/30 min-w-[320px]">
              <div className="px-4 py-3">Voto del trick</div>
              <div className="px-4 py-3 text-right text-muted-foreground">Come oggi</div>
              <div className="px-4 py-3 text-right text-primary">{mech.shortLabel}</div>
            </div>
            {EXAMPLE_VOTES.map((v) => (
              <div key={v} className="grid grid-cols-3 text-sm border-b border-border last:border-0 min-w-[320px]">
                <div className="px-4 py-2.5 font-mono tabular-nums text-muted-foreground">{fmt(v, 1)}</div>
                <div className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">{fmt(MECHANICS.A.points(v))}</div>
                <div className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold">{fmt(mech.points(v))}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quanti salti contano */}
        <h2 className="text-xl font-bold mb-2">Quanti salti contano: {combo.jumps}</h2>
        <p className="text-muted-foreground mb-6">
          {combo.jumps === 3
            ? 'Come nel sistema di oggi: solo i 3 salti migliori del rider fanno punteggio.'
            : `Invece dei soliti 3, qui si sommano i migliori ${combo.jumps} salti del rider: più costanza serve, meno conta un singolo salto fortunato.`}
        </p>
        <Card className="mb-12">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Un esempio semplice, con numeri inventati</p>
            <p className="text-foreground/90 mb-3">
              Un rider fa questi salti in un heat: <span className="font-mono">{example.join(', ')}</span>{combo.jumps === 3 ? ', 5, 4' : ''}.
            </p>
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 inline-block">
              <div className="font-mono text-lg">{example.join(' + ')} = <span className="font-bold text-primary">{exampleSum}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Dati veri */}
        <h2 className="text-xl font-bold mb-2">Con i dati veri della finale di Cold Hawaii</h2>
        <p className="text-muted-foreground mb-6">
          {combo.isBaseline
            ? 'Questi numeri sono il punteggio ufficiale della gara.'
            : 'Stesso heat, stessi salti, ricalcolati con questa combinazione.'}
        </p>

        <Card className="mb-2 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 text-xs font-semibold border-b border-border bg-muted/30 min-w-[520px]">
              <div className="px-4 py-3">Rider</div>
              <div className="px-4 py-3 text-right">Salti</div>
              <div className="px-4 py-3 text-right">Bonus trick</div>
              <div className="px-4 py-3 text-right">Totale</div>
              <div className="px-4 py-3 text-right">Posto</div>
            </div>
            {results.map((r, i) => {
              const delta = r.total - baselineResults[i].total;
              return (
                <div key={r.name} className="grid grid-cols-5 text-sm border-b border-border last:border-0 min-w-[520px]">
                  <div className="px-4 py-3 font-medium">{r.name}</div>
                  <div className="px-4 py-3 text-right font-mono tabular-nums">{fmt(r.jumpsSum)}</div>
                  <div className="px-4 py-3 text-right font-mono tabular-nums">{fmt(r.bonus)}</div>
                  <div className="px-4 py-3 text-right font-mono tabular-nums font-bold text-primary">
                    {fmt(r.total)}
                    {!combo.isBaseline && (
                      <span className={'ml-1.5 text-xs font-normal ' + (delta > 0.001 ? 'text-emerald-400' : delta < -0.001 ? 'text-red-400' : 'text-muted-foreground')}>
                        ({delta >= 0 ? '+' : ''}{fmt(delta)})
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 text-right">
                    {ranks[i]}°
                    {!combo.isBaseline && ranks[i] !== baselineRanks[i] && (
                      <span className="ml-1 text-xs text-secondary">(oggi {baselineRanks[i]}°)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <p className="text-sm text-muted-foreground mb-12">
          {combo.isBaseline ? (
            <><span className="text-emerald-400 font-semibold">✓</span> questi totali tornano identici al risultato ufficiale della gara.</>
          ) : (
            'Il delta tra parentesi è la differenza rispetto al sistema di oggi (stesso rider, stesso heat).'
          )}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-muted-foreground w-full mb-1">Altre combinazioni con questa meccanica:</span>
          {COMBOS.filter((c) => c.mechanic === combo.mechanic && c.id !== combo.id).map((c) => (
            <Link key={c.id} to={`/kota/${c.id}`}>
              <Badge variant="outline" className="hover:bg-muted/50 cursor-pointer">{c.id.toUpperCase()}</Badge>
            </Link>
          ))}
        </div>

        <Link to="/kota" className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Tutte le combinazioni
        </Link>
      </div>
    </div>
  );
}
