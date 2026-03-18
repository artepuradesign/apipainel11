import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, FileSignature, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format, isValid, parseISO } from 'date-fns';
import { useBaseCertidao } from '@/hooks/useBaseCertidao';
import type { BaseCertidao } from '@/services/baseCertidaoService';

interface CertidaoNascimentoSectionProps {
  cpfId?: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const formatMaybeUpper = (v?: string | null) => {
  if (!v) return '';
  const upper = v.toUpperCase();
  // Filtrar valores inválidos
  if (upper === 'SEM RESULTADO' || upper === '-' || upper === 'NULL') return '';
  return upper;
};

const formatBrazilianDate = (value?: string | null) => {
  if (!value) return '';

  // Tenta ISO primeiro (ex: 2026-01-25 / 2026-01-25T00:00:00Z)
  const iso = parseISO(value);
  if (isValid(iso)) return format(iso, 'dd/MM/yyyy');

  // Fallback: tenta Date nativo
  const d = new Date(value);
  if (isValid(d)) return format(d, 'dd/MM/yyyy');

  // Se vier já formatado ou em formato não reconhecido, exibe como está
  return value;
};

const CertidaoNascimentoSection: React.FC<CertidaoNascimentoSectionProps> = ({ cpfId, onCountChange, onAddRecord, showHeaderOnlyWhenEmpty = true }) => {
  const { isLoading, getCertidaoByCpfId } = useBaseCertidao();
  const [certidao, setCertidao] = useState<BaseCertidao | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!cpfId) return;
      const data = await getCertidaoByCpfId(cpfId);
      setCertidao(data);
    };
    load();
  }, [cpfId, getCertidaoByCpfId]);

  const hasData = useMemo(() => {
    if (!certidao) return false;
    return Boolean(
      certidao.tipo_certidao ||
        certidao.numero_certidao ||
        certidao.termo ||
        certidao.livro ||
        certidao.folha ||
        certidao.data_emissao
    );
  }, [certidao]);

  useEffect(() => {
    onCountChange?.(hasData ? 1 : 0);
  }, [hasData, onCountChange]);

  const sectionCardClass = hasData ? 'border-success-border bg-success-subtle' : undefined;

  const copyData = () => {
    if (!certidao || !hasData) return;
    const dados = [
      `Tipo Certidão: ${certidao.tipo_certidao || '-'}`,
      `Número Certidão: ${certidao.numero_certidao || '-'}`,
      `Serviço Registro Civil: ${certidao.servico_registro_civil || '-'}`,
      `Acervo: ${certidao.acervo || '-'}`,
      `Ano: ${certidao.ano || '-'}`,
      `Tipo Livro: ${certidao.tipo_livro || '-'}`,
      `Livro: ${certidao.livro || '-'}`,
      `Folha: ${certidao.folha || '-'}`,
      `Termo: ${certidao.termo || '-'}`,
      `Dígito Verificador: ${certidao.digito_verificador || '-'}`,
      `Data Emissão: ${certidao.data_emissao || '-'}`,
    ].join('\n');
    navigator.clipboard.writeText(dados);
    toast.success('Certidão copiada!');
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <FileSignature className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Certidão de Nascimento</span>
            </CardTitle>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="uppercase tracking-wide">
                Online
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-xs sm:text-sm">Carregando certidão...</p>
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
            <FileSignature className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Certidão de Nascimento</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyData}
                className="h-8 w-8"
                title="Copiar dados da seção"
              >
                <Copy className="h-4 w-4" />
              </Button>
            ) : null}

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
              <Badge variant="secondary" className="uppercase tracking-wide">
                Online
              </Badge>
              {hasData ? (
                <span
                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                  aria-label="Quantidade de registros Certidão de Nascimento: 1"
                >
                  1
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>

      {!hasData && showHeaderOnlyWhenEmpty ? null : (
        <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
          {!hasData ? (
            <div className="text-center py-4 text-muted-foreground">
              <FileSignature className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs sm:text-sm">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_tipo">Tipo Certidão</Label>
                <Input id="cert_tipo" value={formatMaybeUpper(certidao?.tipo_certidao)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_numero">Número Certidão</Label>
                <Input id="cert_numero" value={formatMaybeUpper(certidao?.numero_certidao)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_acervo">Acervo</Label>
                <Input id="cert_acervo" value={formatMaybeUpper(certidao?.acervo)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label className="text-xs sm:text-sm" htmlFor="cert_servico">Serviço Registro Civil</Label>
                <Input
                  id="cert_servico"
                  value={formatMaybeUpper(certidao?.servico_registro_civil)}
                  disabled
                    className="bg-muted text-[14px] md:text-sm"
                />
              </div>

              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_ano">Ano</Label>
                <Input id="cert_ano" value={formatMaybeUpper(certidao?.ano)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_tipo_livro">Tipo Livro</Label>
                <Input id="cert_tipo_livro" value={formatMaybeUpper(certidao?.tipo_livro)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_livro">Livro</Label>
                <Input id="cert_livro" value={formatMaybeUpper(certidao?.livro)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_folha">Folha</Label>
                <Input id="cert_folha" value={formatMaybeUpper(certidao?.folha)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_termo">Termo</Label>
                <Input id="cert_termo" value={formatMaybeUpper(certidao?.termo)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_dv">Dígito Verificador</Label>
                <Input id="cert_dv" value={formatMaybeUpper(certidao?.digito_verificador)} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm" htmlFor="cert_data">Data Emissão</Label>
                <Input
                  id="cert_data"
                  value={formatBrazilianDate(certidao?.data_emissao)}
                  disabled
                  className="bg-muted text-[14px] md:text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CertidaoNascimentoSection;
