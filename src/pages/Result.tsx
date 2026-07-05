import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoring } from '@/contexts/ScoringContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Plus, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { calculateScore, PRESET_WEIGHTS, PRESET_CONFIG, OVERALL_IMPRESSION_CONFIG, heightBracketLabel, amplitudeBracketLabel, AREA_DISPLAY_NAMES, AREA_GRADIENT } from '@/lib/scoring';
import { EventPreset, HeightAmplitudeThresholds, JudgeOverride as JudgeOverrideType, ScoringResult } from '@/types/scoring';
import { JudgeOverride } from '@/components/JudgeOverride';

const effectiveScore = (result: ScoringResult): number => result.override?.score ?? result.totalScore;

const VALUE_LABELS: Record<string, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'super_low': 'Super Low',
  'none': 'None',
  'bomb': 'Bomb',
  'poor': 'Poor',
};

const formatValue = (paramLabel: string, value: string | number, thresholds: HeightAmplitudeThresholds): string => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (paramLabel === 'Height') return heightBracketLabel(value as 'b1' | 'b2' | 'b3' | 'b4', thresholds.height);
  if (paramLabel === 'Amplitude') return amplitudeBracketLabel(value as 'b1' | 'b2' | 'b3' | 'b4', thresholds.amplitude);
  return VALUE_LABELS[value] || value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
};

const getPointsColor = (points: number, max: number): string => {
  const percentage = (points / max) * 100;
  if (percentage <= 25) return 'text-red-400/80';
  if (percentage <= 50) return 'text-amber-400/80';
  if (percentage <= 75) return 'text-lime-400/80';
  return 'text-green-400/80';
};


export default function Result() {
  const navigate = useNavigate();
  const { 
    jump1Result, jump2Result, jump3Result,
    jump1Params, jump2Params, jump3Params,
    activePreset, setActivePreset, setWeights,
    setJump1Result, setJump2Result, setJump3Result,
    setJump1Params, setJump2Params, setJump3Params,
    overallImpressionScore,
    overallImpression,
    heightAmplitudeThresholds,
    realTotalReference, setRealTotalReference,
    jumpMeta, setJumpMeta,
  } = useScoring();
  
  const [selectedPreset, setSelectedPreset] = useState<EventPreset>(activePreset);

  const showOverallImpression = PRESET_CONFIG[activePreset]?.hasOverallImpression ?? false;

  if (!jump1Result || !jump2Result || !jump3Result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-12 shadow-[var(--shadow-card)] text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Jumps Calculated</h2>
          <p className="text-muted-foreground mb-6">
            Enter parameters for all 3 jumps to view results
          </p>
          <Button onClick={() => navigate('/')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Score
          </Button>
        </Card>
      </div>
    );
  }

  const totalJumpsScore = effectiveScore(jump1Result) + effectiveScore(jump2Result) + effectiveScore(jump3Result);
  const finalTotalScore = showOverallImpression ? totalJumpsScore + overallImpressionScore : totalJumpsScore;
  const maxScore = showOverallImpression ? 40 : 30;

  const handleNewJumps = () => {
    setJump1Params(null);
    setJump2Params(null);
    setJump3Params(null);
    setJump1Result(null);
    setJump2Result(null);
    setJump3Result(null);
    setRealTotalReference(null);
    setJumpMeta(null);
    navigate('/');
  };

  const handleEditParameters = () => {
    navigate('/');
  };

  const handlePresetChange = (preset: string) => {
    const newPreset = preset as EventPreset;
    setSelectedPreset(newPreset);
    
    const newWeights = PRESET_WEIGHTS[newPreset as keyof typeof PRESET_WEIGHTS] || PRESET_WEIGHTS.GKA;
    
    if (jump1Params && jump2Params && jump3Params) {
      const newResult1 = calculateScore(jump1Params, newWeights, newPreset);
      const newResult2 = calculateScore(jump2Params, newWeights, newPreset);
      const newResult3 = calculateScore(jump3Params, newWeights, newPreset);
      
      setJump1Result(newResult1);
      setJump2Result(newResult2);
      setJump3Result(newResult3);
      setActivePreset(newPreset);
      setWeights(newWeights);
      toast.success(`Preset changed to "${newPreset}" and scores recalculated`);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      jump1: jump1Result,
      jump2: jump2Result,
      jump3: jump3Result,
      overallImpression: showOverallImpression ? overallImpressionScore : null,
      totalScore: finalTotalScore,
      preset: activePreset,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `jumps-result-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('JSON exported');
  };

  const handleExportCSV = () => {
    let csv = 'Jump,Area,Parameter,Value,Points,Max\n';
    
    [jump1Result, jump2Result, jump3Result].forEach((result, jumpIdx) => {
      result.areaScores.forEach((area) => {
        area.parameters.forEach((param) => {
          csv += `"Jump ${jumpIdx + 1}","${area.area}","${param.label}","${param.value}",${param.points},${param.max}\n`;
        });
      });
      if (result.override) {
        csv += `"Jump ${jumpIdx + 1}","OVERRIDE","score=${result.override.score} (calculated ${result.totalScore})","${result.override.reason.replace(/"/g, '""')}",,\n`;
      }
    });

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const exportFileDefaultName = `jumps-result-${new Date().toISOString()}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('CSV exported');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <h2 className="text-3xl font-bold">Final Result</h2>
        <Button onClick={() => window.print()} variant="outline" className="gap-2 no-print">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <Card className="p-8 mb-6 shadow-[var(--shadow-card)] text-center bg-gradient-to-br from-card to-primary/5 print-avoid-break">
        <h3 className="text-lg text-muted-foreground mb-2">Final Total Score</h3>
        <div className="text-7xl font-bold text-primary mb-4">
          {finalTotalScore.toFixed(2)}
          <span className="text-4xl text-muted-foreground"> / {maxScore}</span>
        </div>
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <span className="text-muted-foreground">3 Jumps: </span>
            <span className="font-bold">{totalJumpsScore.toFixed(2)}</span>
          </div>
          {showOverallImpression && (
            <div>
              <span className="text-muted-foreground">Overall Impression: </span>
              <span className="font-bold">{overallImpressionScore.toFixed(2)}</span>
            </div>
          )}
        </div>
        {realTotalReference !== null && (
          <div className="text-sm text-muted-foreground mt-3">
            vs real total {realTotalReference.toFixed(2)}{' '}
            <span className={`font-bold ${finalTotalScore - realTotalReference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({finalTotalScore - realTotalReference >= 0 ? '+' : ''}{(finalTotalScore - realTotalReference).toFixed(2)})
            </span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { result: jump1Result, label: 'Jump 1' },
          { result: jump2Result, label: 'Jump 2' },
          { result: jump3Result, label: 'Jump 3' },
        ].map(({ result, label }, idx) => (
          <Card key={label} className="p-6 shadow-[var(--shadow-card)]">
            {jumpMeta?.[idx] ? (
              <div className="text-center mb-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-bold">{label} · {jumpMeta[idx].athlete}</h3>
                  <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                    {jumpMeta[idx].category}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-amber-400 mt-1">{jumpMeta[idx].trick}</p>
              </div>
            ) : (
              <h3 className="text-lg font-semibold mb-2 text-center">{label}</h3>
            )}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {effectiveScore(result).toFixed(2)}
                <span className="text-xl text-muted-foreground"> / 10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{result.penaltyReason}</p>
              {result.override && (
                <Badge variant="outline" className="mt-2 border-amber-500/40 text-amber-400 text-[10px]">
                  Overridden (calc. {result.totalScore.toFixed(2)})
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
        <CardHeader className="p-0 mb-6">
          <div className="flex items-center gap-2">
            <CardTitle>Jump 1 - Detailed Breakdown{jumpMeta?.[0] && ` · ${jumpMeta[0].athlete}`}</CardTitle>
            {jumpMeta?.[0] && (
              <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                {jumpMeta[0].category}
              </Badge>
            )}
          </div>
          {jumpMeta?.[0] && (
            <p className="text-sm font-semibold text-amber-400">{jumpMeta[0].trick}</p>
          )}
          <div className="mt-2 no-print">
            <JudgeOverride
              calculatedScore={jump1Result.totalScore}
              override={jump1Result.override}
              onApply={(override) => setJump1Result({ ...jump1Result, override })}
              onRemove={() => setJump1Result({ ...jump1Result, override: null })}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 mb-6">
            {jump1Result.areaScores.map((area, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{AREA_DISPLAY_NAMES[area.area] ?? area.area}</span>
                  <span className="font-semibold text-primary">
                    {area.finalScore.toFixed(2)} / {(area.weight * 10).toFixed(2)}
                  </span>
                </div>
                <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${AREA_GRADIENT[area.area]}`} />
                  <div
                    className="absolute inset-y-0 right-0 bg-muted rounded-r-full transition-all duration-500"
                    style={{ width: `${100 - (area.finalScore / (area.weight * 10)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold">Area</th>
                  <th className="text-left py-3 px-4 font-semibold">Parameter</th>
                  <th className="text-left py-3 px-4 font-semibold">Value</th>
                  <th className="text-center py-3 px-4 font-semibold">Points</th>
                  <th className="text-center py-3 px-4 font-semibold">Max</th>
                </tr>
              </thead>
              <tbody>
                {jump1Result.areaScores.map((area, areaIdx) => (
                  area.parameters.map((param, paramIdx) => (
                    <tr key={`${areaIdx}-${paramIdx}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                      {paramIdx === 0 && (
                        <td rowSpan={area.parameters.length} className="py-3 px-4 font-medium border-r border-border">
                          {AREA_DISPLAY_NAMES[area.area] ?? area.area}
                        </td>
                      )}
                      <td className="py-3 px-4">{param.label}</td>
                      <td className="py-3 px-4">{formatValue(param.label, param.value, heightAmplitudeThresholds)}</td>
                      <td className={`text-center py-3 px-4 font-semibold ${getPointsColor(param.points, param.max)}`}>{param.points.toFixed(2)}</td>
                      <td className="text-center py-3 px-4 text-muted-foreground">{param.max.toFixed(2)}</td>
                    </tr>
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td colSpan={3} className="py-3 px-4 text-right">Calculated Total</td>
                  <td className="text-center py-3 px-4 text-primary">{jump1Result.totalScore.toFixed(2)}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">10.00</td>
                </tr>
                {jump1Result.override && (
                  <tr className="border-t border-amber-500/30 bg-amber-500/10">
                    <td colSpan={3} className="py-3 px-4 text-right text-amber-400 font-semibold">
                      Judge Override — {jump1Result.override.reason}
                    </td>
                    <td className="text-center py-3 px-4 text-amber-400 font-bold">{jump1Result.override.score.toFixed(2)}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">10.00</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
        <CardHeader className="p-0 mb-6">
          <div className="flex items-center gap-2">
            <CardTitle>Jump 2 - Detailed Breakdown{jumpMeta?.[1] && ` · ${jumpMeta[1].athlete}`}</CardTitle>
            {jumpMeta?.[1] && (
              <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                {jumpMeta[1].category}
              </Badge>
            )}
          </div>
          {jumpMeta?.[1] && (
            <p className="text-sm font-semibold text-amber-400">{jumpMeta[1].trick}</p>
          )}
          <div className="mt-2 no-print">
            <JudgeOverride
              calculatedScore={jump2Result.totalScore}
              override={jump2Result.override}
              onApply={(override) => setJump2Result({ ...jump2Result, override })}
              onRemove={() => setJump2Result({ ...jump2Result, override: null })}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 mb-6">
            {jump2Result.areaScores.map((area, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{AREA_DISPLAY_NAMES[area.area] ?? area.area}</span>
                  <span className="font-semibold text-primary">
                    {area.finalScore.toFixed(2)} / {(area.weight * 10).toFixed(2)}
                  </span>
                </div>
                <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${AREA_GRADIENT[area.area]}`} />
                  <div
                    className="absolute inset-y-0 right-0 bg-muted rounded-r-full transition-all duration-500"
                    style={{ width: `${100 - (area.finalScore / (area.weight * 10)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold">Area</th>
                  <th className="text-left py-3 px-4 font-semibold">Parameter</th>
                  <th className="text-left py-3 px-4 font-semibold">Value</th>
                  <th className="text-center py-3 px-4 font-semibold">Points</th>
                  <th className="text-center py-3 px-4 font-semibold">Max</th>
                </tr>
              </thead>
              <tbody>
                {jump2Result.areaScores.map((area, areaIdx) => (
                  area.parameters.map((param, paramIdx) => (
                    <tr key={`${areaIdx}-${paramIdx}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                      {paramIdx === 0 && (
                        <td rowSpan={area.parameters.length} className="py-3 px-4 font-medium border-r border-border">
                          {AREA_DISPLAY_NAMES[area.area] ?? area.area}
                        </td>
                      )}
                      <td className="py-3 px-4">{param.label}</td>
                      <td className="py-3 px-4">{formatValue(param.label, param.value, heightAmplitudeThresholds)}</td>
                      <td className={`text-center py-3 px-4 font-semibold ${getPointsColor(param.points, param.max)}`}>{param.points.toFixed(2)}</td>
                      <td className="text-center py-3 px-4 text-muted-foreground">{param.max.toFixed(2)}</td>
                    </tr>
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td colSpan={3} className="py-3 px-4 text-right">Calculated Total</td>
                  <td className="text-center py-3 px-4 text-primary">{jump2Result.totalScore.toFixed(2)}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">10.00</td>
                </tr>
                {jump2Result.override && (
                  <tr className="border-t border-amber-500/30 bg-amber-500/10">
                    <td colSpan={3} className="py-3 px-4 text-right text-amber-400 font-semibold">
                      Judge Override — {jump2Result.override.reason}
                    </td>
                    <td className="text-center py-3 px-4 text-amber-400 font-bold">{jump2Result.override.score.toFixed(2)}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">10.00</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
        <CardHeader className="p-0 mb-6">
          <div className="flex items-center gap-2">
            <CardTitle>Jump 3 - Detailed Breakdown{jumpMeta?.[2] && ` · ${jumpMeta[2].athlete}`}</CardTitle>
            {jumpMeta?.[2] && (
              <Badge className="font-mono text-xs font-bold tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                {jumpMeta[2].category}
              </Badge>
            )}
          </div>
          {jumpMeta?.[2] && (
            <p className="text-sm font-semibold text-amber-400">{jumpMeta[2].trick}</p>
          )}
          <div className="mt-2 no-print">
            <JudgeOverride
              calculatedScore={jump3Result.totalScore}
              override={jump3Result.override}
              onApply={(override) => setJump3Result({ ...jump3Result, override })}
              onRemove={() => setJump3Result({ ...jump3Result, override: null })}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 mb-6">
            {jump3Result.areaScores.map((area, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{AREA_DISPLAY_NAMES[area.area] ?? area.area}</span>
                  <span className="font-semibold text-primary">
                    {area.finalScore.toFixed(2)} / {(area.weight * 10).toFixed(2)}
                  </span>
                </div>
                <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${AREA_GRADIENT[area.area]}`} />
                  <div
                    className="absolute inset-y-0 right-0 bg-muted rounded-r-full transition-all duration-500"
                    style={{ width: `${100 - (area.finalScore / (area.weight * 10)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold">Area</th>
                  <th className="text-left py-3 px-4 font-semibold">Parameter</th>
                  <th className="text-left py-3 px-4 font-semibold">Value</th>
                  <th className="text-center py-3 px-4 font-semibold">Points</th>
                  <th className="text-center py-3 px-4 font-semibold">Max</th>
                </tr>
              </thead>
              <tbody>
                {jump3Result.areaScores.map((area, areaIdx) => (
                  area.parameters.map((param, paramIdx) => (
                    <tr key={`${areaIdx}-${paramIdx}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                      {paramIdx === 0 && (
                        <td rowSpan={area.parameters.length} className="py-3 px-4 font-medium border-r border-border">
                          {AREA_DISPLAY_NAMES[area.area] ?? area.area}
                        </td>
                      )}
                      <td className="py-3 px-4">{param.label}</td>
                      <td className="py-3 px-4">{formatValue(param.label, param.value, heightAmplitudeThresholds)}</td>
                      <td className={`text-center py-3 px-4 font-semibold ${getPointsColor(param.points, param.max)}`}>{param.points.toFixed(2)}</td>
                      <td className="text-center py-3 px-4 text-muted-foreground">{param.max.toFixed(2)}</td>
                    </tr>
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td colSpan={3} className="py-3 px-4 text-right">Calculated Total</td>
                  <td className="text-center py-3 px-4 text-primary">{jump3Result.totalScore.toFixed(2)}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">10.00</td>
                </tr>
                {jump3Result.override && (
                  <tr className="border-t border-amber-500/30 bg-amber-500/10">
                    <td colSpan={3} className="py-3 px-4 text-right text-amber-400 font-semibold">
                      Judge Override — {jump3Result.override.reason}
                    </td>
                    <td className="text-center py-3 px-4 text-amber-400 font-bold">{jump3Result.override.score.toFixed(2)}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">10.00</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {showOverallImpression && overallImpression && (
        <Card className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break">
          <CardHeader className="p-0 mb-6">
            <CardTitle>Overall Impression - Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="mb-6 p-4 bg-primary/5 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Overall Impression Score</div>
                <div className="text-4xl font-bold text-primary">
                  {overallImpressionScore.toFixed(2)}
                  <span className="text-2xl text-muted-foreground"> / 10.00</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-semibold">Criterion</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-center py-3 px-4 font-semibold">Score</th>
                    <th className="text-center py-3 px-4 font-semibold">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(overallImpression).map(([key, value]) => {
                    const config = OVERALL_IMPRESSION_CONFIG[key as keyof typeof OVERALL_IMPRESSION_CONFIG];
                    const maxValue = 10 / 11; // Each criterion max value
                    return (
                      <tr key={key} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{config?.label || key}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{config?.description || ''}</td>
                        <td className={`text-center py-3 px-4 font-semibold ${getPointsColor(value, maxValue)}`}>
                          {value.toFixed(3)}
                        </td>
                        <td className="text-center py-3 px-4 text-muted-foreground">{maxValue.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span> Each criterion is rated 0-10 in the UI. 
                The final score is calculated as the sum of all criteria divided by 11, resulting in a maximum total of 10 points.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="p-6 mb-6 shadow-[var(--shadow-card)] print-avoid-break no-print">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">Preset:</span>
            <span className="text-xl font-bold text-primary">{activePreset}</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-medium whitespace-nowrap">Change preset:</span>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GKA">GKA</SelectItem>
                <SelectItem value="KOTA">KOTA</SelectItem>
                <SelectItem value="Megaloop">Megaloop</SelectItem>

              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <Button onClick={handleNewJumps} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          New Score
        </Button>
        <Button onClick={handleEditParameters} variant="secondary" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Parameters
        </Button>
        <Button onClick={handleExportJSON} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export JSON
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
