import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Car, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import ModuleStatsCards from '@/components/dashboard/stats/ModuleStatsCards';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { calculateDiscountedPrice } from '@/utils/planUtils';
import { getWalletBalance, getPlanBalance, deductFromAvailableBalance } from '@/utils/balanceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { consultationApiService } from '@/services/consultationApiService';

interface VehicleResult {
  placa: string;
  chassi: string;
  modelo: string;
  marca: string;
  ano: string;
  cor: string;
  combustivel: string;
  situacao: string;
  proprietario: string;
}

const ConsultarVeiculoNew = () => {
  const { user } = useAuth();
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VehicleResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [error, setError] = useState('');
  // Obter plano do usuário específico (user-specific)
  const userPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  useEffect(() => {
    if (user) {
      const wallet = getWalletBalance(user.id);
      const plan = getPlanBalance(user.id);
      setWalletBalance(wallet);
      setPlanBalance(plan);
    }
    
    const history = JSON.parse(localStorage.getItem("vehicle_consultation_history") || "[]");
    setQueryHistory(history);
  }, [user]);

  const totalBalance = walletBalance + planBalance;

  const handleSearch = async () => {
    if (!placa || placa.length < 7) {
      toast.error("Digite uma placa válida");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const originalPrice = 3.00;
    const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

    console.log('=== CONSULTA VEÍCULO - CÁLCULO DE PREÇO ===', {
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
      const consultationResult = await consultationApiService.consultVehicle(placa.toUpperCase(), 'placa');
      
      if (consultationResult.success && consultationResult.data) {
        const apiData = consultationResult.data;
        
        const formattedResult = {
          placa: apiData.placa || placa.toUpperCase(),
          chassi: apiData.chassi || '',
          marca: apiData.marca || '',
          modelo: apiData.modelo || '',
          ano: `${apiData.ano_fabricacao || ''}/${apiData.ano_modelo || ''}`,
          cor: apiData.cor || '',
          combustivel: apiData.combustivel || '',
          situacao: apiData.situacao || '',
          proprietario: apiData.proprietario || 'N/A'
        };
        
        setResult(formattedResult);
        setError('');
        toast.success("Consulta realizada com sucesso!");
      } else {
        setError(consultationResult.error || "Erro ao realizar consulta");
        setResult(null);
        toast.error(consultationResult.error || "Erro ao realizar consulta");
      }
      
    } catch (error) {
      console.error('Erro na consulta Veículo:', error);
      setError("Erro ao realizar consulta. Tente novamente mais tarde.");
      setResult(null);
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

  const originalPrice = 3.00;
  const { finalPrice, discount } = calculateDiscountedPrice(originalPrice, userPlan);

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Consultar Veículo" 
        subtitle="Consulte informações completas do veículo"
      />

      <ModuleStatsCards 
        todayQueries={12}
        totalQueries={300}
        monthlyTotal="R$ 900,00"
        discount="R$ 180,00"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Nova Consulta Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa do Veículo</Label>
              <Input
                id="placa"
                placeholder="Digite a placa (ABC1234 ou ABC1D23)"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase().slice(0, 8))}
                maxLength={8}
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
              disabled={loading || !placa || placa.length < 7 || totalBalance < finalPrice}
              className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Consultando..." : `Consultar Veículo (R$ ${finalPrice.toFixed(2)})`}
            </Button>
          </CardContent>
        </Card>

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
                    <span className="font-medium">Placa:</span>
                    <span className="font-mono">{result.placa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Chassi:</span>
                    <span className="font-mono text-xs">{result.chassi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Marca/Modelo:</span>
                    <span>{result.marca} {result.modelo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Ano:</span>
                    <span>{result.ano}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Cor:</span>
                    <span>{result.cor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Combustível:</span>
                    <span>{result.combustivel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Proprietário:</span>
                    <span>{result.proprietario}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhuma consulta realizada ainda.</p>
                <p className="text-sm mt-2">Digite uma placa válida e clique em "Consultar Veículo".</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Histórico de Consultas Veículo</CardTitle>
        </CardHeader>
        <CardContent>
          {queryHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Placa</TableHead>
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
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma consulta de veículo realizada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultarVeiculoNew;
