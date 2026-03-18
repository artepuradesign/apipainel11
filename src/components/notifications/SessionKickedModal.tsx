import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Monitor, MapPin, Globe, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Locale, useLocale } from '@/contexts/LocaleContext';

export type SessionKickedPayload = {
  reason: 'logged_in_elsewhere';
  revoked_token_prefix?: string;
  revoked_at?: string;
  new_session?: {
    id?: number;
    ip_address?: string;
    user_agent?: string;
    device?: string;
    browser?: string;
    os?: string;
    location?: string;
    country?: string;
    created_at?: string;
    last_activity?: string;
  };
};

const EVENT_NAME = 'apipainel:session-kicked';

const textByLocale: Record<Locale, {
  title: string;
  countdown: (secondsLeft: number) => string;
  description: string;
  unknown: string;
  unknownShort: string;
  device: string;
  location: string;
  ipAddress: string;
  dateTime: string;
  on: string;
  closeNow: string;
}> = {
  'pt-BR': {
    title: 'Login em outro dispositivo',
    countdown: (secondsLeft) => `Você será desconectado em ${secondsLeft}s`,
    description: 'Detectamos um novo login com a sua conta. Por segurança, esta sessão será encerrada automaticamente.',
    unknown: 'Desconhecido',
    unknownShort: 'N/A',
    device: 'Dispositivo',
    location: 'Localização',
    ipAddress: 'Endereço IP',
    dateTime: 'Horário',
    on: 'no',
    closeNow: 'Sair agora',
  },
  en: {
    title: 'Login on another device',
    countdown: (secondsLeft) => `You will be signed out in ${secondsLeft}s`,
    description: 'We detected a new login to your account. For security reasons, this session will be ended automatically.',
    unknown: 'Unknown',
    unknownShort: 'N/A',
    device: 'Device',
    location: 'Location',
    ipAddress: 'IP Address',
    dateTime: 'Time',
    on: 'on',
    closeNow: 'Sign out now',
  },
  es: {
    title: 'Inicio de sesión en otro dispositivo',
    countdown: (secondsLeft) => `Se cerrará tu sesión en ${secondsLeft}s`,
    description: 'Detectamos un nuevo inicio de sesión en tu cuenta. Por seguridad, esta sesión se cerrará automáticamente.',
    unknown: 'Desconocido',
    unknownShort: 'N/D',
    device: 'Dispositivo',
    location: 'Ubicación',
    ipAddress: 'Dirección IP',
    dateTime: 'Hora',
    on: 'en',
    closeNow: 'Salir ahora',
  },
};

const maskIp = (ip?: string, unknownShort = 'N/A') => {
  if (!ip) return unknownShort;
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return parts.map((p, i) => (i >= 2 ? '***' : p)).join('.');
};

const formatDateTime = (dateString: string | undefined, locale: Locale, unknownShort: string) => {
  if (!dateString) return unknownShort;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SessionKickedModal() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { locale } = useLocale();

  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<SessionKickedPayload | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(5);

  const details = useMemo(() => payload?.new_session, [payload]);
  const t = textByLocale[locale] ?? textByLocale['pt-BR'];

  const handleExitNow = useCallback(async () => {
    setOpen(false);
    setPayload(null);

    try {
      await signOut();
    } finally {
      navigate('/logout');
    }
  }, [navigate, signOut]);

  useEffect(() => {
    if (!open) return;

    const tick = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    const timer = window.setTimeout(() => {
      void handleExitNow();
    }, 5000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timer);
    };
  }, [open, handleExitNow]);

  if (!open || !payload) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl">{t.title}</AlertDialogTitle>
              <p className="text-sm text-muted-foreground">{t.countdown(secondsLeft)}</p>
            </div>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2 text-base">
            <p className="font-medium text-foreground">{t.description}</p>

            <div className="space-y-2 rounded-lg bg-muted/50 p-3">
              <div className="flex items-start gap-2">
                <Monitor className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">{t.device}</span>
                  <p className="text-sm font-medium text-foreground">
                    {(details?.browser || t.unknown) + (details?.os ? ` ${t.on} ${details.os}` : '')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">{t.location}</span>
                  <p className="text-sm font-medium text-foreground">
                    {(details?.location || t.unknown) + (details?.country ? `, ${details.country}` : '')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">{t.ipAddress}</span>
                  <p className="font-mono text-sm font-medium text-foreground">{maskIp(details?.ip_address, t.unknownShort)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">{t.dateTime}</span>
                  <p className="text-sm font-medium text-foreground">
                    {formatDateTime(details?.created_at || details?.last_activity, locale, t.unknownShort)}
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button variant="destructive" onClick={handleExitNow} className="w-full">
            {t.closeNow}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const dispatchSessionKicked = (payload: SessionKickedPayload) => {
  window.dispatchEvent(new CustomEvent<SessionKickedPayload>(EVENT_NAME, { detail: payload }));
};
