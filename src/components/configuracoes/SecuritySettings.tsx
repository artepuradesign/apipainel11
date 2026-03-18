
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/utils/database/userService';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [userBirthDate, setUserBirthDate] = useState('');
  
  // Estado para alterar senhas
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    birthDate: '',
    senha4: '',
    senha6: '',
    senha8: ''
  });

  // Senhas atuais para exibição
  const [currentPasswords, setCurrentPasswords] = useState({
    senhaalfa: '',
    senha4: '',
    senha6: '',
    senha8: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user?.id) {
      try {
        const userData = await userService.getUserById(parseInt(user.id));
        if (userData) {
          setCurrentPasswords({
            senhaalfa: userData.senhaalfa || '',
            senha4: userData.senha4 || '',
            senha6: userData.senha6 || '',
            senha8: userData.senha8 || ''
          });
          setUserBirthDate(userData.data_nascimento || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    
    if (passwordData.newPassword.length < 6 || passwordData.newPassword.length > 16) {
      toast.error('A senha deve ter entre 6 e 16 caracteres!');
      return;
    }

    if (passwordData.birthDate !== userBirthDate) {
      toast.error('Data de nascimento incorreta!');
      return;
    }

    // Validar senhas numéricas
    if (passwordData.senha4 && (passwordData.senha4.length !== 4 || !/^\d+$/.test(passwordData.senha4))) {
      toast.error('A senha de 4 dígitos deve ter exatamente 4 números!');
      return;
    }
    
    if (passwordData.senha6 && (passwordData.senha6.length !== 6 || !/^\d+$/.test(passwordData.senha6))) {
      toast.error('A senha de 6 dígitos deve ter exatamente 6 números!');
      return;
    }
    
    if (passwordData.senha8 && (passwordData.senha8.length !== 8 || !/^\d+$/.test(passwordData.senha8))) {
      toast.error('A senha de 8 dígitos deve ter exatamente 8 números!');
      return;
    }

    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('system_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === parseInt(user?.id || '0'));
      
      if (userIndex !== -1) {
        if (passwordData.newPassword) users[userIndex].senhaalfa = passwordData.newPassword;
        if (passwordData.senha4) users[userIndex].senha4 = passwordData.senha4;
        if (passwordData.senha6) users[userIndex].senha6 = passwordData.senha6;
        if (passwordData.senha8) users[userIndex].senha8 = passwordData.senha8;
        
        localStorage.setItem('system_users', JSON.stringify(users));
        
        setCurrentPasswords(prev => ({
          ...prev,
          ...(passwordData.newPassword && { senhaalfa: passwordData.newPassword }),
          ...(passwordData.senha4 && { senha4: passwordData.senha4 }),
          ...(passwordData.senha6 && { senha6: passwordData.senha6 }),
          ...(passwordData.senha8 && { senha8: passwordData.senha8 })
        }));
        
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
          birthDate: '',
          senha4: '',
          senha6: '',
          senha8: ''
        });
        
        toast.success('Senhas alteradas com sucesso!');
      } else {
        toast.error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao alterar senhas:', error);
      toast.error('Erro ao alterar senhas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configurações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Para alterar suas senhas:
            </p>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Digite sua data de nascimento para validação. Se não souber, entre em contato com o suporte.
          </p>
        </div>

        {/* Senhas Atuais */}
        <div>
          <h4 className="font-medium mb-3">Senhas Atuais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Senha Principal</Label>
              <Input
                type="password"
                value={currentPasswords.senhaalfa}
                readOnly
                className="bg-gray-100 dark:bg-gray-800"
                placeholder="Não cadastrada"
              />
            </div>
            <div>
              <Label>Senha 4 Dígitos</Label>
              <Input
                type="password"
                value={currentPasswords.senha4}
                readOnly
                className="bg-gray-100 dark:bg-gray-800"
                placeholder="Não cadastrada"
              />
            </div>
            <div>
              <Label>Senha 6 Dígitos</Label>
              <Input
                type="password"
                value={currentPasswords.senha6}
                readOnly
                className="bg-gray-100 dark:bg-gray-800"
                placeholder="Não cadastrada"
              />
            </div>
            <div>
              <Label>Senha 8 Dígitos</Label>
              <Input
                type="password"
                value={currentPasswords.senha8}
                readOnly
                className="bg-gray-100 dark:bg-gray-800"
                placeholder="Não cadastrada"
              />
            </div>
          </div>
        </div>

        {/* Formulário de Alteração */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Alterar Senhas</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="birth-date-validation" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Nascimento para Validação
              </Label>
              <Input
                id="birth-date-validation"
                type="date"
                value={passwordData.birthDate}
                onChange={(e) => setPasswordData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password">Nova Senha Principal (6-16 caracteres)</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Digite sua nova senha"
                  maxLength={16}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirme sua nova senha"
                  maxLength={16}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="senha4">Nova Senha 4 Dígitos</Label>
                <Input
                  id="senha4"
                  type="password"
                  value={passwordData.senha4}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, senha4: e.target.value }))}
                  placeholder="4 dígitos"
                  maxLength={4}
                />
              </div>
              <div>
                <Label htmlFor="senha6">Nova Senha 6 Dígitos</Label>
                <Input
                  id="senha6"
                  type="password"
                  value={passwordData.senha6}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, senha6: e.target.value }))}
                  placeholder="6 dígitos"
                  maxLength={6}
                />
              </div>
              <div>
                <Label htmlFor="senha8">Nova Senha 8 Dígitos</Label>
                <Input
                  id="senha8"
                  type="password"
                  value={passwordData.senha8}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, senha8: e.target.value }))}
                  placeholder="8 dígitos"
                  maxLength={8}
                />
              </div>
            </div>
            
            <Button 
              onClick={handlePasswordChange}
              disabled={loading || !passwordData.birthDate}
              className="w-full"
            >
              {loading ? 'Alterando...' : 'Alterar Senhas'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
