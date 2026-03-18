
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { consultationApiService } from '@/services/consultationApiService';

// Mock CNPJ data
const mockCnpjData = {
  razaoSocial: "Empresa de Tecnologia LTDA",
  nomeFantasia: "Tech Solutions",
  cnpj: "12.345.678/0001-90",
  abertura: "10/05/2015",
  situacao: "Ativa",
  tipo: "Matriz",
  naturezaJuridica: "Sociedade Empresária Limitada",
  capitalSocial: "R$ 150.000,00",
  porte: "Médio",
  email: "contato@techsolutions.com.br",
  telefone: "(11) 3456-7890",
  endereco: {
    logradouro: "Avenida Paulista",
    numero: "1000",
    complemento: "Sala 1010",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100"
  },
  socios: [
    { nome: "Carlos Alberto Silva", cargo: "Sócio-Administrador", pais: "Brasil" },
    { nome: "Ana Maria Santos", cargo: "Sócio", pais: "Brasil" }
  ],
  atividadePrincipal: "62.01-5-01 - Desenvolvimento de programas de computador sob encomenda",
  atividadesSecundarias: [
    "62.02-3-00 - Desenvolvimento e licenciamento de programas de computador customizáveis",
    "62.04-0-00 - Consultoria em tecnologia da informação"
  ]
};

const ConsultarCNPJ = () => {
  const [searchParams] = useSearchParams();
  const [cnpj, setCnpj] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<typeof mockCnpjData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { balance, loadBalance } = useWalletBalance();
  
  const consultPrice = 3.00;
  const totalBalance = (balance.saldo_plano || 0) + (balance.saldo || 0);

  // Check for URL parameters and auto-search
  useEffect(() => {
    const queryParam = searchParams.get('query');
    const autoSearch = searchParams.get('autoSearch');
    
    if (queryParam) {
      setCnpj(queryParam);
      
      if (autoSearch === 'true') {
        // Automatically perform search
        performSearch(queryParam);
      }
    }
  }, [searchParams]);

  const performSearch = async (cnpjValue: string = cnpj) => {
    const cnpjNumbers = cnpjValue.replace(/\D/g, '');
    
    if (cnpjNumbers.length !== 14) {
      toast.error("Por favor, digite um CNPJ válido");
      return;
    }
    
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    if (totalBalance < consultPrice) {
      toast.error(`Saldo insuficiente. Necessário: R$ ${consultPrice.toFixed(2)}, Disponível: R$ ${totalBalance.toFixed(2)}`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const consultationResult = await consultationApiService.consultCNPJ(cnpjNumbers);
      
      if (consultationResult.success && consultationResult.data) {
        const apiData = consultationResult.data;
        
        // Converter dados da API para o formato esperado
        setResult({
          razaoSocial: apiData.razao_social,
          nomeFantasia: apiData.nome_fantasia,
          cnpj: cnpjValue,
          abertura: new Date(apiData.data_abertura).toLocaleDateString('pt-BR'),
          situacao: apiData.situacao_cnpj,
          tipo: 'Matriz',
          naturezaJuridica: apiData.natureza_juridica,
          capitalSocial: `R$ ${Number(apiData.capital_social).toLocaleString('pt-BR')}`,
          porte: apiData.porte_empresa,
          email: apiData.email,
          telefone: apiData.telefone,
          endereco: {
            logradouro: apiData.endereco.split(',')[0] || 'N/A',
            numero: apiData.endereco.split(',')[1] || 'N/A',
            complemento: apiData.endereco.split(',')[2] || '',
            bairro: apiData.endereco.split(',')[3] || 'N/A',
            cidade: apiData.cidade,
            estado: apiData.estado,
            cep: apiData.cep
          },
          socios: apiData.socios ? apiData.socios.split(', ').map((socio: string) => {
            const parts = socio.split(' (');
            return {
              nome: parts[0],
              cargo: parts[1]?.replace(')', '') || 'Sócio',
              pais: 'Brasil'
            };
          }) : [],
          atividadePrincipal: apiData.cnae_principal,
          atividadesSecundarias: apiData.cnae_secundarios ? apiData.cnae_secundarios.split(', ') : []
        });
        
        // Recarregar saldo
        await loadBalance();
        
        toast.success("Consulta realizada com sucesso!");
      } else {
        setError(consultationResult.error || "Erro ao realizar consulta");
        setResult(null);
        toast.error(consultationResult.error || "Erro ao realizar consulta");
      }
      
    } catch (error) {
      console.error('Erro na consulta CNPJ:', error);
      setError("Erro ao realizar consulta. Tente novamente mais tarde.");
      setResult(null);
      toast.error("Erro ao realizar consulta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format CNPJ
    value = value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);
    
    if (value.length > 12) {
      value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5, 8)}/${value.substring(8, 12)}-${value.substring(12)}`;
    } else if (value.length > 8) {
      value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5, 8)}/${value.substring(8)}`;
    } else if (value.length > 5) {
      value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5)}`;
    } else if (value.length > 2) {
      value = `${value.substring(0, 2)}.${value.substring(2)}`;
    }
    
    setCnpj(value);
  };

  const handleExport = () => {
    toast.info("Exportando dados para PDF...");
    // In a real app, this would trigger a download
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeaderCard 
        title="Consultar CNPJ" 
        subtitle="Busque informações detalhadas por CNPJ"
        badgeText="3 créditos"
      />
      
      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o CNPJ para consultar"
                value={cnpj}
                onChange={handleCnpjChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Formato: 12.345.678/0001-90
              </p>
            </div>
            <Button 
              className="bg-brand-purple hover:bg-brand-darkPurple"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? "Consultando..." : "Consultar"}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      {result && (
        <Card className="overflow-hidden">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="font-medium text-green-800 dark:text-green-300">
                CNPJ Encontrado
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Exportar
            </Button>
          </div>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Dados da Empresa</h3>
                <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Razão Social</dt>
                    <dd className="col-span-2 text-sm">{result.razaoSocial}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome Fantasia</dt>
                    <dd className="col-span-2 text-sm">{result.nomeFantasia}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CNPJ</dt>
                    <dd className="col-span-2 text-sm">{result.cnpj}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Abertura</dt>
                    <dd className="col-span-2 text-sm">{result.abertura}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Situação</dt>
                    <dd className="col-span-2 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {result.situacao}
                      </span>
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</dt>
                    <dd className="col-span-2 text-sm">{result.tipo}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Natureza Jurídica</dt>
                    <dd className="col-span-2 text-sm">{result.naturezaJuridica}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Capital Social</dt>
                    <dd className="col-span-2 text-sm">{result.capitalSocial}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Porte</dt>
                    <dd className="col-span-2 text-sm">{result.porte}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contato e Endereço</h3>
                <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="col-span-2 text-sm">{result.email}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</dt>
                    <dd className="col-span-2 text-sm">{result.telefone}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Endereço</dt>
                    <dd className="col-span-2 text-sm">
                      {`${result.endereco.logradouro}, ${result.endereco.numero}`}
                      {result.endereco.complemento && `, ${result.endereco.complemento}`}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bairro</dt>
                    <dd className="col-span-2 text-sm">{result.endereco.bairro}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cidade/UF</dt>
                    <dd className="col-span-2 text-sm">{`${result.endereco.cidade}/${result.endereco.estado}`}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CEP</dt>
                    <dd className="col-span-2 text-sm">{result.endereco.cep}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-4">Sócios</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Nome</th>
                    <th className="px-6 py-3 text-left">Cargo</th>
                    <th className="px-6 py-3 text-left">País</th>
                  </tr>
                </thead>
                <tbody>
                  {result.socios.map((socio, index) => (
                    <tr 
                      key={index} 
                      className="bg-white dark:bg-gray-900 border-b dark:border-gray-800"
                    >
                      <td className="px-6 py-4">{socio.nome}</td>
                      <td className="px-6 py-4">{socio.cargo}</td>
                      <td className="px-6 py-4">{socio.pais}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-4">Atividades</h3>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Atividade Principal</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">{result.atividadePrincipal}</p>
              
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 mb-2">Atividades Secundárias</h4>
              <ul className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
                {result.atividadesSecundarias.map((atividade, index) => (
                  <li key={index}>{atividade}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultarCNPJ;
