import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Gift,
  Share2,
  Users,
  UserPlus,
  Copy,
  Check,
  MessageCircle,
  Send,
  RefreshCw,
  Sparkles,
  Wallet,
  Coins,
  TrendingUp
} from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useAuth } from '@/contexts/AuthContext';
import { walletApiService } from '@/services/walletApiService';
import { newReferralApiService } from '@/services/newReferralApiService';
import { toast } from 'sonner';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: number;
  amount: number;
  created_at: string;
  status: string;
  referred_name: string;
}

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    pageTitle: 'Programa de Indicação',
    codeUnavailable: 'Código de indicação indisponível',
    codeUnavailableDesc: 'Não encontramos seu código agora. Atualize a página ou entre em contato com o suporte.',
    howItWorks: 'Como Funciona',
    referralSummary: 'Resumo das Indicações',
    earnBadge: 'Indique e Ganhe',
    earnTitle: 'Compartilhe seu código e aumente seus ganhos',
    earnDesc: 'O valor do bônus é dinâmico e segue as predefinições do sistema, sempre vindo da API.',
    currentValue: 'Valor atual:',
    referralLink: 'Link de indicação',
    referralHistory: 'Histórico de Indicações',
    refreshHistory: 'Atualizar histórico',
    noReferrals: 'Nenhuma indicação ainda',
    noReferralsDesc: 'Compartilhe seu link para começar a receber bônus.',
    copyLink: 'Copiar link',
  },
  en: {
    pageTitle: 'Referral Program',
    codeUnavailable: 'Referral code unavailable',
    codeUnavailableDesc: 'We could not find your code right now. Refresh the page or contact support.',
    howItWorks: 'How It Works',
    referralSummary: 'Referral Summary',
    earnBadge: 'Refer and Earn',
    earnTitle: 'Share your code and increase your earnings',
    earnDesc: 'The bonus value is dynamic and follows the system presets from the API.',
    currentValue: 'Current value:',
    referralLink: 'Referral link',
    referralHistory: 'Referral History',
    refreshHistory: 'Refresh history',
    noReferrals: 'No referrals yet',
    noReferralsDesc: 'Share your link to start earning bonuses.',
    copyLink: 'Copy link',
  },
  es: {
    pageTitle: 'Programa de Referidos',
    codeUnavailable: 'Código de referido no disponible',
    codeUnavailableDesc: 'No encontramos tu código ahora. Actualiza la página o contacta con soporte.',
    howItWorks: 'Cómo funciona',
    referralSummary: 'Resumen de Referidos',
    earnBadge: 'Indica y Gana',
    earnTitle: 'Comparte tu código y aumenta tus ganancias',
    earnDesc: 'El valor del bono es dinámico y sigue las predefiniciones del sistema desde la API.',
    currentValue: 'Valor actual:',
    referralLink: 'Enlace de referido',
    referralHistory: 'Historial de Referidos',
    refreshHistory: 'Actualizar historial',
    noReferrals: 'Aún no hay referidos',
    noReferralsDesc: 'Comparte tu enlace para empezar a recibir bonos.',
    copyLink: 'Copiar enlace',
  },
};

const Indique = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const t = textByLocale[locale];

  const [referralEarnings, setReferralEarnings] = useState<ReferralEarning[]>([]);
  const [bonusAmount, setBonusAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralCode = user?.codigo_indicacao || '';
  const referralLink = `${window.location.origin}/registration?ref=${referralCode}`;

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const parseReferredName = (description: string | null | undefined) => {
    if (!description) return 'Usuário indicado';

    let match = description.match(/- (.*?) se cadastrou/);
    if (!match) match = description.match(/(.*?) se cadastrou/);
    if (!match) match = description.match(/Bônus de indicação - (.*?)$/);
    if (!match) match = description.match(/Indicação de (.*?)$/);

    return match?.[1]?.trim() || 'Usuário indicado';
  };

  const loadReferralData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [bonusValue, transactionsResponse] = await Promise.all([
        newReferralApiService.getReferralBonusAmount(),
        walletApiService.getTransactionHistory(parseInt(user.id, 10), 100)
      ]);

      const validBonus = Number.isFinite(bonusValue) ? bonusValue : null;
      setBonusAmount(validBonus);

      let apiReferralEarnings: ReferralEarning[] = [];

      if (transactionsResponse.success && transactionsResponse.data) {
        apiReferralEarnings = transactionsResponse.data
          .filter((transaction: any) => transaction.type === 'indicacao')
          .map((transaction: any) => ({
            id: String(transaction.id ?? Date.now()),
            referrer_id: user.id,
            referred_user_id: Number(transaction.id ?? 0),
            amount: Number(transaction.amount) || validBonus || 0,
            created_at: transaction.created_at || new Date().toISOString(),
            status: 'paid',
            referred_name: parseReferredName(transaction.description)
          }));
      }

      setReferralEarnings(apiReferralEarnings);
    } catch (loadError) {
      console.error('❌ [INDIQUE] Erro ao carregar dados:', loadError);
      const message = loadError instanceof Error ? loadError.message : 'Erro ao carregar dados';
      setError(message);
      setBonusAmount(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferralData();
  }, [user?.id]);

  const totalBonus = useMemo(
    () => referralEarnings.reduce((sum, item) => sum + item.amount, 0),
    [referralEarnings]
  );

  const paidBonusCount = useMemo(
    () => referralEarnings.filter((item) => item.status === 'paid').length,
    [referralEarnings]
  );

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1800);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 1800);
      }
      toast.success('Copiado com sucesso!');
    } catch {
      toast.error('Não foi possível copiar agora.');
    }
  };

  const shareOnWhatsApp = () => {
    const bonusText = bonusAmount !== null ? `${formatCurrency(bonusAmount)} de bônus` : 'bônus';
    const message = `🎁 Use meu código *${referralCode}* e ganhe ${bonusText}!\n\nCadastre-se: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const bonusText = bonusAmount !== null ? `${formatCurrency(bonusAmount)} de bônus` : 'bônus';
    const message = `🎁 Use meu código ${referralCode} e ganhe ${bonusText}!\n\nCadastre-se: ${referralLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const stats = [
    {
      label: 'Valor por Indicação',
      value: bonusAmount !== null ? formatCurrency(bonusAmount) : '—',
      icon: Coins
    },
    {
      label: 'Indicados',
      value: String(referralEarnings.length),
      icon: UserPlus
    },
    {
      label: 'Total Ganho',
      value: formatCurrency(totalBonus),
      icon: TrendingUp
    },
    {
      label: 'Bônus',
      value: String(paidBonusCount),
      icon: Gift
    }
  ];

  const howItWorks = [
    {
      title: 'Compartilhe seu link',
      description: 'Envie seu link único para amigos e contatos.',
      icon: Share2
    },
    {
      title: 'Seu amigo se cadastra',
      description: 'Quando ele finalizar o cadastro com seu código, a indicação é registrada.',
      icon: UserPlus
    },
    {
      title: 'Bônus para os dois',
      description:
        bonusAmount !== null
          ? `Vocês recebem ${formatCurrency(bonusAmount)} conforme as regras do sistema.`
          : 'Vocês recebem bônus conforme as regras do sistema.',
      icon: Sparkles
    }
  ];

  if (!referralCode) {
    return (
      <div className="space-y-6 px-1 sm:px-0">
        <DashboardTitleCard title={t.pageTitle} icon={<Gift className="h-4 w-4 sm:h-5 sm:w-5" />} />
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">{t.codeUnavailable}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.codeUnavailableDesc}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 px-1 sm:px-0">
      {/* 1) Título */}
      <DashboardTitleCard title={t.pageTitle} icon={<Gift className="h-4 w-4 sm:h-5 sm:w-5" />} />

      {/* 2) Como Funciona */}
      <section aria-labelledby="como-funciona">
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="pb-2">
            <CardTitle id="como-funciona" className="text-lg sm:text-xl font-semibold text-foreground">
              {t.howItWorks}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {howItWorks.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </motion.article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3) Cards */}
      <section aria-labelledby="resumo-indicacoes">
        <h2 id="resumo-indicacoes" className="sr-only">
          {t.referralSummary}
        </h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full border-border/60 bg-card/95">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/35 text-accent-foreground">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-base sm:text-xl font-bold text-foreground break-words">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4) Indique e Ganhe */}
      <section aria-labelledby="indique-ganhe">
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="bg-gradient-to-r from-primary/90 via-primary/80 to-accent/85 p-[1px]">
            <CardContent className="rounded-[calc(var(--radius)-1px)] bg-card p-4 sm:p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    {t.earnBadge}
                  </Badge>
                  <h2 id="indique-ganhe" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {t.earnTitle}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                    {t.earnDesc}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">{t.currentValue}</span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {bonusAmount !== null ? formatCurrency(bonusAmount) : '—'}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-border/60 bg-background/70 p-3 sm:p-4">
                  <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">{t.referralLink}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm text-foreground truncate font-mono flex-1">{referralLink}</p>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(referralLink, 'link')}
                    >
                      {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="default" onClick={shareOnWhatsApp} className="rounded-lg">
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    WhatsApp
                  </Button>
                  <Button type="button" variant="secondary" onClick={shareOnTelegram} className="rounded-lg">
                    <Send className="h-4 w-4 mr-1.5" />
                    Telegram
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(referralCode, 'code')}
                    className="rounded-lg"
                  >
                    {copiedCode ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                    Código: {referralCode}
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* 5) Histórico de Indicações */}
      <section aria-labelledby="historico-indicacoes">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle id="historico-indicacoes" className="text-lg sm:text-xl font-semibold">
                  {t.referralHistory}
                </CardTitle>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {referralEarnings.length} {referralEarnings.length === 1 ? 'indicação registrada' : 'indicações registradas'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={loadReferralData}
                disabled={isLoading}
                className="h-8 w-8"
                aria-label={t.refreshHistory}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-1">
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs sm:text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="h-3 w-40 bg-muted rounded" />
                    <div className="mt-2 h-3 w-24 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : referralEarnings.length > 0 ? (
              <div className="space-y-2">
                {referralEarnings.map((earning) => (
                  <article
                    key={earning.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary text-xs font-bold">
                      {earning.referred_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{earning.referred_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(earning.created_at)}</p>
                    </div>

                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      +{formatCurrency(earning.amount)}
                    </Badge>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">{t.noReferrals}</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {t.noReferralsDesc}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => copyToClipboard(referralLink, 'link')}
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  {t.copyLink}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Indique;

