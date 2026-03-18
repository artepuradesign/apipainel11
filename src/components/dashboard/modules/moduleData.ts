
import { 
  User, 
  Building2, 
  Car, 
  FileSearch, 
  Users, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Award,
  DollarSign,
  Shield,
  Camera,
  FileText,
  Calendar,
  Globe,
  Server
} from 'lucide-react';

export const serviceModules = [
  {
    title: "CPF",
    description: "Consulta completa de CPF com dados pessoais",
    icon: User,
    path: "/dashboard/consultar-cpf-puxa-tudo",
    price: "2,00"
  },
  {
    title: "CNPJ", 
    description: "Informações empresariais completas",
    icon: Building2,
    path: "/dashboard/consultar-cnpj",
    price: "2,00"
  },
  {
    title: "Veículo",
    description: "Dados completos de veículos",
    icon: Car,
    path: "/dashboard/consultar-veiculo", 
    price: "3,00"
  },
  {
    title: "Nome",
    description: "Busca por nome completo",
    icon: FileSearch,
    path: "/dashboard/busca-nome",
    price: "2,00"
  },
  {
    title: "Mãe",
    description: "Busca pelo nome da mãe",
    icon: Users,
    path: "/dashboard/busca-mae",
    price: "2,00"
  },
  {
    title: "Pai",
    description: "Busca pelo nome do pai",
    icon: Users,
    path: "/dashboard/busca-pai",
    price: "2,00"
  },
  {
    title: "Telefone",
    description: "Busca por número de telefone",
    icon: Phone,
    path: "/dashboard/busca-telefone",
    price: "2,00"
  },
  {
    title: "Email",
    description: "Busca por endereço de email",
    icon: Mail,
    path: "/dashboard/busca-email",
    price: "2,00"
  },
  {
    title: "Endereço",
    description: "Busca por endereço completo",
    icon: MapPin,
    path: "/dashboard/busca-endereco",
    price: "2,00"
  },
  {
    title: "Score CPF",
    description: "Score de crédito detalhado",
    icon: Award,
    path: "/dashboard/score-cpf",
    price: "4,00"
  },
  {
    title: "Score CNPJ", 
    description: "Score empresarial completo",
    icon: Shield,
    path: "/dashboard/score-cnpj",
    price: "5,00"
  },
  {
    title: "PIX",
    description: "Dados da chave PIX",
    icon: DollarSign,
    path: "/dashboard/consulta-pix",
    price: "1,00"
  },
  {
    title: "Foto",
    description: "Busca de foto pessoal",
    icon: Camera,
    path: "/dashboard/busca-foto",
    price: "10,00"
  },
  {
    title: "BO",
    description: "Boletim de Ocorrência",
    icon: FileText,
    path: "/dashboard/boletim-ocorrencia",
    price: "5,00"
  },
  {
    title: "Data Nascimento",
    description: "Busca por data de nascimento",
    icon: Calendar,
    path: "/dashboard/busca-nascimento",
    price: "2,00"
  },
  {
    title: "DOMÍNIO .COM",
    description: "Registro de domínio .com",
    icon: Globe,
    path: "/dashboard/sistemas-dominio-com",
    price: "2,00"
  },
  {
    title: "DOMÍNIO .COM.BR",
    description: "Registro de domínio .com.br",
    icon: Globe,
    path: "/dashboard/sistemas-dominio-com-br",
    price: "2,00"
  },
  {
    title: "VPS 6 MESES",
    description: "Hospedagem VPS com Linux por 6 meses",
    icon: Server,
    path: "/dashboard/sistemas-hospedagem-vps-6",
    price: "2,00"
  }
];
