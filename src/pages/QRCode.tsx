
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, QrCode, Shield, Calendar, FileText, Award, GraduationCap, Users, Zap, ArrowRight, Star, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';

const QRCodePage = () => {
  const documentTypes = [
    {
      icon: FileText,
      title: "Documentos Pessoais",
      description: "CPF, RG, CNH e outros documentos oficiais",
      features: ["Verificação instantânea", "Segurança garantida", "Acesso rápido"]
    },
    {
      icon: Award,
      title: "Certificados Profissionais",
      description: "Certificados técnicos e profissionais",
      features: ["Validação oficial", "Reconhecimento nacional", "Prova de autenticidade"]
    },
    {
      icon: GraduationCap,
      title: "Diplomas e Cursos",
      description: "Diplomas e certificados de conclusão",
      features: ["Validação acadêmica", "Histórico permanente", "Verificação online"]
    }
  ];

  return (
    <PageLayout 
      variant="landing" 
      backgroundOpacity="medium" 
      showGradients={true}
      className="flex flex-col"
    >
      <MenuSuperior />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Hero Card */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl mb-8">
              <CardContent className="p-8 lg:p-12 text-center">
                {/* QR Code Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-brand-purple to-purple-600 p-4 rounded-full shadow-lg">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                </div>

                <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
                  Tecnologia de Certificação Digital
                </Badge>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  QR Codes
                  <span className="block text-brand-purple">Inteligentes</span>
                </h1>

                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Transforme seus documentos em certificados digitais verificáveis com tecnologia blockchain. 
                  Máxima segurança, autenticidade garantida e verificação instantânea.
                </p>

                <div className="flex justify-center mb-8">
                  <Link to="/registration">
                    <Button size="lg" className="bg-gradient-to-r from-brand-purple to-purple-600 hover:from-brand-darkPurple hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <QrCode className="mr-2 h-5 w-5" />
                      Criar QR Code Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-brand-purple mb-1">10K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Documentos Certificados</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-brand-purple mb-1">99.9%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Segurança Garantida</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-brand-purple mb-1">256-bit</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Criptografia SSL</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-brand-purple mb-1">24/7</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Disponibilidade</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Document Types Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documentTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gradient-to-br from-brand-purple to-purple-600 p-4 rounded-full text-white group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold mb-2">{type.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-12">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Como Funciona
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Processo simples e rápido para certificar seus documentos em apenas 3 passos
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Upload do Documento",
                description: "Faça upload do seu documento de forma segura em nossa plataforma protegida"
              },
              {
                step: "2",
                title: "Verificação Automática",
                description: "Nossa inteligência artificial valida e cria o certificado digital com blockchain"
              },
              {
                step: "3",
                title: "QR Code Gerado",
                description: "Receba seu QR Code verificado e pronto para compartilhar com segurança"
              }
            ].map((process, index) => (
              <Card key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 text-white rounded-full text-xl font-bold mb-4 shadow-lg">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {process.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-purple via-purple-600 to-indigo-600 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-2 text-sm">
              <Star className="w-4 h-4 mr-1" />
              Certificação Profissional
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight">
              Comece a Certificar seus <br />
              <span className="text-yellow-300">Documentos Hoje</span>
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-95 leading-relaxed">
              Junte-se a milhares de profissionais e empresas que já confiam em nossa tecnologia 
              para proteger e validar seus documentos mais importantes
            </p>
            <div className="flex justify-center mb-8">
              <Link to="/registration">
                <Button size="lg" className="bg-white text-brand-purple hover:bg-gray-100 px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <QrCode className="mr-2 h-5 w-5" />
                  Criar Meu QR Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Segurança Blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verificação Instantânea</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Validade Garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </PageLayout>
  );
};

export default QRCodePage;
