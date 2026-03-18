
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from 'lucide-react';

interface AddUserFormProps {
  newUser: {
    username: string;
    name: string;
    email: string;
    role: 'assinante' | 'suporte';
    plan: string;
    balance: number;
    cpf: string;
    phone: string;
    address: string;
    notes: string;
  };
  setNewUser: (user: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddUserForm = ({ newUser, setNewUser, onSubmit, onCancel }: AddUserFormProps) => {
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="text-lg">Novo Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Nome de Usuário *</Label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Ex: joao123"
            />
          </div>
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Ex: João Silva"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Ex: joao@email.com"
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={newUser.cpf}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setNewUser({ ...newUser, cpf: value });
              }}
              placeholder="Ex: 12345678900"
              maxLength={11}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Tipo de Usuário</Label>
            <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assinante">Assinante</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="balance">Saldo Inicial</Label>
            <Input
              id="balance"
              type="number"
              value={newUser.balance}
              onChange={(e) => setNewUser({ ...newUser, balance: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={newUser.notes}
            onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
            placeholder="Observações sobre o usuário..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit}>
            <UserPlus className="h-4 w-4 mr-2" />
            Criar Usuário
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddUserForm;
