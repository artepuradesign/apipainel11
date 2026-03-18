
import React from 'react';
import { useAccountSettings } from '@/hooks/useAccountSettings';
import { formatCpf, formatPhone } from '@/utils/formatters';
import PixKeysManager from './PixKeysManager';
import BasicInfoForm from './BasicInfoForm';
import AddressForm from './AddressForm';
import AccountActivationAlert from './AccountActivationAlert';
import SaveButtonSection from './SaveButtonSection';

const AccountSettings = () => {
  const {
    formData,
    loading,
    loadingCep,
    showPixManager,
    handleInputChange,
    handleSave,
    handleCepChange
  } = useAccountSettings();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    handleInputChange('cpf', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    handleInputChange('telefone', formatted);
  };

  const isPendingStatus = formData.status === 'pendente';

  return (
    <div className="space-y-6">
      {isPendingStatus && (
        <AccountActivationAlert indicadorId={formData.indicador_id} />
      )}

      <BasicInfoForm
        formData={formData}
        onInputChange={handleInputChange}
        onCpfChange={handleCpfChange}
        onPhoneChange={handlePhoneChange}
      />

      <AddressForm
        formData={formData}
        onInputChange={handleInputChange}
        onCepChange={handleCepChange}
        loadingCep={loadingCep}
      />

      <SaveButtonSection
        loading={loading}
        onSave={handleSave}
      />

      {showPixManager && <PixKeysManager />}
    </div>
  );
};

export default AccountSettings;
