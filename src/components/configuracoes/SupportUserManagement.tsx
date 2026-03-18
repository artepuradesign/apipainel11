
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserCog, 
  Crown, 
  Shield, 
  Settings,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from "sonner";

interface SupportUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'suporte';
  isAdmin: boolean;
  permissions: {
    manageUsers: boolean;
    manageSystem: boolean;
    manageAPI: boolean;
    manageDatabase: boolean;
    viewReports: boolean;
  };
  createdAt: string;
  lastLogin?: string;
}

const SupportUserManagement = () => {
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SupportUser | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    isAdmin: false,
    permissions: {
      manageUsers: false,
      manageSystem: false,
      manageAPI: false,
      manageDatabase: false,
      viewReports: false
    }
  });

  useEffect(() => {
    loadSupportUsers();
  }, []);

  const loadSupportUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem('system_users') || '[]');
      const supportUsersOnly = users.filter((user: any) => user.role === 'suporte').map((user: any) => ({
        ...user,
        isAdmin: user.isAdmin || false,
        permissions: user.permissions || {
          manageUsers: false,
          manageSystem: false,
          manageAPI: false,
          manageDatabase: false,
          viewReports: false
        },
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin
      }));
      setSupportUsers(supportUsersOnly);
    } catch (error) {
      console.error('Erro ao carregar usuários de suporte:', error);
      toast.error('Erro ao carregar usuários de suporte');
    }
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('system_users') || '[]');
      
      // Verificar se username já existe
      const usernameExists = users.some((user: any) => user.username === newUser.username);
      if (usernameExists) {
        toast.error('Nome de usuário já existe');
        setLoading(false);
        return;
      }

      const supportUser: SupportUser = {
        id: Date.now().toString(),
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: 'suporte',
        isAdmin: newUser.isAdmin,
        permissions: newUser.permissions,
        createdAt: new Date().toISOString()
      };

      const userForStorage = {
        ...supportUser,
        password: newUser.password,
        plan: 'Suporte',
        balance: 0.00
      };

      users.push(userForStorage);
      localStorage.setItem('system_users', JSON.stringify(users));
      
      loadSupportUsers();
      setShowAddForm(false);
      setNewUser({
        username: '',
        name: '',
        email: '',
        password: '',
        isAdmin: false,
        permissions: {
          manageUsers: false,
          manageSystem: false,
          manageAPI: false,
          manageDatabase: false,
          viewReports: false
        }
      });
      
      toast.success('Usuário de suporte criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário de suporte');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = (userId: string, updates: Partial<SupportUser>) => {
    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('system_users') || '[]');
      const userIndex = users.findIndex((user: any) => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('system_users', JSON.stringify(users));
        loadSupportUsers();
        toast.success('Usuário atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const filteredUsers = users.filter((user: any) => user.id !== userId);
        localStorage.setItem('system_users', JSON.stringify(filteredUsers));
        loadSupportUsers();
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleSetAsAdmin = (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      // Se está definindo como admin, remover admin de outros usuários
      const users = JSON.parse(localStorage.getItem('system_users') || '[]');
      const updatedUsers = users.map((user: any) => {
        if (user.role === 'suporte') {
          return { ...user, isAdmin: user.id === userId };
        }
        return user;
      });
      localStorage.setItem('system_users', JSON.stringify(updatedUsers));
      loadSupportUsers();
      toast.success('Administrador master definido com sucesso!');
    } else {
      handleUpdateUser(userId, { isAdmin: false });
    }
  };

  const adminUser = supportUsers.find(user => user.isAdmin);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Gerenciamento de Usuários de Suporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {adminUser && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <strong>Administrador Master:</strong> {adminUser.name} ({adminUser.username})
                <br />
                <span className="text-sm text-muted-foreground">
                  Este usuário tem controle total sobre todas as configurações do sistema.
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Usuários de Suporte</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie os usuários com acesso administrativo ao sistema
              </p>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Usuário
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Usuário de Suporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Digite o nome de usuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Digite o nome completo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Digite o e-mail"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Digite a senha"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAdmin"
                    checked={newUser.isAdmin}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, isAdmin: checked })}
                  />
                  <Label htmlFor="isAdmin">Definir como Administrador Master</Label>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Permissões</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(newUser.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            setNewUser({
                              ...newUser,
                              permissions: { ...newUser.permissions, [key]: checked }
                            })
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key === 'manageUsers' && 'Gerenciar Usuários'}
                          {key === 'manageSystem' && 'Gerenciar Sistema'}
                          {key === 'manageAPI' && 'Gerenciar API'}
                          {key === 'manageDatabase' && 'Gerenciar Banco de Dados'}
                          {key === 'viewReports' && 'Visualizar Relatórios'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {supportUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {user.isAdmin ? (
                          <Crown className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          {user.isAdmin && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin Master
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          @{user.username} • {user.email}
                        </p>
                        {user.lastLogin && (
                          <p className="text-xs text-muted-foreground">
                            Último login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!user.isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetAsAdmin(user.id, true)}
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Tornar Admin
                        </Button>
                      )}
                      {user.isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetAsAdmin(user.id, false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Remover Admin
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {supportUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário de suporte encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportUserManagement;
