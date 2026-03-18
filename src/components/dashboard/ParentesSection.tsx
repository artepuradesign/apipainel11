import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Copy, Pencil, Plus } from 'lucide-react';
import { useBaseParente } from '@/hooks/useBaseParente';
import { BaseParente } from '@/services/baseParenteService';
import { formatCpf } from '@/utils/formatters';
import { toast } from "sonner";

interface ParentesSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onEdit?: () => void;
  onEditRecord?: (record: BaseParente) => void;
  onAddRecord?: () => void;
}

const ParentesSection: React.FC<ParentesSectionProps> = ({ cpfId, onCountChange, onEdit, onEditRecord, onAddRecord }) => {
  const [parentes, setParentes] = useState<BaseParente[]>([]);
  const [loading, setLoading] = useState(true);
  const { getParentesByCpfId } = useBaseParente();

  const hasData = parentes.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadParentes();
  }, [cpfId]);

  useEffect(() => {
    if (loading) return;
    onCountChange?.(parentes.length);
  }, [loading, onCountChange, parentes.length]);

  const loadParentes = async () => {
    setLoading(true);
    try {
      const data = await getParentesByCpfId(cpfId);
      setParentes(data);
    } catch {
      setParentes([]);
    } finally {
      setLoading(false);
    }
  };

  const copyParentesData = () => {
    if (!hasData) return;

    const dados = parentes.map((parente, idx) =>
      `Parente ${idx + 1}:\n` +
      `Nome: ${parente.nome_vinculo || '-'}\n` +
      `Vínculo: ${parente.vinculo || '-'}\n` +
      `CPF: ${parente.cpf_vinculo ? formatCpf(parente.cpf_vinculo) : '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados dos parentes copiados!');
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <User className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Parentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Carregando...</p>
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
            <User className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Parentes</span>
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
              <Button variant="ghost" size="icon" onClick={copyParentesData} className="h-8 w-8" title="Copiar dados da seção">
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <div className="relative inline-flex">
              <Badge variant="secondary" className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide pr-4' : 'uppercase tracking-wide pr-4'}>
                Online
              </Badge>
              {hasData && (
                <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                  {parentes.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        {!hasData ? (
          <div className="text-center py-4 text-muted-foreground">
            <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">Nenhum parente encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {parentes.map((parente, index) => (
              <div key={parente.id} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">Registro {index + 1}</Badge>
                  {onEditRecord && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" title={`Editar registro ${index + 1}`} onClick={() => onEditRecord(parente)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`nome_${parente.id}`}>Nome</Label>
                    <Input id={`nome_${parente.id}`} value={parente.nome_vinculo?.toUpperCase() || ''} disabled className="uppercase text-[14px] md:text-sm" />
                  </div>

                  <div>
                    <Label htmlFor={`vinculo_${parente.id}`}>Vínculo</Label>
                    <Input id={`vinculo_${parente.id}`} value={parente.vinculo?.toUpperCase() || ''} disabled className="uppercase text-[14px] md:text-sm" />
                  </div>

                  <div>
                    <Label htmlFor={`cpf_${parente.id}`}>CPF</Label>
                    <Input id={`cpf_${parente.id}`} value={parente.cpf_vinculo ? formatCpf(parente.cpf_vinculo) : ''} disabled className="text-[14px] md:text-sm" />
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

export default ParentesSection;
