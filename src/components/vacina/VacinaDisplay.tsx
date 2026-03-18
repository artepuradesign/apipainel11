import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Copy, Pencil, Plus } from 'lucide-react';
import { BaseVacina } from '@/services/baseVacinaService';
import { useBaseVacina } from '@/hooks/useBaseVacina';
import { toast } from "sonner";

interface VacinaDisplayProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onEdit?: () => void;
  onEditRecord?: (record: BaseVacina) => void;
  onAddRecord?: () => void;
}

const VacinaDisplay = ({ cpfId, onCountChange, onEdit, onEditRecord, onAddRecord }: VacinaDisplayProps) => {
  const [vacinas, setVacinas] = useState<BaseVacina[]>([]);
  const [loading, setLoading] = useState(true);
  const { getVacinasByCpfId } = useBaseVacina();

  const hasData = useMemo(() => vacinas.length > 0, [vacinas.length]);
  const sectionCardClass = hasData ? 'border-success-border bg-success-subtle' : undefined;

  useEffect(() => {
    const loadVacinas = async () => {
      if (!cpfId) return;
      setLoading(true);
      try {
        const data = await getVacinasByCpfId(cpfId);
        setVacinas(data);
      } catch {
        setVacinas([]);
      } finally {
        setLoading(false);
      }
    };

    loadVacinas();
  }, [cpfId, getVacinasByCpfId]);

  useEffect(() => {
    onCountChange?.(vacinas.length);
  }, [onCountChange, vacinas.length]);

  const copyVacinasData = () => {
    if (!hasData) return;

    const dados = vacinas.map((vacina, idx) =>
      `Vacina ${idx + 1}:\n` +
      `Nome da Vacina: ${vacina.nome_vacina || '-'}\n` +
      `Descrição: ${vacina.descricao_vacina || '-'}\n` +
      `Lote: ${vacina.lote_vacina || '-'}\n` +
      `Grupo de Atendimento: ${vacina.grupo_atendimento || '-'}\n` +
      `Data de Aplicação: ${vacina.data_aplicacao ? formatDateTime(vacina.data_aplicacao) : '-'}\n` +
      `Status: ${vacina.status || '-'}\n` +
      `Estabelecimento: ${vacina.nome_estabelecimento || '-'}\n` +
      `Aplicador: ${vacina.aplicador_vacina || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de vacinas copiados!');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Vacinas</span>
              </CardTitle>
              <CardDescription>Carregando...</CardDescription>
            </div>
            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Vacinas</span>
            </CardTitle>
            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="text-center py-4 text-muted-foreground">
            <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">Nenhum dado de vacina encontrado</p>
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
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Vacinas</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title="Editar dados da seção">
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onAddRecord && (
              <Button variant="ghost" size="icon" onClick={onAddRecord} className="h-8 w-8" title="Adicionar novo registro">
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {hasData && (
              <Button variant="ghost" size="icon" onClick={copyVacinasData} className="h-8 w-8" title="Copiar dados da seção">
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <div className="relative inline-flex">
              <Badge variant="secondary" className={'bg-success text-success-foreground uppercase tracking-wide pr-4'}>
                Online
              </Badge>
              <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                {vacinas.length}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
        {vacinas.map((vacina, index) => (
          <div key={vacina.id} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline">Registro {index + 1}</Badge>
              {onEditRecord && (
                <Button variant="ghost" size="icon" className="h-8 w-8" title={`Editar registro ${index + 1}`} onClick={() => onEditRecord(vacina)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor={`nome_vacina_${vacina.id}`}>Nome da Vacina</Label>
                <Input id={`nome_vacina_${vacina.id}`} value={vacina.nome_vacina || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`vacina_${vacina.id}`}>Vacina</Label>
                <Input id={`vacina_${vacina.id}`} value={vacina.vaina || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`cor_${vacina.id}`}>Cor</Label>
                <Input id={`cor_${vacina.id}`} value={vacina.cor || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`cns_${vacina.id}`}>CNS</Label>
                <Input id={`cns_${vacina.id}`} value={vacina.cns || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`mae_${vacina.id}`}>Mãe</Label>
                <Input id={`mae_${vacina.id}`} value={vacina.mae || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`descricao_${vacina.id}`}>Descrição da Vacina</Label>
                <Input id={`descricao_${vacina.id}`} value={vacina.descricao_vacina || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`lote_${vacina.id}`}>Lote da Vacina</Label>
                <Input id={`lote_${vacina.id}`} value={vacina.lote_vacina || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`grupo_${vacina.id}`}>Grupo de Atendimento</Label>
                <Input id={`grupo_${vacina.id}`} value={vacina.grupo_atendimento || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`data_${vacina.id}`}>Data de Aplicação</Label>
                <Input id={`data_${vacina.id}`} value={formatDateTime(vacina.data_aplicacao || '')} disabled className="bg-muted text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`status_${vacina.id}`}>Status</Label>
                <Input id={`status_${vacina.id}`} value={vacina.status || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor={`estabelecimento_${vacina.id}`}>Nome do Estabelecimento</Label>
                <Input id={`estabelecimento_${vacina.id}`} value={vacina.nome_estabelecimento || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor={`aplicador_${vacina.id}`}>Aplicador de Vacina</Label>
                <Input id={`aplicador_${vacina.id}`} value={vacina.aplicador_vacina || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`uf_${vacina.id}`}>UF</Label>
                <Input id={`uf_${vacina.id}`} value={vacina.uf || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`municipio_${vacina.id}`}>Município</Label>
                <Input id={`municipio_${vacina.id}`} value={vacina.municipio || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`bairro_${vacina.id}`}>Bairro</Label>
                <Input id={`bairro_${vacina.id}`} value={vacina.bairro || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>

              <div>
                <Label htmlFor={`cep_${vacina.id}`}>CEP</Label>
                <Input id={`cep_${vacina.id}`} value={vacina.cep || ''} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default VacinaDisplay;
