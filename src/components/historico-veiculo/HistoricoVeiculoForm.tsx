import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { CreateBaseHistoricoVeiculo } from '@/services/baseHistoricoVeiculoService';

interface HistoricoVeiculoFormProps {
  data: Partial<CreateBaseHistoricoVeiculo>[];
  onChange: (data: Partial<CreateBaseHistoricoVeiculo>[]) => void;
}

const HistoricoVeiculoForm: React.FC<HistoricoVeiculoFormProps> = ({ data, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAddVeiculo = () => {
    const newVeiculo: Partial<CreateBaseHistoricoVeiculo> = {
      cpf_id: 0,
      placa: '',
      chassi: '',
      marca: '',
      ano_fabricacao: undefined,
      cor_veiculo: '',
    };
    
    const newData = [...data, newVeiculo];
    onChange(newData);
    
    setExpandedSections(prev => ({
      ...prev,
      [data.length]: true
    }));
  };
  
  // Adiciona automaticamente um veículo vazio ao carregar o componente
  useEffect(() => {
    if (data.length === 0) {
      handleAddVeiculo();
    }
  }, []); // Executa apenas uma vez ao montar o componente

  const handleRemoveVeiculo = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleVeiculoChange = (index: number, field: keyof CreateBaseHistoricoVeiculo, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Car className="h-5 w-5 sm:h-6 sm:w-6" />
          Histórico de Veículos
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Adicione os veículos vinculados ao CPF ({data.length} veículo{data.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((veiculo, index) => {
            const isExpanded = expandedSections[index] !== false;
            
            return (
              <React.Fragment key={index}>
                {isExpanded && (
                  <div className="space-y-4">
                    {/* Dados do Veículo */}
                    <div>
                      <h5 className="text-sm font-semibold mb-3 text-primary">Dados do Veículo</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`placa-${index}`}>Placa</Label>
                          <Input
                            id={`placa-${index}`}
                            value={veiculo.placa || ''}
                            onChange={(e) => handleVeiculoChange(index, 'placa', e.target.value)}
                            placeholder="ABC1234"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`chassi-${index}`}>Chassi</Label>
                          <Input
                            id={`chassi-${index}`}
                            value={veiculo.chassi || ''}
                            onChange={(e) => handleVeiculoChange(index, 'chassi', e.target.value)}
                            placeholder="9BFZZZGDAWB577384"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`marca-${index}`}>Marca</Label>
                          <Input
                            id={`marca-${index}`}
                            value={veiculo.marca || ''}
                            onChange={(e) => handleVeiculoChange(index, 'marca', e.target.value)}
                            placeholder="FORD/KA"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cor-${index}`}>Cor</Label>
                          <Input
                            id={`cor-${index}`}
                            value={veiculo.cor_veiculo || ''}
                            onChange={(e) => handleVeiculoChange(index, 'cor_veiculo', e.target.value)}
                            placeholder="Preto"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`ano_fabricacao-${index}`}>Ano Fabricação</Label>
                          <Input
                            id={`ano_fabricacao-${index}`}
                            type="number"
                            value={veiculo.ano_fabricacao || ''}
                            onChange={(e) => handleVeiculoChange(index, 'ano_fabricacao', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="2020"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`ano_modelo-${index}`}>Ano Modelo</Label>
                          <Input
                            id={`ano_modelo-${index}`}
                            type="number"
                            value={veiculo.ano_modelo || ''}
                            onChange={(e) => handleVeiculoChange(index, 'ano_modelo', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="2021"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`tipo_carroceria-${index}`}>Tipo Carroceria</Label>
                          <Input
                            id={`tipo_carroceria-${index}`}
                            value={veiculo.tipo_carroceria || ''}
                            onChange={(e) => handleVeiculoChange(index, 'tipo_carroceria', e.target.value)}
                            placeholder="Sedan"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`combustivel-${index}`}>Combustível</Label>
                          <Input
                            id={`combustivel-${index}`}
                            value={veiculo.combustivel || ''}
                            onChange={(e) => handleVeiculoChange(index, 'combustivel', e.target.value)}
                            placeholder="Gasolina"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`uf_placa-${index}`}>UF Placa</Label>
                          <Input
                            id={`uf_placa-${index}`}
                            value={veiculo.uf_placa || ''}
                            onChange={(e) => handleVeiculoChange(index, 'uf_placa', e.target.value)}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div>
                      <h5 className="text-sm font-semibold mb-3 text-primary">Especificações Técnicas</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`motor-${index}`}>Motor</Label>
                          <Input
                            id={`motor-${index}`}
                            value={veiculo.motor || ''}
                            onChange={(e) => handleVeiculoChange(index, 'motor', e.target.value)}
                            placeholder="C4BW577384"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`potencia-${index}`}>Potência</Label>
                          <Input
                            id={`potencia-${index}`}
                            type="number"
                            value={veiculo.potencia || ''}
                            onChange={(e) => handleVeiculoChange(index, 'potencia', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cilindradas-${index}`}>Cilindradas</Label>
                          <Input
                            id={`cilindradas-${index}`}
                            type="number"
                            value={veiculo.cilindradas || ''}
                            onChange={(e) => handleVeiculoChange(index, 'cilindradas', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`capacidade-${index}`}>Capacidade</Label>
                          <Input
                            id={`capacidade-${index}`}
                            type="number"
                            value={veiculo.capacidade || ''}
                            onChange={(e) => handleVeiculoChange(index, 'capacidade', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="5"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`quantidade_passageiro-${index}`}>Qtd Passageiros</Label>
                          <Input
                            id={`quantidade_passageiro-${index}`}
                            type="number"
                            value={veiculo.quantidade_passageiro || ''}
                            onChange={(e) => handleVeiculoChange(index, 'quantidade_passageiro', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="5"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`eixos-${index}`}>Eixos</Label>
                          <Input
                            id={`eixos-${index}`}
                            type="number"
                            value={veiculo.eixos || ''}
                            onChange={(e) => handleVeiculoChange(index, 'eixos', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`nacionalidade-${index}`}>Nacionalidade</Label>
                          <Input
                            id={`nacionalidade-${index}`}
                            value={veiculo.nacionalidade || ''}
                            onChange={(e) => handleVeiculoChange(index, 'nacionalidade', e.target.value)}
                            placeholder="Nacional"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`caixa_cambio-${index}`}>Caixa de Câmbio</Label>
                          <Input
                            id={`caixa_cambio-${index}`}
                            value={veiculo.caixa_cambio || ''}
                            onChange={(e) => handleVeiculoChange(index, 'caixa_cambio', e.target.value)}
                            placeholder="Manual"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`eixo_traseiro_dif-${index}`}>Eixo Traseiro/Dif</Label>
                          <Input
                            id={`eixo_traseiro_dif-${index}`}
                            value={veiculo.eixo_traseiro_dif || ''}
                            onChange={(e) => handleVeiculoChange(index, 'eixo_traseiro_dif', e.target.value)}
                            placeholder="Informações do eixo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`terceiro_eixo-${index}`}>Terceiro Eixo</Label>
                          <Input
                            id={`terceiro_eixo-${index}`}
                            value={veiculo.terceiro_eixo || ''}
                            onChange={(e) => handleVeiculoChange(index, 'terceiro_eixo', e.target.value)}
                            placeholder="Informações do 3º eixo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`capacidade_max_tracao-${index}`}>Capacidade Máx Tração</Label>
                          <Input
                            id={`capacidade_max_tracao-${index}`}
                            type="number"
                            value={veiculo.capacidade_max_tracao || ''}
                            onChange={(e) => handleVeiculoChange(index, 'capacidade_max_tracao', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`peso_bruto_total-${index}`}>Peso Bruto Total</Label>
                          <Input
                            id={`peso_bruto_total-${index}`}
                            type="number"
                            value={veiculo.peso_bruto_total || ''}
                            onChange={(e) => handleVeiculoChange(index, 'peso_bruto_total', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Proprietário e Faturamento */}
                    <div>
                      <h5 className="text-sm font-semibold mb-3 text-primary">Proprietário e Faturamento</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`nome_proprietario-${index}`}>Nome Proprietário</Label>
                          <Input
                            id={`nome_proprietario-${index}`}
                            value={veiculo.nome_proprietario || ''}
                            onChange={(e) => handleVeiculoChange(index, 'nome_proprietario', e.target.value)}
                            placeholder="Nome do proprietário"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`doc_proprietario-${index}`}>Doc. Proprietário</Label>
                          <Input
                            id={`doc_proprietario-${index}`}
                            value={veiculo.doc_proprietario || ''}
                            onChange={(e) => handleVeiculoChange(index, 'doc_proprietario', e.target.value)}
                            placeholder="CPF/CNPJ"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`situacao_veiculo-${index}`}>Situação</Label>
                          <Input
                            id={`situacao_veiculo-${index}`}
                            value={veiculo.situacao_veiculo || ''}
                            onChange={(e) => handleVeiculoChange(index, 'situacao_veiculo', e.target.value)}
                            placeholder="Regular"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`nome_faturado-${index}`}>Nome Faturado</Label>
                          <Input
                            id={`nome_faturado-${index}`}
                            value={veiculo.nome_faturado || ''}
                            onChange={(e) => handleVeiculoChange(index, 'nome_faturado', e.target.value)}
                            placeholder="Nome do faturado"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`doc_faturado-${index}`}>Doc. Faturado</Label>
                          <Input
                            id={`doc_faturado-${index}`}
                            value={veiculo.doc_faturado || ''}
                            onChange={(e) => handleVeiculoChange(index, 'doc_faturado', e.target.value)}
                            placeholder="CPF/CNPJ"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`uf_faturado-${index}`}>UF Faturado</Label>
                          <Input
                            id={`uf_faturado-${index}`}
                            value={veiculo.uf_faturado || ''}
                            onChange={(e) => handleVeiculoChange(index, 'uf_faturado', e.target.value)}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Restrições */}
                    <div>
                      <h5 className="text-sm font-semibold mb-3 text-primary">Restrições</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`restricao_1-${index}`}>Restrição 1</Label>
                          <Input
                            id={`restricao_1-${index}`}
                            value={veiculo.restricao_1 || ''}
                            onChange={(e) => handleVeiculoChange(index, 'restricao_1', e.target.value)}
                            placeholder="Restrição 1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`restricao_2-${index}`}>Restrição 2</Label>
                          <Input
                            id={`restricao_2-${index}`}
                            value={veiculo.restricao_2 || ''}
                            onChange={(e) => handleVeiculoChange(index, 'restricao_2', e.target.value)}
                            placeholder="Restrição 2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`restricao_3-${index}`}>Restrição 3</Label>
                          <Input
                            id={`restricao_3-${index}`}
                            value={veiculo.restricao_3 || ''}
                            onChange={(e) => handleVeiculoChange(index, 'restricao_3', e.target.value)}
                            placeholder="Restrição 3"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`restricao_4-${index}`}>Restrição 4</Label>
                          <Input
                            id={`restricao_4-${index}`}
                            value={veiculo.restricao_4 || ''}
                            onChange={(e) => handleVeiculoChange(index, 'restricao_4', e.target.value)}
                            placeholder="Restrição 4"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div>
                      <h5 className="text-sm font-semibold mb-3 text-primary">Endereço</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`endereco-${index}`}>Endereço</Label>
                          <Input
                            id={`endereco-${index}`}
                            value={veiculo.endereco || ''}
                            onChange={(e) => handleVeiculoChange(index, 'endereco', e.target.value)}
                            placeholder="Rua, avenida..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`numero_casa-${index}`}>Número</Label>
                          <Input
                            id={`numero_casa-${index}`}
                            value={veiculo.numero_casa || ''}
                            onChange={(e) => handleVeiculoChange(index, 'numero_casa', e.target.value)}
                            placeholder="123"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`complemento-${index}`}>Complemento</Label>
                          <Input
                            id={`complemento-${index}`}
                            value={veiculo.complemento || ''}
                            onChange={(e) => handleVeiculoChange(index, 'complemento', e.target.value)}
                            placeholder="Apto 101"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`bairro-${index}`}>Bairro</Label>
                          <Input
                            id={`bairro-${index}`}
                            value={veiculo.bairro || ''}
                            onChange={(e) => handleVeiculoChange(index, 'bairro', e.target.value)}
                            placeholder="Centro"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cidade-${index}`}>Cidade</Label>
                          <Input
                            id={`cidade-${index}`}
                            value={veiculo.cidade || ''}
                            onChange={(e) => handleVeiculoChange(index, 'cidade', e.target.value)}
                            placeholder="São Paulo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`estado-${index}`}>Estado</Label>
                          <Input
                            id={`estado-${index}`}
                            value={veiculo.estado || ''}
                            onChange={(e) => handleVeiculoChange(index, 'estado', e.target.value)}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cep-${index}`}>CEP</Label>
                          <Input
                            id={`cep-${index}`}
                            value={veiculo.cep || ''}
                            onChange={(e) => handleVeiculoChange(index, 'cep', e.target.value)}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        }
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddVeiculo}
          className="w-full sm:w-auto mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Veículo
        </Button>
      </CardContent>
    </Card>
  );
};

export default HistoricoVeiculoForm;
