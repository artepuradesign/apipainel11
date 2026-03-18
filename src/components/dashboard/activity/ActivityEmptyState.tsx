
import React from 'react';
import { Eye } from 'lucide-react';

const ActivityEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Nenhuma atividade recente</p>
      <p className="text-xs mt-1">As atividades aparecerão aqui em tempo real</p>
    </div>
  );
};

export default ActivityEmptyState;
