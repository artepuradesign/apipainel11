import React, { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLiquidGlass } from "@/contexts/LiquidGlassContext";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface DashboardTitleCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Por padrão volta para /dashboard (como solicitado) */
  backTo?: string;
  right?: React.ReactNode;
}

const DashboardTitleCard = ({
  title,
  subtitle,
  icon,
  backTo = "/dashboard",
  right,
}: DashboardTitleCardProps) => {
  const navigate = useNavigate();
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
        liquidGlassConfig.enabled && "bg-transparent border-transparent"
      )}
      style={liquidGlassConfig.enabled ? glassStyle : undefined}
    >
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {icon ? <span className="shrink-0 text-primary">{icon}</span> : null}
              <span className="truncate">{title}</span>
            </CardTitle>
            {subtitle ? (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {right ? right : null}
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(backTo)}
              className="rounded-full h-9 w-9"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DashboardTitleCard;
