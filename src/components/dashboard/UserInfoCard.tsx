
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Wallet, Shield, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserInfoCard = () => {
  const { user } = useAuth();
  const [accountInfo, setAccountInfo] = useState({
    memberSince: '',
    lastAccess: '',
    accountStatus: 'Ativo'
  });

  useEffect(() => {
    if (user) {
      // Calcular data de cadastro (simulada)
      const memberSince = new Date().toLocaleDateString('pt-BR');
      const lastAccess = new Date().toLocaleDateString('pt-BR');
      
      setAccountInfo({
        memberSince,
        lastAccess,
        accountStatus: user.status || 'Ativo'
      });
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p>Usuário não autenticado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-brand-purple" />
          Informações da Conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.full_name || user.login || 'Não informado'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">E-mail</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.email || user.login}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plano</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.tipoplano || 'Pré-Pago'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  accountInfo.accountStatus === 'Ativo' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {accountInfo.accountStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Membro desde: {accountInfo.memberSince}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
