import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseRais } from "@/services/baseRaisService";
import { Briefcase, Copy, Plus } from "lucide-react";
import { toast } from "sonner";

interface RaisSectionProps {
  data: BaseRais[];
  isLoading: boolean;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

export const RaisSection = ({ data, isLoading, onAddRecord, showHeaderOnlyWhenEmpty = true }: RaisSectionProps) => {
  const hasData = data && data.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  const copyRaisData = () => {
    if (!hasData) return;
    
    const dados = data.map((rais, idx) => 
      `Emprego ${idx + 1}:\n` +
      `Empresa: ${rais.razao_social || '-'}\n` +
      `CNPJ: ${rais.cnpj || '-'}\n` +
      `Situação: ${rais.situacao || '-'}\n` +
      `Data de Admissão: ${rais.data_admissao || '-'}\n` +
      `Data de Desligamento: ${rais.data_desligamento || '-'}\n` +
      `Faixa de Renda: ${rais.faixa_renda || '-'}\n` +
      `Data de Entrega: ${rais.data_entrega || '-'}\n` +
      `Data de Cadastro: ${rais.data_cadastro || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de RAIS copiados!');
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                <Briefcase className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Rais - Histórico de Emprego</span>
              </CardTitle>
              <CardDescription>Histórico de empregos RAIS</CardDescription>
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
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Rais - Histórico de Emprego</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyRaisData}
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
                  aria-label={`Quantidade de registros RAIS: ${data.length}`}
                >
                  {data.length}
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
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((rais, index) => (
                <div key={rais.id}>
                  {index > 0 && <div className="border-t pt-3"></div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`empresa_${rais.id}`}>Razão Social</Label>
                      <Input
                        id={`empresa_${rais.id}`}
                        value={rais.razao_social?.toUpperCase() || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`cnpj_${rais.id}`}>CNPJ</Label>
                      <Input
                        id={`cnpj_${rais.id}`}
                        value={rais.cnpj || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`situacao_${rais.id}`}>Situação</Label>
                      <Input
                        id={`situacao_${rais.id}`}
                        value={rais.situacao?.toUpperCase() || '-'}
                        disabled
                        className="bg-muted uppercase text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`admissao_${rais.id}`}>Data Admissão</Label>
                      <Input
                        id={`admissao_${rais.id}`}
                        value={rais.data_admissao || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`desligamento_${rais.id}`}>Data Desligamento</Label>
                      <Input
                        id={`desligamento_${rais.id}`}
                        value={rais.data_desligamento || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`renda_${rais.id}`}>Faixa Renda</Label>
                      <Input
                        id={`renda_${rais.id}`}
                        value={rais.faixa_renda?.toUpperCase() || '-'}
                        disabled
                        className="bg-muted uppercase text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`entrega_${rais.id}`}>Data Entrega</Label>
                      <Input
                        id={`entrega_${rais.id}`}
                        value={rais.data_entrega || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`cadastro_${rais.id}`}>Data Cadastro</Label>
                      <Input
                        id={`cadastro_${rais.id}`}
                        value={rais.data_cadastro || '-'}
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
