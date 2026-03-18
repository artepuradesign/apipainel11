
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { consultationApiService } from '@/services/consultationApiService';

const ConsultarVeiculo = () => {
  const [placa, setPlaca] = useState('');
  const [chassi, setChassi] = useState('');
  const [searchType, setSearchType] = useState<'placa' | 'chassi'>('placa');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { balance, loadBalance } = useWalletBalance();

  const consultPrice = 3.00;
  const totalBalance = (balance.saldo_plano || 0) + (balance.saldo || 0);

  const formatPlaca = (value: string) => {
    // New format: ABC1D23 or ABC-1D23
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (sanitized.length <= 3) return sanitized;
    if (sanitized.length <= 7) {
      return `${sanitized.slice(0, 3)}-${sanitized.slice(3)}`;
    }
    return sanitized.slice(0, 7); // Limit to 7 chars
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPlaca = formatPlaca(e.target.value);
    setPlaca(formattedPlaca);
  };

  const handleChassiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chassi should be uppercase without formatting
    const formattedChassi = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setChassi(formattedChassi);
  };

  const validatePlaca = (placa: string) => {
    const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Simplified validation - just checking length and format
    // Real validation would be more complex
    return cleanPlaca.length === 7 && 
           /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleanPlaca);
  };

  const validateChassi = (chassi: string) => {
    // Simple validation for chassis number
    // Real validation would check VIN format and check digit
    return chassi.length === 17;
  };

  const handleConsulta = async () => {
    // Reset states
    setError('');
    setResult(null);
    
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Check if user has enough balance
    if (totalBalance < consultPrice) {
      toast.error(`Saldo insuficiente. Necessário: R$ ${consultPrice.toFixed(2)}, Disponível: R$ ${totalBalance.toFixed(2)}`);
      return;
    }
    
    // Validate input based on search type
    let isValid = false;
    let searchValue = '';
    
    if (searchType === 'placa') {
      isValid = validatePlaca(placa);
      searchValue = placa;
      if (!isValid) {
        setError('Placa inválida. Por favor, verifique o número informado.');
        return;
      }
    } else {
      isValid = validateChassi(chassi);
      searchValue = chassi;
      if (!isValid) {
        setError('Chassi inválido. O chassi deve conter 17 caracteres.');
        return;
      }
    }
    
    // Start searching
    setIsSearching(true);
    
    try {
      const consultationResult = await consultationApiService.consultVehicle(searchValue, searchType);
      
      if (consultationResult.success && consultationResult.data) {
        const apiData = consultationResult.data;
        
        // Converter dados da API para o formato esperado
        const formattedResult = {
          placa: apiData.placa,
          chassi: apiData.chassi,
          marca: apiData.marca,
          modelo: apiData.modelo,
          anoFabricacao: apiData.ano_fabricacao?.toString(),
          anoModelo: apiData.ano_modelo?.toString(),
          cor: apiData.cor,
          combustivel: apiData.combustivel,
          situacao: apiData.situacao,
          renavam: apiData.renavam,
          municipio: apiData.municipio,
          uf: apiData.uf,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        };
        
        setResult(formattedResult);
        
        // Recarregar saldo
        await loadBalance();
        
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
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header - Updated to use PageHeaderCard */}
      <PageHeaderCard 
        title="Consultar Veículo" 
        subtitle="Bem Vindo: Usuário X / Plano: Plano Black"
      />
      
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="dark:bg-gray-800 dark:text-white">
          <CardHeader>
            <CardTitle>Consulta de Veículo</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Informe a placa ou o chassi para realizar a consulta (Custo: R$ {consultPrice.toFixed(2)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <Button
                  variant={searchType === 'placa' ? 'default' : 'outline'}
                  onClick={() => setSearchType('placa')}
                  className={searchType === 'placa' ? 'bg-brand-purple hover:bg-brand-darkPurple' : ''}
                >
                  Consultar por Placa
                </Button>
                <Button
                  variant={searchType === 'chassi' ? 'default' : 'outline'}
                  onClick={() => setSearchType('chassi')}
                  className={searchType === 'chassi' ? 'bg-brand-purple hover:bg-brand-darkPurple' : ''}
                >
                  Consultar por Chassi
                </Button>
              </div>
              
              {searchType === 'placa' ? (
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa do Veículo</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="placa" 
                      placeholder="ABC-1D23" 
                      className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={placa}
                      onChange={handlePlacaChange}
                      maxLength={8} // Includes the dash
                    />
                    <Button 
                      type="submit" 
                      className="bg-brand-purple hover:bg-brand-darkPurple"
                      onClick={handleConsulta}
                      disabled={isSearching || !placa || placa.replace(/[^a-zA-Z0-9]/g, '').length !== 7}
                    >
                      <Search size={18} className="mr-2" />
                      {isSearching ? 'Consultando...' : 'Consultar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="chassi">Chassi do Veículo</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="chassi" 
                      placeholder="9BWHE21JX24060960" 
                      className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={chassi}
                      onChange={handleChassiChange}
                      maxLength={17}
                    />
                    <Button 
                      type="submit" 
                      className="bg-brand-purple hover:bg-brand-darkPurple"
                      onClick={handleConsulta}
                      disabled={isSearching || !chassi || chassi.length !== 17}
                    >
                      <Search size={18} className="mr-2" />
                      {isSearching ? 'Consultando...' : 'Consultar'}
                    </Button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
            <div>Saldo disponível: R$ {totalBalance.toFixed(2)}</div>
          </CardFooter>
        </Card>
        
        {result && (
          <Card className="border-green-500 dark:border-green-600 dark:bg-gray-800 dark:text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 dark:text-green-500" />
                <CardTitle>Resultado da Consulta</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Informações encontradas para o veículo 
                {searchType === 'placa' ? ` com placa ${result.placa}` : ` com chassi ${result.chassi}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Dados do Veículo</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Placa</dt>
                      <dd className="text-base font-semibold">{result.placa}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Chassi</dt>
                      <dd className="text-base">{result.chassi}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Marca / Modelo</dt>
                      <dd className="text-base">{result.marca} / {result.modelo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ano</dt>
                      <dd className="text-base">{result.anoFabricacao} / {result.anoModelo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cor</dt>
                      <dd className="text-base">{result.cor}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Combustível</dt>
                      <dd className="text-base">{result.combustivel}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Renavam</dt>
                      <dd className="text-base">{result.renavam}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Situação</dt>
                      <dd className="text-base">{result.situacao}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Local</dt>
                      <dd className="text-base">{result.municipio} - {result.uf}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Atualização</dt>
                      <dd className="text-base">{result.ultimaAtualizacao}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultarVeiculo;
