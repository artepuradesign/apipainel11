
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Settings, Edit, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConsultationModule {
  id: number;
  name: string;
  description: string;
  icon: string;
  path: string;
  basic_price: number;
  complete_price: number;
  premium_price: number | null;
  is_active: boolean;
}

const ModuleManagement = () => {
  const [modules, setModules] = useState<ConsultationModule[]>([]);
  const [editingModule, setEditingModule] = useState<ConsultationModule | null>(null);
  const [newModule, setNewModule] = useState<Partial<ConsultationModule>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load modules from localStorage (simulating database)
    const savedModules = localStorage.getItem("consultation_modules");
    if (savedModules) {
      setModules(JSON.parse(savedModules));
    } else {
      // Initialize with default modules
      const defaultModules: ConsultationModule[] = [
        {
          id: 1,
          name: "CPF",
          description: "Consulta de dados de pessoas físicas",
          icon: "User",
          path: "/dashboard/consultar-cpf-puxa-tudo",
          basic_price: 0.19,
          complete_price: 0.39,
          premium_price: 0.59,
          is_active: true
        },
        {
          id: 2,
          name: "CNPJ",
          description: "Consulta de dados de empresas",
          icon: "Building2",
          path: "/dashboard/consultar-cnpj",
          basic_price: 0.29,
          complete_price: 0.59,
          premium_price: 0.99,
          is_active: true
        },
        {
          id: 3,
          name: "Veículo",
          description: "Consulta de dados de veículos",
          icon: "Car",
          path: "/dashboard/consultar-veiculo",
          basic_price: 0.39,
          complete_price: 0.69,
          premium_price: null,
          is_active: true
        },
        {
          id: 4,
          name: "Checker Lista",
          description: "Verificação em lote",
          icon: "Clipboard",
          path: "/dashboard/checker-lista",
          basic_price: 0.15,
          complete_price: null,
          premium_price: null,
          is_active: true
        }
      ];
      setModules(defaultModules);
      localStorage.setItem("consultation_modules", JSON.stringify(defaultModules));
    }
  }, []);

  const saveModules = (updatedModules: ConsultationModule[]) => {
    setModules(updatedModules);
    localStorage.setItem("consultation_modules", JSON.stringify(updatedModules));
    toast.success("Módulos atualizados com sucesso!");
  };

  const handleToggleActive = (moduleId: number) => {
    const updatedModules = modules.map(module => 
      module.id === moduleId 
        ? { ...module, is_active: !module.is_active }
        : module
    );
    saveModules(updatedModules);
  };

  const handleEditModule = (module: ConsultationModule) => {
    setEditingModule({ ...module });
  };

  const handleSaveEdit = () => {
    if (!editingModule) return;
    
    const updatedModules = modules.map(module => 
      module.id === editingModule.id ? editingModule : module
    );
    saveModules(updatedModules);
    setEditingModule(null);
  };

  const handleAddModule = () => {
    if (!newModule.name || !newModule.description) {
      toast.error("Nome e descrição são obrigatórios");
      return;
    }

    const newId = Math.max(...modules.map(m => m.id)) + 1;
    const moduleToAdd: ConsultationModule = {
      id: newId,
      name: newModule.name || "",
      description: newModule.description || "",
      icon: newModule.icon || "Settings",
      path: newModule.path || `/dashboard/${newModule.name?.toLowerCase()}`,
      basic_price: newModule.basic_price || 0,
      complete_price: newModule.complete_price || 0,
      premium_price: newModule.premium_price || null,
      is_active: true
    };

    const updatedModules = [...modules, moduleToAdd];
    saveModules(updatedModules);
    setNewModule({});
    setShowAddForm(false);
  };

  const handleDeleteModule = (moduleId: number) => {
    if (confirm("Tem certeza que deseja excluir este módulo?")) {
      const updatedModules = modules.filter(module => module.id !== moduleId);
      saveModules(updatedModules);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A";
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Administração de Módulos
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-brand-purple hover:bg-brand-darkPurple"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Módulo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          {/* Formulário para Novo Módulo */}
          {showAddForm && (
            <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Novo Módulo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-name">Nome</Label>
                    <Input
                      id="new-name"
                      value={newModule.name || ""}
                      onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do módulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-icon">Ícone</Label>
                    <Input
                      id="new-icon"
                      value={newModule.icon || ""}
                      onChange={(e) => setNewModule(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="User, Building2, Car, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="new-description">Descrição</Label>
                    <Input
                      id="new-description"
                      value={newModule.description || ""}
                      onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do módulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-basic-price">Preço Básico</Label>
                    <Input
                      id="new-basic-price"
                      type="number"
                      step="0.01"
                      value={newModule.basic_price || ""}
                      onChange={(e) => setNewModule(prev => ({ ...prev, basic_price: parseFloat(e.target.value) }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-complete-price">Preço Completo</Label>
                    <Input
                      id="new-complete-price"
                      type="number"
                      step="0.01"
                      value={newModule.complete_price || ""}
                      onChange={(e) => setNewModule(prev => ({ ...prev, complete_price: parseFloat(e.target.value) }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddModule} className="bg-green-500 hover:bg-green-600">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Módulo
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de Módulos */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preços</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="font-medium">{module.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {module.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>Básico: {formatCurrency(module.basic_price)}</div>
                      {module.complete_price && (
                        <div>Completo: {formatCurrency(module.complete_price)}</div>
                      )}
                      {module.premium_price && (
                        <div>Premium: {formatCurrency(module.premium_price)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={module.is_active}
                        onCheckedChange={() => handleToggleActive(module.id)}
                      />
                      <Badge className={module.is_active ? "bg-green-500" : "bg-gray-500"}>
                        {module.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Modal de Edição */}
          {editingModule && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Editar Módulo: {editingModule.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Input
                      id="edit-description"
                      value={editingModule.description}
                      onChange={(e) => setEditingModule(prev => prev ? { ...prev, description: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-basic-price">Preço Básico</Label>
                    <Input
                      id="edit-basic-price"
                      type="number"
                      step="0.01"
                      value={editingModule.basic_price}
                      onChange={(e) => setEditingModule(prev => prev ? { ...prev, basic_price: parseFloat(e.target.value) } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-complete-price">Preço Completo</Label>
                    <Input
                      id="edit-complete-price"
                      type="number"
                      step="0.01"
                      value={editingModule.complete_price || ""}
                      onChange={(e) => setEditingModule(prev => prev ? { ...prev, complete_price: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-premium-price">Preço Premium</Label>
                    <Input
                      id="edit-premium-price"
                      type="number"
                      step="0.01"
                      value={editingModule.premium_price || ""}
                      onChange={(e) => setEditingModule(prev => prev ? { ...prev, premium_price: parseFloat(e.target.value) || null } : null)}
                    />
                  </div>
                </CardContent>
                <div className="flex justify-end space-x-2 p-6">
                  <Button variant="outline" onClick={() => setEditingModule(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleManagement;
