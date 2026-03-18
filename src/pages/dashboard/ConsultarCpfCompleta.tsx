import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Settings, Crown, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { getPlanType } from '@/utils/planUtils';

interface ConsultaOption {
  id: string;
  label: string;
  description: string;
  price: number;
  category: 'basic' | 'contact' | 'address' | 'family' | 'premium';
}

const consultaOptions: ConsultaOption[] = [
  // Dados Básicos
  { id: 'nome', label: 'Nome Completo', description: 'Nome civil da pessoa', price: 0.50, category: 'basic' },
  { id: 'cpf', label: 'CPF', description: 'Número do CPF', price: 0.50, category: 'basic' },
  { id: 'nascimento', label: 'Data de Nascimento', description: 'Data de nascimento', price: 0.30, category: 'basic' },
  { id: 'situacao', label: 'Situação CPF', description: 'Status do CPF na Receita', price: 0.30, category: 'basic' },
  
  // Contato
  { id: 'email', label: 'E-mail', description: 'Endereço de e-mail', price: 2.00, category: 'contact' },
  { id: 'telefone', label: 'Telefone', description: 'Números de telefone', price: 2.00, category: 'contact' },
  
  // Endereço
  { id: 'endereco', label: 'Endereço Completo', description: 'Endereço atual', price: 2.00, category: 'address' },
  { id: 'cep', label: 'CEP', description: 'Código postal', price: 0.50, category: 'address' },
  
  // Filiação
  { id: 'mae', label: 'Nome da Mãe', description: 'Nome completo da mãe', price: 2.50, category: 'family' },
  { id: 'pai', label: 'Nome do Pai', description: 'Nome completo do pai', price: 3.00, category: 'family' },
  
  // Premium
  { id: 'historico_enderecos', label: 'Histórico de Endereços', description: 'Endereços anteriores', price: 2.00, category: 'premium' },
  { id: 'vinculos_empresariais', label: 'Vínculos Empresariais', description: 'Empresas relacionadas', price: 3.00, category: 'premium' },
  { id: 'score_credito', label: 'Score de Crédito', description: 'Pontuação de crédito', price: 4.00, category: 'premium' },
  { id: 'beneficios', label: 'Benefícios', description: 'Benefícios sociais', price: 10.00, category: 'premium' },
  { id: 'pix', label: 'Chaves PIX', description: 'Chaves PIX cadastradas', price: 1.00, category: 'premium' },
  { id: 'foto', label: 'Foto do Documento', description: 'Foto do documento de identidade', price: 5.00, category: 'premium' },
];

const ConsultarCpfCompleta = () => {
  const [cpf, setCpf] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Hook para saldo da API externa
  const { balance } = useWalletBalance();
  
  // Hook para verificar assinatura e descontos
  const { 
    hasActiveSubscription, 
    subscription, 
    planInfo, 
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading 
  } = useUserSubscription();

  // Obter plano do usuário específico (user-specific) ou usar assinatura ativa
  const userPlan = hasActiveSubscription && subscription 
    ? subscription.plan_name 
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago");
  const planType = getPlanType(userPlan);

  // Verificar se o usuário tem acesso (apenas planos REI)
  if (planType !== 'rei') {
    return (
      <div className="space-y-6">
        <PageHeaderCard 
          title="Consulta Personalizada" 
          subtitle="Acesso negado - Disponível apenas para Planos Reis"
        />
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6 text-center">
            <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A Consulta Personalizada é um recurso exclusivo para usuários com Planos Reis.
            </p>
            <div className="space-y-3">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  toast.info("Faça upgrade para plano REI para acessar a Consulta Personalizada", {
                    description: "Personalize suas consultas e pague apenas pelos dados que precisa",
                    duration: 5000
                  });
                }}
              >
                Fazer Upgrade para Rei
              </Button>
              <Link to="/dashboard/consultar-cpf">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Consulta Padrão
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const saldoPlano = balance.saldo_plano || 0;
  const saldoCarteira = balance.saldo || 0;
  const totalBalance = saldoPlano + saldoCarteira;

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const calculateTotalPrice = () => {
    const basePrice = consultaOptions
      .filter(option => selectedOptions.includes(option.id))
      .reduce((total, option) => total + option.price, 0);
    
    // Usar desconto da assinatura se ativa
    if (hasActiveSubscription) {
      return calculateSubscriptionDiscount(basePrice);
    }
    
    return { discountedPrice: basePrice, hasDiscount: false };
  };

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  const handleConsulta = async () => {
    if (!cpf || cpf.length !== 11) {
      toast.error("Digite um CPF válido (11 dígitos)");
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error("CPF Inválido");
      return;
    }

    if (selectedOptions.length === 0) {
      toast.error("Selecione pelo menos uma opção de consulta");
      return;
    }

    const { discountedPrice: finalPrice } = calculateTotalPrice();

    if (totalBalance < finalPrice) {
      toast.error(`Saldo insuficiente. Necessário: R$ ${finalPrice.toFixed(2)}, Disponível: R$ ${totalBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      // Simular consulta personalizada (implementar integração real)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(
        `Consulta personalizada realizada! Valor cobrado: R$ ${finalPrice.toFixed(2)}`,
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const groupedOptions = consultaOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, ConsultaOption[]>);

  const categoryNames = {
    basic: 'Dados Básicos',
    contact: 'Contato',
    address: 'Endereço',
    family: 'Filiação',
    premium: 'Dados Premium'
  };

  const { discountedPrice: finalPrice, hasDiscount } = calculateTotalPrice();
  const discount = hasDiscount ? discountPercentage : 0;

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Consulta Personalizada" 
        subtitle="Selecione exatamente as informações que você precisa"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário e Opções */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input CPF */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurar Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (apenas números)</Label>
                <Input
                  id="cpf"
                  placeholder="Digite o CPF (11 dígitos)"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    const cleanedCpf = pastedText.replace(/\D/g, '').slice(0, 11);
                    setCpf(cleanedCpf);
                  }}
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Opções de Consulta */}
          {Object.entries(groupedOptions).map(([category, options]) => (
            <Card key={category} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">
                  {categoryNames[category as keyof typeof categoryNames]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => handleOptionToggle(option.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {formatCurrency(option.price)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo e Checkout */}
        <div className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5 text-purple-600" />
                Resumo da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Itens selecionados:</span>
                  <span className="font-medium">{selectedOptions.length}</span>
                </div>
                
                {selectedOptions.length > 0 && (
                  <>
                    <div className="border-t pt-2 space-y-1">
                      {selectedOptions.map(optionId => {
                        const option = consultaOptions.find(opt => opt.id === optionId);
                        return option ? (
                          <div key={optionId} className="flex justify-between text-xs">
                            <span>{option.label}</span>
                            <span>{formatCurrency(option.price)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className={hasDiscount ? "line-through text-gray-500" : ""}>
                          {formatCurrency(consultaOptions
                            .filter(option => selectedOptions.includes(option.id))
                            .reduce((total, option) => total + option.price, 0)
                          )}
                        </span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total com desconto ({discount}%):</span>
                          <span className="text-green-600">{formatCurrency(finalPrice)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <div className="text-xs text-gray-600 dark:text-gray-400 border-t pt-2">
                  Saldo atual: {formatCurrency(totalBalance)}
                  <div className="text-xs text-gray-500">
                    Plano: {formatCurrency(saldoPlano)} | Carteira: {formatCurrency(saldoCarteira)}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConsulta}
                disabled={loading || !cpf || cpf.length !== 11 || selectedOptions.length === 0 || totalBalance < finalPrice}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Consultando..." : "Realizar Consulta"}
              </Button>

              <Link to="/dashboard/consultar-cpf">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Consulta Padrão
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsultarCpfCompleta;