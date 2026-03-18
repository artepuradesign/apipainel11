import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Loader2, Copy, Plus } from 'lucide-react';
import { useBaseEmpresaSocio } from '@/hooks/useBaseEmpresaSocio';
import { BaseEmpresaSocio } from '@/services/baseEmpresaSocioService';
import { formatCpf, formatCnpj, formatDateOnly } from '@/utils/formatters';
import { toast } from "sonner";

interface EmpresasSocioSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const EmpresasSocioSection: React.FC<EmpresasSocioSectionProps> = ({ cpfId, onCountChange, onAddRecord, showHeaderOnlyWhenEmpty = true }) => {
  const [empresas, setEmpresas] = useState<BaseEmpresaSocio[]>([]);
  const [loading, setLoading] = useState(true);
  const { getEmpresasSocioByCpfId } = useBaseEmpresaSocio();

  const hasData = empresas.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadEmpresas();
  }, [cpfId]);

  useEffect(() => {
    onCountChange?.(empresas.length);
  }, [onCountChange, empresas.length]);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const data = await getEmpresasSocioByCpfId(cpfId);
      setEmpresas(data);
    } catch (error) {
      console.error('Erro ao carregar empresas sócio:', error);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  const copyEmpresasData = () => {
    if (empresas.length === 0) return;
    
    const dados = empresas.map((empresa, idx) => 
      `Empresa ${idx + 1}:\n` +
      `CNPJ: ${empresa.cnpj ? formatCnpj(empresa.cnpj) : (empresa.empresa_cnpj ? formatCnpj(empresa.empresa_cnpj) : '-')}\n` +
      `Identificador do Sócio: ${empresa.identificador_socio || '-'}\n` +
      `Qualificação do Sócio: ${empresa.qualificacao_socio || (empresa.socio_qualificacao || '-')}\n` +
      `Data de Entrada: ${empresa.data_entrada_sociedade ? formatDateOnly(empresa.data_entrada_sociedade) : (empresa.socio_data_entrada ? formatDateOnly(empresa.socio_data_entrada) : '-')}\n` +
      `Representante Legal: ${empresa.representante_legal ? formatCpf(empresa.representante_legal) : '-'}\n` +
      `Nome do Representante: ${empresa.nome_representante || '-'}\n` +
      `Qualificação Rep. Legal: ${empresa.qualificacao_representante_legal || '-'}\n` +
      `Faixa Etária: ${empresa.faixa_etaria || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados das empresas copiados!');
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                <Briefcase className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Empresas Associadas (SÓCIO)</span>
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

  if (empresas.length === 0) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                <Briefcase className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Empresas Associadas (SÓCIO)</span>
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
              <Briefcase className="h-12 w-12 text-muted-foreground mb-3" />
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
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <Briefcase className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Empresas Associadas (SÓCIO)</span>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyEmpresasData}
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
                  aria-label={`Quantidade de empresas sócio: ${empresas.length}`}
                >
                  {empresas.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {empresas.map((empresa, index) => (
          <div key={empresa.id}>
            {index > 0 && <div className="border-t pt-3"></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`cnpj_${empresa.id}`}>CNPJ</Label>
                <Input
                  id={`cnpj_${empresa.id}`}
                  value={empresa.cnpj || empresa.empresa_cnpj || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`identificador_${empresa.id}`}>Identificador do Sócio</Label>
                <Input
                  id={`identificador_${empresa.id}`}
                  value={empresa.identificador_socio || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`qualificacao_${empresa.id}`}>Qualificação do Sócio</Label>
                <Input
                  id={`qualificacao_${empresa.id}`}
                  value={empresa.qualificacao_socio || empresa.socio_qualificacao || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`data_${empresa.id}`}>Data de Entrada</Label>
                <Input
                  id={`data_${empresa.id}`}
                  value={
                    empresa.data_entrada_sociedade
                      ? formatDateOnly(empresa.data_entrada_sociedade)
                      : empresa.socio_data_entrada
                        ? formatDateOnly(empresa.socio_data_entrada)
                        : '-'
                  }
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`rep_${empresa.id}`}>Representante Legal</Label>
                <Input
                  id={`rep_${empresa.id}`}
                  value={empresa.representante_legal ? formatCpf(empresa.representante_legal) : '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>

              <div>
                <Label htmlFor={`nome_rep_${empresa.id}`}>Nome do Representante</Label>
                <Input
                  id={`nome_rep_${empresa.id}`}
                  value={empresa.nome_representante || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>

              <div>
                <Label htmlFor={`qual_rep_${empresa.id}`}>Qualificação Rep. Legal</Label>
                <Input
                  id={`qual_rep_${empresa.id}`}
                  value={empresa.qualificacao_representante_legal || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>

              <div>
                <Label htmlFor={`faixa_${empresa.id}`}>Faixa Etária</Label>
                <Input
                  id={`faixa_${empresa.id}`}
                  value={empresa.faixa_etaria || '-'}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EmpresasSocioSection;
