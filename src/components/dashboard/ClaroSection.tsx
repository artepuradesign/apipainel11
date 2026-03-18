import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Copy, Plus, Pencil } from 'lucide-react';
import { useBaseClaro } from '@/hooks/useBaseClaro';
import { BaseClaro } from '@/services/baseClaroService';
import { toast } from "sonner";
import { formatPhone } from '@/utils/formatters';

interface ClaroSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  onEditRecord?: (record?: BaseClaro) => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const ClaroSection: React.FC<ClaroSectionProps> = ({ cpfId, onCountChange, onAddRecord, onEditRecord, showHeaderOnlyWhenEmpty = true }) => {
  const [clarosList, setClarosList] = useState<BaseClaro[]>([]);
  const [loading, setLoading] = useState(true);
  const { getClarosByCpfId } = useBaseClaro();

  const hasData = clarosList.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadClaro();
  }, [cpfId]);

  useEffect(() => {
    onCountChange?.(clarosList.length);
  }, [clarosList.length, onCountChange]);

  const loadClaro = async () => {
    setLoading(true);
    try {
      const data = await getClarosByCpfId(cpfId);
      setClarosList(data);
    } catch (error) {
      console.error('Erro ao carregar dados Claro:', error);
      setClarosList([]);
    } finally {
      setLoading(false);
    }
  };

  const copyClaroData = () => {
    if (clarosList.length === 0) return;
    
    const dados = clarosList.map((claro, idx) => 
      `Registro ${idx + 1}:\n` +
      `Telefone: ${claro.ddd && claro.fone ? formatPhone(`${claro.ddd}${claro.fone}`) : '-'}\n` +
      `Instalação: ${claro.inst || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados Claro copiados!');
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Operadora Claro</span>
              </CardTitle>
              <CardDescription>Dados da operadora</CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="uppercase tracking-wide">
                Online
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
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
            <Phone className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Operadora Claro</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && onEditRecord ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditRecord(clarosList[0])}
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
                onClick={copyClaroData}
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
              <Badge variant="secondary" className="uppercase tracking-wide">
                Online
              </Badge>
              {hasData ? (
                <span
                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                  aria-label={`Quantidade de registros Operadora Claro: ${clarosList.length}`}
                >
                  {clarosList.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      {!hasData && showHeaderOnlyWhenEmpty ? null : (
        <CardContent className="p-4 md:p-6">
          {!hasData ? (
            <div className="text-center py-4 text-muted-foreground">
              <Phone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clarosList.map((claro, index) => (
                <div key={claro.id}>
                  {index > 0 && <div className="border-t pt-3"></div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`telefone_${claro.id}`}>Telefone</Label>
                      <Input
                        id={`telefone_${claro.id}`}
                        value={claro.ddd && claro.fone ? formatPhone(`${claro.ddd}${claro.fone}`) : '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`inst_${claro.id}`}>Instalação</Label>
                      <Input
                        id={`inst_${claro.id}`}
                        value={claro.inst || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ClaroSection;