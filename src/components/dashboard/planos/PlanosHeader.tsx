
import React from 'react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

interface PlanosHeaderProps {
  hasUnsavedChanges?: boolean;
}

const PlanosHeader = ({ hasUnsavedChanges }: PlanosHeaderProps) => {
  return (
    <PageHeaderCard 
      title="Gerenciar Planos" 
      subtitle="Ative um plano para ter descontos nas consultas"
      showAddButton={true}
      isCompact={true}
    />
  );
};

export default PlanosHeader;
