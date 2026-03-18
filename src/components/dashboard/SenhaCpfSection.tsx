import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, SearchX, Plus, Pencil } from 'lucide-react';
import { baseSenhaCpfService, BaseSenhaCpf } from '@/services/baseSenhaCpfService';
import { toast } from "sonner";

interface SenhaCpfSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  onEditRecord?: (record?: BaseSenhaCpf) => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const SenhaCpfSection: React.FC<SenhaCpfSectionProps> = ({ cpfId, onCountChange, onAddRecord, onEditRecord, showHeaderOnlyWhenEmpty = true }) => {
  const [senhas, setSenhas] = useState<BaseSenhaCpf[]>([]);
  const [loading, setLoading] = useState(true);

  const hasData = useMemo(() => senhas.length > 0, [senhas]);
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadSenhas();
  }, [cpfId]);

  useEffect(() => {
    onCountChange?.(senhas.length);
  }, [onCountChange, senhas.length]);

  const loadSenhas = async () => {
    setLoading(true);
    try {
      const response = await baseSenhaCpfService.getByCpfId(cpfId);
      if (response.success && response.data) {
        setSenhas(response.data);
      } else {
        setSenhas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar senhas de CPF:', error);
      setSenhas([]);
    } finally {
      setLoading(false);
    }
  };

  const copySenhasData = () => {
    if (senhas.length === 0) return;
    
    const dados = senhas.map((senha, idx) => 
      `Senha ${idx + 1}:\n` +
      `CPF: ${senha.cpf || '-'}\n` +
      `Senha: ${senha.senha || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Senhas de CPF copiadas!');
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Senhas de CPF</span>
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
            <span className="truncate">Senhas de CPF</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && onEditRecord ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditRecord(senhas[0])}
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
                onClick={copySenhasData}
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
                className={hasData ? "bg-success text-success-foreground uppercase tracking-wide" : "uppercase tracking-wide"}
              >
                Online
              </Badge>
              {hasData ? (
                <span
                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                  aria-label={`Quantidade de senhas de CPF: ${senhas.length}`}
                >
                  {senhas.length}
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
              <SearchX className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs sm:text-sm">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {senhas.map((senha, index) => (
                <div key={senha.id}>
                  {index > 0 && <div className="border-t pt-3"></div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm" htmlFor={`cpf_${senha.id}`}>
                        CPF
                      </Label>
                      <Input
                        id={`cpf_${senha.id}`}
                        value={senha.cpf || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm" htmlFor={`senha_${senha.id}`}>
                        Senha
                      </Label>
                      <Input
                        id={`senha_${senha.id}`}
                        value={senha.senha || '-'}
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

export default SenhaCpfSection;
