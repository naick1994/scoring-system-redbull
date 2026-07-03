import { useState, useEffect } from 'react';
import { useScoring } from '@/contexts/ScoringContext';
import { PRESET_WEIGHTS, PRESET_CONFIG } from '@/lib/scoring';
import { EventPreset, PresetWeights } from '@/types/scoring';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const JUDGE_NAMES = {
  HEIGHT: 'HEIGHT',
  EXTREMITY: 'EXTREMITY',
  TECHNICALITY: 'TECHNICALITY',
  EXECUTION: 'EXECUTION'
};

const JUDGE_NAMES_SHORT = {
  HEIGHT: 'Height',
  EXTREMITY: 'Extremity',
  TECHNICALITY: 'Technicality',
  EXECUTION: 'Execution'
};

const PRESET_NAME_TO_KEY: Record<string, EventPreset> = {
  'GKA': 'GKA',
  'KOTA': 'KOTA',
  'Megaloop': 'Megaloop',
};

export default function PresetEvents() {
  const { activePreset, setActivePreset, weights, setWeights } = useScoring();
  const [selectedPreset, setSelectedPreset] = useState<EventPreset>(activePreset);
  const [customWeights, setCustomWeights] = useState<PresetWeights>(weights);
  const [isValid, setIsValid] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const sum = customWeights.HEIGHT + customWeights.EXTREMITY + customWeights.TECHNICALITY + customWeights.EXECUTION;
    setIsValid(sum === 100);
  }, [customWeights]);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset as EventPreset);
    if (preset !== 'Custom') {
      setCustomWeights(PRESET_WEIGHTS[preset as keyof typeof PRESET_WEIGHTS]);
    }
  };

  const handleActivatePreset = () => {
    if (selectedPreset === 'Custom' && !isValid) {
      toast.error('Weights must sum to exactly 100%');
      return;
    }
    setActivePreset(selectedPreset);
    setWeights(customWeights);
    toast.success(`Preset "${selectedPreset}" activated successfully`);
  };

  const handleCustomWeightChange = (judge: keyof PresetWeights, value: string) => {
    // Permetti di cancellare completamente il campo
    if (value === '') {
      setCustomWeights({ ...customWeights, [judge]: 0 });
      return;
    }
    // Accetta solo numeri
    const numValue = parseInt(value) || 0;
    setCustomWeights({ ...customWeights, [judge]: numValue });
  };

  const presetData = [
    { name: 'GKA', ...PRESET_WEIGHTS.GKA, hasOI: PRESET_CONFIG.GKA.hasOverallImpression },
    { name: 'KOTA', ...PRESET_WEIGHTS.KOTA, hasOI: PRESET_CONFIG.KOTA.hasOverallImpression },
    { name: 'Megaloop', ...PRESET_WEIGHTS.Megaloop, hasOI: PRESET_CONFIG.Megaloop.hasOverallImpression },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-3xl font-bold mb-8">Configure Event Presets</h2>

      <Card className="p-6 mb-8 shadow-[var(--shadow-card)]">
        <h3 className="text-xl font-semibold mb-6">Select and Activate Preset</h3>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="preset-select" className="text-base mb-2 block">
              Choose a preset
            </Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GKA">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>GKA</span>
                    {activePreset === 'GKA' && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </SelectItem>
                <SelectItem value="KOTA">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>KOTA</span>
                    {activePreset === 'KOTA' && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </SelectItem>
                <SelectItem value="Megaloop">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>Megaloop</span>
                    {activePreset === 'Megaloop' && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </SelectItem>
                <SelectItem value="Custom">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>Custom</span>
                    {activePreset === 'Custom' && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {selectedPreset !== activePreset && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected preset: <span className="font-semibold">{selectedPreset}</span> 
                {activePreset && <span> • Active preset: <span className="font-semibold text-primary">{activePreset}</span></span>}
              </p>
            )}
          </div>

          {selectedPreset === 'Custom' ? (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold">Custom Weights</h4>
                {isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className={`text-sm ${isValid ? 'text-green-600' : 'text-destructive'}`}>
                  Sum: {customWeights.HEIGHT + customWeights.EXTREMITY + customWeights.TECHNICALITY + customWeights.EXECUTION}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['HEIGHT', 'EXTREMITY', 'TECHNICALITY', 'EXECUTION'] as const).map((judge) => (
                  <div key={judge}>
                    <Label htmlFor={`weight-${judge}`} className="mb-2 block text-sm">
                      {JUDGE_NAMES[judge]} (%)
                    </Label>
                    <Input
                      id={`weight-${judge}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={customWeights[judge] === 0 ? '' : customWeights[judge]}
                      onChange={(e) => handleCustomWeightChange(judge, e.target.value)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">Preset Preview "{selectedPreset}"</h4>
              <div className="grid grid-cols-2 gap-3">
                {(['HEIGHT', 'EXTREMITY', 'TECHNICALITY', 'EXECUTION'] as const).map((judge) => (
                  <div key={judge} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{JUDGE_NAMES_SHORT[judge]}:</span>
                    <span className="font-semibold">{customWeights[judge]}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleActivatePreset}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            Activate Preset
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-xl font-semibold mb-4">Predefined Presets</h3>
        
        {isMobile ? (
          <div className="space-y-4">
            {presetData.map((preset) => (
              <div 
                key={preset.name} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  activePreset === PRESET_NAME_TO_KEY[preset.name] 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{preset.name}</h4>
                  {activePreset === PRESET_NAME_TO_KEY[preset.name] && (
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Active
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['HEIGHT', 'EXTREMITY', 'TECHNICALITY', 'EXECUTION'] as const).map((judge) => (
                    <div key={judge} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{JUDGE_NAMES_SHORT[judge]}:</span>
                      <span className="font-medium">{preset[judge]}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Overall Impression:</span>
                  {preset.hasOI ? (
                    <Badge variant="default" className="bg-green-600">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold">Evento</th>
                  <th className="text-center py-3 px-4 font-semibold">{JUDGE_NAMES_SHORT.HEIGHT}</th>
                  <th className="text-center py-3 px-4 font-semibold">{JUDGE_NAMES_SHORT.EXTREMITY}</th>
                  <th className="text-center py-3 px-4 font-semibold">{JUDGE_NAMES_SHORT.TECHNICALITY}</th>
                  <th className="text-center py-3 px-4 font-semibold">{JUDGE_NAMES_SHORT.EXECUTION}</th>
                  <th className="text-center py-3 px-4 font-semibold">Overall Impression</th>
                </tr>
              </thead>
              <tbody>
                {presetData.map((preset) => (
                  <tr 
                    key={preset.name} 
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      activePreset === PRESET_NAME_TO_KEY[preset.name] ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {preset.name}
                        {activePreset === PRESET_NAME_TO_KEY[preset.name] && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">{preset.HEIGHT}%</td>
                    <td className="text-center py-3 px-4">{preset.EXTREMITY}%</td>
                    <td className="text-center py-3 px-4">{preset.TECHNICALITY}%</td>
                    <td className="text-center py-3 px-4">{preset.EXECUTION}%</td>
                    <td className="text-center py-3 px-4">
                      {preset.hasOI ? (
                        <Badge variant="default" className="bg-green-600">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
