import React from 'react';
import { useParams } from 'react-router-dom';
import { useModuleBalanceGuard } from '@/hooks/useModuleBalanceGuard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';

const ModulePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { module, isAuthorized, hasValidBalance } = useModuleBalanceGuard(slug || '');

  if (!slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border backdrop-blur-sm shadow-xl">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Erro na URL</h2>
              <p className="text-muted-foreground mb-6">Parâmetro de módulo não encontrado na URL.</p>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!module || !isAuthorized || !hasValidBalance) {
    // O hook já cuida do redirecionamento, mas mantemos como fallback
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border backdrop-blur-sm shadow-xl">
            <CardContent className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verificando acesso ao módulo...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Obter o componente do ícone
  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const ModuleIcon = getIconComponent(module.icon);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card border-border backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ModuleIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{module.title}</CardTitle>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Módulo {module.title}
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Este módulo está em desenvolvimento. As funcionalidades estarão disponíveis em breve.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  Autorizado
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                  Saldo OK
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
                  R$ {typeof module.price === 'number' ? module.price.toFixed(2).replace('.', ',') : module.price}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Status: <strong className="text-foreground">Pronto para uso</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Funcionalidades específicas do módulo serão implementadas aqui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModulePage;