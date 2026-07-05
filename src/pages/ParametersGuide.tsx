import { useScoring } from '@/contexts/ScoringContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { ParametersAccordion } from '@/components/ParametersAccordion';

export default function ParametersGuide() {
  const { activePreset, weights } = useScoring();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Scoring Parameters Guide</h1>
          <p className="text-muted-foreground">
            Complete reference for all judging areas and scoring parameters
          </p>
          <p className="text-sm text-muted-foreground mt-3 max-w-3xl">
            HEIGHT & AMPLITUDE, EXTREMITY and TECHNICALITY are all <span className="font-semibold text-foreground">objective</span> — measured from real Woo sensor data or fixed, verifiable categories. EXECUTION is the only <span className="font-semibold text-foreground">subjective</span> area: it's scored live by the judges.
          </p>
        </div>

        {/* Active Preset Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Active Preset: {activePreset}
            </CardTitle>
            <CardDescription>Current weight distribution across judging areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">HEIGHT & AMPLITUDE</div>
                <div className="text-2xl font-bold text-cyan-600">{weights.HEIGHT}%</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">EXTREMITY</div>
                <div className="text-2xl font-bold text-pink-600">{weights.EXTREMITY}%</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">TECHNICALITY</div>
                <div className="text-2xl font-bold text-amber-400">{weights.TECHNICALITY}%</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">EXECUTION</div>
                <div className="text-2xl font-bold text-lime-400">{weights.EXECUTION}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ParametersAccordion />

        {/* Landing Outcomes & Penalties */}
        <Card className="mt-8 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-destructive" />
              Landing Outcomes & Penalties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-primary text-primary-foreground">Clean</Badge>
              <p className="text-sm text-muted-foreground flex-1">
                Perfect landing with no penalties. All parameters apply normally.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Butt</Badge>
              <p className="text-sm text-muted-foreground flex-1">
                Landing on butt. <span className="font-semibold text-foreground">50% penalty</span> applied to final score.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="destructive">Crash</Badge>
              <p className="text-sm text-muted-foreground flex-1">
                Failed landing. <span className="font-semibold text-foreground">Automatic zero score</span> regardless of other parameters.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
