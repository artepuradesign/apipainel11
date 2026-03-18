import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Monitor, Globe, Clock, MapPin } from 'lucide-react';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { cookieUtils } from '@/utils/cookieUtils';
import { toast } from 'sonner';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.BASE_URL;

const SessionNotification = () => {
  const navigate = useNavigate();
  const { hasMultipleSessions, newSessions, acknowledgeNewSession } = useSessionMonitor();
  const [isTerminating, setIsTerminating] = useState(false);

  const currentSession = newSessions[0];
  const isOpen = hasMultipleSessions && newSessions.length > 0;

  const handleWasMe = () => {
    if (currentSession) {
      acknowledgeNewSession(currentSession.id);
      toast.success('Sessão reconhecida');
    }
  };

  const handleWasNotMe = async () => {
    if (!currentSession) return;

    setIsTerminating(true);
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');

    try {
      const response = await fetch(`${API_URL}/session-monitor/${currentSession.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Sessão suspeita encerrada com sucesso');
        acknowledgeNewSession(currentSession.id);
      } else {
        toast.error('Erro ao encerrar sessão');
      }
    } catch (error) {
      console.error('❌ [SESSION_NOTIFICATION] Erro ao encerrar sessão:', error);
      toast.error('Erro ao encerrar sessão');
    } finally {
      setIsTerminating(false);
    }
  };

  const handleLogoutHere = () => {
    navigate('/logout');
  };

  if (!isOpen || !currentSession) {
    return null;
  }

  // Ocultar parte do IP
  const maskedIp = currentSession.ip_address.split('.').map((part, index) => 
    index >= 2 ? '***' : part
  ).join('.');

  // Formatar data/hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Nova Sessão Detectada</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p className="text-foreground font-medium">
              Uma nova sessão foi iniciada em outro dispositivo:
            </p>
            
            <div className="space-y-2 bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Monitor className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Dispositivo</span>
                  <p className="text-sm font-medium text-foreground">
                    {currentSession.browser} no {currentSession.os}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Localização</span>
                  <p className="text-sm font-medium text-foreground">
                    {currentSession.location}, {currentSession.country}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Endereço IP</span>
                  <p className="text-sm font-medium text-foreground font-mono">
                    {maskedIp}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Horário</span>
                  <p className="text-sm font-medium text-foreground">
                    {formatDateTime(currentSession.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Se não foi você, recomendamos encerrar esta sessão imediatamente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleWasMe}
            className="w-full sm:w-auto"
          >
            Fui eu
          </Button>
          <Button
            variant="destructive"
            onClick={handleWasNotMe}
            disabled={isTerminating}
            className="w-full sm:w-auto"
          >
            {isTerminating ? 'Encerrando...' : 'Não fui eu'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogoutHere}
            className="w-full sm:w-auto"
          >
            Encerrar esta sessão
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionNotification;
