import React, { useState, useEffect } from 'react';
import { clearRequestsCache } from '@/config/api';
import { refreshNotifications } from '@/utils/notificationRefresh';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Download,
  AlertTriangle,
  Code,
  Database,
  Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import UserStatsCards from '@/components/dashboard/users/UserStatsCards';
import UserFilters from '@/components/dashboard/users/UserFilters';
import AddUserModal from '@/components/dashboard/users/AddUserModal';
import UserListItem from '@/components/dashboard/users/UserListItem';
import UserDetailsModal from '@/components/dashboard/users/UserDetailsModal';
import EditUserModal from '@/components/dashboard/users/EditUserModal';
import type { User } from '@/types/user';
import { adminUserApiService, type AdminUserData } from '@/services/adminUserApiService';
import { referralRegistrationService } from '@/services/referralRegistrationService';

const GestaoUsuarios = () => {
  console.log('GestaoUsuarios component started rendering');
  
  const { isSupport } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'assinante' | 'suporte'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'assinante' as 'assinante' | 'suporte',
    plan: 'Pré-Pago',
    balance: 0,
    cpf: '',
    phone: '',
    address: '',
    notes: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'suspenso' | 'pendente'
  });

  useEffect(() => {
    console.log('GestaoUsuarios useEffect - isSupport:', isSupport);
    if (isSupport) {
      loadUsers();
    }
  }, [isSupport]);

  const loadUsers = async () => {
    console.log('loadUsers function called');
    setLoading(true);
    
    try {
      // Carregar todos os usuários via API administrativa
      const apiResponse = await adminUserApiService.getAllUsers();
      
      if (apiResponse.success && apiResponse.data) {
        console.log('Loaded users from API:', apiResponse.data);
        
        // A API dashboard-admin retorna os dados em formato diferente
        const usersData = Array.isArray(apiResponse.data) ? apiResponse.data : ((apiResponse.data as any)?.users || []);
        
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id?.toString() || '',
          username: user.login || user.email?.split('@')[0] || '',
          name: user.name || user.full_name || '',
          email: user.email || '',
          role: (user.user_role === 'admin' || user.user_role === 'suporte') ? 'suporte' : 'assinante' as 'assinante' | 'suporte',
          user_role: user.user_role || 'assinante', // Role original da API
          plan: user.plan || user.tipoplano || 'Pré-Pago',
          balance: user.balance || user.saldo || 0,
          planBalance: user.saldo_plano || 0,
          isActive: user.status === 'ativo',
          status: user.status || 'pendente',
          createdAt: user.created_at || new Date().toISOString(),
          lastLogin: user.last_login || user.ultimo_login || '',
          cpf: user.cpf || '',
          phone: user.telefone || '',
          address: user.endereco || '',
          notes: '',
          pixKeys: [],
          planStartDate: user.data_inicio || '',
          planEndDate: user.data_fim || '',
          planDiscount: user.plan_discount || user.discount_percentage || 0,
          subscription: user.subscription
        }));
        
        setUsers(formattedUsers);
        console.log('Formatted users from API:', formattedUsers);
      } else {
        console.error('❌ [LOAD_USERS] Erro ao carregar usuários:', apiResponse.error);
        toast.error(apiResponse.error || 'Erro ao carregar usuários da API');
      }
    } catch (error) {
      console.error('❌ [LOAD_USERS] Erro na comunicação:', error);
      toast.error('Erro na comunicação com a API');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (extraData: { planBalance: number; planStartDate: string; planEndDate: string; planDiscount: number }) => {
    console.log('handleAddUser called with:', newUser, 'extraData:', extraData);
    if (!newUser.name || !newUser.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      // PASSO 1: Registrar usuário básico via /auth/register
      const registrationPayload = {
        email: newUser.email.trim(),
        password: '123456',
        full_name: newUser.name.trim(),
        user_role: newUser.role,
        aceite_termos: true,
        cpf: newUser.cpf,
        telefone: newUser.phone,
      };

      console.log('🌐 [ADD_USER] Passo 1: Registrando usuário via /auth/register...');
      const registrationResult = await referralRegistrationService.registerWithReferral(registrationPayload);

      if (!registrationResult.success) {
        console.error('❌ [ADD_USER] Erro no registro:', registrationResult.error);
        toast.error(registrationResult.error || 'Erro ao criar usuário');
        return;
      }

      // PASSO 2: Obter ID do usuário criado e atualizar dados complementares
      const createdUserId = registrationResult.user?.id;
      console.log('✅ [ADD_USER] Usuário registrado, ID:', createdUserId);

      if (createdUserId) {
        const updatePayload: any = {
          tipoplano: newUser.plan,
          saldo: newUser.balance,
          saldo_plano: extraData.planBalance,
          cpf: newUser.cpf,
          telefone: newUser.phone,
          endereco: newUser.address,
          plan_discount: extraData.planDiscount,
          notes: newUser.notes,
          status: newUser.status,
        };

        if (extraData.planStartDate) {
          updatePayload.data_inicio = extraData.planStartDate;
        }
        if (extraData.planEndDate) {
          updatePayload.data_fim = extraData.planEndDate;
        }

        console.log('🌐 [ADD_USER] Passo 2: Atualizando dados complementares...', updatePayload);
        const updateResult = await adminUserApiService.updateUser(createdUserId, updatePayload);
        
        if (!updateResult.success) {
          console.warn('⚠️ [ADD_USER] Usuário criado mas erro ao atualizar dados:', updateResult.error);
          toast.warning(`Usuário criado, mas houve erro ao salvar dados complementares: ${updateResult.error || 'erro desconhecido'}`);
        }
      } else {
        console.warn('⚠️ [ADD_USER] Não foi possível obter o ID do usuário criado para atualizar dados extras');
      }

      await loadUsers();
      setNewUser({
        username: '',
        name: '',
        email: '',
        role: 'assinante',
        plan: 'Pré-Pago',
        balance: 0,
        cpf: '',
        phone: '',
        address: '',
        notes: '',
        status: 'ativo'
      });
      setShowAddForm(false);
      toast.success('Usuário criado com sucesso! Senha padrão: 123456');
    } catch (error) {
      console.error('❌ [ADD_USER] Erro na comunicação:', error);
      toast.error('Erro na comunicação com a API');
    } finally {
      setLoading(false);
    }
  };

  // Guardar o usuário original ao abrir edição para comparar mudanças
  const [originalEditingUser, setOriginalEditingUser] = useState<User | null>(null);

  const handleStartEdit = (user: User) => {
    setOriginalEditingUser({ ...user });
    setEditingUser({ ...user });
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setLoading(true);
    
    try {
      const userData: Partial<AdminUserData> & { notes?: string; plan_discount?: number; data_inicio?: string; data_fim?: string } = {
        email: editingUser.email,
        full_name: editingUser.name,
        user_role: editingUser.role as 'assinante' | 'suporte' | 'admin',
        tipoplano: editingUser.plan,
        saldo: editingUser.balance,
        saldo_plano: editingUser.planBalance || 0,
        cpf: editingUser.cpf,
        telefone: editingUser.phone,
        endereco: editingUser.address,
        status: editingUser.status || (editingUser.isActive ? 'ativo' : 'inativo'),
        plan_discount: editingUser.planDiscount || 0,
        data_inicio: editingUser.planStartDate,
        data_fim: editingUser.planEndDate,
      };

      // Enviar observações para gerar notificação no backend
      if (editingUser.notes && editingUser.notes.trim()) {
        (userData as any).notes = editingUser.notes.trim();
      }

      const apiResponse = await adminUserApiService.updateUser(parseInt(editingUser.id), userData);
      
      if (apiResponse.success) {
        await loadUsers();
        setEditingUser(null);
        setOriginalEditingUser(null);
        // Limpar cache e forçar refresh das notificações
        clearRequestsCache();
        setTimeout(() => refreshNotifications(), 1000);
        toast.success('Usuário atualizado com sucesso! Notificações enviadas.');
      } else {
        console.error('❌ [EDIT_USER] Erro na API:', apiResponse.error);
        toast.error(apiResponse.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('❌ [EDIT_USER] Erro na comunicação:', error);
      toast.error('Erro na comunicação com a API');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    console.log('🔄 [TOGGLE_STATUS] Iniciando toggle - userId:', userId, 'isActive:', isActive);
    setLoading(true);
    
    try {
      const apiResponse = await adminUserApiService.toggleUserStatus(parseInt(userId), isActive);
      console.log('🔄 [TOGGLE_STATUS] Resposta da API:', apiResponse);
      
      if (apiResponse.success) {
        await loadUsers();
        toast.success(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        console.error('❌ [TOGGLE_STATUS] Erro na API:', apiResponse.error);
        toast.error(apiResponse.error || 'Erro ao atualizar status do usuário');
      }
    } catch (error) {
      console.error('❌ [TOGGLE_STATUS] Erro na comunicação:', error);
      toast.error('Erro na comunicação com a API');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('🗑️ [DELETE_USER] Iniciando exclusão - userId:', userId);
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita!')) {
      setLoading(true);
      try {
        const apiResponse = await adminUserApiService.deleteUser(parseInt(userId));
        console.log('🗑️ [DELETE_USER] Resposta da API:', apiResponse);
        
        if (apiResponse.success) {
          await loadUsers();
          toast.success('Usuário excluído com sucesso!');
        } else {
          console.error('❌ [DELETE_USER] Erro na API:', apiResponse.error);
          toast.error(apiResponse.error || 'Erro ao excluir usuário');
        }
      } catch (error) {
        console.error('❌ [DELETE_USER] Erro na comunicação:', error);
        // Log mais detalhado do erro
        if (error instanceof Error) {
          console.error('❌ [DELETE_USER] Error name:', error.name);
          console.error('❌ [DELETE_USER] Error message:', error.message);
          console.error('❌ [DELETE_USER] Error stack:', error.stack);
        }
        toast.error('Erro na comunicação com a API');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async (userId: string) => {
    console.log('🔑 [RESET_PASSWORD] Iniciando reset - userId:', userId);
    if (window.confirm('Tem certeza que deseja resetar a senha deste usuário? A nova senha será: 123456')) {
      setLoading(true);
      try {
        const apiResponse = await adminUserApiService.resetUserPassword(parseInt(userId), '123456');
        console.log('🔑 [RESET_PASSWORD] Resposta da API:', apiResponse);
        
        if (apiResponse.success) {
          toast.success('Senha resetada com sucesso! Nova senha: 123456');
        } else {
          console.error('❌ [RESET_PASSWORD] Erro na API:', apiResponse.error);
          toast.error(apiResponse.error || 'Erro ao resetar senha');
        }
      } catch (error) {
        console.error('❌ [RESET_PASSWORD] Erro na comunicação:', error);
        toast.error('Erro na comunicação com a API');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `usuarios_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Dados exportados com sucesso!');
  };

  console.log('GestaoUsuarios render - isSupport:', isSupport, 'users count:', users.length);

  if (!isSupport) {
    console.log('User is not support, showing access denied');
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Apenas usuários de suporte podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const userName = user.name || '';
    const userEmail = user.email || '';
    const userUsername = user.username || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userUsername.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    assinantes: users.filter(u => u.role === 'assinante').length,
    suporte: users.filter(u => u.role === 'suporte').length,
    admin: users.filter(u => (u as any).user_role === 'admin').length,
    ativos: users.filter(u => u.isActive).length,
    assinaturasAtivas: users.filter(u => {
      if (!u.subscription?.ends_at) return false;
      // Se ends_at >= data atual, considera ativo
      const dataFim = new Date(u.subscription.ends_at);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Remove hora para comparar apenas datas
      return dataFim >= hoje;
    }).length
  };

  console.log('About to render main component, stats:', stats);

  return (
    <div className="space-y-6">
      <DashboardTitleCard
        title="Gestão de Usuários"
        icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
      />

      <UserStatsCards stats={stats} />

      <Card>
        <CardHeader className="p-4 lg:p-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                Gestão de Usuários
              </CardTitle>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                Gerencie todos os usuários do sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportUsers} disabled={loading} className="text-xs lg:text-sm">
                <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} disabled={loading} className="text-xs lg:text-sm">
                {loading ? (
                  <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                )}
                <span className="hidden sm:inline">Novo Usuário</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6">
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          <AddUserModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            newUser={newUser}
            setNewUser={setNewUser}
            onSubmit={handleAddUser}
          />

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {filteredUsers.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    onToggleStatus={handleToggleUserStatus}
                    onView={setViewingUser}
                    onEdit={handleStartEdit}
                    onResetPassword={handleResetPassword}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


      <UserDetailsModal
        user={viewingUser}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
      />

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditUser}
        onUserChange={setEditingUser}
      />
    </div>
  );
};

export default GestaoUsuarios;
