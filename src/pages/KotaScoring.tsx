import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { COMBOS, MECHANICS, MECHANIC_KEYS, denomFor } from '@/data/kotaScoring';

export default function KotaScoring() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Badge variant="secondary" className="mb-4">Change the System · documento interno</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
          Come cambierebbe il punteggio <span className="text-primary">del King of the Air.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Due leve per rendere il punteggio più giusto: quanti salti contare, e come premiare un trick mai visto
          prima. Ogni combinazione delle due ha la sua pagina, spiegata a fondo.
        </p>

        <Card className="mb-10">
          <CardContent className="pt-6 space-y-3">
            <h2 className="font-semibold text-lg mb-1">Come funziona oggi</h2>
            <p className="text-foreground/90">Contano solo i <span className="font-semibold">3 salti migliori</span> di ogni rider.</p>
            <p className="text-foreground/90">Si aggiungono fino a <span className="font-semibold">7 punti</span> se fa trick mai visti prima: oggi vale tutto o niente, sopra voto 6.5 punto pieno, sotto zero.</p>
            <p className="text-foreground/90">I giudici aggiungono fino a <span className="font-semibold">3 punti</span> a loro discrezione. Questa parte non cambia mai in nessuna proposta.</p>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-2">Tutte le combinazioni</h2>
        <p className="text-muted-foreground mb-6">
          5 modi di premiare un trick nuovo, per 3 conteggi di salti possibili: 15 combinazioni. La prima riga di
          ogni gruppo è la meccanica spiegata in generale, poi 3, 5 o 7 salti contati. Clicca una riga per il
          dettaglio.
        </p>

        <div className="space-y-8 mb-12">
          {MECHANIC_KEYS.map((mk) => (
            <div key={mk}>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="font-semibold">{MECHANICS[mk].label}</h3>
                {mk === 'A' && <span className="text-xs text-muted-foreground">(sistema di oggi)</span>}
                {mk === 'B' && <span className="text-xs text-muted-foreground">(proposta ricevuta da altri giudici, WindGames)</span>}
              </div>
              <Card className="overflow-hidden">
                {COMBOS.filter((c) => c.mechanic === mk).map((c, i, arr) => (
                  <Link
                    key={c.id}
                    to={`/kota/${c.id}`}
                    className={
                      'flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors ' +
                      (i < arr.length - 1 ? 'border-b border-border' : '')
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-primary min-w-[64px] shrink-0 whitespace-nowrap">{c.id.toUpperCase()}</span>
                      <span className="text-sm">
                        migliori <span className="font-semibold">{c.jumps}</span> salti
                        <span className="text-muted-foreground"> · su {denomFor(c.jumps)} punti totali</span>
                      </span>
                      {c.isBaseline && <Badge variant="secondary" className="ml-1">baseline</Badge>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </Card>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground border-t border-border pt-6">
          Change the System · documento interno · dati verificati contro il risultato ufficiale della gara
        </p>
      </div>
    </div>
  );
}
