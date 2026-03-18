import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Eye, Database, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import NewFooter from '@/components/NewFooter';
import PageLayout from '@/components/layout/PageLayout';
import { useLocale } from '@/contexts/LocaleContext';

const contentByLocale = {
  'pt-BR': {
    title: 'Política de Privacidade',
    updated: 'Última atualização',
    sections: [
      {
        icon: Lock,
        title: '1. Informações que Coletamos',
        intro: 'Coletamos as seguintes informações:',
        items: [
          'Dados de cadastro (nome, e-mail, telefone)',
          'Informações de uso da plataforma',
          'Logs de acesso e consultas realizadas',
          'Dados de pagamento (processados por terceiros)',
        ],
      },
      {
        icon: Eye,
        title: '2. Como Usamos suas Informações',
        intro: 'Utilizamos suas informações para:',
        items: [
          'Fornecer e melhorar nossos serviços',
          'Processar pagamentos e gerenciar sua conta',
          'Enviar comunicações importantes sobre o serviço',
          'Cumprir obrigações legais e regulamentares',
        ],
      },
      {
        icon: Database,
        title: '3. Proteção de Dados',
        paragraph:
          'Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição não autorizada.',
      },
      {
        icon: UserCheck,
        title: '4. Seus Direitos (LGPD)',
        intro: 'Você tem os seguintes direitos sobre seus dados:',
        items: [
          'Acesso aos dados pessoais que tratamos',
          'Correção de dados incompletos ou incorretos',
          'Exclusão de dados pessoais',
          'Portabilidade de dados',
          'Revogação de consentimento',
        ],
      },
    ],
    back: '← Voltar ao Início',
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated',
    sections: [
      {
        icon: Lock,
        title: '1. Information We Collect',
        intro: 'We collect the following information:',
        items: [
          'Registration data (name, email, phone)',
          'Platform usage information',
          'Access logs and query history',
          'Payment data (processed by third parties)',
        ],
      },
      {
        icon: Eye,
        title: '2. How We Use Your Information',
        intro: 'We use your information to:',
        items: [
          'Provide and improve our services',
          'Process payments and manage your account',
          'Send important service communications',
          'Comply with legal and regulatory obligations',
        ],
      },
      {
        icon: Database,
        title: '3. Data Protection',
        paragraph:
          'We implement technical and organizational security measures to protect your personal information against unauthorized access, changes, disclosure, or destruction.',
      },
      {
        icon: UserCheck,
        title: '4. Your Rights',
        intro: 'You have the following rights regarding your data:',
        items: [
          'Access to the personal data we process',
          'Correction of incomplete or incorrect data',
          'Deletion of personal data',
          'Data portability',
          'Withdrawal of consent',
        ],
      },
    ],
    back: '← Back to Home',
  },
  es: {
    title: 'Política de Privacidad',
    updated: 'Última actualización',
    sections: [
      {
        icon: Lock,
        title: '1. Información que Recopilamos',
        intro: 'Recopilamos la siguiente información:',
        items: [
          'Datos de registro (nombre, correo, teléfono)',
          'Información de uso de la plataforma',
          'Registros de acceso e historial de consultas',
          'Datos de pago (procesados por terceros)',
        ],
      },
      {
        icon: Eye,
        title: '2. Cómo Usamos tu Información',
        intro: 'Usamos tu información para:',
        items: [
          'Brindar y mejorar nuestros servicios',
          'Procesar pagos y gestionar tu cuenta',
          'Enviar comunicaciones importantes del servicio',
          'Cumplir obligaciones legales y regulatorias',
        ],
      },
      {
        icon: Database,
        title: '3. Protección de Datos',
        paragraph:
          'Implementamos medidas técnicas y organizativas para proteger tu información personal contra accesos no autorizados, alteraciones, divulgación o destrucción.',
      },
      {
        icon: UserCheck,
        title: '4. Tus Derechos',
        intro: 'Tienes los siguientes derechos sobre tus datos:',
        items: [
          'Acceso a los datos personales que tratamos',
          'Corrección de datos incompletos o incorrectos',
          'Eliminación de datos personales',
          'Portabilidad de datos',
          'Revocación del consentimiento',
        ],
      },
    ],
    back: '← Volver al Inicio',
  },
} as const;

const dateLocaleByLocale = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
} as const;

const PrivacyPolicy = () => {
  const { locale } = useLocale();
  const content = contentByLocale[locale];

  return (
    <PageLayout>
      <MenuSuperior />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{content.title}</h1>
            <p className="text-lg text-muted-foreground">
              {content.updated}: {new Date().toLocaleDateString(dateLocaleByLocale[locale])}
            </p>
          </div>

          <div className="space-y-6">
            {content.sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <Card className="border-border/60" key={`${section.title}-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {'paragraph' in section ? (
                      <p className="text-muted-foreground">{section.paragraph}</p>
                    ) : (
                      <div className="space-y-4 text-muted-foreground">
                        <p>{section.intro}</p>
                        <ul className="list-disc list-inside space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/">{content.back}</Link>
            </Button>
          </div>
        </div>
      </div>
      <NewFooter />
    </PageLayout>
  );
};

export default PrivacyPolicy;
