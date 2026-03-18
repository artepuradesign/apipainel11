import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useApiInterceptor } from '@/hooks/useApiInterceptor';
import { ModuleTemplateProvider } from '@/contexts/ModuleTemplateContext';
import AuthWrapper from '@/components/AuthWrapper';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ScrollToTop from '@/components/ScrollToTop';
import RequireSupportOrAdmin from '@/components/auth/RequireSupportOrAdmin';
import SessionKickedModal from '@/components/notifications/SessionKickedModal';
import MaintenanceGuard from '@/components/MaintenanceGuard';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';
import TempConsulta from '@/pages/TempConsulta';
import VerifyEmail from '@/pages/VerifyEmail';
import ApiDocs from '@/pages/ApiDocs';
import PricingPage from '@/pages/PricingPage';
import QRCodePage from '@/pages/QRCode';
import AuthLoading from '@/pages/AuthLoading';
import Logout from '@/pages/Logout';
import IndicacoesPublicas from '@/pages/IndicacoesPublicas';
import Modulos from '@/pages/Modulos';
import ResetPassword from '@/pages/ResetPassword';

import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import NotificationsList from '@/pages/NotificationsList';
import NotificationDetails from '@/pages/NotificationDetails';
import NotificationsHelp from '@/pages/NotificationsHelp';
import TestRecharge from '@/pages/TestRecharge';

// Dashboard Pages
import DashboardHome from '@/pages/dashboard/DashboardHome';
import MinhaConta from '@/pages/dashboard/MinhaConta';
import Carteira from '@/pages/dashboard/Carteira';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';
import ConsultarCpfSimples from '@/pages/dashboard/ConsultarCpfSimples';
import ConsultarCpfBasico from '@/pages/dashboard/ConsultarCpfBasico';
import ConsultarCpfCompleto from '@/pages/dashboard/ConsultarCpfCompleto';
import ConsultarCpfFoto from '@/pages/dashboard/ConsultarCpfFoto';
import ConsultarCpfParentes from '@/pages/dashboard/ConsultarCpfParentes';
import ConsultarCpfCertidao from '@/pages/dashboard/ConsultarCpfCertidao';
import ConsultarCpfTelefones from '@/pages/dashboard/ConsultarCpfTelefones';
import ConsultarCpfEnderecos from '@/pages/dashboard/ConsultarCpfEnderecos';
import ConsultarCpfEmails from '@/pages/dashboard/ConsultarCpfEmails';
import ConsultarCpfCns from '@/pages/dashboard/ConsultarCpfCns';
import ConsultarCpfTitulo from '@/pages/dashboard/ConsultarCpfTitulo';
import ConsultarCpfPis from '@/pages/dashboard/ConsultarCpfPis';
import ConsultarCpfScore from '@/pages/dashboard/ConsultarCpfScore';
import ConsultarCpfCovid from '@/pages/dashboard/ConsultarCpfCovid';
import ConsultarCpfEmpresasSocio from '@/pages/dashboard/ConsultarCpfEmpresasSocio';
import ConsultarCpfMei from '@/pages/dashboard/ConsultarCpfMei';
import ConsultarCpfDividasAtivas from '@/pages/dashboard/ConsultarCpfDividasAtivas';
import ConsultarCpfAuxilioEmergencia from '@/pages/dashboard/ConsultarCpfAuxilioEmergencia';
import ConsultarCpfRais from '@/pages/dashboard/ConsultarCpfRais';
import ConsultarCpfInss from '@/pages/dashboard/ConsultarCpfInss';
import ConsultarCpfSenhasEmail from '@/pages/dashboard/ConsultarCpfSenhasEmail';
import ConsultarCpfSenhasCpf from '@/pages/dashboard/ConsultarCpfSenhasCpf';
import ConsultarCNPJ from '@/pages/dashboard/ConsultarCNPJ';
import ConsultarVeiculo from '@/pages/dashboard/ConsultarVeiculo';
import BuscaNome from '@/pages/dashboard/BuscaNome';
import BuscaMae from '@/pages/dashboard/BuscaMae';
import BuscaPai from '@/pages/dashboard/BuscaPai';
import CheckerLista from '@/pages/dashboard/CheckerLista';
import Historico from '@/pages/dashboard/Historico';
import HistoricoConsultas from '@/pages/dashboard/historico/HistoricoConsultas';
import HistoricoCadastrosApi from '@/pages/dashboard/historico/HistoricoCadastrosApi';
import HistoricoPagamentosPix from '@/pages/dashboard/historico/HistoricoPagamentosPix';
import HistoricoRecargasDepositos from '@/pages/dashboard/historico/HistoricoRecargasDepositos';
import HistoricoComprasPlanos from '@/pages/dashboard/historico/HistoricoComprasPlanos';
import HistoricoCuponsUtilizados from '@/pages/dashboard/historico/HistoricoCuponsUtilizados';
import HistoricoConsultasCpf from '@/pages/dashboard/HistoricoConsultasCpf';
import HistoricoConsultasNome from '@/pages/dashboard/HistoricoConsultasNome';
import ConsultarNomeCompleto from '@/pages/dashboard/ConsultarNomeCompleto';
import ControlePessoalAgenda from '@/pages/dashboard/ControlePessoalAgenda';
import ControlePessoalFinanceiro from '@/pages/dashboard/ControlePessoalFinanceiro';
import ControlePessoalNovoCliente from '@/pages/dashboard/ControlePessoalNovoCliente';
import ControlePessoalRelatorios from '@/pages/dashboard/ControlePessoalRelatorios';
import ControlePessoalVendaSimples from '@/pages/dashboard/ControlePessoalVendaSimples';

import Indique from '@/pages/dashboard/Indique';
import Revenda from '@/pages/dashboard/Revenda';
import Cupons from '@/pages/dashboard/Cupons';
import GerenciarCupons from '@/pages/dashboard/admin/GerenciarCupons';

import Personalizacao from '@/pages/dashboard/Personalizacao';
import PlanoDetalhes from '@/pages/dashboard/PlanoDetalhes';
import Configuracoes from '@/pages/dashboard/Configuracoes';
import AdicionarSaldo from '@/pages/dashboard/AdicionarSaldo';
import HistoricoPagamentos from '@/pages/dashboard/HistoricoPagamentos';
import SaquePix from '@/pages/dashboard/SaquePix';
import CadastrarDispositivos from '@/pages/dashboard/CadastrarDispositivos';
import ConsultaPersonalizada from '@/pages/dashboard/ConsultaPersonalizada';
import ConsultarCpfCompleta from '@/pages/dashboard/ConsultarCpfCompleta';
import ConsultarCNPJNew from '@/pages/dashboard/ConsultarCNPJNew';
import ConsultarVeiculoNew from '@/pages/dashboard/ConsultarVeiculoNew';
import GestaoUsuarios from '@/pages/dashboard/GestaoUsuarios';
import UserDetails from '@/pages/dashboard/UserDetails';

// Module Pages
import CnpjPuxaTudo from '@/pages/module/CnpjPuxaTudo';

import AdminDepoimentos from '@/pages/dashboard/AdminDepoimentos';
import CadastrarCPF from '@/pages/dashboard/CadastrarCPF';
import BaseCpfAdmin from '@/pages/dashboard/admin/BaseCpfAdmin';
import BaseCpfDetails from '@/pages/dashboard/admin/BaseCpfDetails';
import BaseCpfDetalhes from '@/pages/dashboard/admin/BaseCpfDetalhes';
import CpfView from '@/pages/dashboard/admin/CpfView';
import CpfEdit from '@/pages/dashboard/admin/CpfEdit';
import ConsultasCpfAdmin from '@/pages/dashboard/admin/ConsultasCpfAdmin';
import BaseReceitaAdmin from '@/pages/dashboard/admin/BaseReceitaAdmin';

import PainelIndividual from '@/pages/dashboard/PainelIndividual';
import DashboardAdmin from '@/pages/dashboard/DashboardAdmin';
import AdminCaixa from '@/pages/dashboard/admin/AdminCaixa';
import AdminCompraPlanos from '@/pages/dashboard/admin/AdminCompraPlanos';
import AdminRecargas from '@/pages/dashboard/admin/AdminRecargas';
import AdminIndicacoes from '@/pages/dashboard/admin/AdminIndicacoes';
import AdminPagamentosPix from '@/pages/dashboard/admin/AdminPagamentosPix';
import AdminPagamentosCartao from '@/pages/dashboard/admin/AdminPagamentosCartao';
import AdminPagamentosPaypal from '@/pages/dashboard/admin/AdminPagamentosPaypal';
import AdminPaineisAtivos from '@/pages/dashboard/admin/AdminPaineisAtivos';
import AdminModulos from '@/pages/dashboard/admin/AdminModulos';
import AdminUsuariosOnline from '@/pages/dashboard/admin/AdminUsuariosOnline';
import Ajuda from '@/pages/dashboard/Ajuda';
import Suporte from '@/pages/dashboard/Suporte';
import GerenciarChamados from '@/pages/dashboard/GerenciarChamados';
import MercadoPago from '@/pages/dashboard/integracoes/MercadoPago';
import MercadoPagoCartao from '@/pages/dashboard/integracoes/MercadoPagoCartao';
import MercadoPagoBoleto from '@/pages/dashboard/integracoes/MercadoPagoBoleto';
import HistoricoPix from '@/pages/dashboard/pagamentos/HistoricoPix';
import MeuHistoricoPix from '@/pages/dashboard/MeuHistoricoPix';
import NovoModuloStatus from '@/pages/ModuleStatus/NovoModulo';
import Manutencao from '@/pages/ModuleStatus/Manutencao';
import ModuloOff from '@/pages/ModuleStatus/ModuloOff';
import ModulePage from '@/components/module/ModulePage';
import Sessions from '@/pages/dashboard/Sessions';
import SessionNotification from '@/components/notifications/SessionNotification';
import Predefinicoes from '@/pages/dashboard/admin/Predefinicoes';
import AdminPedidos from '@/pages/dashboard/admin/AdminPedidos';
import AdminContadores from '@/pages/dashboard/admin/AdminContadores';

// Novos painéis específicos
import PainelColeta from '@/pages/dashboard/PainelColeta';
import PainelChecker from '@/pages/dashboard/PainelChecker';
import PainelBeneficios from '@/pages/dashboard/PainelBeneficios';

import PainelBancos from '@/pages/dashboard/PainelBancos';
import PagarPlano from '@/pages/dashboard/PagarPlano';
import PublicPlanos from '@/pages/PublicPlanos';
import PublicPlanPayment from '@/pages/PublicPlanPayment';
import PhotoDebugger from '@/components/debug/PhotoDebugger';
import QRCodeRg6m from '@/pages/dashboard/QRCodeRg6m';
import QRCodeRg6mTodos from '@/pages/dashboard/QRCodeRg6mTodos';
import QRCodeRg3m from '@/pages/dashboard/QRCodeRg3m';
import QRCodeRg3mTodos from '@/pages/dashboard/QRCodeRg3mTodos';
import QRCodeRg1m from '@/pages/dashboard/QRCodeRg1m';
import QRCodeRg1mTodos from '@/pages/dashboard/QRCodeRg1mTodos';
import QRCodeRgReativar from '@/pages/dashboard/QRCodeRgReativar';
import Rg2026 from '@/pages/dashboard/Rg2026';
import Rg2026Todos from '@/pages/dashboard/Rg2026Todos';
import EditaveisRg from '@/pages/dashboard/EditaveisRg';
import LoginHotmail from '@/pages/dashboard/LoginHotmail';
import LoginGmail from '@/pages/dashboard/LoginGmail';
import LoginRenner from '@/pages/dashboard/LoginRenner';
import PdfRg from '@/pages/dashboard/PdfRg';
import ImprimirRg from '@/pages/dashboard/ImprimirRg';
import PdfPersonalizado from '@/pages/dashboard/PdfPersonalizado';
import SistemasDominioCom from '@/pages/dashboard/SistemasDominioCom';
import SistemasDominioComBr from '@/pages/dashboard/SistemasDominioComBr';
import SistemasHospedagemVps1Mes from '@/pages/dashboard/SistemasHospedagemVps1Mes';
import SistemasHospedagemVps6 from '@/pages/dashboard/SistemasHospedagemVps6';
import SistemasHospedagemVps1Ano from '@/pages/dashboard/SistemasHospedagemVps1Ano';
import MeusPedidos from '@/pages/dashboard/MeusPedidos';
import ConsultarCpfHistorico from '@/pages/dashboard/ConsultarCpfHistorico';
import Preferencias from '@/pages/dashboard/Preferencias';
import { SiteThemeProvider } from '@/contexts/SiteThemeContext';
import MatrixRainBackground from '@/components/effects/MatrixRainBackground';
import LiquidGlassAdmin from '@/pages/dashboard/LiquidGlassAdmin';
import { LiquidGlassProvider } from '@/contexts/LiquidGlassContext';
import { LocaleProvider } from '@/contexts/LocaleContext';

// Create a client
const queryClient = new QueryClient();

const ApiInterceptorBootstrap = () => {
  useApiInterceptor();
  return null;
};

function App() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');

    if (redirectPath && redirectPath.startsWith('/')) {
      window.history.replaceState(null, '', redirectPath);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
        <SiteThemeProvider>
        <LiquidGlassProvider>
        <AuthProvider>
          <ApiInterceptorBootstrap />
          <ModuleTemplateProvider>
            <TooltipProvider>
              <Router>
                <ScrollToTop />
                <SessionKickedModal />
                <SessionNotification />
                <AuthWrapper>
                  <MaintenanceGuard>
                  <div className="App">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/auth-loading" element={<AuthLoading />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/qrcode" element={<QRCodePage />} />
                    
                    
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/api-docs" element={<ApiDocs />} />
                    <Route path="/planos" element={<PricingPage />} />
                    <Route path="/planos-publicos" element={<PublicPlanos />} />
                    <Route path="/indicacoes" element={<IndicacoesPublicas />} />
                    <Route path="/modulos" element={<Modulos />} />
                    <Route path="/public-plan-payment" element={<PublicPlanPayment />} />
                    <Route path="/temp" element={<TempConsulta />} />
                    
                    {/* Dashboard routes */}
                    <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
                    <Route path="/dashboard/admin" element={<DashboardLayout><DashboardAdmin /></DashboardLayout>} />
                    <Route path="/dashboard/admin/caixa" element={<DashboardLayout><AdminCaixa /></DashboardLayout>} />
                    <Route path="/dashboard/admin/compra-planos" element={<DashboardLayout><AdminCompraPlanos /></DashboardLayout>} />
                    <Route path="/dashboard/admin/recargas" element={<DashboardLayout><AdminRecargas /></DashboardLayout>} />
                    <Route path="/dashboard/admin/indicacoes" element={<DashboardLayout><AdminIndicacoes /></DashboardLayout>} />
                    
                    <Route path="/dashboard/minha-conta" element={<DashboardLayout><MinhaConta /></DashboardLayout>} />
                    <Route path="/dashboard/preferencias" element={<DashboardLayout><Preferencias /></DashboardLayout>} />
                    <Route path="/dashboard/dados-pessoais" element={<DashboardLayout><MinhaConta /></DashboardLayout>} />
                    <Route path="/dashboard/carteira" element={<DashboardLayout><Carteira /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-puxa-tudo" element={<DashboardLayout><ConsultarCpfPuxaTudo /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-simples" element={<DashboardLayout><ConsultarCpfSimples /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-basico" element={<DashboardLayout><ConsultarCpfBasico /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-completo" element={<DashboardLayout><ConsultarCpfCompleto /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-foto" element={<DashboardLayout><ConsultarCpfFoto /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-parentes" element={<DashboardLayout><ConsultarCpfParentes /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-certidao" element={<DashboardLayout><ConsultarCpfCertidao /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-telefones" element={<DashboardLayout><ConsultarCpfTelefones /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-enderecos" element={<DashboardLayout><ConsultarCpfEnderecos /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-emails" element={<DashboardLayout><ConsultarCpfEmails /></DashboardLayout>} />

                    <Route path="/dashboard/consultar-cpf-cns" element={<DashboardLayout><ConsultarCpfCns /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-titulo" element={<DashboardLayout><ConsultarCpfTitulo /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-pis" element={<DashboardLayout><ConsultarCpfPis /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-score" element={<DashboardLayout><ConsultarCpfScore /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-covid" element={<DashboardLayout><ConsultarCpfCovid /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-empresas-socio" element={<DashboardLayout><ConsultarCpfEmpresasSocio /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-mei" element={<DashboardLayout><ConsultarCpfMei /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-dividas-ativas" element={<DashboardLayout><ConsultarCpfDividasAtivas /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-auxilio-emergencia" element={<DashboardLayout><ConsultarCpfAuxilioEmergencia /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-rais" element={<DashboardLayout><ConsultarCpfRais /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-inss" element={<DashboardLayout><ConsultarCpfInss /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-senhasemail" element={<DashboardLayout><ConsultarCpfSenhasEmail /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-senhascpf" element={<DashboardLayout><ConsultarCpfSenhasCpf /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-historico" element={<DashboardLayout><ConsultarCpfHistorico /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cnpj" element={<DashboardLayout><ConsultarCNPJ /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-veiculo" element={<DashboardLayout><ConsultarVeiculo /></DashboardLayout>} />
                    <Route path="/dashboard/busca-nome" element={<DashboardLayout><BuscaNome /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-nome-completo" element={<DashboardLayout><ConsultarNomeCompleto /></DashboardLayout>} />
                    <Route path="/dashboard/busca-mae" element={<DashboardLayout><BuscaMae /></DashboardLayout>} />
                    <Route path="/dashboard/busca-pai" element={<DashboardLayout><BuscaPai /></DashboardLayout>} />
                    <Route path="/dashboard/checker-lista" element={<DashboardLayout><CheckerLista /></DashboardLayout>} />
                    <Route path="/dashboard/controlepessoal-agenda" element={<DashboardLayout><ControlePessoalAgenda /></DashboardLayout>} />
                    <Route path="/dashboard/controlepessoal-financeiro" element={<DashboardLayout><ControlePessoalFinanceiro /></DashboardLayout>} />
                    <Route path="/dashboard/controlepessoal-novocliente" element={<DashboardLayout><ControlePessoalNovoCliente /></DashboardLayout>} />
                    <Route path="/dashboard/controlepessoal-relatorios" element={<DashboardLayout><ControlePessoalRelatorios /></DashboardLayout>} />
                    <Route path="/dashboard/controlepessoal-vendasimples" element={<DashboardLayout><ControlePessoalVendaSimples /></DashboardLayout>} />
                    <Route path="/dashboard/historico" element={<DashboardLayout><Historico /></DashboardLayout>} />
                    <Route path="/dashboard/historico/consultas" element={<DashboardLayout><HistoricoConsultas /></DashboardLayout>} />
                    <Route path="/dashboard/historico/cadastros-api" element={<DashboardLayout><HistoricoCadastrosApi /></DashboardLayout>} />
                    <Route path="/dashboard/historico/pagamentos-pix" element={<DashboardLayout><HistoricoPagamentosPix /></DashboardLayout>} />
                    <Route path="/dashboard/historico/recargas-depositos" element={<DashboardLayout><HistoricoRecargasDepositos /></DashboardLayout>} />
                    <Route path="/dashboard/historico/compras-planos" element={<DashboardLayout><HistoricoComprasPlanos /></DashboardLayout>} />
                    <Route path="/dashboard/historico/cupons-utilizados" element={<DashboardLayout><HistoricoCuponsUtilizados /></DashboardLayout>} />
                    <Route path="/dashboard/historico-consultas-cpf" element={<DashboardLayout><HistoricoConsultasCpf /></DashboardLayout>} />
                    <Route path="/dashboard/historico-consultas-nome" element={<DashboardLayout><HistoricoConsultasNome /></DashboardLayout>} />
                    
                    
                    <Route path="/dashboard/indique" element={<DashboardLayout><Indique /></DashboardLayout>} />
                    <Route path="/dashboard/revenda" element={<DashboardLayout><Revenda /></DashboardLayout>} />
                    <Route path="/dashboard/cupons" element={<DashboardLayout><Cupons /></DashboardLayout>} />
                    <Route path="/dashboard/admin/cupons" element={<DashboardLayout><GerenciarCupons /></DashboardLayout>} />
                    
                    {/* Notificações */}
                    <Route path="/notifications" element={<DashboardLayout><NotificationsList /></DashboardLayout>} />
                    <Route path="/notifications/help" element={<DashboardLayout><NotificationsHelp /></DashboardLayout>} />
                    <Route path="/notifications/:id" element={<DashboardLayout><NotificationDetails /></DashboardLayout>} />
                    <Route path="/test-recharge" element={<DashboardLayout><TestRecharge /></DashboardLayout>} />
                    
                    <Route path="/dashboard/personalizacao" element={<DashboardLayout><RequireSupportOrAdmin><Personalizacao /></RequireSupportOrAdmin></DashboardLayout>} />
                    <Route path="/dashboard/personalizacao/plano/:planId" element={<DashboardLayout><RequireSupportOrAdmin><PlanoDetalhes /></RequireSupportOrAdmin></DashboardLayout>} />
                    <Route path="/dashboard/configuracoes" element={<DashboardLayout><Configuracoes /></DashboardLayout>} />
                    <Route path="/dashboard/adicionar-saldo" element={<DashboardLayout><AdicionarSaldo /></DashboardLayout>} />
                    <Route path="/dashboard/pagarplano" element={<DashboardLayout><PagarPlano /></DashboardLayout>} />
                    <Route path="/dashboard/historico-pagamentos" element={<DashboardLayout><HistoricoPagamentos /></DashboardLayout>} />
                    <Route path="/dashboard/saque-pix" element={<DashboardLayout><SaquePix /></DashboardLayout>} />
                    <Route path="/dashboard/cadastrar-dispositivos" element={<DashboardLayout><CadastrarDispositivos /></DashboardLayout>} />
                    <Route path="/dashboard/consulta-personalizada" element={<DashboardLayout><ConsultaPersonalizada /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cpf-completa" element={<DashboardLayout><ConsultarCpfCompleta /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-cnpj-new" element={<DashboardLayout><ConsultarCNPJNew /></DashboardLayout>} />
                    <Route path="/dashboard/consultar-veiculo-new" element={<DashboardLayout><ConsultarVeiculoNew /></DashboardLayout>} />
                    <Route path="/dashboard/gestao-usuarios" element={<DashboardLayout><GestaoUsuarios /></DashboardLayout>} />
                    <Route path="/dashboard/usuario/:userId" element={<DashboardLayout><UserDetails /></DashboardLayout>} />
                    <Route path="/dashboard/sessions" element={<DashboardLayout><Sessions /></DashboardLayout>} />
                    
                    <Route path="/dashboard/admin-depoimentos" element={<DashboardLayout><AdminDepoimentos /></DashboardLayout>} />
                    <Route path="/dashboard/api-externa/cadastrar-cpf" element={<DashboardLayout><CadastrarCPF /></DashboardLayout>} />
                    
                     <Route path="/dashboard/ajuda" element={<DashboardLayout><Ajuda /></DashboardLayout>} />
                     <Route path="/dashboard/suporte" element={<DashboardLayout><Suporte /></DashboardLayout>} />
                     <Route path="/dashboard/gerenciar-chamados" element={<DashboardLayout><GerenciarChamados /></DashboardLayout>} />
                    <Route path="/dashboard/admin/base-cpf" element={<DashboardLayout><BaseCpfAdmin /></DashboardLayout>} />
                    <Route path="/dashboard/admin/base-cpf/:cpfId" element={<DashboardLayout><BaseCpfDetails /></DashboardLayout>} />
                    <Route path="/dashboard/admin/base-cpf/detalhes/:id" element={<DashboardLayout><BaseCpfDetalhes /></DashboardLayout>} />
                     <Route path="/dashboard/admin/cpf-view/40" element={<Navigate to="/dashboard/admin/cpf-view/39" replace />} />
                     <Route path="/dashboard/admin/cpf-view/:id" element={<DashboardLayout><CpfView /></DashboardLayout>} />
                     <Route path="/dashboard/admin/cpf-edit/:id" element={<DashboardLayout><CpfEdit /></DashboardLayout>} />
                     <Route path="/dashboard/admin/consultas-cpf" element={<DashboardLayout><ConsultasCpfAdmin /></DashboardLayout>} />
                     <Route path="/dashboard/admin/base-receita" element={<DashboardLayout><BaseReceitaAdmin /></DashboardLayout>} />
                    <Route path="/dashboard/admin/caixa" element={<DashboardLayout><AdminCaixa /></DashboardLayout>} />
                    <Route path="/dashboard/admin/compra-planos" element={<DashboardLayout><AdminCompraPlanos /></DashboardLayout>} />
                    <Route path="/dashboard/admin/recargas" element={<DashboardLayout><AdminRecargas /></DashboardLayout>} />
                    <Route path="/dashboard/admin/indicacoes" element={<DashboardLayout><AdminIndicacoes /></DashboardLayout>} />
                    <Route path="/dashboard/admin/pagamentos-pix" element={<DashboardLayout><AdminPagamentosPix /></DashboardLayout>} />
                    <Route path="/dashboard/admin/pagamentos-cartao" element={<DashboardLayout><AdminPagamentosCartao /></DashboardLayout>} />
                    <Route path="/dashboard/admin/pagamentos-paypal" element={<DashboardLayout><AdminPagamentosPaypal /></DashboardLayout>} />
                    <Route path="/dashboard/admin/paineis-ativos" element={<DashboardLayout><AdminPaineisAtivos /></DashboardLayout>} />
                    <Route path="/dashboard/admin/modulos" element={<DashboardLayout><AdminModulos /></DashboardLayout>} />
                    <Route path="/dashboard/admin/usuarios-online" element={<DashboardLayout><AdminUsuariosOnline /></DashboardLayout>} />
                    <Route path="/dashboard/admin/predefinicoes" element={<DashboardLayout><RequireSupportOrAdmin><Predefinicoes /></RequireSupportOrAdmin></DashboardLayout>} />
                     <Route path="/dashboard/admin/pedidos" element={<DashboardLayout><RequireSupportOrAdmin><AdminPedidos /></RequireSupportOrAdmin></DashboardLayout>} />
                    <Route path="/dashboard/admin/liquid-glass" element={<DashboardLayout><RequireSupportOrAdmin><LiquidGlassAdmin /></RequireSupportOrAdmin></DashboardLayout>} />
                    <Route path="/dashboard/admin/contadores" element={<DashboardLayout><RequireSupportOrAdmin><AdminContadores /></RequireSupportOrAdmin></DashboardLayout>} />
                    
                    
                    {/* Integrações */}
                    <Route path="/dashboard/integracoes/mercado-pago" element={<DashboardLayout><MercadoPago /></DashboardLayout>} />
                    <Route path="/dashboard/integracoes/mercado-pago-cartao" element={<DashboardLayout><MercadoPagoCartao /></DashboardLayout>} />
                    <Route path="/dashboard/integracoes/mercado-pago-boleto" element={<DashboardLayout><MercadoPagoBoleto /></DashboardLayout>} />
                    
                    {/* Pagamentos */}
                    <Route path="/dashboard/pagamentos/historico-pix" element={<DashboardLayout><HistoricoPix /></DashboardLayout>} />
                    <Route path="/dashboard/meu-historico-pix" element={<DashboardLayout><MeuHistoricoPix /></DashboardLayout>} />
                    
                    <Route path="/dashboard/painel/:painelId" element={<DashboardLayout><PainelIndividual /></DashboardLayout>} />
                    
                    {/* Module Pages - Protegido por saldo */}
                    <Route path="/module/:slug" element={<DashboardLayout><ModulePage /></DashboardLayout>} />
                    <Route path="/module/cnpj-puxa-tudo" element={<DashboardLayout><CnpjPuxaTudo /></DashboardLayout>} />
                    
                    {/* Module Status Pages */}
                    <Route path="/paginas/novomodulo" element={<NovoModuloStatus />} />
                    <Route path="/paginas/manutencao" element={<Manutencao />} />
                    <Route path="/paginas/modulooff" element={<ModuloOff />} />
                    
                    {/* Rotas dos novos painéis específicos */}
                    <Route path="/dashboard/coleta" element={<DashboardLayout><PainelColeta /></DashboardLayout>} />
                    <Route path="/dashboard/consulta" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
                    <Route path="/dashboard/checker" element={<DashboardLayout><PainelChecker /></DashboardLayout>} />
                    <Route path="/dashboard/beneficio" element={<DashboardLayout><PainelBeneficios /></DashboardLayout>} />
                    <Route path="/dashboard/editor" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
                    
                    <Route path="/dashboard/editaveis-rg" element={<DashboardLayout><EditaveisRg /></DashboardLayout>} />
                    <Route path="/dashboard/login-hotmail" element={<DashboardLayout><LoginHotmail /></DashboardLayout>} />
                    <Route path="/dashboard/login-gmail" element={<DashboardLayout><LoginGmail /></DashboardLayout>} />
                    <Route path="/dashboard/login-renner" element={<DashboardLayout><LoginRenner /></DashboardLayout>} />
<Route path="/dashboard/pdf-rg" element={<DashboardLayout><PdfRg /></DashboardLayout>} />
                    <Route path="/dashboard/imprimir-rg" element={<DashboardLayout><ImprimirRg /></DashboardLayout>} />
                    <Route path="/dashboard/pdf-personalizado" element={<DashboardLayout><PdfPersonalizado /></DashboardLayout>} />
                    <Route path="/dashboard/sistemas-dominio-com" element={<DashboardLayout><SistemasDominioCom /></DashboardLayout>} />
                    <Route path="/dashboard/sistemas-dominio-com-br" element={<DashboardLayout><SistemasDominioComBr /></DashboardLayout>} />
                    <Route path="/dashboard/sistemas-hospedagem-vps-1" element={<DashboardLayout><SistemasHospedagemVps1Mes /></DashboardLayout>} />
                    <Route path="/dashboard/sistemas-hospedagem-vps-6" element={<DashboardLayout><SistemasHospedagemVps6 /></DashboardLayout>} />
                    <Route path="/dashboard/sistemas-hospedagem-vps-1a" element={<DashboardLayout><SistemasHospedagemVps1Ano /></DashboardLayout>} />
                    <Route path="/dashboard/meus-pedidos" element={<DashboardLayout><MeusPedidos /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode" element={<DashboardLayout><QRCodePage /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-6m" element={<DashboardLayout><QRCodeRg6m /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-6m/todos" element={<DashboardLayout><QRCodeRg6mTodos /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-3m" element={<DashboardLayout><QRCodeRg3m /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-3m/todos" element={<DashboardLayout><QRCodeRg3mTodos /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-1m" element={<DashboardLayout><QRCodeRg1m /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-1m/todos" element={<DashboardLayout><QRCodeRg1mTodos /></DashboardLayout>} />
                    <Route path="/dashboard/rg-2026" element={<DashboardLayout><Rg2026 /></DashboardLayout>} />
                    <Route path="/dashboard/rg-2026/todos" element={<DashboardLayout><Rg2026Todos /></DashboardLayout>} />
                    <Route path="/dashboard/qrcode-rg-reativar" element={<DashboardLayout><QRCodeRgReativar /></DashboardLayout>} />
                    <Route path="/dashboard/banco" element={<DashboardLayout><PainelBancos /></DashboardLayout>} />
                    
                     {/* Debug route for testing photo endpoint */}
                     <Route path="/debug/photos" element={<DashboardLayout><PhotoDebugger /></DashboardLayout>} />
                     
                     {/* Fallback route */}
                     <Route path="*" element={<NotFound />} />
                  </Routes>
                  </div>
                  </MaintenanceGuard>
                </AuthWrapper>
              </Router>
              <Toaster />
            </TooltipProvider>
          </ModuleTemplateProvider>
        </AuthProvider>
        </LiquidGlassProvider>
        </SiteThemeProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
