
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { calculateDiscountedPrice } from '@/utils/planUtils';

interface PaiResult {
  nome_pai: string;
  filhos: Array<{
    nome: string;
    cpf: string;
    data_nascimento: string;
    nome_mae: string;
  }>;
}

const BuscaPai = () => {
  const [nomePai, setNomePai] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaiResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);

  const userPlan = localStorage.getItem("user_plan") || "Rainha de Ouros";
  const userBalance = parseFloat(localStorage.getItem("user_balance") || "0.00");

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("pai_consultation_history") || "[]");
    setQueryHistory(history);
  }, []);

  const handleSearch = async () => {
    if (!nomePai || nomePai.trim().length < 3) {
      toast.error("Digite um nome válido com pelo menos 3 caracteres");
      return;
    }

    const originalPrice = 3.00;
    const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

    if (userBalance < finalPrice) {
      toast.error("Saldo insuficiente para realizar a consulta");
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: PaiResult = {
        nome_pai: nomePai.toUpperCase(),
        filhos: [
          {
            nome: "JOÃO SILVA",
            cpf: "123.456.789-00",
            data_nascimento: "15/03/1995",
            nome_mae: "MARIA SANTOS"
          },
          {
            nome: "ANA SILVA",
            cpf: "987.654.321-00",
            data_nascimento: "22/08/1998",
            nome_mae: "MARIA SANTOS"
          }
        ]
      };

      setResult(mockResult);

      const newBalance = userBalance - finalPrice;
      localStorage.setItem("user_balance", newBalance.toString());

      const consultationRecord = {
        type: "PAI",
        document: nomePai,
        date: new Date().toISOString(),
        price: finalPrice,
        originalPrice: originalPrice,
        discount: discount,
        success: true
      };

      const updatedHistory = [consultationRecord, ...queryHistory].slice(0, 50);
      setQueryHistory(updatedHistory);
      localStorage.setItem("pai_consultation_history", JSON.stringify(updatedHistory));

      const generalHistory = JSON.parse(localStorage.getItem("consultation_history") || "[]");
      generalHistory.unshift(consultationRecord);
      localStorage.setItem("consultation_history", JSON.stringify(generalHistory.slice(0, 100)));

      toast.success("Consulta realizada com sucesso!");

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

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Busca por Nome do Pai" 
        subtitle="Consulte informações por nome do pai"
      />

      <ModuleStatsCards 
        todayQueries={8}
        totalQueries={240}
        monthlyTotal="R$ 720,00"
        discount="R$ 144,00"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Nova Busca por Nome do Pai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomePai">Nome do Pai</Label>
              <Input
                id="nomePai"
                placeholder="Digite o nome completo do pai"
                value={nomePai}
                onChange={(e) => setNomePai(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Custo da consulta:</span>
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">
                    R$ 3,00
                  </div>
                  <div className="font-bold text-green-600">
                    R$ {calculateDiscountedPrice(3.00, userPlan).finalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Seu saldo atual: R$ {userBalance.toFixed(2)}
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !nomePai.trim() || nomePai.trim().length < 3 || userBalance < calculateDiscountedPrice(3.00, userPlan).finalPrice}
              className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Buscando..." : "Buscar por Nome do Pai"}
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Resultado da Busca</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nome do Pai:</span>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {result.nome_pai}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Filhos Encontrados:</h4>
                  {result.filhos.map((filho, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Nome:</span>
                        <span>{filho.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">CPF:</span>
                        <span className="font-mono">{filho.cpf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Data Nascimento:</span>
                        <span>{filho.data_nascimento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Nome da Mãe:</span>
                        <span>{filho.nome_mae}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhuma busca realizada ainda.</p>
                <p className="text-sm mt-2">Digite um nome válido e clique em "Buscar por Nome do Pai".</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Histórico de Buscas por Nome do Pai</CardTitle>
        </CardHeader>
        <CardContent>
          {queryHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome do Pai</TableHead>
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
              Nenhuma busca por nome do pai realizada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuscaPai;
