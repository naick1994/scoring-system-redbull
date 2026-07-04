import { useScoring } from '@/contexts/ScoringContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PARAMETER_CONFIG, PRESET_CONFIG, OVERALL_IMPRESSION_CONFIG, heightBracketLabel, amplitudeBracketLabel, YANK_POWER_RANGES, FREE_FALL_RANGES, KITE_ANGLE_RANGES } from '@/lib/scoring';
import { Info } from 'lucide-react';

export default function ParametersGuide() {
  const { activePreset, weights, heightAmplitudeThresholds } = useScoring();
  const ht = heightAmplitudeThresholds.height;
  const at = heightAmplitudeThresholds.amplitude;
  const showOverallImpression = PRESET_CONFIG[activePreset]?.hasOverallImpression ?? false;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Scoring Parameters Guide</h1>
          <p className="text-muted-foreground">
            Complete reference for all judging areas and scoring parameters
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

        {/* Parameters Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {/* J1 - Take-off Area */}
          <AccordionItem value="j1" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <div>
                  <div className="text-lg font-semibold">HEIGHT & AMPLITUDE</div>
                  <div className="text-sm text-muted-foreground">Weight: {weights.HEIGHT}%</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                {/* Height */}
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.HEIGHT.height.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Maximum vertical height achieved during the jump
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">{heightBracketLabel('b1', ht)}: 0 pts</Badge>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">{heightBracketLabel('b2', ht)}: 0.6 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">{heightBracketLabel('b3', ht)}: 0.9 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">{heightBracketLabel('b4', ht)}: 1.5 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.HEIGHT.height.max} points</div>
                </div>

                {/* Amplitude */}
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.HEIGHT.amplitude.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Horizontal distance covered during the jump
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">{amplitudeBracketLabel('b1', at)}: 0 pts</Badge>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">{amplitudeBracketLabel('b2', at)}: 0.33 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">{amplitudeBracketLabel('b3', at)}: 0.67 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">{amplitudeBracketLabel('b4', at)}: 1.0 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.HEIGHT.amplitude.max} points</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* EXTREMITY */}
          <AccordionItem value="extremity" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                <div>
                  <div className="text-lg font-semibold">EXTREMITY</div>
                  <div className="text-sm text-muted-foreground">Weight: {weights.EXTREMITY}%</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                {/* Kite Angle */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.EXTREMITY.kite_angle.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Kite position during the kiteloop (lower is riskier and scores higher)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">High ({KITE_ANGLE_RANGES.high}): 0 pts</Badge>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium ({KITE_ANGLE_RANGES.average}): 0.25 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">Low ({KITE_ANGLE_RANGES.low}): 0.5 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Super Low ({KITE_ANGLE_RANGES.super_low}): 0.75 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.EXTREMITY.kite_angle.max} points · measured as angle from zenith (0° overhead, 180° level with the rider)</div>
                </div>

                {/* Yank Power */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.EXTREMITY.yank_power.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Force and explosiveness of the take-off
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">None ({YANK_POWER_RANGES.none}): 0 pts</Badge>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Low ({YANK_POWER_RANGES.low}): 0.25 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">Medium ({YANK_POWER_RANGES.medium}): 0.5 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Bomb ({YANK_POWER_RANGES.bomb}): 0.75 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.EXTREMITY.yank_power.max} points · measured as peak IMU acceleration (g-force) at the loading moment</div>
                </div>

                {/* Free Fall */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.EXTREMITY.free_fall.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Quality and duration of free fall after take-off
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">Poor ({FREE_FALL_RANGES.poor}): 0 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">Medium ({FREE_FALL_RANGES.medium}): 0.25 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">High ({FREE_FALL_RANGES.high}): 0.5 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.EXTREMITY.free_fall.max} points · measured as time spent near 0g during the jump</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* TECHNICALITY */}
          <AccordionItem value="technicality" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                <div>
                  <div className="text-lg font-semibold">TECHNICALITY</div>
                  <div className="text-sm text-muted-foreground">Weight: {weights.TECHNICALITY}%</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                {/* Rotations */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.TECHNICALITY.rotations.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Number of front or back rotations completed during the jump
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">1 rotation: 0.25 pts</Badge>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">2 rotations: 0.50 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">3 rotations: 0.75 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">4+ rotations: 1.0 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.TECHNICALITY.rotations.max} points</div>
                </div>

                {/* Rotation Axis */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.TECHNICALITY.rotation_axis.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Axis of rotation - horizontal rotations (front/back flips) score higher than vertical rotations (spins)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Vertical: 0.2 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">Horizontal: 0.5 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.TECHNICALITY.rotation_axis.max} points</div>
                </div>

                {/* Board Off */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.TECHNICALITY.board_off.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Whether the board is released from the feet during the trick
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">No: 0 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">Yes: 0.3 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.TECHNICALITY.board_off.max} points</div>
                </div>

                {/* Board Flip */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.TECHNICALITY.board_flip.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Number of board flips performed (only applies if Board Off = Yes)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">1 flip: 0.15 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">2 flips: 0.25 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">3+ flips: 0.4 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.TECHNICALITY.board_flip.max} points (conditional)</div>
                </div>

                {/* Board Spin */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold mb-2 text-foreground">{PARAMETER_CONFIG.TECHNICALITY.board_spin.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Number of board spins performed (only applies if Board Off = Yes)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">1 spin: 0.1 pts</Badge>
                    <Badge variant="outline" className="bg-lime-500/20 text-lime-400 border-lime-500/30">2 spins: 0.2 pts</Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">3+ spins: 0.3 pts</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Max: {PARAMETER_CONFIG.TECHNICALITY.board_spin.max} points (conditional)</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* J4 - Overall Impression */}
          <AccordionItem value="j4" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-lime-500 shrink-0" />
                <div>
                  <div className="text-lg font-semibold">EXECUTION</div>
                  <div className="text-sm text-muted-foreground">Weight: {weights.EXECUTION}%</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  All EXECUTION parameters are judged on a continuous scale from 0 to 10.
                </p>

                {Object.entries(PARAMETER_CONFIG.EXECUTION).map(([key, config]) => (
                  <div key={key} className="border-l-4 border-lime-500 pl-4">
                    <h4 className="font-semibold mb-2 text-foreground">{config.label}</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-destructive via-amber-500 via-lime-500 to-green-500 w-full"></div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">0 - 10 pts</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Overall Impression (conditional) */}
          {showOverallImpression && (
            <AccordionItem value="overall-impression" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div>
                    <div className="text-lg font-semibold">OVERALL IMPRESSION</div>
                    <div className="text-sm text-muted-foreground">Max: 10 points total across all criteria</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Rate 11 criteria from 0 to 10. The sum of all criteria is automatically normalized to a maximum of 10 points.
                  </p>

                  {Object.entries(OVERALL_IMPRESSION_CONFIG).map(([key, config]) => (
                    <div key={key} className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-2 text-foreground">{config.label}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {config.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-destructive via-amber-500 via-lime-500 to-green-500 w-full"></div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">0 - {config.max} pts</Badge>
                      </div>
                    </div>
                  ))}

                  <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary mt-6">
                    <p className="text-sm text-foreground font-medium mb-2">📝 Scoring Calculation</p>
                    <p className="text-sm text-muted-foreground">
                      Each criterion can be rated from 0 to 10 for ease of judging. 
                      The final score is calculated as: (Sum of all criteria) / 11, resulting in a maximum total of 10 points.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

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
