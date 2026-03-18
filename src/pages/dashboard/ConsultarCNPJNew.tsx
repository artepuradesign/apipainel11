import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { consultationApiService } from '@/services/consultationApiService';
import { calculateDiscountedPrice } from '@/utils/planUtils';

interface CNPJResult {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao: string;
  data_abertura: string;
  atividade_principal: string;
  capital_social: string;
  endereco: string;
}

const ConsultarCNPJNew = () => {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CNPJResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Definir userPlan baseado no usuário
  const userPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  const { balance, loadBalance } = useWalletBalance();
  const consultPrice = 3.00;
  const totalBalance = (balance.saldo_plano || 0) + (balance.saldo || 0);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("cnpj_consultation_history") || "[]");
    setQueryHistory(history);
  }, []);

  const checkForDuplicate = (cnpjToCheck: string) => {
    return queryHistory.find(item => item.document === cnpjToCheck && item.success);
  };

  const handleSearch = async () => {
    if (!cnpj || cnpj.length < 14) {
      toast.error("Digite um CNPJ válido (14 dígitos)");
      return;
    }

    // Check for duplicate consultation
    const existingConsultation = checkForDuplicate(cnpj);
    if (existingConsultation) {
      toast.info(
        "Esta informação já foi consultada anteriormente e está disponível no histórico. Consulta não será cobrada.",
        {
          duration: 5000
        }
      );
      return;
    }

    const originalPrice = 2.00;
    const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

    if (totalBalance < finalPrice) {
      toast.error("Saldo insuficiente para realizar a consulta");
      return;
    }

    setLoading(true);

    try {
      const cnpjNumbers = cnpj.replace(/\D/g, '');
      const consultationResult = await consultationApiService.consultCNPJ(cnpjNumbers);
      
      if (consultationResult.success && consultationResult.data) {
        const apiData = consultationResult.data;
        setResult({
          cnpj: cnpj,
          razao_social: apiData.razao_social,
          nome_fantasia: apiData.nome_fantasia,
          situacao: apiData.situacao_cnpj,
          data_abertura: new Date(apiData.data_abertura).toLocaleDateString('pt-BR'),
          atividade_principal: apiData.cnae_principal,
          capital_social: `R$ ${Number(apiData.capital_social).toLocaleString('pt-BR')}`,
          endereco: apiData.endereco
        });
        await loadBalance();
        toast.success("Consulta realizada com sucesso!");
        
        // Scroll para o resultado
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        toast.error(consultationResult.error || 'Erro ao realizar consulta');
        setResult(null);
      }

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

  const getTodayQueries = () => {
    const today = new Date().toDateString();
    return queryHistory.filter(item => 
      new Date(item.date).toDateString() === today
    ).length;
  };

  const getMonthlyTotal = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    return queryHistory
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
      })
      .reduce((total, item) => total + item.price, 0);
  };

  const getMonthlyDiscount = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    return queryHistory
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
      })
      .reduce((total, item) => total + (item.originalPrice - item.price), 0);
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Consultar CNPJ" 
        subtitle="Consulte informações completas do CNPJ"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Consulta */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Nova Consulta CNPJ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (apenas números)</Label>
              <Input
                id="cnpj"
                placeholder="Digite o CNPJ (14 dígitos)"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value.replace(/\D/g, '').slice(0, 14))}
                maxLength={14}
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !cnpj || cnpj.length < 14 || totalBalance < consultPrice}
              className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Consultando..." : "Consultar CNPJ"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado da Consulta */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Resultado da Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {result.situacao}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">CNPJ:</span>
                    <span className="font-mono">{result.cnpj}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Razão Social:</span>
                    <span>{result.razao_social}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Nome Fantasia:</span>
                    <span>{result.nome_fantasia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Data Abertura:</span>
                    <span>{result.data_abertura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Atividade:</span>
                    <span className="text-right max-w-48">{result.atividade_principal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Capital Social:</span>
                    <span>{result.capital_social}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Endereço:</span>
                    <span className="text-right max-w-48">{result.endereco}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhuma consulta realizada ainda.</p>
                <p className="text-sm mt-2">Digite um CNPJ válido e clique em "Consultar CNPJ".</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultado expandido quando houver resultado */}
      {result && (
        <div ref={resultRef}>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <CheckCircle className="mr-2 h-5 w-5" />
                CNPJ Encontrado - Informações Completas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Dados da Empresa</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CNPJ</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.cnpj}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Razão Social</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.razao_social}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome Fantasia</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.nome_fantasia}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Situação</span>
                      <Badge className="bg-green-500 text-white">{result.situacao}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Informações Adicionais</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Data de Abertura</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.data_abertura}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Capital Social</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.capital_social}</span>
                    </div>
                    <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Atividade Principal</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.atividade_principal}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Endereço</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.endereco}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico de Consultas */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Histórico de Consultas CNPJ</CardTitle>
        </CardHeader>
        <CardContent>
          {queryHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>CNPJ</TableHead>
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
                    <TableCell className="font-mono">
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
              Nenhuma consulta CNPJ realizada ainda.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards movidos para baixo do histórico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-brand-purple">{getTodayQueries()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoje</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-brand-purple">{queryHistory.length}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Consultas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-brand-purple">{formatCurrency(getMonthlyTotal())}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Mensal</p>
              <p className="text-xs text-green-600">Desconto: {formatCurrency(getMonthlyDiscount())}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultarCNPJNew;
