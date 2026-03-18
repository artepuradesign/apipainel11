interface ReferralRecord {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  bonus_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  device_fingerprint: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  failure_reason?: string;
}

interface DeviceInfo {
  fingerprint: string;
  ip_address: string;
  user_agent: string;
  screen_resolution: string;
  timezone: string;
}

interface ReferralCodeValidation {
  isValid: boolean;
  isExpired: boolean;
  referrerData?: any;
  expirationDate?: string;
  daysRemaining?: number;
}

// Configurações do sistema de indicação
export const getReferralSystemConfig = async () => {
  try {
    // Tentar buscar configuração da API externa primeiro
    const { systemConfigService } = await import('@/services/systemConfigService');
    const apiConfig = await systemConfigService.getReferralConfig();
    
    const config = {
      bonusAmount: apiConfig.referral_bonus_amount,
      commissionPercentage: apiConfig.referral_commission_percentage,
      enabled: apiConfig.referral_system_enabled,
      requireCpfActivation: true,
      preventDuplicateDevices: false,
      defaultReferralCode: '5',
      maxReferralsPerUser: 0,
      codeValidityDays: 7
    };
    
    localStorage.setItem('referral_system_config', JSON.stringify(config));
    return config;
  } catch (error) {
    console.error('❌ [REFERRAL_SYSTEM] Erro ao buscar config da API, usando localStorage:', error);
    
    // Fallback para localStorage
    const config = localStorage.getItem('referral_system_config');
    if (config) {
      return JSON.parse(config);
    }
    
    // Configuração padrão mínima em caso de erro total
    const defaultConfig = {
      bonusAmount: 5.00, // Valor padrão do bonus.php
      commissionPercentage: 5,
      enabled: true,
      requireCpfActivation: true,
      preventDuplicateDevices: false,
      defaultReferralCode: '5',
      maxReferralsPerUser: 0,
      codeValidityDays: 7
    };
    
    localStorage.setItem('referral_system_config', JSON.stringify(defaultConfig));
    return defaultConfig;
  }
};

// Atualizar configurações (apenas para suporte)
export const updateReferralSystemConfig = (newConfig: any) => {
  const currentConfig = getReferralSystemConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  localStorage.setItem('referral_system_config', JSON.stringify(updatedConfig));
  return updatedConfig;
};

// Gerar fingerprint do dispositivo
export const generateDeviceFingerprint = (): DeviceInfo => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  const canvasFingerprint = canvas.toDataURL();
  
  const fingerprint = btoa(
    navigator.userAgent +
    screen.width + 'x' + screen.height +
    screen.colorDepth +
    new Date().getTimezoneOffset() +
    canvasFingerprint.slice(-50)
  ).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);

  const mockIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;

  return {
    fingerprint,
    ip_address: mockIP,
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

// Verificar dispositivo duplicado - REMOVIDA A FUNCIONALIDADE
export const checkDuplicateDevice = (deviceInfo: DeviceInfo): boolean => {
  // Sempre retorna false - permitindo cadastros de qualquer dispositivo
  return false;
};

// Registrar dispositivo
export const registerDevice = (deviceInfo: DeviceInfo): void => {
  const deviceRecords = JSON.parse(localStorage.getItem('device_records') || '[]');
  deviceRecords.push({
    ...deviceInfo,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('device_records', JSON.stringify(deviceRecords));
};

// Validar código de indicação
export const validateReferralCode = async (referralCode: string): Promise<ReferralCodeValidation> => {
  try {
    // Código padrão sempre válido
    if (referralCode === '5') {
      return { 
        isValid: true, 
        isExpired: false,
        referrerData: { full_name: 'Sistema APIPanel', id: '5' }
      };
    }
    
    // Verificar se é um ID válido
    const users = JSON.parse(localStorage.getItem('system_users') || '[]');
    const referrer = users.find((user: any) => 
      user.id.toString() === referralCode || 
      user.login === referralCode
    );
    
    if (!referrer) {
      return { isValid: false, isExpired: false };
    }
    
    return { isValid: true, isExpired: false, referrerData: referrer };
    
  } catch (error) {
    console.error('Erro ao validar código de indicação:', error);
    return { isValid: false, isExpired: false };
  }
};

// Criar indicação pendente
export const createPendingReferral = async (referralCode: string, newUserId: string, deviceInfo: DeviceInfo): Promise<void> => {
  const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]') as ReferralRecord[];
  const config = await getReferralSystemConfig();
  
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  
  const newRecord: ReferralRecord = {
    id: Date.now().toString(),
    referrer_id: referralCode,
    referred_user_id: newUserId,
    bonus_amount: config.bonusAmount,
    status: 'pending',
    device_fingerprint: deviceInfo.fingerprint,
    ip_address: deviceInfo.ip_address,
    created_at: new Date().toISOString(),
    expires_at: expirationDate.toISOString()
  };
  
  referralRecords.push(newRecord);
  localStorage.setItem('referral_records', JSON.stringify(referralRecords));
  
  console.log('Indicação pendente criada:', newRecord);
};

// Processar bônus de cadastro - VAI PARA O SALDO DO PLANO PRÉ-PAGO
export const processReferralBonus = async (userId: string): Promise<{ success: boolean; message: string; bonusReceived: number; referrerBonus: number }> => {
  try {
    const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]') as ReferralRecord[];
    const users = JSON.parse(localStorage.getItem('system_users') || '[]');
    const config = await getReferralSystemConfig();
    
    const pendingReferral = referralRecords.find(record => 
      record.referred_user_id === userId && record.status === 'pending'
    );
    
    if (!pendingReferral) {
      return { success: false, message: 'Nenhuma indicação pendente encontrada', bonusReceived: 0, referrerBonus: 0 };
    }
    
    // Verificar se não expirou
    const now = new Date();
    const expirationDate = new Date(pendingReferral.expires_at);
    if (now > expirationDate) {
      const recordIndex = referralRecords.findIndex(record => record.id === pendingReferral.id);
      if (recordIndex !== -1) {
        referralRecords[recordIndex].status = 'expired';
        localStorage.setItem('referral_records', JSON.stringify(referralRecords));
      }
      return { success: false, message: 'Código de indicação expirado', bonusReceived: 0, referrerBonus: 0 };
    }
    
    const bonusAmount = config.bonusAmount;
    
    // ADICIONAR BÔNUS AO SALDO DO PLANO PRÉ-PAGO DO NOVO USUÁRIO
    const currentUserPlanBalance = parseFloat(localStorage.getItem(`plan_balance_${userId}`) || '0.00');
    const newUserPlanBalance = currentUserPlanBalance + bonusAmount;
    localStorage.setItem(`plan_balance_${userId}`, newUserPlanBalance.toString());
    
    // Registrar transação para o novo usuário
    const userTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${userId}`) || '[]');
    userTransactions.push({
      id: Date.now().toString(),
      amount: bonusAmount,
      type: 'credit',
      description: '🎁 Bônus de boas-vindas por indicação',
      date: new Date().toISOString(),
      balance_type: 'plan',
      previous_balance: currentUserPlanBalance,
      new_balance: newUserPlanBalance
    });
    localStorage.setItem(`balance_transactions_${userId}`, JSON.stringify(userTransactions));
    
    let referrerMessage = '';
    let referrerBonus = 0;
    
    // Se não for o código padrão, adicionar bônus ao SALDO DO PLANO do indicador
    if (pendingReferral.referrer_id !== '5') {
      const referrer = users.find((user: any) => user.id.toString() === pendingReferral.referrer_id);
      
      if (referrer) {
        const currentReferrerPlanBalance = parseFloat(localStorage.getItem(`plan_balance_${referrer.id}`) || '0.00');
        const newReferrerPlanBalance = currentReferrerPlanBalance + bonusAmount;
        localStorage.setItem(`plan_balance_${referrer.id}`, newReferrerPlanBalance.toString());
        
        // Registrar transação para o indicador
        const referrerTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${referrer.id}`) || '[]');
        referrerTransactions.push({
          id: Date.now().toString(),
          amount: bonusAmount,
          type: 'credit',
          description: `👥 Bônus de indicação - Novo usuário cadastrado`,
          date: new Date().toISOString(),
          balance_type: 'plan',
          previous_balance: currentReferrerPlanBalance,
          new_balance: newReferrerPlanBalance
        });
        localStorage.setItem(`balance_transactions_${referrer.id}`, JSON.stringify(referrerTransactions));
        
        referrerMessage = ` e R$ ${bonusAmount.toFixed(2)} foi creditado no plano de quem te indicou`;
        referrerBonus = bonusAmount;
      }
    }
    
    // Marcar indicação como concluída
    const recordIndex = referralRecords.findIndex(record => record.id === pendingReferral.id);
    if (recordIndex !== -1) {
      referralRecords[recordIndex].status = 'completed';
      referralRecords[recordIndex].completed_at = new Date().toISOString();
      localStorage.setItem('referral_records', JSON.stringify(referralRecords));
    }
    
    // Disparar evento de atualização de saldo
    window.dispatchEvent(new CustomEvent('balanceUpdated', { 
      detail: { userId, shouldAnimate: true }
    }));
    
    const successMessage = `Parabéns! Você recebeu R$ ${bonusAmount.toFixed(2)} no seu plano pré-pago${referrerMessage}!`;
    
    return { 
      success: true, 
      message: successMessage, 
      bonusReceived: bonusAmount,
      referrerBonus: referrerBonus
    };
    
  } catch (error) {
    console.error('Erro ao processar bônus de indicação:', error);
    return { success: false, message: 'Erro interno ao processar bônus', bonusReceived: 0, referrerBonus: 0 };
  }
};

// NOVA FUNÇÃO: Processar comissão de recarga - VAI PARA A CARTEIRA DIGITAL
export const processRechargeCommission = async (userId: string, rechargeAmount: number): Promise<{ success: boolean; commission: number; referrerId: string | null }> => {
  try {
    const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]') as ReferralRecord[];
    const config = await getReferralSystemConfig();
    
    // Encontrar quem indicou este usuário (apenas indicações completadas)
    const completedReferral = referralRecords.find(record => 
      record.referred_user_id === userId && record.status === 'completed'
    );
    
    if (!completedReferral || completedReferral.referrer_id === '5') {
      return { success: false, commission: 0, referrerId: null };
    }
    
    // Calcular comissão
    const commissionAmount = (rechargeAmount * config.commissionPercentage) / 100;
    const referrerId = completedReferral.referrer_id;
    
    // Adicionar comissão à CARTEIRA DIGITAL do indicador
    const currentReferrerWalletBalance = parseFloat(localStorage.getItem(`wallet_balance_${referrerId}`) || '0.00');
    const newReferrerWalletBalance = currentReferrerWalletBalance + commissionAmount;
    localStorage.setItem(`wallet_balance_${referrerId}`, newReferrerWalletBalance.toString());
    
    // Registrar transação de comissão
    const referrerTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${referrerId}`) || '[]');
    referrerTransactions.push({
      id: Date.now().toString(),
      amount: commissionAmount,
      type: 'credit',
      description: `💰 Comissão ${config.commissionPercentage}% - Recarga de indicado (R$ ${rechargeAmount.toFixed(2)})`,
      date: new Date().toISOString(),
      balance_type: 'wallet',
      previous_balance: currentReferrerWalletBalance,
      new_balance: newReferrerWalletBalance
    });
    localStorage.setItem(`balance_transactions_${referrerId}`, JSON.stringify(referrerTransactions));
    
    // Disparar evento de atualização de saldo para o indicador
    window.dispatchEvent(new CustomEvent('balanceUpdated', { 
      detail: { userId: referrerId, shouldAnimate: true }
    }));
    
    console.log(`Comissão de R$ ${commissionAmount.toFixed(2)} creditada para usuário ${referrerId}`);
    
    return { 
      success: true, 
      commission: commissionAmount, 
      referrerId: referrerId 
    };
    
  } catch (error) {
    console.error('Erro ao processar comissão de recarga:', error);
    return { success: false, commission: 0, referrerId: null };
  }
};

// Obter estatísticas de indicação para um usuário
export const getReferralStats = (userId: string) => {
  const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]') as ReferralRecord[];
  
  const userReferrals = referralRecords.filter(record => record.referrer_id === userId);
  const completedReferrals = userReferrals.filter(record => record.status === 'completed');
  const pendingReferrals = userReferrals.filter(record => record.status === 'pending');
  
  // Calcular comissões totais das transações da carteira
  const walletTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${userId}`) || '[]');
  const commissionTransactions = walletTransactions.filter((t: any) => 
    t.description.includes('Comissão') && t.type === 'credit'
  );
  const totalCommissions = commissionTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalBonus = completedReferrals.reduce((sum, record) => sum + record.bonus_amount, 0);
  
  return {
    totalReferrals: userReferrals.length,
    completedReferrals: completedReferrals.length,
    pendingReferrals: pendingReferrals.length,
    totalBonusEarned: totalBonus, // Bônus de cadastro (no plano)
    totalCommissionsEarned: totalCommissions, // Comissões de recarga (na carteira)
    lastReferralDate: userReferrals.length > 0 ? userReferrals[userReferrals.length - 1].created_at : null
  };
};

// Obter estatísticas gerais do sistema
export const getSystemReferralStats = () => {
  const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]') as ReferralRecord[];
  
  const totalReferrals = referralRecords.length;
  const completedReferrals = referralRecords.filter(record => record.status === 'completed');
  const pendingReferrals = referralRecords.filter(record => record.status === 'pending');
  const failedReferrals = referralRecords.filter(record => record.status === 'failed');
  
  const totalBonusToReferred = completedReferrals.reduce((sum, record) => sum + record.bonus_amount, 0);
  const totalBonusToReferrers = completedReferrals.filter(record => record.referrer_id !== '5').reduce((sum, record) => sum + record.bonus_amount, 0);
  const totalBonusPaid = totalBonusToReferred + totalBonusToReferrers;
  
  return {
    totalReferrals,
    completedReferrals: completedReferrals.length,
    pendingReferrals: pendingReferrals.length,
    failedReferrals: failedReferrals.length,
    totalBonusPaid,
    totalBonusReferrers: totalBonusToReferrers,
    totalBonusReferred: totalBonusToReferred,
    conversionRate: totalReferrals > 0 ? (completedReferrals.length / totalReferrals * 100).toFixed(2) : '0'
  };
};

// Resetar sistema completo
export const resetReferralSystem = () => {
  localStorage.removeItem('referral_records');
  localStorage.removeItem('device_records');
  localStorage.removeItem('referral_system_config');
  localStorage.removeItem('referral_codes_validity');
  console.log('Sistema de indicação resetado');
};
