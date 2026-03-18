import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Monitor, Globe, Clock, MapPin, LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { cookieUtils } from '@/utils/cookieUtils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_URL = import.meta.env.VITE_API_URL || 'https://api.artepuradesign.com.br';

interface SessionInfo {
  id: number;
  device: string;
  browser: string;
  os: string;
  location: string;
  country: string;
  ip_address: string;
  created_at: string;
  last_activity: string;
  session_token: string;
}

const Sessions = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingId, setTerminatingId] = useState<number | null>(null);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [terminatingAll, setTerminatingAll] = useState(false);

  const currentToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');

  const loadSessions = async () => {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/session-monitor/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSessions(data.data.sessions || []);
        }
      } else if (response.status === 401) {
        window.location.href = '/logout';
      }
    } catch (error) {
      console.error('❌ [SESSIONS] Erro ao carregar sessões:', error);
      toast.error('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: number) => {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!token) return;

    setTerminatingId(sessionId);

    try {
      const response = await fetch(`${API_URL}/session-monitor/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Sessão encerrada com sucesso');
        await loadSessions();
      } else {
        toast.error('Erro ao encerrar sessão');
      }
    } catch (error) {
      console.error('❌ [SESSIONS] Erro ao encerrar sessão:', error);
      toast.error('Erro ao encerrar sessão');
    } finally {
      setTerminatingId(null);
    }
  };

  const terminateAllOtherSessions = async () => {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!token) return;

    setTerminatingAll(true);

    try {
      const response = await fetch(`${API_URL}/session-monitor/others`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const terminated = data.data?.terminated_sessions || 0;
        toast.success(`${terminated} sessão(ões) encerrada(s)`);
        await loadSessions();
      } else {
        toast.error('Erro ao encerrar sessões');
      }
    } catch (error) {
      console.error('❌ [SESSIONS] Erro ao encerrar sessões:', error);
      toast.error('Erro ao encerrar sessões');
    } finally {
      setTerminatingAll(false);
      setShowTerminateAllDialog(false);
    }
  };

  useEffect(() => {
    loadSessions();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  const isCurrentSession = (session: SessionInfo) => {
    return currentToken && session.session_token.startsWith(currentToken.substring(0, 10));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sessões Ativas</h1>
        <p className="text-muted-foreground">
          Gerencie as sessões ativas da sua conta
        </p>
      </div>

      {sessions.length > 1 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-lg">Múltiplas Sessões Detectadas</CardTitle>
            </div>
            <CardDescription>
              Sua conta está ativa em {sessions.length} dispositivos diferentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowTerminateAllDialog(true)}
              disabled={terminatingAll}
            >
              {terminatingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Encerrar Todas as Outras Sessões
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando sessões...</p>
            </CardContent>
          </Card>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma sessão ativa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const isCurrent = isCurrentSession(session);
            const maskedIp = session.ip_address.split('.').map((part, index) => 
              index >= 2 ? '***' : part
            ).join('.');

            return (
              <Card key={session.id} className={isCurrent ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {session.browser} no {session.os}
                          {isCurrent && (
                            <Badge variant="default" className="ml-2">
                              Sessão Atual
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Ativo há {getRelativeTime(session.last_activity)}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        disabled={terminatingId === session.id}
                      >
                        {terminatingId === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground block">Localização</span>
                        <p className="text-sm font-medium truncate">
                          {session.location}, {session.country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground block">Endereço IP</span>
                        <p className="text-sm font-medium font-mono">
                          {maskedIp}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Criado em {formatDateTime(session.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Todas as Outras Sessões?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai desconectar todos os outros dispositivos onde você está logado.
              Apenas a sessão atual permanecerá ativa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={terminateAllOtherSessions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Encerrar Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sessions;
