import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, FileText, SearchX, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useBaseCns } from '@/hooks/useBaseCns';
import type { BaseCns } from '@/services/baseCnsService';

interface CnsSectionProps {
  cpfId?: number;
  onCountChange?: (count: number) => void;
  onEdit?: () => void;
  onEditRecord?: (record: BaseCns) => void;
  onAddRecord?: () => void;
}

const tipoLabel = (t?: string | null) => {
  if (t === 'D') return 'Definitivo';
  if (t === 'P') return 'Provisório';
  return '';
};

const CnsSection: React.FC<CnsSectionProps> = ({ cpfId, onCountChange, onEdit, onEditRecord, onAddRecord }) => {
  const { isLoading, error, getCnsByCpfId } = useBaseCns();
  const [items, setItems] = useState<BaseCns[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!cpfId) return;
      const data = await getCnsByCpfId(cpfId);
      setItems(data);
    };
    load();
  }, [cpfId, getCnsByCpfId]);

  useEffect(() => {
    onCountChange?.(items.length);
  }, [onCountChange, items.length]);

  const hasData = useMemo(() => items.length > 0, [items]);
  const sectionCardClass = hasData ? 'border-success-border bg-success-subtle' : undefined;

  const copyData = () => {
    if (!hasData) return;
    const text = items
      .map((i, idx) => {
        const tipo = tipoLabel(i.tipo_cartao) || i.tipo_cartao;
        return [`CNS #${idx + 1}`, `Número: ${i.numero_cns || '-'}`, `Tipo: ${tipo || '-'}`].join('\n');
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    toast.success('CNS copiado!');
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">CNS</span>
            </CardTitle>
            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-xs sm:text-sm">Carregando CNS...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={sectionCardClass}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <FileText className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">CNS</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title="Editar dados da seção">
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onAddRecord && (
              <Button variant="outline" size="icon" onClick={onAddRecord} className="h-8 w-8 rounded-full" title="Adicionar novo registro">
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {hasData && (
              <Button variant="ghost" size="icon" onClick={copyData} className="h-8 w-8" title="Copiar dados da seção">
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <div className="relative inline-flex">
              <Badge variant="secondary" className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide pr-4' : 'uppercase tracking-wide pr-4'}>
                Online
              </Badge>
              {hasData && (
                <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                  {items.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
        {!hasData ? (
          <div className="text-center py-4 text-muted-foreground">
            <SearchX className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs sm:text-sm">{error ? error : 'Nenhum registro encontrado'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id ?? item.numero_cns} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">Registro {index + 1}</Badge>
                  {onEditRecord && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" title={`Editar registro ${index + 1}`} onClick={() => onEditRecord(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-xs sm:text-sm" htmlFor={`cns_numero_${item.id}`}>Número CNS</Label>
                    <Input id={`cns_numero_${item.id}`} value={item.numero_cns || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm" htmlFor={`cns_tipo_${item.id}`}>Tipo</Label>
                    <Input id={`cns_tipo_${item.id}`} value={tipoLabel(item.tipo_cartao) || item.tipo_cartao || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CnsSection;
