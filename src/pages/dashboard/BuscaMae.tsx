
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import ModuleStatsCards from '@/components/dashboard/stats/ModuleStatsCards';
import ConsultationChart from '@/components/dashboard/ConsultationChart';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { calculateDiscountedPrice, getPlanType } from '@/utils/planUtils';

interface MaeResult {
  nome_filho: string;
  cpf: string;
  data_nascimento: string;
  nome_mae: string;
  situacao_cpf: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
}

const BuscaMae = () => {
  const [nomeMae, setNomeMae] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MaeResult[]>([]);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);

  const userPlan = localStorage.getItem("user_plan") || "Rainha de Ouros";
  const userBalance = parseFloat(localStorage.getItem("user_balance") || "0.00");
  const planType = getPlanType(userPlan);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("mae_consultation_history") || "[]");
    setQueryHistory(history);
  }, []);

  const handleSearch = async () => {
    if (!nomeMae || nomeMae.length < 3) {
      toast.error("Digite um nome válido (mínimo 3 caracteres)");
      return;
    }

    const originalPrice = 2.50;
    const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

    if (userBalance < finalPrice) {
      toast.error("Saldo insuficiente para realizar a consulta");
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults: MaeResult[] = [
        {
          nome_filho: "JOÃO DA SILVA",
          cpf: "12345678901",
          data_nascimento: "15/05/1985",
          nome_mae: nomeMae.toUpperCase(),
          situacao_cpf: "REGULAR",
          endereco: "RUA DAS FLORES, 123",
          cidade: "SÃO PAULO",
          uf: "SP"
        },
        {
          nome_filho: "MARIA DA SILVA",
          cpf: "98765432109",
          data_nascimento: "22/08/1990",
          nome_mae: nomeMae.toUpperCase(),
          situacao_cpf: "REGULAR",
          endereco: "AV. BRASIL, 456",
          cidade: "RIO DE JANEIRO",
          uf: "RJ"
        }
      ];

      setResults(mockResults);

      // Atualizar saldo
      const newBalance = userBalance - finalPrice;
      localStorage.setItem("user_balance", newBalance.toString());

      // Salvar no histórico
      const consultationRecord = {
        type: "MÃE",
        document: nomeMae,
        date: new Date().toISOString(),
        price: finalPrice,
        originalPrice: originalPrice,
        discount: discount,
        success: true
      };

      const updatedHistory = [consultationRecord, ...queryHistory].slice(0, 50);
      setQueryHistory(updatedHistory);
      localStorage.setItem("mae_consultation_history", JSON.stringify(updatedHistory));

      // Atualizar histórico geral
      const generalHistory = JSON.parse(localStorage.getItem("consultation_history") || "[]");
      generalHistory.unshift(consultationRecord);
      localStorage.setItem("consultation_history", JSON.stringify(generalHistory.slice(0, 100)));

      toast.success(
        `Consulta realizada com sucesso! Valor descontado: R$ ${finalPrice.toFixed(2)}`,
        {
          style: {
            backgroundColor: '#f0fdf4',
            borderColor: '#22c55e',
            color: '#15803d'
          }
        }
      );

    } catch (error) {
      toast.error("Erro ao realizar consulta");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Busca por Nome da Mãe" 
        subtitle="Consulte filhos pelo nome da mãe"
      />

      <ModuleStatsCards 
        todayQueries={12}
        totalQueries={380}
        monthlyTotal="R$ 950,00"
        discount="R$ 190,00"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Nova Busca por Mãe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeMae">Nome da Mãe</Label>
              <Input
                id="nomeMae"
                placeholder="Digite o nome completo da mãe"
                value={nomeMae}
                onChange={(e) => setNomeMae(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Custo da consulta:</span>
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">
                    R$ 2,50
                  </div>
                  <div className="font-bold text-green-600">
                    R$ {calculateDiscountedPrice(2.50, userPlan).finalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Seu saldo atual: R$ {userBalance.toFixed(2)}
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !nomeMae || nomeMae.length < 3 || userBalance < calculateDiscountedPrice(2.50, userPlan).finalPrice}
              className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Consultando..." : "Buscar por Mãe"}
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Sobre a Busca por Mãe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Encontre filhos utilizando o nome completo da mãe. Útil para pesquisas genealógicas 
                e localização de familiares.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-300">Retorna:</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• Nome dos filhos</li>
                  <li>• CPF dos filhos</li>
                  <li>• Data de nascimento</li>
                  <li>• Endereços atuais</li>
                  <li>• Situação do CPF</li>
                </ul>
              </div>

              {userBalance < calculateDiscountedPrice(2.50, userPlan).finalPrice && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="flex items-center text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Saldo insuficiente</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Você precisa recarregar seu saldo para realizar esta consulta.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados da Consulta */}
      {results.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
            <CardTitle className="flex items-center text-green-700 dark:text-green-300">
              <CheckCircle className="mr-2 h-5 w-5" />
              {results.length} Filho(s) Encontrado(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.nome_filho}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CPF:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nascimento:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.data_nascimento}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Situação:</span>
                        <Badge className="bg-green-500 text-white">{result.situacao_cpf}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Localização:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.cidade}/{result.uf}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ConsultationChart 
        consultationHistory={queryHistory}
        title="Histórico Busca Mãe - Últimos 7 dias"
      />

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Histórico de Buscas por Mãe</CardTitle>
        </CardHeader>
        <CardContent>
          {queryHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome da Mãe</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryHistory.slice(0, 10).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell>
                      {item.document}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">
                        {formatCurrency(item.price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.discount > 0 ? (
                        <Badge className="bg-green-500 text-white">
                          {item.discount}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {item.success ? 'Sucesso' : 'Erro'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma busca por mãe realizada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuscaMae;
