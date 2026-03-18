import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, Plus, Pencil } from 'lucide-react';
import { useBaseInss } from '@/hooks/useBaseInss';
import { BaseInss } from '@/services/baseInssService';
import { toast } from "sonner";

interface InssSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  onEditRecord?: (record?: BaseInss) => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const InssSection: React.FC<InssSectionProps> = ({ cpfId, onCountChange, onAddRecord, onEditRecord, showHeaderOnlyWhenEmpty = true }) => {
  const [inssList, setInssList] = useState<BaseInss[]>([]);
  const [loading, setLoading] = useState(true);
  const { getInssByCpfId } = useBaseInss();

  const hasData = inssList.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadInss();
  }, [cpfId]);

  useEffect(() => {
    onCountChange?.(inssList.length);
  }, [inssList.length, onCountChange]);

  const loadInss = async () => {
    setLoading(true);
    try {
      const data = await getInssByCpfId(cpfId);
      setInssList(data);
    } catch (error) {
      console.error('Erro ao carregar dados INSS:', error);
      setInssList([]);
    } finally {
      setLoading(false);
    }
  };

  const copyInssData = () => {
    if (inssList.length === 0) return;
    
    const dados = inssList.map((inss, idx) => 
      `Benefício ${idx + 1}:\n` +
      `NB: ${inss.nb || '-'}\n` +
      `Entidade: ${inss.entidade || '-'}\n` +
      `Espécie: ${inss.especie || '-'}\n` +
      `Descrição da Espécie: ${inss.especie_descricao || '-'}\n` +
      `Valor: ${inss.valor || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados INSS copiados!');
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">INSS</span>
              </CardTitle>
              <CardDescription>Dados previdenciários</CardDescription>
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
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">INSS</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && onEditRecord ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditRecord(inssList[0])}
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
                onClick={copyInssData}
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
                  aria-label={`Quantidade de benefícios INSS: ${inssList.length}`}
                >
                  {inssList.length}
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
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm">Nenhum benefício INSS encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inssList.map((inss, index) => (
                <div key={inss.id}>
                  {index > 0 && <div className="border-t pt-3"></div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`nb_${inss.id}`}>NB</Label>
                      <Input
                        id={`nb_${inss.id}`}
                        value={inss.nb || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`entidade_${inss.id}`}>Entidade</Label>
                      <Input
                        id={`entidade_${inss.id}`}
                        value={inss.entidade?.toUpperCase() || '-'}
                        disabled
                        className="bg-muted uppercase text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`especie_${inss.id}`}>Espécie</Label>
                      <Input
                        id={`especie_${inss.id}`}
                        value={inss.especie || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`valor_${inss.id}`}>Valor</Label>
                      <Input
                        id={`valor_${inss.id}`}
                        value={inss.valor?.toUpperCase() || '-'}
                        disabled
                        className="bg-muted uppercase text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor={`descricao_${inss.id}`}>Espécie Descrição</Label>
                      <Input
                        id={`descricao_${inss.id}`}
                        value={inss.especie_descricao?.toUpperCase() || '-'}
                        disabled
                        className="bg-muted uppercase text-[14px] md:text-sm"
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

export default InssSection;
