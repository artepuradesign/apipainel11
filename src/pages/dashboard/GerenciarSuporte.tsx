
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import SupportUserManagement from '@/components/configuracoes/SupportUserManagement';

const GerenciarSuporte = () => {
  const { user } = useAuth();
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeaderCard 
          title="Administração de Suporte" 
          subtitle="Gerencie usuários e configurações de suporte do sistema" 
          currentPlan={currentPlan}
          isControlPanel={false}
        />
        
        {/* Main Content */}
        <SupportUserManagement />
      </div>
    </DashboardLayout>
  );
};

export default GerenciarSuporte;
