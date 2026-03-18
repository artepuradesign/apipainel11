
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, RotateCcw, Trash2, Users, Settings, CreditCard, Database, Shield } from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SystemReset = () => {
  const [isResetting, setIsResetting] = useState(false);

  const resetUsers = () => {
    localStorage.removeItem('system_users');
    localStorage.removeItem('user_balance');
    localStorage.removeItem('user_plan');
    localStorage.removeItem('current_user_id');
    
    // Limpar dados específicos de usuários
    Object.keys(localStorage).forEach(key => {
      if (key.includes('_balance_') || key.includes('_transactions_') || key.includes('_plan_') || 
          key.includes('wallet_balance_') || key.includes('plan_balance_') || key.includes('payment_history_')) {
        localStorage.removeItem(key);
      }
    });
    
    toast.success("Dados de usuários resetados!");
  };

  const resetPersonalization = () => {
    localStorage.removeItem('lovable_custom_plans');
    localStorage.removeItem('lovable_custom_modules');
    localStorage.removeItem('lovable_system_panels');
    localStorage.removeItem('lovable_personalization_settings');
    toast.success("Personalização resetada!");
  };

  const resetFinancial = () => {
    localStorage.removeItem('central_cash_transactions');
    localStorage.removeItem('central_cash_stats');
    localStorage.removeItem('referral_records');
    localStorage.removeItem('device_records');
    localStorage.removeItem('referral_system_config');
    
    // Limpar transações e balanços
    Object.keys(localStorage).forEach(key => {
      if (key.includes('balance_transactions_') || key.includes('payment_history_') || 
          key.includes('wallet_balance_') || key.includes('plan_balance_')) {
        localStorage.removeItem(key);
      }
    });
    
    toast.success("Dados financeiros resetados!");
  };

  const resetSupport = () => {
    localStorage.removeItem('support_tickets');
    localStorage.removeItem('admin_stats');
    localStorage.removeItem('admin_recent_activity');
    toast.success("Dados de suporte resetados!");
  };


  const resetSettings = () => {
    localStorage.removeItem('app_settings');
    localStorage.removeItem('user_preferences');
    localStorage.removeItem('system_settings');
    toast.success("Configurações resetadas!");
  };

  const resetEverything = () => {
    setIsResetting(true);
    
    setTimeout(() => {
      // Reset completo do localStorage
      localStorage.clear();
      
      // Recriar usuários padrão
      const defaultUsers = [
        {
          id: '1',
          username: 'anjoip',
          password: '112233',
          name: 'Anjo IP',
          email: 'anjoip@email.com',
          role: 'assinante',
          plan: 'Pré-Pago',
          balance: 0.00
        },
        {
          id: '2',
          username: 'artepura',
          password: '332211',
          name: 'SUPORTE',
          email: 'suporte@apipainel.com',
          role: 'suporte',
          plan: 'Rei de Espadas',
          balance: 0.00
        }
      ];
      
      localStorage.setItem('system_users', JSON.stringify(defaultUsers));
      
      setIsResetting(false);
      toast.success("Sistema completamente resetado! Faça login novamente.");
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }, 3000);
  };

  const resetOptions = [
    {
      id: 'users',
      title: 'Usuários e Contas',
      description: 'Remove todos os usuários, balanços e dados pessoais',
      icon: Users,
      action: resetUsers,
      color: 'bg-blue-500',
      items: ['Usuários cadastrados', 'Balanços', 'Históricos pessoais']
    },
    {
      id: 'personalization',
      title: 'Personalização',
      description: 'Remove planos customizados, módulos e painéis',
      icon: Settings,
      action: resetPersonalization,
      color: 'bg-purple-500',
      items: ['Planos customizados', 'Módulos personalizados', 'Painéis configurados']
    },
    {
      id: 'financial',
      title: 'Dados Financeiros',
      description: 'Remove transações, caixa central e indicações',
      icon: CreditCard,
      action: resetFinancial,
      color: 'bg-green-500',
      items: ['Transações do caixa', 'Histórico de pagamentos', 'Sistema de indicações']
    },
    {
      id: 'support',
      title: 'Suporte e Tickets',
      description: 'Remove tickets de suporte e estatísticas admin',
      icon: Shield,
      action: resetSupport,
      color: 'bg-orange-500',
      items: ['Tickets de suporte', 'Estatísticas admin', 'Atividades recentes']
    },
    {
      id: 'settings',
      title: 'Configurações Gerais',
      description: 'Remove preferências e configurações do sistema',
      icon: RotateCcw,
      action: resetSettings,
      color: 'bg-gray-500',
      items: ['Preferências de usuário', 'Configurações do sistema']
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Reiniciar Sistema
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Reset seletivo ou completo dos dados do sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Aviso de segurança */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-200">Atenção!</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              Esta ação é irreversível. Todos os dados selecionados serão permanentemente removidos.
              Certifique-se de ter backup dos dados importantes antes de prosseguir.
            </p>
          </div>

          {/* Opções de reset individuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resetOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card key={option.id} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`${option.color} p-2 rounded-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {option.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {option.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {option.items.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Trash2 className="w-3 h-3 mr-2" />
                          Resetar {option.title}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Reset - {option.title}</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja resetar <strong>{option.title.toLowerCase()}</strong>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={option.action}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Reset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* Reset completo */}
          <div className="text-center space-y-4">
            <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-6">
              <RotateCcw className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Reset Completo do Sistema
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Remove TODOS os dados do sistema e volta às configurações de fábrica.
                Os usuários padrão serão recriados automaticamente.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="lg"
                    disabled={isResetting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isResetting ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Resetando Sistema...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        RESETAR TUDO
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">⚠️ RESET COMPLETO DO SISTEMA</AlertDialogTitle>
                    <AlertDialogDescription className="text-red-700">
                      <strong>ATENÇÃO MÁXIMA!</strong> Esta ação irá:
                      <br />• Remover TODOS os dados do sistema
                      <br />• Apagar todos os usuários (exceto os padrão)
                      <br />• Limpar todas as transações e históricos
                      <br />• Resetar todas as personalizações
                      <br />• Voltar às configurações de fábrica
                      <br /><br />
                      <strong>Esta ação é IRREVERSÍVEL!</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={resetEverything}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      SIM, RESETAR TUDO
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemReset;
