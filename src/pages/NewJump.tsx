import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoring } from '@/contexts/ScoringContext';
import { JumpParameters, LandingOutcome } from '@/types/scoring';
import { calculateScore, PRESET_CONFIG, HEIGHT_BRACKET_POINTS, AMPLITUDE_BRACKET_POINTS, heightBracketLabel, amplitudeBracketLabel } from '@/lib/scoring';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const BRACKET_COLORS = ['text-red-600', 'text-amber-600', 'text-lime-600', 'text-green-600'];

const getSliderValueColor = (value: number): string => {
  const percentage = (value / 10) * 100;
  if (percentage <= 25) return 'text-red-600';
  if (percentage <= 50) return 'text-amber-600';
  if (percentage <= 75) return 'text-lime-600';
  return 'text-green-600';
};

const getProgressGradient = (percentage: number): string => {
  if (percentage < 50) return 'from-red-500 to-amber-500';
  if (percentage < 75) return 'from-amber-500 to-lime-500';
  return 'from-lime-500 to-green-500';
};

interface JumpFormState {
  landingOutcome: LandingOutcome;
  heightParams: { height: string; amplitude: string };
  extremityParams: { kite_angle: string; yank_power: string; free_fall: string };
  technicalityParams: { rotations: string; rotation_axis: string; board_off: string; board_flip: string; board_tic_tac: string };
  executionParams: { style: number; stability_control: number; landing_control: number; board_control: number; kite_control: number };
}

const initialFormState: JumpFormState = {
  landingOutcome: 'clean',
  heightParams: { height: '', amplitude: '' },
  extremityParams: { kite_angle: '', yank_power: '', free_fall: '' },
  technicalityParams: { rotations: '', rotation_axis: '', board_off: '', board_flip: '', board_tic_tac: '' },
  executionParams: { style: 0, stability_control: 0, landing_control: 0, board_control: 0, kite_control: 0 },
};

export default function NewJump() {
  const navigate = useNavigate();
  const {
    weights, activePreset,
    jump1Params, jump2Params, jump3Params,
    setJump1Result, setJump2Result, setJump3Result,
    setJump1Params, setJump2Params, setJump3Params,
    heightAmplitudeThresholds,
  } = useScoring();

  const heightBrackets = (['b1', 'b2', 'b3', 'b4'] as const).map((b) => ({
    value: b,
    label: heightBracketLabel(b, heightAmplitudeThresholds.height),
    points: HEIGHT_BRACKET_POINTS[b],
  }));
  const amplitudeBrackets = (['b1', 'b2', 'b3', 'b4'] as const).map((b) => ({
    value: b,
    label: amplitudeBracketLabel(b, heightAmplitudeThresholds.amplitude),
    points: AMPLITUDE_BRACKET_POINTS[b],
  }));
  
  const [activeTab, setActiveTab] = useState('jump1');
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [jump1, setJump1] = useState<JumpFormState>(initialFormState);
  const [jump2, setJump2] = useState<JumpFormState>(initialFormState);
  const [jump3, setJump3] = useState<JumpFormState>(initialFormState);

  const showOverallImpression = PRESET_CONFIG[activePreset]?.hasOverallImpression ?? false;

  // Load saved params
  useEffect(() => {
    if (jump1Params) setJump1(convertParamsToFormState(jump1Params));
    if (jump2Params) setJump2(convertParamsToFormState(jump2Params));
    if (jump3Params) setJump3(convertParamsToFormState(jump3Params));
  }, [jump1Params, jump2Params, jump3Params]);

  const convertParamsToFormState = (params: JumpParameters): JumpFormState => ({
    landingOutcome: params.landingOutcome,
    heightParams: { height: params.HEIGHT.height, amplitude: params.HEIGHT.amplitude },
    extremityParams: params.EXTREMITY,
    technicalityParams: {
      rotations: params.TECHNICALITY.rotations,
      rotation_axis: params.TECHNICALITY.rotation_axis,
      board_off: params.TECHNICALITY.board_off,
      board_flip: params.TECHNICALITY.board_flip || '',
      board_tic_tac: params.TECHNICALITY.board_tic_tac || '',
    },
    executionParams: {
      style: (params.EXECUTION.style * 10) / 0.4,
      stability_control: (params.EXECUTION.stability_control * 10) / 0.4,
      landing_control: (params.EXECUTION.landing_control * 10) / 0.4,
      board_control: (params.EXECUTION.board_control * 10) / 0.4,
      kite_control: (params.EXECUTION.kite_control * 10) / 0.4,
    },
  });

  const convertFormStateToParams = (form: JumpFormState): JumpParameters => ({
    landingOutcome: form.landingOutcome,
    HEIGHT: form.heightParams,
    EXTREMITY: form.extremityParams,
    TECHNICALITY: form.technicalityParams,
    EXECUTION: {
      style: (form.executionParams.style * 0.4) / 10,
      stability_control: (form.executionParams.stability_control * 0.4) / 10,
      landing_control: (form.executionParams.landing_control * 0.4) / 10,
      board_control: (form.executionParams.board_control * 0.4) / 10,
      kite_control: (form.executionParams.kite_control * 0.4) / 10,
    },
  });

  const isJumpValid = (jump: JumpFormState): boolean => {
    if (jump.landingOutcome === 'crash') return true;
    
    const missing: string[] = [];
    if (weights.HEIGHT > 0) {
      if (!jump.heightParams.height) missing.push('Height');
      if (!jump.heightParams.amplitude) missing.push('Amplitude');
    }
    if (weights.EXTREMITY > 0) {
      if (!jump.extremityParams.kite_angle) missing.push('Kite Angle');
      if (!jump.extremityParams.yank_power) missing.push('Yank Power');
      if (!jump.extremityParams.free_fall) missing.push('Free Fall');
    }
    if (weights.TECHNICALITY > 0) {
      if (!jump.technicalityParams.rotations) missing.push('Rotations');
      if (!jump.technicalityParams.rotation_axis) missing.push('Rotation Axis');
      if (!jump.technicalityParams.board_off) missing.push('Board Off');
      if (jump.technicalityParams.board_off === 'yes') {
        if (!jump.technicalityParams.board_flip) missing.push('Board Flip');
        if (!jump.technicalityParams.board_tic_tac) missing.push('Board Tic Tac');
      }
    }
    return missing.length === 0;
  };

  const handleCalculateAll = async () => {
    if (!isJumpValid(jump1) || !isJumpValid(jump2) || !isJumpValid(jump3)) {
      return;
    }

    setIsCalculating(true);

    const params1 = convertFormStateToParams(jump1);
    const params2 = convertFormStateToParams(jump2);
    const params3 = convertFormStateToParams(jump3);

    await new Promise(resolve => setTimeout(resolve, 300));

    const result1 = calculateScore(params1, weights, activePreset);
    const result2 = calculateScore(params2, weights, activePreset);
    const result3 = calculateScore(params3, weights, activePreset);

    setJump1Result(result1);
    setJump2Result(result2);
    setJump3Result(result3);

    setJump1Params(params1);
    setJump2Params(params2);
    setJump3Params(params3);

    setIsCalculating(false);

    if (showOverallImpression) {
      navigate('/overall-impression');
    } else {
      navigate('/result');
    }
  };

  const renderJumpForm = (jump: JumpFormState, setJump: React.Dispatch<React.SetStateAction<JumpFormState>>, jumpNumber: number) => {
    const isCrash = jump.landingOutcome === 'crash';
    const isValid = isJumpValid(jump);
    const liveScore = calculateScore(convertFormStateToParams(jump), weights, activePreset).totalScore;
    const livePercentage = (liveScore / 10) * 100;

    return (
      <div className="space-y-6">
        <Card className="p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-card to-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projected Total (live)</h3>
            <span className="text-2xl font-black text-primary tabular-nums">
              {liveScore.toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> / 10</span>
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(livePercentage)} transition-all duration-300`}
              style={{ width: `${livePercentage}%` }}
            />
          </div>
        </Card>

        <Card className="p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Landing Outcome</h3>
            {isValid && <Badge className="bg-green-600"><Check className="w-3 h-3 mr-1" />Complete</Badge>}
          </div>
          <Select value={jump.landingOutcome} onValueChange={(v) => setJump({ ...jump, landingOutcome: v as LandingOutcome })}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clean">Clean</SelectItem>
              <SelectItem value="butt">Butt</SelectItem>
              <SelectItem value="crash">Crash</SelectItem>
            </SelectContent>
          </Select>

          {isCrash && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-destructive font-medium">Crash: total score 0</p>
            </div>
          )}

          {jump.landingOutcome === 'butt' && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500 rounded-lg">
              <p className="text-amber-700 font-medium">⚠️ 50% Penalty</p>
            </div>
          )}
        </Card>

        {!isCrash && (
          <>
            {weights.HEIGHT > 0 && (
              <Card className="p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-semibold mb-6">HEIGHT & AMPLITUDE</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor={`height-${jumpNumber}`} className="text-base mb-2 block">Height</Label>
                    <Select value={jump.heightParams.height} onValueChange={(v) => setJump({ ...jump, heightParams: { ...jump.heightParams, height: v } })}>
                      <SelectTrigger id={`height-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {heightBrackets.map((b, i) => (
                          <SelectItem key={b.value} value={b.value} className={BRACKET_COLORS[i]}>
                            {b.label} ({b.points} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`amplitude-${jumpNumber}`} className="text-base mb-2 block">Amplitude</Label>
                    <Select value={jump.heightParams.amplitude} onValueChange={(v) => setJump({ ...jump, heightParams: { ...jump.heightParams, amplitude: v } })}>
                      <SelectTrigger id={`amplitude-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {amplitudeBrackets.map((b, i) => (
                          <SelectItem key={b.value} value={b.value} className={BRACKET_COLORS[i]}>
                            {b.label} ({b.points} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            {weights.EXTREMITY > 0 && (
              <Card className="p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-semibold mb-6">EXTREMITY</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor={`kite-angle-${jumpNumber}`} className="text-base mb-2 block">Kite Angle</Label>
                    <Select value={jump.extremityParams.kite_angle} onValueChange={(v) => setJump({ ...jump, extremityParams: { ...jump.extremityParams, kite_angle: v } })}>
                      <SelectTrigger id={`kite-angle-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high" className="text-red-600">high angle (0° - 30°) - 0 pt</SelectItem>
                        <SelectItem value="average" className="text-amber-600">average angle (31° - 50°) - 0.25 pt</SelectItem>
                        <SelectItem value="low" className="text-lime-600">low angle (51° - 70°) - 0.50 pt</SelectItem>
                        <SelectItem value="super_low" className="text-green-600">super low (71° - 90°+) - 0.75 pt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`yank-power-${jumpNumber}`} className="text-base mb-2 block">Yank Power</Label>
                    <Select value={jump.extremityParams.yank_power} onValueChange={(v) => setJump({ ...jump, extremityParams: { ...jump.extremityParams, yank_power: v } })}>
                      <SelectTrigger id={`yank-power-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-red-600">None (0 points)</SelectItem>
                        <SelectItem value="low" className="text-amber-600">Low (0.25 points)</SelectItem>
                        <SelectItem value="medium" className="text-lime-600">Medium (0.5 points)</SelectItem>
                        <SelectItem value="bomb" className="text-green-600">Bomb (0.75 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`free-fall-${jumpNumber}`} className="text-base mb-2 block">Free Fall</Label>
                    <Select value={jump.extremityParams.free_fall} onValueChange={(v) => setJump({ ...jump, extremityParams: { ...jump.extremityParams, free_fall: v } })}>
                      <SelectTrigger id={`free-fall-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor" className="text-red-600">Poor (0 points)</SelectItem>
                        <SelectItem value="medium" className="text-amber-600">Medium (0.25 points)</SelectItem>
                        <SelectItem value="high" className="text-lime-600">High (0.5 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            {weights.TECHNICALITY > 0 && (
              <Card className="p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-semibold mb-6">TECHNICALITY</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor={`rotations-${jumpNumber}`} className="text-base mb-2 block">Rotations</Label>
                    <Select value={jump.technicalityParams.rotations} onValueChange={(v) => setJump({ ...jump, technicalityParams: { ...jump.technicalityParams, rotations: v } })}>
                      <SelectTrigger id={`rotations-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="text-red-600">1 rotation (0.25 pts)</SelectItem>
                        <SelectItem value="2" className="text-amber-600">2 rotations (0.50 pts)</SelectItem>
                        <SelectItem value="3" className="text-lime-600">3 rotations (0.75 pts)</SelectItem>
                        <SelectItem value="4+" className="text-green-600">4+ rotations (1.0 pts — max)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`rotation-axis-${jumpNumber}`} className="text-base mb-2 block">Rotation Axis</Label>
                    <Select value={jump.technicalityParams.rotation_axis} onValueChange={(v) => setJump({ ...jump, technicalityParams: { ...jump.technicalityParams, rotation_axis: v } })}>
                      <SelectTrigger id={`rotation-axis-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vertical" className="text-amber-600">Vertical (0.2 points)</SelectItem>
                        <SelectItem value="horizontal" className="text-lime-600">Horizontal (0.5 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`board-off-${jumpNumber}`} className="text-base mb-2 block">Board Off</Label>
                    <Select value={jump.technicalityParams.board_off} onValueChange={(v) => setJump({ ...jump, technicalityParams: { ...jump.technicalityParams, board_off: v, board_flip: v === 'no' ? '' : jump.technicalityParams.board_flip, board_tic_tac: v === 'no' ? '' : jump.technicalityParams.board_tic_tac } })}>
                      <SelectTrigger id={`board-off-${jumpNumber}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no" className="text-red-600">No (0 points)</SelectItem>
                        <SelectItem value="yes" className="text-lime-600">Yes (1.0 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {jump.technicalityParams.board_off === 'yes' && (
                    <>
                      <div>
                        <Label htmlFor={`board-flip-${jumpNumber}`} className="text-base mb-2 block">Board Flip</Label>
                        <Select value={jump.technicalityParams.board_flip} onValueChange={(v) => setJump({ ...jump, technicalityParams: { ...jump.technicalityParams, board_flip: v } })}>
                          <SelectTrigger id={`board-flip-${jumpNumber}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" className="text-gray-600">0 flips — 0 pt</SelectItem>
                            <SelectItem value="1" className="text-amber-600">1 flip (0.10 pts)</SelectItem>
                            <SelectItem value="2" className="text-lime-600">2 flips (0.20 pts)</SelectItem>
                            <SelectItem value="3+" className="text-green-600">3+ flips (0.30 pts — max)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`board-tic-tac-${jumpNumber}`} className="text-base mb-2 block">Board Tic Tac</Label>
                        <Select value={jump.technicalityParams.board_tic_tac} onValueChange={(v) => setJump({ ...jump, technicalityParams: { ...jump.technicalityParams, board_tic_tac: v } })}>
                          <SelectTrigger id={`board-tic-tac-${jumpNumber}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" className="text-gray-600">0 tic-tacs — 0 pt</SelectItem>
                            <SelectItem value="1" className="text-amber-600">1 tic-tac (0.07 pts)</SelectItem>
                            <SelectItem value="2" className="text-lime-600">2 tic-tacs (0.14 pts)</SelectItem>
                            <SelectItem value="3+" className="text-green-600">3+ tic-tacs (0.20 pts — max)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {weights.EXECUTION > 0 && (
              <Card className="p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-semibold mb-6">EXECUTION</h3>
                <div className="space-y-6">
                  {Object.entries({
                    style: 'Style',
                    stability_control: 'Stability & Control',
                    landing_control: 'Landing Control',
                    board_control: 'Board Control',
                    kite_control: 'Kite Control',
                  }).map(([key, label]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor={`${key}-${jumpNumber}`} className="text-base">{label}</Label>
                        <span className={`text-sm font-semibold ${getSliderValueColor(jump.executionParams[key as keyof typeof jump.executionParams])}`}>
                          {jump.executionParams[key as keyof typeof jump.executionParams].toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        id={`${key}-${jumpNumber}`}
                        min={0}
                        max={10}
                        step={0.1}
                        value={[jump.executionParams[key as keyof typeof jump.executionParams]]}
                        onValueChange={([v]) => setJump({ ...jump, executionParams: { ...jump.executionParams, [key]: v } })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  const allJumpsValid = isJumpValid(jump1) && isJumpValid(jump2) && isJumpValid(jump3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-3xl font-bold mb-2">New Score</h2>
      <p className="text-muted-foreground mb-8">Fill in the parameters for all 3 jumps</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jump1" className="relative">
            Jump 1
            {isJumpValid(jump1) && <Check className="w-4 h-4 ml-2 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="jump2" className="relative">
            Jump 2
            {isJumpValid(jump2) && <Check className="w-4 h-4 ml-2 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="jump3" className="relative">
            Jump 3
            {isJumpValid(jump3) && <Check className="w-4 h-4 ml-2 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jump1" className="mt-6">
          {renderJumpForm(jump1, setJump1, 1)}
        </TabsContent>

        <TabsContent value="jump2" className="mt-6">
          {renderJumpForm(jump2, setJump2, 2)}
        </TabsContent>

        <TabsContent value="jump3" className="mt-6">
          {renderJumpForm(jump3, setJump3, 3)}
        </TabsContent>
      </Tabs>

      {!allJumpsValid && (
        <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 font-medium">
            Please complete all 3 jumps before calculating
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleCalculateAll}
        disabled={isCalculating || !allJumpsValid}
        className="w-full h-12 text-lg font-semibold"
        size="lg"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            Calculate All Jumps {showOverallImpression && '& Continue to Overall Impression'}
          </>
        )}
      </Button>
    </div>
  );
}
