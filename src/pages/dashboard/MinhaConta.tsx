
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, User } from 'lucide-react';
import { useMinhaContaData } from '@/hooks/useMinhaContaData';
import AccountInfo from '@/components/minha-conta/AccountInfo';
import BasicInfoForm from '@/components/minha-conta/BasicInfoForm';
import PasswordChangeForm from '@/components/minha-conta/PasswordChangeForm';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useLocation } from 'react-router-dom';
import PremiumPanelsSection from '@/components/minha-conta/PremiumPanelsSection';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import LightningEffect from '@/components/effects/LightningEffect';
import LockEffect from '@/components/effects/LockEffect';
import PremiumActivationEffect from '@/components/effects/PremiumActivationEffect';
import { useLocale } from '@/contexts/LocaleContext';


const MinhaConta = () => {
  const location = useLocation();
  const { locale } = useLocale();
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showPremiumActivation, setShowPremiumActivation] = useState(false);
  const {
    userData,
    loading,
    saving,
    handleInputChange,
    handleSave
  } = useMinhaContaData();

  const i18n = {
    'pt-BR': {
      personalData: 'Dados Pessoais',
      myAccount: 'Minha Conta',
      subtitlePersonal: 'Gerencie suas informações pessoais e configurações de conta',
      subtitleAccount: 'Visualize e edite suas informações pessoais',
      loadError: 'Erro ao carregar dados do usuário',
      tryAgain: 'Tentar novamente',
      saving: 'Salvando...',
      saveInfo: 'Salvar Informações',
    },
    en: {
      personalData: 'Personal Data',
      myAccount: 'My Account',
      subtitlePersonal: 'Manage your personal information and account settings',
      subtitleAccount: 'View and edit your personal information',
      loadError: 'Error loading user data',
      tryAgain: 'Try again',
      saving: 'Saving...',
      saveInfo: 'Save Information',
    },
    es: {
      personalData: 'Datos Personales',
      myAccount: 'Mi Cuenta',
      subtitlePersonal: 'Gestiona tu información personal y configuración de cuenta',
      subtitleAccount: 'Visualiza y edita tu información personal',
      loadError: 'Error al cargar datos del usuario',
      tryAgain: 'Intentar de nuevo',
      saving: 'Guardando...',
      saveInfo: 'Guardar información',
    },
  }[locale];

  const handlePremiumUnlock = () => {
    setShowLightning(true);
    setPremiumUnlocked(true);
  };

  const handlePremiumLock = () => {
    setShowLock(true);
    setPremiumUnlocked(false);
  };

  const handlePremiumToggleActivation = (enabled: boolean) => {
    if (enabled) {
      setShowPremiumActivation(true);
    } else {
      setShowLock(true);
    }
  };

  const isNewRoute = location.pathname === '/dashboard/dados-pessoais';
  const pageTitle = isNewRoute ? i18n.personalData : i18n.myAccount;
  const pageSubtitle = isNewRoute ? i18n.subtitlePersonal : i18n.subtitleAccount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{i18n.loadError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          {i18n.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {isNewRoute ? (
        <DashboardTitleCard
          title={pageTitle}
          icon={<User className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
      ) : (
        <PageHeaderCard title={pageTitle} subtitle={pageSubtitle} />
      )}

      {showLightning && (
        <LightningEffect onComplete={() => setShowLightning(false)} />
      )}
      {showLock && (
        <LockEffect onComplete={() => setShowLock(false)} />
      )}
      {showPremiumActivation && (
        <PremiumActivationEffect onComplete={() => setShowPremiumActivation(false)} />
      )}

      <AccountInfo 
        userData={userData} 
        onPremiumUnlock={handlePremiumUnlock} 
        onPremiumLock={handlePremiumLock}
        isPremiumUnlocked={premiumUnlocked}
      />

      <BasicInfoForm
        userData={userData}
        onInputChange={handleInputChange}
      />

      {premiumUnlocked && <PremiumPanelsSection onToggle={handlePremiumToggleActivation} />}

      <PasswordChangeForm />

      {/* Botão Salvar */}
      <div className="flex justify-end px-2 sm:px-0">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-brand-purple hover:bg-brand-darkPurple"
        >
          {saving ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {i18n.saving}
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {i18n.saveInfo}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MinhaConta;
