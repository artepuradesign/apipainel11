import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, Copy, Plus } from 'lucide-react';
import { useBaseCnpjMei } from '@/hooks/useBaseCnpjMei';
import { toast } from "sonner";

interface CnpjMeiSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const CnpjMeiSection: React.FC<CnpjMeiSectionProps> = ({ cpfId, onCountChange, onAddRecord, showHeaderOnlyWhenEmpty = true }) => {
  const { getCnpjMeisByCpfId, cnpjMeis, isLoading, clearData } = useBaseCnpjMei();
  const [dataLoaded, setDataLoaded] = useState(false);
  const lastCpfIdRef = useRef<number | null>(null);

  const hasData = useMemo(() => (cnpjMeis?.length ?? 0) > 0, [cnpjMeis?.length]);
  const sectionCardClass = useMemo(
    () => (hasData ? 'border-success-border bg-success-subtle' : undefined),
    [hasData]
  );

  // Se o CPF mudar, precisamos resetar para disparar uma nova busca.
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
      getCnpjMeisByCpfId(cpfId).finally(() => {
        setDataLoaded(true);
      });
    }
  }, [cpfId, getCnpjMeisByCpfId, dataLoaded]);

  useEffect(() => {
    onCountChange?.(cnpjMeis?.length ?? 0);
  }, [cnpjMeis?.length, onCountChange]);

  const copyCnpjMeiData = () => {
    if (!cnpjMeis || cnpjMeis.length === 0) return;
    
    const dados = cnpjMeis.map((cnpj, idx) => 
      `CNPJ MEI ${idx + 1}:\n` +
      `CNPJ: ${cnpj.cnpj || '-'}\n` +
      `Razão Social: ${cnpj.razao_social || '-'}\n` +
      `Natureza Jurídica: ${cnpj.natureza_juridica || '-'}\n` +
      `Qualificação: ${cnpj.qualificacao || '-'}\n` +
      `Capital Social: ${cnpj.capital_social ? `R$ ${cnpj.capital_social}` : '-'}\n` +
      `Porte da Empresa: ${cnpj.porte_empresa || '-'}\n` +
      `Ente Federativo: ${cnpj.ente_federativo || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de CNPJ MEI copiados!');
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <Building2 className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">CNPJ MEI</span>
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cnpjMeis || cnpjMeis.length === 0) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <Building2 className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">CNPJ MEI</span>
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
              <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
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
              <Building2 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">CNPJ MEI</span>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyCnpjMeiData}
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
                  aria-label={`Quantidade de CNPJ MEI: ${cnpjMeis.length}`}
                >
                  {cnpjMeis.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cnpjMeis.map((cnpj, index) => (
          <div key={cnpj.id || index}>
            {index > 0 && <div className="border-t pt-3"></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`cnpj_${cnpj.id}`}>CNPJ</Label>
                <Input
                  id={`cnpj_${cnpj.id}`}
                  value={cnpj.cnpj || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor={`razao_${cnpj.id}`}>Razão Social</Label>
                <Input
                  id={`razao_${cnpj.id}`}
                  value={cnpj.razao_social || '-'}
                  disabled
                  className="bg-muted uppercase text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`natureza_${cnpj.id}`}>Natureza Jurídica</Label>
                <Input
                  id={`natureza_${cnpj.id}`}
                  value={cnpj.natureza_juridica || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`qualificacao_${cnpj.id}`}>Qualificação</Label>
                <Input
                  id={`qualificacao_${cnpj.id}`}
                  value={cnpj.qualificacao || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`capital_${cnpj.id}`}>Capital Social</Label>
                <Input
                  id={`capital_${cnpj.id}`}
                  value={
                    typeof cnpj.capital_social === 'number'
                      ? `R$ ${cnpj.capital_social.toFixed(2)}`
                      : cnpj.capital_social
                        ? `R$ ${Number(cnpj.capital_social).toFixed(2)}`
                        : '-'
                  }
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`porte_${cnpj.id}`}>Porte Empresa</Label>
                <Input
                  id={`porte_${cnpj.id}`}
                  value={cnpj.porte_empresa || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`ente_${cnpj.id}`}>Ente Federativo Responsável</Label>
                <Input
                  id={`ente_${cnpj.id}`}
                  value={cnpj.ente_federativo || '-'}
                  disabled
                  className="bg-muted uppercase text-[14px] md:text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CnpjMeiSection;
