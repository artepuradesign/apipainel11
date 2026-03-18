import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HandCoins, Copy, Pencil, Plus } from 'lucide-react';
import { BaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';
import { toast } from 'sonner';

interface AuxilioEmergencialSectionProps {
  auxilios: BaseAuxilioEmergencial[];
  onEdit?: () => void;
  onEditRecord?: (record: BaseAuxilioEmergencial) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

export const AuxilioEmergencialSection = ({ auxilios, onEdit, onEditRecord, onAddRecord, showHeaderOnlyWhenEmpty = false }: AuxilioEmergencialSectionProps) => {
  const hasData = useMemo(() => (auxilios?.length ?? 0) > 0, [auxilios?.length]);
  const sectionCardClass = useMemo(
    () => (hasData ? 'border-success-border bg-success-subtle' : undefined),
    [hasData]
  );

  const formatCurrencyBRL = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }, []);

  const parseParcelaNumber = (parcela?: string) => {
    if (!parcela) return Number.POSITIVE_INFINITY;
    const match = String(parcela).match(/\d+/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
  };

  const formatMesAno = (value?: string) => {
    if (!value) return '-';
    const s = String(value).trim();
    if (/^\d{2}\/\d{4}$/.test(s)) return s;
    if (/^\d{6}$/.test(s)) {
      const yyyy = s.slice(0, 4);
      const mm = s.slice(4, 6);
      return `${mm}/${yyyy}`;
    }
    return s;
  };

  const normalizeMoneyNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const normalized = trimmed.includes(',')
        ? trimmed.replace(/\./g, '').replace(',', '.')
        : trimmed.replace(',', '.');

      const n = Number(normalized);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const sortedAuxilios = useMemo(() => {
    const list = [...(auxilios ?? [])];
    list.sort((a, b) => {
      const na = parseParcelaNumber(a.parcela);
      const nb = parseParcelaNumber(b.parcela);
      if (na !== nb) return na - nb;
      return String(a.parcela ?? '').localeCompare(String(b.parcela ?? ''), 'pt-BR', { numeric: true });
    });
    return list;
  }, [auxilios]);

  const copyAuxiliosData = () => {
    if (!sortedAuxilios || sortedAuxilios.length === 0) return;

    const dados = sortedAuxilios.map((auxilio, idx) =>
      (() => {
        const money = normalizeMoneyNumber((auxilio as any).valor_beneficio);
        const moneyText = money !== null ? formatCurrencyBRL.format(money) : '-';

        return (
          `Auxílio ${idx + 1}:\n` +
          `Parcela: ${auxilio.parcela || '-'}\n` +
          `Mês Disponibilização: ${formatMesAno(auxilio.mes_disponibilizacao)}\n` +
          `Enquadramento: ${auxilio.enquadramento || '-'}\n` +
          `UF: ${auxilio.uf || '-'}\n` +
          `Valor Benefício: ${moneyText}\n` +
          `Observação: ${auxilio.observacao || '-'}`
        );
      })()
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de auxílio emergencial copiados!');
  };

  if (!auxilios || auxilios.length === 0) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <HandCoins className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Auxílio Emergencial</span>
              </CardTitle>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onAddRecord ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onAddRecord}
                  className="h-8 w-8 rounded-full"
                  title="Adicionar novo registro"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
              <Badge variant="secondary" className="uppercase tracking-wide">
                Online
              </Badge>
            </div>
          </div>
        </CardHeader>
        {!showHeaderOnlyWhenEmpty ? (
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HandCoins className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          </CardContent>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className={sectionCardClass}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <HandCoins className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Auxílio Emergencial</span>
            </CardTitle>
          </div>

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

            {onAddRecord && (
              <Button
                variant="outline"
                size="icon"
                onClick={onAddRecord}
                className="h-8 w-8 rounded-full"
                title="Adicionar novo registro"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {hasData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAuxiliosData}
                className="h-8 w-8"
                title="Copiar dados da seção"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <div className="relative inline-flex">
              <Badge
                variant="secondary"
                className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide pr-4' : 'uppercase tracking-wide pr-4'}
              >
                Online
              </Badge>

              {hasData && (
                <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                  {auxilios.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAuxilios.map((auxilio, index) => (
            <div key={auxilio.id || index} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">Registro {index + 1}</Badge>
                {onEditRecord && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={`Editar registro ${index + 1}`}
                    onClick={() => onEditRecord(auxilio)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`parcela_${auxilio.id}`}>Parcela</Label>
                  <Input
                    id={`parcela_${auxilio.id}`}
                    value={auxilio.parcela || '-'}
                    disabled
                    className="bg-muted uppercase text-[14px] md:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`mes_${auxilio.id}`}>Mês Disponibilização</Label>
                  <Input
                    id={`mes_${auxilio.id}`}
                    value={formatMesAno(auxilio.mes_disponibilizacao)}
                    disabled
                    className="bg-muted text-[14px] md:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`enquadramento_${auxilio.id}`}>Enquadramento</Label>
                  <Input
                    id={`enquadramento_${auxilio.id}`}
                    value={auxilio.enquadramento || '-'}
                    disabled
                    className="bg-muted uppercase text-[14px] md:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`uf_${auxilio.id}`}>UF</Label>
                  <Input
                    id={`uf_${auxilio.id}`}
                    value={auxilio.uf || '-'}
                    disabled
                    className="bg-muted uppercase text-[14px] md:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`valor_${auxilio.id}`}>Valor Benefício</Label>
                  <Input
                    id={`valor_${auxilio.id}`}
                    value={(() => {
                      const money = normalizeMoneyNumber((auxilio as any).valor_beneficio);
                      return money !== null ? formatCurrencyBRL.format(money) : '-';
                    })()}
                    disabled
                    className="bg-muted text-[14px] md:text-sm"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor={`obs_${auxilio.id}`}>Observação</Label>
                  <Input
                    id={`obs_${auxilio.id}`}
                    value={auxilio.observacao || '-'}
                    disabled
                    className="bg-muted uppercase text-[14px] md:text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
