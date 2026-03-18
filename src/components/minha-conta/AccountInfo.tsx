import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Clock, Calendar, CreditCard } from 'lucide-react';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { getDiscount } from '@/utils/planUtils';
import { useLocale } from '@/contexts/LocaleContext';

interface AccountInfoProps {
  userData: {
    id: number;
    status: string;
    created_at: string;
    tipoplano?: string;
    data_inicio?: string;
    data_fim?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    subscription_status?: string;
  };
  onPremiumUnlock?: () => void;
  onPremiumLock?: () => void;
  isPremiumUnlocked?: boolean;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ userData, onPremiumUnlock, onPremiumLock, isPremiumUnlocked }) => {
  const { isLoading } = useUserSubscription();
  const { locale } = useLocale();

  const t = {
    'pt-BR': {
      accountInfo: 'Informações da Conta',
      userId: 'ID do Usuário',
      status: 'Status',
      memberSince: 'Membro desde',
      currentPlan: 'Plano Atual',
      plan: 'Plano',
      start: 'Início',
      end: 'Término',
      remaining: 'Restantes',
      notInformed: 'Não informado',
      notApplicable: 'Não se aplica',
      noExpiry: 'Sem vencimento',
      unlimited: 'Ilimitado',
      expired: 'Expirado',
      days: 'dias',
      prepaid: 'Pré-Pago',
    },
    en: {
      accountInfo: 'Account Information',
      userId: 'User ID',
      status: 'Status',
      memberSince: 'Member since',
      currentPlan: 'Current Plan',
      plan: 'Plan',
      start: 'Start',
      end: 'End',
      remaining: 'Remaining',
      notInformed: 'Not informed',
      notApplicable: 'Not applicable',
      noExpiry: 'No expiration',
      unlimited: 'Unlimited',
      expired: 'Expired',
      days: 'days',
      prepaid: 'Prepaid',
    },
    es: {
      accountInfo: 'Información de la Cuenta',
      userId: 'ID del Usuario',
      status: 'Estado',
      memberSince: 'Miembro desde',
      currentPlan: 'Plan Actual',
      plan: 'Plan',
      start: 'Inicio',
      end: 'Fin',
      remaining: 'Restantes',
      notInformed: 'No informado',
      notApplicable: 'No aplica',
      noExpiry: 'Sin vencimiento',
      unlimited: 'Ilimitado',
      expired: 'Expirado',
      days: 'días',
      prepaid: 'Prepago',
    },
  }[locale];

  const [secretStep, setSecretStep] = useState(0);
  const [lockStep, setLockStep] = useState(0);

  const handleSecretClick = useCallback((icon: 'shield' | 'user' | 'clock') => {
    if (!isPremiumUnlocked) {
      if (icon === 'shield' && secretStep === 0) setSecretStep(1);
      else if (icon === 'user' && secretStep === 1) setSecretStep(2);
      else if (icon === 'clock' && secretStep === 2) {
        setSecretStep(3);
        onPremiumUnlock?.();
      } else setSecretStep(0);
    } else {
      if (icon === 'clock' && lockStep === 0) setLockStep(1);
      else if (icon === 'user' && lockStep === 1) setLockStep(2);
      else if (icon === 'shield' && lockStep === 2) {
        setLockStep(0);
        setSecretStep(0);
        onPremiumLock?.();
      } else setLockStep(0);
    }
  }, [secretStep, lockStep, isPremiumUnlocked, onPremiumUnlock, onPremiumLock]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return t.notInformed;
    try {
      if (dateString.includes('T') || dateString.includes(' ')) {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'en' ? 'en-US' : locale);
      }
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return t.notInformed;
    }
  };

  const getPlanInfo = () => {
    const planNameRaw = userData.tipoplano || t.prepaid;
    const isPrepaid = ['Pré-Pago', 'Prepaid', 'Prepago'].includes(planNameRaw);

    if (isPrepaid) {
      return {
        planName: t.prepaid,
        startDate: t.notApplicable,
        endDate: t.notApplicable,
        daysRemaining: 0,
      };
    }

    const startDate = userData.data_inicio ? new Date(userData.data_inicio) : null;
    const endDate = userData.data_fim ? new Date(userData.data_fim) : null;

    if (startDate && endDate) {
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        planName: planNameRaw,
        startDate: formatDate(userData.data_inicio),
        endDate: formatDate(userData.data_fim),
        daysRemaining: Math.max(0, daysRemaining),
      };
    }

    if (startDate && !endDate) {
      return {
        planName: planNameRaw,
        startDate: formatDate(userData.data_inicio),
        endDate: t.noExpiry,
        daysRemaining: 999999,
      };
    }

    return {
      planName: planNameRaw,
      startDate: t.notInformed,
      endDate: t.notInformed,
      daysRemaining: 0,
    };
  };

  const planData = getPlanInfo();

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
          {t.accountInfo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-brand-purple flex-shrink-0 cursor-pointer select-none" onClick={() => handleSecretClick('user')} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.userId}</p>
              <p className="font-semibold text-sm sm:text-base">{userData.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 cursor-pointer select-none" onClick={() => handleSecretClick('shield')} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.status}</p>
              <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${userData.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {userData.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 cursor-pointer select-none" onClick={() => handleSecretClick('clock')} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.memberSince}</p>
              <p className="font-semibold text-sm sm:text-base">{formatDate(userData.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
            {t.currentPlan}
          </h3>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                {(() => {
                  const planDiscount = getDiscount(planData.planName);
                  return planDiscount > 0 ? (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-purple-600 text-white shadow-lg border-2 border-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1">
                        {planDiscount}%
                      </Badge>
                    </div>
                  ) : null;
                })()}

                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.plan}</p>
                  <p className="font-semibold text-purple-600 text-xs sm:text-base truncate">{planData.planName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.start}</p>
                  <p className="font-semibold text-green-600 text-xs sm:text-base truncate">{planData.startDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.end}</p>
                  <p className="font-semibold text-orange-600 text-xs sm:text-base truncate">{planData.endDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.remaining}</p>
                  <p className="font-semibold text-blue-600 text-xs sm:text-base">
                    {planData.daysRemaining === 999999
                      ? t.unlimited
                      : planData.daysRemaining > 0
                        ? `${planData.daysRemaining} ${t.days}`
                        : t.expired}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInfo;
