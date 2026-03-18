import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationFiltersProps {
  filter: 'all' | 'unread' | 'read';
  setFilter: (value: 'all' | 'unread' | 'read') => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  uniqueTypes: string[];
  getTypeLabel: (type: string) => string;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  setFilter,
  typeFilter,
  setTypeFilter,
  uniqueTypes,
  getTypeLabel
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="bg-background border-border shadow-sm">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as notificações</SelectItem>
            <SelectItem value="unread">Não lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Tipo</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-background border-border shadow-sm">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>
                {getTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default NotificationFilters;