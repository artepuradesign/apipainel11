import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Phone, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useBaseOperadoraTim } from '@/hooks/useBaseOperadoraTim';
import type { BaseOperadoraTim } from '@/services/baseOperadoraTimService';

interface OperadoraTimSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  onEditRecord?: (record?: BaseOperadoraTim) => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const display = (v: unknown) => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
};

const OperadoraTimSection: React.FC<OperadoraTimSectionProps> = ({ cpfId, onCountChange, onAddRecord, onEditRecord, showHeaderOnlyWhenEmpty = true }) => {
  const { getOperadoraTimByCpfId, registros, isLoading, clearData } = useBaseOperadoraTim();
  const [dataLoaded, setDataLoaded] = useState(false);
  const lastCpfIdRef = useRef<number | null>(null);

  const hasData = useMemo(() => (registros?.length ?? 0) > 0, [registros?.length]);
  const sectionCardClass = useMemo(
    () => (hasData ? 'border-success-border bg-success-subtle' : undefined),
    [hasData]
  );

  useEffect(() => {
    if (!cpfId) return;
    if (lastCpfIdRef.current !== cpfId) {
      lastCpfIdRef.current = cpfId;
      setDataLoaded(false);
      clearData();
    }
  }, [cpfId, clearData]);

  useEffect(() => {
    if (cpfId && !dataLoaded) {
      getOperadoraTimByCpfId(cpfId).finally(() => setDataLoaded(true));
    }
  }, [cpfId, dataLoaded, getOperadoraTimByCpfId]);

  useEffect(() => {
    onCountChange?.(registros?.length ?? 0);
  }, [onCountChange, registros?.length]);

  const copyTimData = () => {
    if (!registros || registros.length === 0) return;

    const dados = registros
      .map((r: BaseOperadoraTim, idx: number) => {
        const lines: string[] = [`Operadora TIM ${idx + 1}:`];
        const add = (label: string, value: unknown) => {
          const v = display(value);
          if (v) lines.push(`${label}: ${v}`);
        };

        add('Telefone', r.telefone);
        add('DDD', r.ddd);
        add('Tipo Logradouro', r.tipo_logradouro);
        add('Logradouro', r.logradouro);
        add('N\u00famero', r.numero);
        add('Complemento', r.complemento);
        add('Bairro', r.bairro);
        add('Cidade', r.cidade);
        add('UF', r.uf);
        add('CEP', r.cep);
        return lines.join('\n');
      })
      .join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados da Operadora TIM copiados!');
  };

  const Field = ({ id, label, value, className }: { id: string; label: string; value: unknown; className?: string }) => {
    const v = display(value);
    if (!v) return null;
    return (
      <div className={className}>
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} value={v} disabled className="bg-muted text-[14px] md:text-sm" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Operadora TIM</span>
              </CardTitle>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="secondary"
                className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide' : 'uppercase tracking-wide'}
              >
                Online
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!registros || registros.length === 0) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Operadora TIM</span>
              </CardTitle>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onAddRecord ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onAddRecord}
                  className="h-8 w-8 rounded-full"
                  title="Adicionar registro"
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
              <Phone className="h-12 w-12 text-muted-foreground mb-3" />
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
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Operadora TIM</span>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && onEditRecord ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditRecord(registros[0])}
                className="h-8 w-8"
                title="Editar dados da seção"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}

            {hasData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyTimData}
                className="h-8 w-8"
                title="Copiar dados da seção"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}

            {onAddRecord ? (
              <Button
                variant="outline"
                size="icon"
                onClick={onAddRecord}
                className="h-8 w-8 rounded-full"
                title="Adicionar registro"
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : null}

            <div className="relative inline-flex">
              <Badge
                variant="secondary"
                className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide' : 'uppercase tracking-wide'}
              >
                Online
              </Badge>
              {hasData ? (
                <span
                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                  aria-label={`Quantidade de registros Operadora TIM: ${registros.length}`}
                >
                  {registros.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {registros.map((r, index) => (
          <div key={r.id || index}>
            {index > 0 && <div className="border-t pt-3" />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id={`ddd_${r.id}`} label="DDD" value={r.ddd} className="md:max-w-[120px]" />
              <Field id={`telefone_${r.id}`} label="Telefone" value={r.telefone} />
              <Field id={`tipo_logradouro_${r.id}`} label="Tipo Logradouro" value={r.tipo_logradouro} />
              <Field id={`logradouro_${r.id}`} label="Logradouro" value={r.logradouro} className="md:col-span-2" />
              <Field id={`numero_${r.id}`} label="N\u00famero" value={r.numero} />
              <Field id={`complemento_${r.id}`} label="Complemento" value={r.complemento} className="md:col-span-2" />
              <Field id={`bairro_${r.id}`} label="Bairro" value={r.bairro} />
              <Field id={`cidade_${r.id}`} label="Cidade" value={r.cidade} />
              <Field id={`uf_${r.id}`} label="UF" value={r.uf} />
              <Field id={`cep_${r.id}`} label="CEP" value={r.cep} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OperadoraTimSection;
