import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Car, Copy } from 'lucide-react';
import { baseHistoricoVeiculoService, BaseHistoricoVeiculo } from '@/services/baseHistoricoVeiculoService';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoricoDeVeiculoSectionProps {
  cpfId: number;
}

const HistoricoDeVeiculoSection: React.FC<HistoricoDeVeiculoSectionProps> = ({ cpfId }) => {
  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState<BaseHistoricoVeiculo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVeiculos = async () => {
      if (!cpfId) return;

      setLoading(true);
      setError(null);
      
      console.log('🚗 [VEICULO] Iniciando carregamento para cpfId:', cpfId);
      console.log('🚗 [VEICULO] URL base da API:', 'https://api.apipainel.com.br');

      try {
        const response = await baseHistoricoVeiculoService.getByCpfId(cpfId);
        
        console.log('🚗 [VEICULO] Resposta recebida:', {
          success: response.success,
          hasData: !!response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : 0,
          error: response.error
        });

        if (response.success && Array.isArray(response.data)) {
          console.log('✅ [VEICULO] Dados carregados com sucesso:', response.data.length, 'veículos');
          if (response.data.length > 0) {
            console.log('🚗 [VEICULO] Primeiro veículo:', response.data[0]);
          }
          setVeiculos(response.data);
        } else {
          console.warn('⚠️ [VEICULO] Nenhum dado retornado ou erro:', response.error);
          setVeiculos([]);
          setError(response.error || null);
        }
      } catch (err) {
        console.error('❌ [VEICULO] Erro ao carregar:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setVeiculos([]);
      } finally {
        setLoading(false);
        console.log('🚗 [VEICULO] Carregamento finalizado');
      }
    };

    loadVeiculos();
  }, [cpfId]);

  const copyVeiculosData = () => {
    if (!veiculos || veiculos.length === 0) {
      toast.error('Nenhum dado disponível para copiar');
      return;
    }

    const texto = veiculos.map((v, index) => `
═══════════════════════════════════════
VEÍCULO ${index + 1}
═══════════════════════════════════════

📋 DADOS DO VEÍCULO
Placa: ${v.placa || '-'}
Chassi: ${v.chassi || '-'}
Motor: ${v.motor || '-'}
Marca: ${v.marca || '-'}
UF Placa: ${v.uf_placa || '-'}

📅 ANO
Ano Fabricação: ${v.ano_fabricacao || '-'}
Ano Modelo: ${v.ano_modelo || '-'}

🔧 ESPECIFICAÇÕES TÉCNICAS
Combustível: ${v.combustivel || '-'}
Potência: ${v.potencia || '-'}
Capacidade: ${v.capacidade || '-'}
Cilindradas: ${v.cilindradas || '-'}
Caixa de Câmbio: ${v.caixa_cambio || '-'}
Eixo Traseiro Dif: ${v.eixo_traseiro_dif || '-'}
Terceiro Eixo: ${v.terceiro_eixo || '-'}
Eixos: ${v.eixos || '-'}

⚖️ PESO E CAPACIDADE
Capacidade Máx. Tração: ${v.capacidade_max_tracao || '-'}
Peso Bruto Total: ${v.peso_bruto_total || '-'}

🎨 CARACTERÍSTICAS
Tipo Carroceria: ${v.tipo_carroceria || '-'}
Cor do Veículo: ${v.cor_veiculo || '-'}
Quantidade Passageiros: ${v.quantidade_passageiro || '-'}
Nacionalidade: ${v.nacionalidade || '-'}

👤 PROPRIETÁRIO
Nome: ${v.nome_proprietario || '-'}
Documento: ${v.doc_proprietario || '-'}

📄 FATURADO
Nome Faturado: ${v.nome_faturado || '-'}
Documento Faturado: ${v.doc_faturado || '-'}
UF Faturado: ${v.uf_faturado || '-'}

📍 ENDEREÇO
${v.endereco || '-'}, ${v.numero_casa || 'S/N'}
${v.complemento ? `Complemento: ${v.complemento}` : ''}
${v.bairro || '-'} - ${v.cidade || '-'} / ${v.estado || '-'}
CEP: ${v.cep || '-'}

📊 STATUS
Situação do Veículo: ${v.situacao_veiculo || '-'}
Restrição 1: ${v.restricao_1 || '-'}
Restrição 2: ${v.restricao_2 || '-'}
Restrição 3: ${v.restricao_3 || '-'}
Restrição 4: ${v.restricao_4 || '-'}
    `.trim()).join('\n\n');

    navigator.clipboard.writeText(texto);
    toast.success(`Dados de ${veiculos.length} veículo(s) copiados!`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Car className="h-5 w-5" />
            Histórico de Veículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
            Histórico de Veículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {error || 'Nenhum histórico de veículo encontrado'}
            </p>
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
              Histórico de Veículo
            </CardTitle>
            {veiculos.length > 0 && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {veiculos.length}
              </div>
            )}
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
      <CardContent className="space-y-8">
        {veiculos.map((veiculo, index) => (
          <div key={veiculo.id || index}>
            {index > 0 && <Separator className="my-6" />}
            
            <div className="space-y-6">
              {/* Cabeçalho do Veículo */}
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Car className="h-4 w-4" />
                VEÍCULO {index + 1}
              </div>

              {/* Dados do Veículo */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📋 DADOS DO VEÍCULO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Placa</Label>
                    <Input value={veiculo.placa || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Chassi</Label>
                    <Input value={veiculo.chassi || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Motor</Label>
                    <Input value={veiculo.motor || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Marca</Label>
                    <Input value={veiculo.marca || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>UF Placa</Label>
                    <Input value={veiculo.uf_placa || '-'} disabled className="bg-muted uppercase" />
                  </div>
                </div>
              </div>

              {/* Ano */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📅 ANO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Ano Fabricação</Label>
                    <Input value={veiculo.ano_fabricacao || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Ano Modelo</Label>
                    <Input value={veiculo.ano_modelo || '-'} disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">🔧 ESPECIFICAÇÕES TÉCNICAS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Combustível</Label>
                    <Input value={veiculo.combustivel || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Potência</Label>
                    <Input value={veiculo.potencia || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Capacidade</Label>
                    <Input value={veiculo.capacidade || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Cilindradas</Label>
                    <Input value={veiculo.cilindradas || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Caixa de Câmbio</Label>
                    <Input value={veiculo.caixa_cambio || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Eixo Traseiro Dif</Label>
                    <Input value={veiculo.eixo_traseiro_dif || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Terceiro Eixo</Label>
                    <Input value={veiculo.terceiro_eixo || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Eixos</Label>
                    <Input value={veiculo.eixos || '-'} disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Peso e Capacidade */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">⚖️ PESO E CAPACIDADE</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Capacidade Máx. Tração</Label>
                    <Input value={veiculo.capacidade_max_tracao || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Peso Bruto Total</Label>
                    <Input value={veiculo.peso_bruto_total || '-'} disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Características */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">🎨 CARACTERÍSTICAS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo Carroceria</Label>
                    <Input value={veiculo.tipo_carroceria || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Cor do Veículo</Label>
                    <Input value={veiculo.cor_veiculo || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Quantidade Passageiros</Label>
                    <Input value={veiculo.quantidade_passageiro || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Nacionalidade</Label>
                    <Input value={veiculo.nacionalidade || '-'} disabled className="bg-muted uppercase" />
                  </div>
                </div>
              </div>

              {/* Proprietário */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">👤 PROPRIETÁRIO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Nome Proprietário</Label>
                    <Input value={veiculo.nome_proprietario || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Documento Proprietário</Label>
                    <Input value={veiculo.doc_proprietario || '-'} disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Faturado */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📄 FATURADO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Nome Faturado</Label>
                    <Input value={veiculo.nome_faturado || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Documento Faturado</Label>
                    <Input value={veiculo.doc_faturado || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>UF Faturado</Label>
                    <Input value={veiculo.uf_faturado || '-'} disabled className="bg-muted uppercase" />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📍 ENDEREÇO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Endereço</Label>
                    <Input value={veiculo.endereco || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input value={veiculo.numero_casa || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input value={veiculo.complemento || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input value={veiculo.bairro || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>CEP</Label>
                    <Input value={veiculo.cep || '-'} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input value={veiculo.cidade || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input value={veiculo.estado || '-'} disabled className="bg-muted uppercase" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📊 STATUS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Situação do Veículo</Label>
                    <Input value={veiculo.situacao_veiculo || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Restrição 1</Label>
                    <Input value={veiculo.restricao_1 || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Restrição 2</Label>
                    <Input value={veiculo.restricao_2 || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Restrição 3</Label>
                    <Input value={veiculo.restricao_3 || '-'} disabled className="bg-muted uppercase" />
                  </div>
                  <div>
                    <Label>Restrição 4</Label>
                    <Input value={veiculo.restricao_4 || '-'} disabled className="bg-muted uppercase" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HistoricoDeVeiculoSection;
