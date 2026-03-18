import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X, LogOut, Wallet, Eye, EyeOff, Languages } from 'lucide-react';
import NotificationIcon from '@/components/notifications/NotificationIcon';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SimpleCounter } from '@/components/ui/simple-counter';
import { formatDateBR, remainingDaysBR } from '@/utils/timezone';
import { languageOptions, localeContent, useLocale } from '@/contexts/LocaleContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface UserWalletDropdownProps {
  onLogout?: () => void;
}

const localeToNumberFormat: Record<'pt-BR' | 'en' | 'es', string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

const UserWalletDropdown = ({ onLogout }: UserWalletDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState(languageOptions[0].locale);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, refreshUser } = useAuth();
  const { balance, isLoading, loadBalance } = useWalletBalance();
  const { subscription, discountPercentage, refreshSubscription } = useUserSubscription();
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();

  const content = localeContent[locale];
  const selectedLanguageOption = languageOptions.find((option) => option.locale === locale) ?? languageOptions[0];

  const formatCurrency = (value: number) => {
    return value.toLocaleString(localeToNumberFormat[locale], {
      style: 'currency',
      currency: 'BRL',
    });
  };

  useEffect(() => {
    if (isOpen) {
      Promise.all([loadBalance(), refreshUser(), refreshSubscription()]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAddBalance = () => {
    navigate('/dashboard/adicionar-saldo');
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleRefreshBalance = async () => {
    await Promise.all([loadBalance(), refreshUser(), refreshSubscription()]);
    toast.success(`${content.walletRefresh}!`);

    window.dispatchEvent(new CustomEvent('balanceUpdated', {
      detail: { timestamp: Date.now(), shouldAnimate: true },
    }));
  };

  const openLanguageModal = () => {
    setPendingLocale(locale);
    setIsLanguageModalOpen(true);
  };

  const applyLanguage = () => {
    setLocale(pendingLocale);
    setIsLanguageModalOpen(false);
  };

  if (!user || !profile) return null;

  const currentPlan = subscription?.plan_name || user.tipoplano || content.walletPrepaid;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2 rounded-l-full py-1 px-3 pr-2 -mr-2 bg-brand-purple/20 dark:bg-brand-purple/30 z-0">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 44 44"
              fill="currentColor"
              className="text-gray-600 dark:text-gray-300 w-7 h-7"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M34.0007 5.99922C30.261 2.25953 25.2886 0.199951 20 0.199951C14.711 0.199951 9.73891 2.25953 5.99922 5.99922C2.25953 9.73891 0.199951 14.711 0.199951 20C0.199951 25.2886 2.25953 30.261 5.99922 34.0007C9.73891 37.7404 14.711 39.8 20 39.8C25.2886 39.8 30.261 37.7404 34.0007 34.0007C37.7404 30.261 39.8 25.2886 39.8 20C39.8 14.711 37.7404 9.73891 34.0007 5.99922ZM10.1262 34.4158C10.9544 29.6477 15.0862 26.1307 20 26.1307C24.914 26.1307 29.0455 29.6477 29.8737 34.4158C27.0624 36.3473 23.6611 37.4796 20 37.4796C16.3388 37.4796 12.9375 36.3473 10.1262 34.4158ZM13.7043 17.5147C13.7043 14.043 16.5285 11.219 20 11.219C23.4714 11.219 26.2956 14.0433 26.2956 17.5147C26.2956 20.9861 23.4714 23.8103 20 23.8103C16.5285 23.8103 13.7043 20.9861 13.7043 17.5147ZM31.8834 32.8064C31.2589 30.5867 30.0187 28.5727 28.2803 26.9996C27.2138 26.0343 25.9998 25.2726 24.6947 24.7357C27.0536 23.197 28.6162 20.535 28.6162 17.5147C28.6162 12.7638 24.7509 8.89871 20 8.89871C15.2491 8.89871 11.384 12.7638 11.384 17.5147C11.384 20.535 12.9466 23.197 15.3052 24.7357C14.0004 25.2726 12.7861 26.034 11.7196 26.9993C9.98152 28.5724 8.741 30.5864 8.11651 32.8061C4.67683 29.6117 2.52026 25.0533 2.52026 20C2.52026 10.3616 10.3616 2.52026 20 2.52026C29.6383 2.52026 37.4796 10.3616 37.4796 20C37.4796 25.0536 35.3231 29.612 31.8834 32.8064Z" fill="currentColor" />
            </svg>
          </div>

          <div className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap mr-2">
            {showBalance ? (
              <SimpleCounter
                value={balance.total}
                formatAsCurrency={true}
                className="text-sm font-bold text-gray-900 dark:text-white"
                duration={800}
              />
            ) : (
              'R$***'
            )}
          </div>
        </div>

        <Button
          size="sm"
          className="whitespace-nowrap text-white bg-green-600 hover:bg-green-700 border-0 uppercase font-bold text-xs leading-4 z-10"
          onClick={(e) => {
            e.stopPropagation();
            handleAddBalance();
          }}
        >
          {content.walletDeposit}
        </Button>
      </div>

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[10000] backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <div
              className="bg-white dark:bg-gray-900 border-2 border-border rounded-lg shadow-2xl w-80 md:w-96 max-h-[90vh] overflow-y-auto"
              style={{
                boxShadow: '0px 20px 32px 0px hsl(var(--shadow)/0.15)',
              }}
            >
              <Card className="border-0 bg-transparent">
                <div className="sticky top-0 z-10 p-3">
                  <div className="flex justify-center items-center relative">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        aria-label={content.openLanguage}
                        onClick={(event) => {
                          event.stopPropagation();
                          openLanguageModal();
                        }}
                        className="h-8 w-8 rounded-md flex items-center justify-center border border-border bg-background text-foreground hover:bg-muted transition-colors"
                      >
                        <span className="text-sm leading-none" aria-hidden="true">{selectedLanguageOption.flag}</span>
                      </button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ThemeSwitcher />
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 44 44"
                        fill="currentColor"
                        className="text-gray-600 dark:text-gray-300 w-11 h-11"
                      >
                        <path fillRule="evenodd" clipRule="evenodd" d="M34.0007 5.99922C30.261 2.25953 25.2886 0.199951 20 0.199951C14.711 0.199951 9.73891 2.25953 5.99922 5.99922C2.25953 9.73891 0.199951 14.711 0.199951 20C0.199951 25.2886 2.25953 30.261 5.99922 34.0007C9.73891 37.7404 14.711 39.8 20 39.8C25.2886 39.8 30.261 37.7404 34.0007 34.0007C37.7404 30.261 39.8 25.2886 39.8 20C39.8 14.711 37.7404 9.73891 34.0007 5.99922ZM10.1262 34.4158C10.9544 29.6477 15.0862 26.1307 20 26.1307C24.914 26.1307 29.0455 29.6477 29.8737 34.4158C27.0624 36.3473 23.6611 37.4796 20 37.4796C16.3388 37.4796 12.9375 36.3473 10.1262 34.4158ZM13.7043 17.5147C13.7043 14.043 16.5285 11.219 20 11.219C23.4714 11.219 26.2956 14.0433 26.2956 17.5147C26.2956 20.9861 23.4714 23.8103 20 23.8103C16.5285 23.8103 13.7043 20.9861 13.7043 17.5147ZM31.8834 32.8064C31.2589 30.5867 30.0187 28.5727 28.2803 26.9996C27.2138 26.0343 25.9998 25.2726 24.6947 24.7357C27.0536 23.197 28.6162 20.535 28.6162 17.5147C28.6162 12.7638 24.7509 8.89871 20 8.89871C15.2491 8.89871 11.384 12.7638 11.384 17.5147C11.384 20.535 12.9466 23.197 15.3052 24.7357C14.0004 25.2726 12.7861 26.034 11.7196 26.9993C9.98152 28.5724 8.741 30.5864 8.11651 32.8061C4.67683 29.6117 2.52026 25.0533 2.52026 20C2.52026 10.3616 10.3616 2.52026 20 2.52026C29.6383 2.52026 37.4796 10.3616 37.4796 20C37.4796 25.0536 35.3231 29.612 31.8834 32.8064Z" fill="currentColor" />
                      </svg>
                      <div onClick={(e) => e.stopPropagation()}>
                        <NotificationIcon />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="absolute top-0 right-0 h-8 w-8 p-0 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-bold text-foreground">
                      {profile?.full_name || user?.full_name || user?.login || content.walletUserFallback}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {user?.email || user?.login || ''}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-brand-purple" />
                        <span className="font-bold">{content.walletBalance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBalance(!showBalance)}
                          className="h-6 w-6 p-0"
                        >
                          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {showBalance ? (
                            <SimpleCounter
                              value={balance.total}
                              formatAsCurrency={true}
                              className="text-base font-bold text-gray-900 dark:text-white"
                              duration={800}
                            />
                          ) : (
                            'R$***'
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{content.walletWalletBalance}</span>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {showBalance ? formatCurrency(balance.saldo) : 'R$***'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{content.walletPlanBalance}</span>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {showBalance ? formatCurrency(balance.saldo_plano) : 'R$***'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{content.walletPlan}</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {currentPlan}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{content.walletDiscount}</span>
                          <div className="font-medium text-green-600 dark:text-green-400">
                            {discountPercentage > 0 ? `${discountPercentage}%` : '0%'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{content.walletPlanStart}</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatDateBR(subscription?.start_date || subscription?.starts_at)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{content.walletPlanEnd}</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatDateBR(subscription?.end_date || subscription?.ends_at)}
                          </div>
                        </div>
                        {(subscription?.end_date || subscription?.ends_at) && (
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-muted-foreground font-semibold">{content.walletDaysRemaining}</span>
                            <div className="font-bold text-blue-600 dark:text-blue-400">
                              {(() => {
                                const days = remainingDaysBR(subscription?.end_date || subscription?.ends_at);
                                return days > 0 ? `${days} ${content.walletDaysSuffix}` : content.walletExpired;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshBalance}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                      {content.walletRefresh}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoutClick}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-3 w-3" />
                      {content.logout}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>,
        document.body,
      )}

      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogContent hideOverlay className="z-[10020] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {content.languageModalTitle}
            </DialogTitle>
            <DialogDescription>{content.languageModalDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {languageOptions.map((option) => {
              const isActive = option.locale === pendingLocale;

              return (
                <button
                  key={option.locale}
                  type="button"
                  onClick={() => setPendingLocale(option.locale)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                    isActive
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="text-base" aria-hidden="true">{option.flag}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setIsLanguageModalOpen(false)}>
              {content.cancel}
            </Button>
            <Button onClick={applyLanguage}>{content.applyLanguage}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserWalletDropdown;
