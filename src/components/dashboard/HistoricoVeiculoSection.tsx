import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Copy } from 'lucide-react';
import { useBaseHistoricoVeiculo } from '@/hooks/useBaseHistoricoVeiculo';
import { toast } from 'sonner';

interface HistoricoVeiculoSectionProps {
  cpfId: number;
}

const HistoricoVeiculoSection: React.FC<HistoricoVeiculoSectionProps> = ({ cpfId }) => {
  const { getVeiculosByCpfId, veiculos, isLoading } = useBaseHistoricoVeiculo();

  useEffect(() => {
    if (cpfId) {
      getVeiculosByCpfId(cpfId);
    }
  }, [cpfId, getVeiculosByCpfId]);

  const copyVeiculosData = () => {
    if (!veiculos || veiculos.length === 0) return;
    
    const dados = veiculos.map((veiculo, idx) => 
      `Veículo ${idx + 1}:\n` +
      `Placa: ${veiculo.placa || '-'}\n` +
      `Chassi: ${veiculo.chassi || '-'}\n` +
      `Motor: ${veiculo.motor || '-'}\n` +
      `Marca: ${veiculo.marca || '-'}\n` +
      `UF Placa: ${veiculo.uf_placa || '-'}\n` +
      `Ano Fabricação: ${veiculo.ano_fabricacao || '-'}\n` +
      `Ano Modelo: ${veiculo.ano_modelo || '-'}\n` +
      `Combustível: ${veiculo.combustivel || '-'}\n` +
      `Cor: ${veiculo.cor_veiculo || '-'}\n` +
      `Tipo Carroceria: ${veiculo.tipo_carroceria || '-'}\n` +
      `Potência: ${veiculo.potencia || '-'}\n` +
      `Situação: ${veiculo.situacao_veiculo || '-'}\n` +
      `Proprietário: ${veiculo.nome_proprietario || '-'}\n` +
      `Doc. Proprietário: ${veiculo.doc_proprietario || '-'}\n` +
      `Restrições: ${[veiculo.restricao_1, veiculo.restricao_2, veiculo.restricao_3, veiculo.restricao_4].filter(Boolean).join(', ') || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de veículos copiados!');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Car className="h-5 w-5" />
            Histórico de Veículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!veiculos || veiculos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Car className="h-5 w-5" />
            Histórico de Veículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum registro encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <Car className="h-5 w-5" />
              Histórico de Veículos
            </CardTitle>
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
              {veiculos.length}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyVeiculosData}
            className="h-8 w-8"
            title="Copiar dados da seção"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {veiculos.map((veiculo, index) => (
          <div key={veiculo.id || index} className="space-y-4">
            {index > 0 && <div className="border-t pt-4"></div>}
            
            {/* Informações Básicas do Veículo */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">Informações do Veículo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`placa_${veiculo.id}`}>Placa</Label>
                  <Input
                    id={`placa_${veiculo.id}`}
                    value={veiculo.placa || '-'}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`uf_placa_${veiculo.id}`}>UF Placa</Label>
                  <Input
                    id={`uf_placa_${veiculo.id}`}
                    value={veiculo.uf_placa?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`chassi_${veiculo.id}`}>Chassi</Label>
                  <Input
                    id={`chassi_${veiculo.id}`}
                    value={veiculo.chassi || '-'}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`motor_${veiculo.id}`}>Motor</Label>
                  <Input
                    id={`motor_${veiculo.id}`}
                    value={veiculo.motor || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`marca_${veiculo.id}`}>Marca</Label>
                  <Input
                    id={`marca_${veiculo.id}`}
                    value={veiculo.marca?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`cor_${veiculo.id}`}>Cor</Label>
                  <Input
                    id={`cor_${veiculo.id}`}
                    value={veiculo.cor_veiculo?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`ano_fab_${veiculo.id}`}>Ano Fabricação</Label>
                  <Input
                    id={`ano_fab_${veiculo.id}`}
                    value={veiculo.ano_fabricacao || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`ano_modelo_${veiculo.id}`}>Ano Modelo</Label>
                  <Input
                    id={`ano_modelo_${veiculo.id}`}
                    value={veiculo.ano_modelo || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`tipo_carroceria_${veiculo.id}`}>Tipo Carroceria</Label>
                  <Input
                    id={`tipo_carroceria_${veiculo.id}`}
                    value={veiculo.tipo_carroceria?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`combustivel_${veiculo.id}`}>Combustível</Label>
                  <Input
                    id={`combustivel_${veiculo.id}`}
                    value={veiculo.combustivel?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`situacao_${veiculo.id}`}>Situação</Label>
                  <Input
                    id={`situacao_${veiculo.id}`}
                    value={veiculo.situacao_veiculo?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
            
            {/* Especificações Técnicas */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">Especificações Técnicas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`potencia_${veiculo.id}`}>Potência</Label>
                  <Input
                    id={`potencia_${veiculo.id}`}
                    value={veiculo.potencia ? `${veiculo.potencia} cv` : '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`cilindradas_${veiculo.id}`}>Cilindradas</Label>
                  <Input
                    id={`cilindradas_${veiculo.id}`}
                    value={veiculo.cilindradas || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`capacidade_${veiculo.id}`}>Capacidade</Label>
                  <Input
                    id={`capacidade_${veiculo.id}`}
                    value={veiculo.capacidade || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`quantidade_passageiro_${veiculo.id}`}>Passageiros</Label>
                  <Input
                    id={`quantidade_passageiro_${veiculo.id}`}
                    value={veiculo.quantidade_passageiro || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`eixos_${veiculo.id}`}>Eixos</Label>
                  <Input
                    id={`eixos_${veiculo.id}`}
                    value={veiculo.eixos || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`peso_bruto_${veiculo.id}`}>Peso Bruto Total</Label>
                  <Input
                    id={`peso_bruto_${veiculo.id}`}
                    value={veiculo.peso_bruto_total ? `${veiculo.peso_bruto_total} kg` : '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`caixa_cambio_${veiculo.id}`}>Caixa de Câmbio</Label>
                  <Input
                    id={`caixa_cambio_${veiculo.id}`}
                    value={veiculo.caixa_cambio?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`nacionalidade_${veiculo.id}`}>Nacionalidade</Label>
                  <Input
                    id={`nacionalidade_${veiculo.id}`}
                    value={veiculo.nacionalidade?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
            
            {/* Propriedade e Faturamento */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">Propriedade</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`nome_proprietario_${veiculo.id}`}>Nome Proprietário</Label>
                  <Input
                    id={`nome_proprietario_${veiculo.id}`}
                    value={veiculo.nome_proprietario?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`doc_proprietario_${veiculo.id}`}>Documento Proprietário</Label>
                  <Input
                    id={`doc_proprietario_${veiculo.id}`}
                    value={veiculo.doc_proprietario || '-'}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`nome_faturado_${veiculo.id}`}>Nome Faturado</Label>
                  <Input
                    id={`nome_faturado_${veiculo.id}`}
                    value={veiculo.nome_faturado?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`doc_faturado_${veiculo.id}`}>Documento Faturado</Label>
                  <Input
                    id={`doc_faturado_${veiculo.id}`}
                    value={veiculo.doc_faturado || '-'}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`uf_faturado_${veiculo.id}`}>UF Faturado</Label>
                  <Input
                    id={`uf_faturado_${veiculo.id}`}
                    value={veiculo.uf_faturado?.toUpperCase() || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
            
            {/* Endereço */}
            {(veiculo.endereco || veiculo.bairro || veiculo.cidade) && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor={`endereco_${veiculo.id}`}>Endereço</Label>
                    <Input
                      id={`endereco_${veiculo.id}`}
                      value={veiculo.endereco?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`numero_${veiculo.id}`}>Número</Label>
                    <Input
                      id={`numero_${veiculo.id}`}
                      value={veiculo.numero_casa || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`complemento_${veiculo.id}`}>Complemento</Label>
                    <Input
                      id={`complemento_${veiculo.id}`}
                      value={veiculo.complemento?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`bairro_${veiculo.id}`}>Bairro</Label>
                    <Input
                      id={`bairro_${veiculo.id}`}
                      value={veiculo.bairro?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`cep_${veiculo.id}`}>CEP</Label>
                    <Input
                      id={`cep_${veiculo.id}`}
                      value={veiculo.cep || '-'}
                      disabled
                      className="bg-muted font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`cidade_${veiculo.id}`}>Cidade</Label>
                    <Input
                      id={`cidade_${veiculo.id}`}
                      value={veiculo.cidade?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`estado_${veiculo.id}`}>Estado</Label>
                    <Input
                      id={`estado_${veiculo.id}`}
                      value={veiculo.estado?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Restrições */}
            {(veiculo.restricao_1 || veiculo.restricao_2 || veiculo.restricao_3 || veiculo.restricao_4) && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Restrições</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {veiculo.restricao_1 && (
                    <div>
                      <Label htmlFor={`restricao1_${veiculo.id}`}>Restrição 1</Label>
                      <Input
                        id={`restricao1_${veiculo.id}`}
                        value={veiculo.restricao_1.toUpperCase()}
                        disabled
                        className="bg-muted text-red-600 dark:text-red-400"
                      />
                    </div>
                  )}
                  
                  {veiculo.restricao_2 && (
                    <div>
                      <Label htmlFor={`restricao2_${veiculo.id}`}>Restrição 2</Label>
                      <Input
                        id={`restricao2_${veiculo.id}`}
                        value={veiculo.restricao_2.toUpperCase()}
                        disabled
                        className="bg-muted text-red-600 dark:text-red-400"
                      />
                    </div>
                  )}
                  
                  {veiculo.restricao_3 && (
                    <div>
                      <Label htmlFor={`restricao3_${veiculo.id}`}>Restrição 3</Label>
                      <Input
                        id={`restricao3_${veiculo.id}`}
                        value={veiculo.restricao_3.toUpperCase()}
                        disabled
                        className="bg-muted text-red-600 dark:text-red-400"
                      />
                    </div>
                  )}
                  
                  {veiculo.restricao_4 && (
                    <div>
                      <Label htmlFor={`restricao4_${veiculo.id}`}>Restrição 4</Label>
                      <Input
                        id={`restricao4_${veiculo.id}`}
                        value={veiculo.restricao_4.toUpperCase()}
                        disabled
                        className="bg-muted text-red-600 dark:text-red-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HistoricoVeiculoSection;
