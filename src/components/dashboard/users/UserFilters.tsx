
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterRole: 'all' | 'assinante' | 'suporte';
  setFilterRole: (value: 'all' | 'assinante' | 'suporte') => void;
  filterStatus: 'all' | 'active' | 'inactive';
  setFilterStatus: (value: 'all' | 'active' | 'inactive') => void;
}

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus
}: UserFiltersProps) => {
  return (
    <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:gap-4">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="assinante">Assinantes</SelectItem>
            <SelectItem value="suporte">Suporte</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserFilters;
