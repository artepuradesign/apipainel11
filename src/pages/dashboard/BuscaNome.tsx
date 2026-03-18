import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Search } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import ModuleStatsCards from '@/components/dashboard/stats/ModuleStatsCards';
import ConsultaResult from '@/components/dashboard/ConsultaResult';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { calculateDiscountedPrice } from '@/utils/planUtils';
import { getWalletBalance, getPlanBalance, deductFromAvailableBalance } from '@/utils/balanceUtils';
import { useAuth } from '@/contexts/AuthContext';

interface NameResult {
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  nome_mae: string;
  situacao: string;
  sexo: string;
  idade: string;
  email: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  nome_pai: string;
}

const BuscaNome = () => {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NameResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);

  // Obter plano do usuário específico (user-specific)
  const userPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  useEffect(() => {
    if (user) {
      const wallet = getWalletBalance(user.id);
      const plan = getPlanBalance(user.id);
      setWalletBalance(wallet);
      setPlanBalance(plan);
    }
    
    const history = JSON.parse(localStorage.getItem("nome_consultation_history") || "[]");
    setQueryHistory(history);
  }, [user]);

  const totalBalance = walletBalance + planBalance;

  const handleSearch = async () => {
    if (!nome || nome.trim().length < 3) {
      toast.error("Digite um nome válido com pelo menos 3 caracteres");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const originalPrice = 2.50;
    const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

    console.log('=== BUSCA NOME - CÁLCULO DE PREÇO ===', {
      userPlan,
      originalPrice,
      discount,
      finalPrice,
      walletBalance,
      planBalance,
      totalBalance
    });

    if (totalBalance < finalPrice) {
      toast.error(`Saldo insuficiente. Necessário: R$ ${finalPrice.toFixed(2)}, Disponível: R$ ${totalBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: NameResult = {
        nome: nome.toUpperCase(),
        cpf: "456.745.674-56",
        rg: "12.345.678-9",
        data_nascimento: "15/05/1985",
        nome_mae: "MARIA SILVA",
        nome_pai: "JOSÉ DOS SANTOS",
        situacao: "REGULAR",
        sexo: "Masculino",
        idade: "40 anos",
        email: "joao.silva@email.com",
        telefone: "(11) 98765-4321",
        endereco: "Rua das Flores, 123, Apto 45",
        bairro: "Centro",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01234-567"
      };

      setResult(mockResult);

      // Debitar o valor com desconto aplicado usando o novo sistema
      const debitSuccess = await deductFromAvailableBalance(user.id, finalPrice, `Consulta de Nome: ${nome}`);
      
      if (debitSuccess) {
        // Atualizar os saldos locais
        const newWallet = getWalletBalance(user.id);
        const newPlan = getPlanBalance(user.id);
        setWalletBalance(newWallet);
        setPlanBalance(newPlan);

        // Emitir evento para atualizar navbar
        window.dispatchEvent(new Event('balanceUpdated'));

        const consultationRecord = {
          type: "NOME",
          document: nome,
          date: new Date().toISOString(),
          price: finalPrice,
          originalPrice: originalPrice,
          discount: discount,
          success: true
        };

        const updatedHistory = [consultationRecord, ...queryHistory].slice(0, 50);
        setQueryHistory(updatedHistory);
        localStorage.setItem("nome_consultation_history", JSON.stringify(updatedHistory));

        const generalHistory = JSON.parse(localStorage.getItem("consultation_history") || "[]");
        generalHistory.unshift(consultationRecord);
        localStorage.setItem("consultation_history", JSON.stringify(generalHistory.slice(0, 100)));

        if (discount > 0) {
          toast.success(`Consulta realizada com sucesso! Economia de ${discount}% (R$ ${(originalPrice - finalPrice).toFixed(2)})`);
        } else {
          toast.success("Consulta realizada com sucesso!");
        }
      } else {
        toast.error("Erro ao debitar saldo");
      }

    } catch (error) {
      toast.error("Erro ao realizar consulta");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    const exportData = `
Dados da Consulta - Busca por Nome
=====================================
Nome: ${result.nome}
CPF: ${result.cpf}
RG: ${result.rg}
Data de Nascimento: ${result.data_nascimento}
Sexo: ${result.sexo}
Idade: ${result.idade}
Situação: ${result.situacao}
Email: ${result.email}
Telefone: ${result.telefone}
Endereço: ${result.endereco}
Bairro: ${result.bairro}
Cidade/UF: ${result.cidade}/${result.uf}
CEP: ${result.cep}
Nome da Mãe: ${result.nome_mae}
Nome do Pai: ${result.nome_pai}
=====================================
Data da Consulta: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta-nome-${result.cpf.replace(/\D/g, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso!');
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

  const originalPrice = 2.50;
  const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Busca por Nome" 
        subtitle="Consulte informações por nome completo"
      />

      <ModuleStatsCards 
        todayQueries={15}
        totalQueries={450}
        monthlyTotal="R$ 1125,00"
        discount="R$ 225,00"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Nova Busca por Nome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Digite o nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* Mostrar informações de preço */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Preço da consulta:</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    R$ {finalPrice.toFixed(2)}
                  </div>
                  {discount > 0 && (
                    <>
                      <div className="text-xs text-gray-500 line-through">
                        R$ {originalPrice.toFixed(2)}
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">
                        -{discount}% desconto
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Plano: {userPlan} | Saldo disponível: R$ {totalBalance.toFixed(2)}
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !nome.trim() || nome.trim().length < 3 || totalBalance < finalPrice}
              className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Buscando..." : `Buscar por Nome (R$ ${finalPrice.toFixed(2)})`}
            </Button>
          </CardContent>
        </Card>

        <ConsultaResult
          title="Resultado da Busca por Nome"
          data={result}
          loading={loading}
          onExport={handleExport}
        />
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Histórico de Buscas por Nome</CardTitle>
        </CardHeader>
        <CardContent>
          {queryHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
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
              Nenhuma busca por nome realizada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuscaNome;
