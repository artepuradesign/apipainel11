import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  BellRing, 
  MessageSquare, 
  Settings, 
  User, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  ArrowLeft,
  HelpCircle,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const NotificationsHelp: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link to="/notifications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Notificações
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Como funcionam as Notificações</h1>
            <p className="text-muted-foreground">Mantenha-se sempre informado sobre as atividades da sua conta</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* O que são notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              O que são Notificações?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              As notificações são mensagens automáticas que enviamos para mantê-lo informado sobre atividades importantes
              na sua conta. Elas aparecem em tempo real e garantem que você nunca perca informações relevantes.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Instantâneas</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba avisos imediatamente quando algo importante acontece
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Seguras</h4>
                  <p className="text-sm text-muted-foreground">
                    Apenas você tem acesso às suas notificações pessoais
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Tipos de Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-full bg-blue-500/10 flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">Sistema</h4>
                    <Badge variant="secondary" className="text-xs">system</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mensagens de boas-vindas, atualizações importantes e informações gerais da plataforma.
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Exemplo: "Bem-vindo à nossa plataforma!"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-full bg-green-500/10 flex-shrink-0">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">Recarga</h4>
                    <Badge variant="secondary" className="text-xs">recharge</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Confirmações de recargas realizadas, status de pagamentos e movimentações financeiras.
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Exemplo: "Recarga de R$ 50,00 confirmada"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-full bg-red-500/10 flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">Alertas</h4>
                    <Badge variant="secondary" className="text-xs">alert</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Avisos importantes sobre segurança, limitações de conta ou ações necessárias.
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Exemplo: "Ação necessária: Verifique sua conta"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Níveis de prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Níveis de Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="p-2 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="text-xs">ALTA</Badge>
                    <span className="font-medium text-red-800">Urgente</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Requer ação imediata. Aparecem como popup na tela e ficam destacadas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-xs">MÉDIA</Badge>
                    <span className="font-medium text-yellow-800">Importante</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Informações relevantes que devem ser verificadas quando conveniente.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="p-2 rounded-full bg-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">BAIXA</Badge>
                    <span className="font-medium text-green-800">Informativa</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Informações gerais e atualizações que não requerem ação imediata.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como gerenciar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Como Gerenciar suas Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Visualizar
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                    <li>• Clique no ícone de sino no canto superior direito</li>
                    <li>• Notificações não lidas aparecem com um ponto azul</li>
                    <li>• Clique em uma notificação para ver os detalhes completos</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-600" />
                    Organizar
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                    <li>• Marque como lida clicando na notificação</li>
                    <li>• Delete notificações antigas com o botão de lixeira</li>
                    <li>• Use filtros para encontrar notificações específicas</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary" />
                  Dica Importante
                </h4>
                <p className="text-sm text-muted-foreground">
                  As notificações são atualizadas automaticamente a cada 30 segundos. Você não precisa recarregar a página
                  para ver novas mensagens. Notificações de alta prioridade aparecem instantaneamente como popup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <Link to="/notifications">
            <Button className="gap-2">
              <Bell className="h-4 w-4" />
              Ver Minhas Notificações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsHelp;