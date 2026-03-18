import React, { useState } from 'react';
import { toast } from 'sonner';
import { useLiquidGlass, defaultLiquidGlassConfig, LiquidGlassConfig } from '@/contexts/LiquidGlassContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, Droplets, Eye, Save, Sun, Moon, Palette } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useTheme } from '@/components/ThemeProvider';
import ContainedMatrixRain from '@/components/effects/ContainedMatrixRain';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface SliderParam {
  key: keyof LiquidGlassConfig;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const sliderParams: SliderParam[] = [
  { key: 'strength', label: 'Strength', min: 0, max: 50, step: 1, unit: 'px' },
  { key: 'softness', label: 'Softness', min: 0, max: 50, step: 1, unit: 'px' },
  { key: 'extraBlur', label: 'Extra Blur', min: 0, max: 20, step: 1, unit: 'px' },
  { key: 'tinting', label: 'Tinting', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'tintSaturation', label: 'Tint Saturation', min: 0, max: 400, step: 1, unit: '%' },
  { key: 'tintHue', label: 'Tint Hue', min: 0, max: 360, step: 1, unit: '°' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1, unit: '%' },
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1, unit: '%' },
  { key: 'invert', label: 'Invert', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'edgeSpecularity', label: 'Edge Specularity', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'cornerRadius', label: 'Corner Radius', min: 0, max: 100, step: 1, unit: 'px' },
  { key: 'opacity', label: 'Opacity', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'backgroundAlpha', label: 'Transparência do Botão', min: 0, max: 100, step: 1, unit: '%' },
];

type PreviewTheme = 'default' | 'matrix';

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    subtitle: 'Configure o estilo Liquid Glass dos elementos do sistema',
    saved: 'Configurações salvas!',
    save: 'Salvar',
    customize: 'Personalizar',
    customizeDesc: 'Ajuste os parâmetros do efeito Liquid Glass',
    reset: 'Resetar',
    enable: 'Ativar Liquid Glass',
    enableDesc: 'Aplicar efeito nos temas atuais',
    preview: 'Pré-visualização',
    previewDesc: 'Visualize o efeito em tempo real',
    defaultTheme: 'Padrão',
    light: 'Claro',
    dark: 'Escuro',
    previewTitle: 'Prévia Liquid Glass',
    previewText: 'Este card reflete todas as configurações em tempo real.',
    previewButton: 'Botão Liquid Glass',
    currentConfig: 'Configuração Atual',
    active: 'Ativo',
    yes: 'Sim',
    no: 'Não',
  },
  en: {
    subtitle: 'Configure the Liquid Glass style across system elements',
    saved: 'Settings saved!',
    save: 'Save',
    customize: 'Customize',
    customizeDesc: 'Adjust Liquid Glass effect parameters',
    reset: 'Reset',
    enable: 'Enable Liquid Glass',
    enableDesc: 'Apply effect to active themes',
    preview: 'Preview',
    previewDesc: 'See the effect in real time',
    defaultTheme: 'Default',
    light: 'Light',
    dark: 'Dark',
    previewTitle: 'Liquid Glass Preview',
    previewText: 'This card reflects all settings in real time.',
    previewButton: 'Liquid Glass Button',
    currentConfig: 'Current Configuration',
    active: 'Active',
    yes: 'Yes',
    no: 'No',
  },
  es: {
    subtitle: 'Configura el estilo Liquid Glass de los elementos del sistema',
    saved: '¡Configuraciones guardadas!',
    save: 'Guardar',
    customize: 'Personalizar',
    customizeDesc: 'Ajusta los parámetros del efecto Liquid Glass',
    reset: 'Restablecer',
    enable: 'Activar Liquid Glass',
    enableDesc: 'Aplicar efecto a los temas actuales',
    preview: 'Vista previa',
    previewDesc: 'Visualiza el efecto en tiempo real',
    defaultTheme: 'Predeterminado',
    light: 'Claro',
    dark: 'Oscuro',
    previewTitle: 'Vista previa Liquid Glass',
    previewText: 'Esta tarjeta refleja todas las configuraciones en tiempo real.',
    previewButton: 'Botón Liquid Glass',
    currentConfig: 'Configuración Actual',
    active: 'Activo',
    yes: 'Sí',
    no: 'No',
  },
};

const LiquidGlassAdmin = () => {
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const { config, updateParam, resetToDefaults } = useLiquidGlass();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [previewDark, setPreviewDark] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>('default');
  const isPreviewMatrix = previewTheme === 'matrix';

  const glassFilter = `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`;

  return (
    <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title="Liquid Glass"
          subtitle={t.subtitle}
          icon={<Droplets className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
          right={
            <Button
              variant="outline"
              size="icon"
              onClick={() => toast.success(t.saved)}
              className="rounded-full h-9 w-9"
              aria-label={t.save}
              title={t.save}
          >
            <Save className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customize Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{t.customize}</CardTitle>
              <CardDescription>{t.customizeDesc}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              {t.reset}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <label className="text-sm font-medium text-foreground">{t.enable}</label>
                <p className="text-xs text-muted-foreground">{t.enableDesc}</p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateParam('enabled', checked)}
              />
            </div>

            {sliderParams.map((param) => (
              <div key={param.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">{param.label}</label>
                  <span className="text-sm font-semibold tabular-nums min-w-[60px] text-right text-foreground">
                    {config[param.key] as number}{param.unit}
                  </span>
                </div>
                <Slider
                  value={[config[param.key] as number]}
                  onValueChange={([v]) => updateParam(param.key, v)}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="w-full"
                  disabled={!config.enabled}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Eye className="h-4 w-4" />
                  {t.preview}
                </CardTitle>
                <CardDescription>{t.previewDesc}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Theme select */}
                <Select value={previewTheme} onValueChange={(v) => setPreviewTheme(v as PreviewTheme)}>
                  <SelectTrigger className="w-[130px] h-9">
                    <Palette className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t.defaultTheme}</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                  </SelectContent>
                </Select>
                {/* Light/Dark toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewDark(!previewDark)}
                  className="gap-2"
                >
                  {previewDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {previewDark ? t.light : t.dark}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="relative rounded-xl overflow-hidden p-8 min-h-[400px] flex flex-col items-center justify-center gap-6"
              style={isPreviewMatrix
                ? { background: previewDark ? '#000' : '#1a3a1a' }
                : { background: previewDark
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                    : 'linear-gradient(135deg, #3a3a5e 0%, #4a4a6e 50%, #2f4a70 100%)'
                }
              }
            >
              {isPreviewMatrix ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <ContainedMatrixRain />
                </div>
              ) : (
                <>
                  <div className="absolute top-8 left-8 w-32 h-32 rounded-full blur-xl" style={{ background: 'rgba(124,58,237,0.2)' }} />
                  <div className="absolute bottom-12 right-12 w-40 h-40 rounded-full blur-2xl" style={{ background: 'rgba(59,130,246,0.15)' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-xl" style={{ background: 'rgba(168,85,247,0.15)' }} />
                </>
              )}

              {/* Glass div preview */}
              <div
                className="relative z-10 p-6 max-w-sm w-full text-center"
                style={{
                  borderRadius: `${config.cornerRadius}px`,
                  backdropFilter: config.enabled ? glassFilter : 'none',
                  WebkitBackdropFilter: config.enabled ? glassFilter : 'none',
                  background: `rgba(255,255,255,${config.backgroundAlpha / 100})`,
                  boxShadow: config.enabled
                    ? `0 0 ${config.softness}px rgba(255,255,255,${config.edgeSpecularity / 200}), inset 0 1px 0 rgba(255,255,255,${config.edgeSpecularity / 300})`
                    : 'none',
                  opacity: config.opacity / 100,
                  border: `1px solid rgba(255,255,255,${config.backgroundAlpha / 200})`,
                }}
              >
                <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {t.previewTitle}
                </p>
                <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {t.previewText}
                </p>
              </div>

              {/* Glass button preview */}
              <div className="relative z-10">
                <LiquidGlassButton variant="primary">
                  {t.previewButton}
                </LiquidGlassButton>
              </div>
            </div>

            {/* Current Config Summary */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.currentConfig}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                <div className="flex justify-between gap-1">
                  <span className="text-muted-foreground truncate">{t.active}:</span>
                  <span className="font-mono font-medium text-foreground">{config.enabled ? t.yes : t.no}</span>
                </div>
                {sliderParams.map((param) => (
                  <div key={param.key} className="flex justify-between gap-1">
                    <span className="text-muted-foreground truncate">{param.label}:</span>
                    <span className="font-mono font-medium text-foreground">{config[param.key] as number}{param.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiquidGlassAdmin;
