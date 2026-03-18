
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, AlertTriangle, Scale, UserCheck, Lock, Ban, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { useLocale } from '@/contexts/LocaleContext';

const contentByLocale = {
  'pt-BR': {
    title: 'Termos de Uso e Responsabilidades',
    updated: 'Última atualização',
    warning: 'LEIA ATENTAMENTE ANTES DE UTILIZAR A PLATAFORMA',
    back: 'Voltar ao Início',
    rights: 'Todos os direitos reservados.',
    sections: [
      {
        icon: FileText,
        title: '1. Aceitação dos Termos',
        paragraph: 'Ao criar uma conta, acessar ou utilizar qualquer funcionalidade do APIPainel, você declara que leu e concorda integralmente com estes termos.',
      },
      {
        icon: Shield,
        title: '2. Descrição do Serviço',
        items: [
          'Consultas de documentos e dados públicos/comerciais.',
          'Acesso a informações cadastrais e empresariais.',
          'Ferramentas administrativas e de gestão.',
          'Sistema de créditos e saldo para consultas.',
        ],
      },
      {
        icon: AlertTriangle,
        title: '3. Responsabilidades do Usuário',
        items: [
          'Usar dados apenas para fins legais e legítimos.',
          'Respeitar leis aplicáveis, incluindo LGPD.',
          'Não revender, redistribuir ou compartilhar dados obtidos.',
          'Não usar a plataforma para fraude, perseguição ou atividades ilícitas.',
        ],
      },
      {
        icon: Scale,
        title: '4. Limitação de Responsabilidade',
        paragraph: 'A plataforma atua como intermediária tecnológica e não garante a atualização ou precisão absoluta de dados de terceiros.',
      },
      {
        icon: UserCheck,
        title: '5. Direitos e Deveres do Usuário',
        items: [
          'Direito de acesso aos serviços contratados.',
          'Dever de manter credenciais seguras e dados cadastrais atualizados.',
          'Obrigação de uso de boa-fé e conforme legislação vigente.',
        ],
      },
      {
        icon: Lock,
        title: '6. Privacidade e Segurança',
        paragraph: 'Tratamos dados pessoais para execução dos serviços e aplicamos medidas de segurança administrativas e técnicas.',
      },
      {
        icon: Ban,
        title: '7. Suspensão e Cancelamento',
        items: [
          'Violação destes termos.',
          'Uso suspeito/fraudulento da plataforma.',
          'Tentativa de burlar mecanismos de segurança.',
          'Determinação judicial ou regulatória.',
        ],
      },
      {
        icon: Gavel,
        title: '8. Disposições Gerais',
        paragraph: 'Este termo é regido pelas leis brasileiras e pode ser atualizado a qualquer momento, passando a valer após publicação na plataforma.',
      },
    ],
    declarationTitle: 'DECLARAÇÃO DE CIÊNCIA E CONCORDÂNCIA',
    declarationText: 'Ao utilizar o APIPainel, você declara que leu, compreendeu e concorda com estes termos, assumindo responsabilidade pelo uso dos dados e serviços.',
    declarationSupport: 'Para dúvidas, utilize os canais oficiais de suporte.',
  },
  en: {
    title: 'Terms of Use and Responsibilities',
    updated: 'Last updated',
    warning: 'PLEASE READ CAREFULLY BEFORE USING THE PLATFORM',
    back: 'Back to Home',
    rights: 'All rights reserved.',
    sections: [
      {
        icon: FileText,
        title: '1. Acceptance of Terms',
        paragraph: 'By creating an account or using APIPainel, you confirm that you have read and agreed to these terms.',
      },
      {
        icon: Shield,
        title: '2. Service Description',
        items: [
          'Document and public/commercial data lookups.',
          'Access to registration and business information.',
          'Administrative and management tools.',
          'Credits and balance system for lookups.',
        ],
      },
      {
        icon: AlertTriangle,
        title: '3. User Responsibilities',
        items: [
          'Use data only for lawful and legitimate purposes.',
          'Comply with applicable data protection laws.',
          'Do not resell, redistribute, or share obtained data.',
          'Do not use the platform for fraud or illegal activities.',
        ],
      },
      {
        icon: Scale,
        title: '4. Limitation of Liability',
        paragraph: 'The platform is a technology intermediary and does not guarantee absolute accuracy or freshness of third-party data.',
      },
      {
        icon: UserCheck,
        title: '5. User Rights and Duties',
        items: [
          'Right to access contracted services.',
          'Duty to keep credentials secure and profile data updated.',
          'Duty to use the platform in good faith and legal compliance.',
        ],
      },
      {
        icon: Lock,
        title: '6. Privacy and Security',
        paragraph: 'We process personal data to deliver services and apply technical and administrative safeguards.',
      },
      {
        icon: Ban,
        title: '7. Suspension and Termination',
        items: [
          'Violation of these terms.',
          'Suspicious or fraudulent use.',
          'Attempts to bypass security controls.',
          'Court or regulatory order.',
        ],
      },
      {
        icon: Gavel,
        title: '8. General Provisions',
        paragraph: 'These terms are governed by Brazilian law and may be updated at any time, effective upon publication.',
      },
    ],
    declarationTitle: 'ACKNOWLEDGEMENT AND AGREEMENT',
    declarationText: 'By using APIPainel, you acknowledge and agree to these terms and assume responsibility for your use of data and services.',
    declarationSupport: 'For questions, contact our official support channels.',
  },
  es: {
    title: 'Términos de Uso y Responsabilidades',
    updated: 'Última actualización',
    warning: 'LEE ATENTAMENTE ANTES DE USAR LA PLATAFORMA',
    back: 'Volver al Inicio',
    rights: 'Todos los derechos reservados.',
    sections: [
      {
        icon: FileText,
        title: '1. Aceptación de los Términos',
        paragraph: 'Al crear una cuenta o usar APIPainel, confirmas que leíste y aceptaste estos términos.',
      },
      {
        icon: Shield,
        title: '2. Descripción del Servicio',
        items: [
          'Consultas de documentos y datos públicos/comerciales.',
          'Acceso a información registral y empresarial.',
          'Herramientas administrativas y de gestión.',
          'Sistema de créditos y saldo para consultas.',
        ],
      },
      {
        icon: AlertTriangle,
        title: '3. Responsabilidades del Usuario',
        items: [
          'Usar los datos solo para fines lícitos y legítimos.',
          'Cumplir leyes aplicables de protección de datos.',
          'No revender, redistribuir ni compartir datos obtenidos.',
          'No usar la plataforma para fraude o actividades ilícitas.',
        ],
      },
      {
        icon: Scale,
        title: '4. Limitación de Responsabilidad',
        paragraph: 'La plataforma actúa como intermediaria tecnológica y no garantiza precisión absoluta de datos de terceros.',
      },
      {
        icon: UserCheck,
        title: '5. Derechos y Deberes del Usuario',
        items: [
          'Derecho de acceso a servicios contratados.',
          'Deber de proteger credenciales y actualizar datos.',
          'Uso de buena fe y conforme a la legislación vigente.',
        ],
      },
      {
        icon: Lock,
        title: '6. Privacidad y Seguridad',
        paragraph: 'Tratamos datos personales para prestar servicios y aplicamos medidas técnicas y administrativas de protección.',
      },
      {
        icon: Ban,
        title: '7. Suspensión y Cancelación',
        items: [
          'Incumplimiento de estos términos.',
          'Uso sospechoso o fraudulento.',
          'Intentos de evadir controles de seguridad.',
          'Orden judicial o regulatoria.',
        ],
      },
      {
        icon: Gavel,
        title: '8. Disposiciones Generales',
        paragraph: 'Estos términos se rigen por leyes brasileñas y pueden actualizarse en cualquier momento al publicarse en la plataforma.',
      },
    ],
    declarationTitle: 'DECLARACIÓN DE CONOCIMIENTO Y CONFORMIDAD',
    declarationText: 'Al usar APIPainel, declaras que leíste y aceptas estos términos, asumiendo responsabilidad por el uso de los datos y servicios.',
    declarationSupport: 'Para consultas, usa los canales oficiales de soporte.',
  },
} as const;

const dateLocaleByLocale = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
} as const;

const TermsOfService = () => {
  const { locale } = useLocale();
  const content = contentByLocale[locale];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 pb-8 border-b border-border">
            <h1 className="text-4xl font-bold text-foreground mb-4">{content.title}</h1>
            <p className="text-lg text-muted-foreground">
              {content.updated}: {new Date().toLocaleDateString(dateLocaleByLocale[locale])}
            </p>
            <p className="text-sm text-destructive mt-2 font-medium">{content.warning}</p>
          </div>

          <div className="space-y-6">
            {content.sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card className="border-border" key={`${section.title}-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                      <Icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {'items' in section ? (
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {section.items.map((item, itemIndex) => (
                          <li key={`${item}-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">{section.paragraph}</p>
                    )}

                    {section.title.startsWith('6.') || section.title.startsWith('6') ? (
                      <p className="text-muted-foreground leading-relaxed mt-4">
                        <Link to="/privacy" className="text-primary hover:underline">
                          {locale === 'pt-BR' ? 'Política de Privacidade' : locale === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
                        </Link>
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <p className="text-foreground font-bold text-lg text-center">{content.declarationTitle}</p>
                <p className="text-muted-foreground text-center leading-relaxed">{content.declarationText}</p>
                <p className="text-sm text-muted-foreground text-center">{content.declarationSupport}</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12 space-y-4">
            <Button asChild size="lg">
              <Link to="/">{content.back}</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} APIPainel. {content.rights}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
