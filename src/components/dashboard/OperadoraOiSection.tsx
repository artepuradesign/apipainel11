import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Phone, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useBaseOperadoraOi } from '@/hooks/useBaseOperadoraOi';
import type { BaseOperadoraOi } from '@/services/baseOperadoraOiService';

interface OperadoraOiSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  onEditRecord?: (record?: BaseOperadoraOi) => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const boolBr = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (typeof v === 'number') return v === 1 ? 'Sim' : 'Não';
  const s = String(v).toLowerCase();
  if (s === '1' || s === 'true' || s === 'sim') return 'Sim';
  if (s === '0' || s === 'false' || s === 'nao' || s === 'não') return 'Não';
  return String(v);
};

const display = (v: unknown) => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
};

const OperadoraOiSection: React.FC<OperadoraOiSectionProps> = ({ cpfId, onCountChange, onAddRecord, onEditRecord, showHeaderOnlyWhenEmpty = true }) => {
  const { getOperadoraOiByCpfId, registros, isLoading, clearData } = useBaseOperadoraOi();
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
      getOperadoraOiByCpfId(cpfId).finally(() => setDataLoaded(true));
    }
  }, [cpfId, dataLoaded, getOperadoraOiByCpfId]);

  useEffect(() => {
    onCountChange?.(registros?.length ?? 0);
  }, [onCountChange, registros?.length]);

  const copyOiData = () => {
    if (!registros || registros.length === 0) return;

    const dados = registros
      .map((r: BaseOperadoraOi, idx: number) => {
        const lines: string[] = [`Operadora OI ${idx + 1}:`];
        const add = (label: string, value: unknown) => {
          const v = display(value);
          if (v) lines.push(`${label}: ${v}`);
        };

        add('Número Contrato', r.numero_contrato);
        add('Plano Atual', r.plano_atual);
        add('Status', r.status);
        add('Tipo', r.tipo);
        add('Titular', r.titular);
        add('CPF/CNPJ', r.cpf_cnpj);
        add('Débito Automático', r.debito_automatico);
        add('Falha Aberta', boolBr(r.existe_falha_aberta));
        add('Qtd. Contratos', r.quantidade_contratos);
        add('Contrato Físico', r.numero_contrato_fisico);
        add('Pode Habilitar Confiança', boolBr(r.pode_habilitar_confianca));
        add('Nome', r.nome);
        add('Email', r.email);
        add('Bairro Instalação', r.bairro_instalacao);
        add('Cidade Instalação', r.cidade_instalacao);
        add('Legado', r.legado);
        add('Modalidade', r.modalidade);
        return lines.join('\n');
      })
      .join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados da Operadora OI copiados!');
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

  const BoolField = ({ id, label, value, className }: { id: string; label: string; value: unknown; className?: string }) => {
    const v = boolBr(value);
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
                <span className="truncate">Operadora OI</span>
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
                <span className="truncate">Operadora OI</span>
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
              <span className="truncate">Operadora OI</span>
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
                onClick={copyOiData}
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
                  aria-label={`Quantidade de registros Operadora OI: ${registros.length}`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field id={`numero_contrato_${r.id}`} label="Número Contrato" value={r.numero_contrato} />
              <Field id={`plano_atual_${r.id}`} label="Plano Atual" value={r.plano_atual} />
              <Field id={`status_${r.id}`} label="Status" value={r.status} />
              <Field id={`tipo_${r.id}`} label="Tipo" value={r.tipo} />
              <Field id={`titular_${r.id}`} label="Titular" value={r.titular} />
              <Field id={`cpf_cnpj_${r.id}`} label="CPF/CNPJ" value={r.cpf_cnpj} />
              <Field id={`debito_automatico_${r.id}`} label="Débito Automático" value={r.debito_automatico} />
              <BoolField id={`falha_${r.id}`} label="Existe Falha Aberta" value={r.existe_falha_aberta} />
              <Field id={`qtd_contratos_${r.id}`} label="Quantidade Contratos" value={r.quantidade_contratos} />
              <Field id={`contrato_fisico_${r.id}`} label="Contrato Físico" value={r.numero_contrato_fisico} />
              <BoolField id={`confianca_${r.id}`} label="Pode Habilitar Confiança" value={r.pode_habilitar_confianca} />
              <Field id={`nome_${r.id}`} label="Nome" value={r.nome} className="md:col-span-2" />
              <Field id={`email_${r.id}`} label="Email" value={r.email} className="md:col-span-2" />
              <Field id={`bairro_${r.id}`} label="Bairro Instalação" value={r.bairro_instalacao} />
              <Field id={`cidade_${r.id}`} label="Cidade Instalação" value={r.cidade_instalacao} />
              <Field id={`legado_${r.id}`} label="Legado" value={r.legado} />
              <Field id={`modalidade_${r.id}`} label="Modalidade" value={r.modalidade} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OperadoraOiSection;
