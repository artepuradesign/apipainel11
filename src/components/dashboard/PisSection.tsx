import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, FileText, SearchX, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  const upper = str.toUpperCase();
  if (!str || upper === '-' || upper === 'SEM RESULTADO' || upper === 'SEM DADOS') return '';
  return str;
};

interface PisSectionProps {
  pis?: string | null;
  onEdit?: () => void;
  enableCopy?: boolean;
}

const PisSection: React.FC<PisSectionProps> = ({ pis, onEdit, enableCopy = true }) => {
  const pisValue = normalizeText(pis);
  const hasData = useMemo(() => !!pisValue, [pisValue]);
  const sectionCardClass = hasData ? 'border-success-border bg-success-subtle' : '';

  const handleCopy = async () => {
    if (!hasData) return;
    try {
      await navigator.clipboard.writeText(pisValue);
      toast.success('PIS copiado!');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  return (
    <Card className={sectionCardClass}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <FileText className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">PIS</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
                title="Editar dados da seção"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {hasData && enableCopy && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8"
                title="Copiar PIS"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <Badge
              variant="secondary"
              className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide' : 'uppercase tracking-wide'}
            >
              Online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
        {!hasData ? (
          <div className="text-center py-4 text-muted-foreground">
            <SearchX className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs sm:text-sm">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs sm:text-sm" htmlFor="pis">
                Número do PIS/PASEP
              </Label>
              <Input
                id="pis"
                value={pisValue}
                disabled
                className="bg-muted text-[14px] md:text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PisSection;
