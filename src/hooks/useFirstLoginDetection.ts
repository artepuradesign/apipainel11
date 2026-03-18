import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firstLoginNotificationService } from '@/services/firstLoginNotificationService';
import { makeDirectRequest } from '@/config/apiConfig';

export const useFirstLoginDetection = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    console.log('🔍 [FIRST_LOGIN_DETECTION] Verificando primeiro login para usuário:', user.id);

    // Verificar se é o primeiro login do usuário
    const hasLoggedBefore = localStorage.getItem(`user_${user.id}_has_logged`);
    
    if (!hasLoggedBefore) {
      console.log('🎯 [FIRST_LOGIN_DETECTION] Primeiro login detectado!');
      
      // Marcar que o usuário já fez login
      localStorage.setItem(`user_${user.id}_has_logged`, 'true');
      
      // Processar bônus de primeiro login via API
      processFirstLoginBonus();
      
      // Agendar notificação de bônus (se aplicável)
      firstLoginNotificationService.scheduleFirstLoginNotification(Number(user.id));
    } else {
      console.log('🔄 [FIRST_LOGIN_DETECTION] Login subsequente');
    }

    // Verificar se o usuário é um indicador e alguém que ele indicou acabou de fazer login
    firstLoginNotificationService.checkForReferrerBonus(Number(user.id));

  }, [user]);

  const processFirstLoginBonus = async () => {
    try {
      console.log('💰 [FIRST_LOGIN] Processando bônus de primeiro login...');
      
      // Processar bônus de primeiro login usando o endpoint específico
      const response = await makeDirectRequest('/auth/process-first-login-bonus', 'POST');
      
      if (response.success) {
        console.log('✅ [FIRST_LOGIN] Bônus processado:', response.data);
      } else {
        console.log('ℹ️ [FIRST_LOGIN] Resposta do servidor:', response.message);
      }
      
    } catch (error) {
      console.error('❌ [FIRST_LOGIN] Erro ao processar bônus:', error);
    }
  };

  return {
    // Não retorna nada, apenas executa a lógica
  };
};