import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Copy, Pencil, Plus } from 'lucide-react';
import { useBaseTelefone } from '@/hooks/useBaseTelefone';
import { BaseTelefone } from '@/services/baseTelefoneService';
import { toast } from "sonner";
import { formatDateOnly } from '@/utils/formatters';

const formatLocalPhone = (value: string) => {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.length === 8) return digits.replace(/(\d{4})(\d{4})/, '$1-$2');
  if (digits.length === 9) return digits.replace(/(\d{5})(\d{4})/, '$1-$2');
  return digits;
};

interface TelefonesSectionProps {
  cpfId?: number;
  onCountChange?: (count: number) => void;
  compact?: boolean;
  onEdit?: () => void;
  onEditRecord?: (record: BaseTelefone) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const TelefonesSection: React.FC<TelefonesSectionProps> = ({ cpfId, onCountChange, compact = false, onEdit, onEditRecord, onAddRecord, showHeaderOnlyWhenEmpty = false }) => {
  const { isLoading, getTelefonesByCpfId } = useBaseTelefone();
  const [telefones, setTelefones] = useState<BaseTelefone[]>([]);
  const [didLoad, setDidLoad] = useState(false);

  const hasData = telefones.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    const loadTelefones = async () => {
      setDidLoad(false);
      if (cpfId) {
        const result = await getTelefonesByCpfId(cpfId);
        setTelefones(result || []);
        setDidLoad(true);
      } else {
        setTelefones([]);
        setDidLoad(true);
      }
    };

    loadTelefones();
  }, [cpfId, getTelefonesByCpfId]);

  useEffect(() => {
    if (!didLoad) return;
    onCountChange?.(telefones.length);
  }, [didLoad, onCountChange, telefones.length]);

  const copyTelefonesData = () => {
    if (telefones.length === 0) return;

    const dados = telefones.map((tel, idx) =>
      `Telefone ${idx + 1}:\n` +
      `DDD: ${tel.ddd || '-'}\n` +
      `Número: ${formatLocalPhone(tel.telefone) || '-'}\n` +
      `Tipo: ${tel.tipo_texto || '-'}` +
      (compact
        ? ''
        : `\nClassificação: ${tel.classificacao || '-'}\n` +
          `Sigilo: ${tel.sigilo ? 'Sim' : 'Não'}\n` +
          `Data Inclusão: ${tel.data_inclusao ? formatDateOnly(tel.data_inclusao) : '-'}`)
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados dos telefones copiados!');
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <Phone className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Telefones</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Carregando telefones...</p>
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
            <Phone className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Telefones</span>
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
              <Button variant="ghost" size="icon" onClick={copyTelefonesData} className="h-8 w-8" title="Copiar dados da seção">
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <div className="relative inline-flex">
              <Badge variant="secondary" className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide pr-4' : 'uppercase tracking-wide pr-4'}>
                Online
              </Badge>
              {hasData && (
                <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                  {telefones.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {(hasData || !showHeaderOnlyWhenEmpty) ? (
        <CardContent className="space-y-4 p-4 md:p-6">
          {hasData ? (
            <div className="space-y-4">
              {telefones.map((telefone, index) => (
                <div key={telefone.id} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">Registro {index + 1}</Badge>
                    {onEditRecord && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={`Editar registro ${index + 1}`} onClick={() => onEditRecord(telefone)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`ddd_${telefone.id}`}>DDD</Label>
                      <Input id={`ddd_${telefone.id}`} value={telefone.ddd || '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                    </div>

                    <div>
                      <Label htmlFor={`tel_${telefone.id}`}>Telefone</Label>
                      <Input id={`tel_${telefone.id}`} value={formatLocalPhone(telefone.telefone) || '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                    </div>

                    <div>
                      <Label htmlFor={`tipo_${telefone.id}`}>Tipo</Label>
                      <Input id={`tipo_${telefone.id}`} value={telefone.tipo_texto || '-'} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
                    </div>

                    {!compact && (
                      <>
                        <div>
                          <Label htmlFor={`class_${telefone.id}`}>Classificação</Label>
                          <Input id={`class_${telefone.id}`} value={telefone.classificacao || '-'} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`sigilo_${telefone.id}`}>Sigilo</Label>
                          <Input id={`sigilo_${telefone.id}`} value={telefone.sigilo ? 'Sim' : 'Não'} disabled className="bg-muted text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`dt_inc_${telefone.id}`}>Data Inclusão</Label>
                          <Input id={`dt_inc_${telefone.id}`} value={telefone.data_inclusao ? formatDateOnly(telefone.data_inclusao) : '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Phone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm">Nenhum telefone adicional encontrado para este CPF</p>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
};

export default TelefonesSection;
