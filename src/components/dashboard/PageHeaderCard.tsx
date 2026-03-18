
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export interface PageHeaderCardProps {
  title: string;
  subtitle: string;
  isControlPanel?: boolean;
  extra?: React.ReactElement;
  currentPlan?: string;
  badgeText?: string;
  value?: string;
  valueDetails?: string;
  showAddButton?: boolean;
  isCompact?: boolean;
}

const PageHeaderCard: React.FC<PageHeaderCardProps> = ({ 
  title, 
  subtitle, 
  isControlPanel = false,
  extra,
  currentPlan,
  badgeText,
  value,
  valueDetails,
  showAddButton,
  isCompact
}) => {
  const { config: liquidGlassConfig } = useLiquidGlass();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const glassStyle = useMemo<React.CSSProperties>(() => {
    if (!liquidGlassConfig.enabled) return {};
    const filter = `blur(${liquidGlassConfig.strength + liquidGlassConfig.extraBlur}px) saturate(${liquidGlassConfig.tintSaturation}%) contrast(${liquidGlassConfig.contrast}%) brightness(${liquidGlassConfig.brightness}%) invert(${liquidGlassConfig.invert}%) hue-rotate(${liquidGlassConfig.tintHue}deg)`;
    const bgAlpha = liquidGlassConfig.backgroundAlpha / 100;
    const specHighAlpha = liquidGlassConfig.edgeSpecularity / 200;
    const specLowAlpha = liquidGlassConfig.edgeSpecularity / 300;
    const borderAlpha = liquidGlassConfig.backgroundAlpha / 200;
    return {
      borderRadius: `${liquidGlassConfig.cornerRadius}px`,
      backdropFilter: filter,
      WebkitBackdropFilter: filter,
      background: `rgba(255,255,255,${bgAlpha})`,
      boxShadow: `0 0 ${liquidGlassConfig.softness}px rgba(255,255,255,${specHighAlpha}), inset 0 1px 0 rgba(255,255,255,${specLowAlpha})`,
      opacity: liquidGlassConfig.opacity / 100,
      border: `1px solid rgba(255,255,255,${borderAlpha})`,
    };
  }, [liquidGlassConfig, isDark]);

  return (
    <Card 
      className={cn(
        !liquidGlassConfig.enabled && "bg-gradient-to-r from-brand-purple/10 to-brand-purple/5 border-brand-purple/20",
        liquidGlassConfig.enabled && "bg-transparent border-transparent"
      )}
      style={liquidGlassConfig.enabled ? glassStyle : undefined}
    >
      <CardHeader className="pb-3 lg:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg lg:text-2xl font-bold">
              {isControlPanel && <Crown className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-500" />}
              {title}
              {badgeText && (
                <span className="text-xs lg:text-sm bg-brand-purple text-white px-2 py-1 rounded-full">
                  {badgeText}
                </span>
              )}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              {subtitle}
            </p>
            {currentPlan && (
              <p className="text-sm text-brand-purple font-medium mt-1">
                Plano: {currentPlan}
              </p>
            )}
            {value && (
              <div className="mt-2">
                <p className="text-lg font-semibold">
                  {value}
                </p>
                {valueDetails && (
                  <p className="text-sm text-muted-foreground">
                    {valueDetails}
                  </p>
                )}
              </div>
            )}
          </div>
          {extra && (
            <div>
              {extra}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default PageHeaderCard;
