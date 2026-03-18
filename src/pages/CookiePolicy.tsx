import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, BarChart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import NewFooter from '@/components/NewFooter';
import PageLayout from '@/components/layout/PageLayout';

const CookiePolicy = () => {
  return (
    <PageLayout>
      <MenuSuperior />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Política de Cookies
            </h1>
            <p className="text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Cookie className="h-5 w-5 text-primary" />
                  1. O que são Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo 
                  quando você visita nosso site. Eles nos ajudam a melhorar sua experiência de 
                  navegação e fornecer funcionalidades personalizadas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5 text-primary" />
                  2. Tipos de Cookies que Usamos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Cookies Essenciais</h4>
                    <p className="text-muted-foreground">
                      Necessários para o funcionamento básico do site, como autenticação e preferências de sessão.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Cookies de Funcionalidade</h4>
                    <p className="text-muted-foreground">
                      Lembram suas preferências e escolhas para melhorar sua experiência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart className="h-5 w-5 text-primary" />
                  3. Cookies de Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilizamos cookies de análise para entender como os visitantes usam nosso site. 
                  Essas informações nos ajudam a melhorar continuamente nossos serviços e a 
                  experiência do usuário.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  4. Gerenciamento de Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Você pode controlar o uso de cookies:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Através das configurações do seu navegador</li>
                    <li>Usando nossas preferências de cookies (quando disponível)</li>
                    <li>Desabilitando cookies específicos (pode afetar funcionalidades)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/">← Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </div>
      <NewFooter />
    </PageLayout>
  );
};

export default CookiePolicy;
