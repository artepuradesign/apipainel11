import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, User, Heart, Phone, Mail, MapPin, FileText, CreditCard, DollarSign, TrendingUp, Camera, Globe, Plus, Trash2, Briefcase } from 'lucide-react';
import { baseCpfService, BaseCpf } from '@/services/baseCpfService';
import { formatCep, formatCpf, formatCnpj, formatPhone, formatDateOfBirth } from '@/utils/formatters';
import MultiplePhotoUploader from '@/components/cpf/MultiplePhotoUploader';
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { CreateBaseTelefone } from '@/services/baseTelefoneService';
import { CreateBaseEmail } from '@/services/baseEmailService';
import { CreateBaseRg } from '@/services/baseRgService';
import { CreateBaseCnh } from '@/services/baseCnhService';
import BaseReceitaFormSection from '@/components/admin/BaseReceitaFormSection';
import CpfValidationStatus from '@/components/cpf/CpfValidationStatus';
import CreditinkForm from '@/components/credilink/CreditinkForm';
import VacinaSection from '@/components/vacina/VacinaSection';
import CnpjMeiForm from '@/components/cnpj-mei/CnpjMeiForm';
import DividasAtivasSection from '@/components/dividas-ativas/DividasAtivasSection';
import AuxilioEmergencialSection from '@/components/auxilio-emergencial/AuxilioEmergencialSection';
import InssForm from '@/components/inss/InssForm';
import HistoricoVeiculoForm from '@/components/historico-veiculo/HistoricoVeiculoForm';
import ParenteForm from '@/components/parente/ParenteForm';
import BoletimOcorrenciaForm from '@/components/boletim-ocorrencia/BoletimOcorrenciaForm';
import EmpresasSocioForm from '@/components/empresas-socio/EmpresasSocioForm';
import VivoForm from '@/components/operadoras/VivoForm';
import ClaroForm from '@/components/operadoras/ClaroForm';
import TimForm from '@/components/operadoras/TimForm';
import SenhaEmailForm from '@/components/senhas/SenhaEmailForm';
import SenhaCpfForm from '@/components/senhas/SenhaCpfForm';

import { CreateBaseCredilink } from '@/services/baseCreditinkService';
import { CreateBaseParente } from '@/services/baseParenteService';
import { CreateBaseBoletimOcorrencia } from '@/components/boletim-ocorrencia/BoletimOcorrenciaForm';
import { CreateBaseEmpresasSocio } from '@/components/empresas-socio/EmpresasSocioForm';
import { CreateBaseVivo } from '@/components/operadoras/VivoForm';
import { CreateBaseClaro } from '@/components/operadoras/ClaroForm';
import { CreateBaseTim } from '@/components/operadoras/TimForm';
import { CreateBaseSenhaEmail } from '@/components/senhas/SenhaEmailForm';
import { CreateBaseSenhaCpf } from '@/components/senhas/SenhaCpfForm';
import { CreateBaseVacina } from '@/services/baseVacinaService';
import { CreateBaseCnpjMei } from '@/services/baseCnpjMeiService';
import { CreateBaseDividasAtivas } from '@/services/baseDividasAtivasService';
import { CreateBaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';
import { CreateBaseInss } from '@/services/baseInssService';
import { CreateBaseHistoricoVeiculo } from '@/services/baseHistoricoVeiculoService';


const splitPhone = (input: string) => {
  const digits = (input || '').replace(/\D/g, '');
  const ddd = digits.slice(0, 2);
  const telefone = digits.slice(2);
  return { ddd, telefone, digits };
};


const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const CadastrarCPF = () => {
  console.log('🔧 [CADASTRAR_CPF] Componente inicializando...');
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado para dados do CPF usando a nova estrutura da tabela
  const [dadosBasicos, setDadosBasicos] = useState<Partial<BaseCpf>>({
    cpf: '',
    ref: '',
    nome: '',
    data_nascimento: '',
    sexo: '',
    situacao_cpf: '',
    cor: '',
    mae: '',
    pai: '',
    naturalidade: '',
    uf_naturalidade: '',
    estado_civil: '',
    escolaridade: '',
    
    // Documentos (mantidos apenas os que não foram removidos da tabela)
    passaporte: '',
    cns: '',
    nit: '',
    ctps: '',
    titulo_eleitor: '',
    zona: '',
    secao: '',
    nsu: '',
    pis: '',
    
    // Dados profissionais
    aposentado: '',
    tipo_emprego: '',
    cbo: '',
    
    // Dados financeiros
    poder_aquisitivo: '',
    renda: '',
    fx_poder_aquisitivo: '',
    csb8: undefined,
    csb8_faixa: '',
    csba: undefined,
    csba_faixa: '',
    
    // Outros
    data_obito: '',
    foto: '',
    foto2: '',
    photo: '',
    photo2: '',
    photo3: '',
    photo4: '',
    fonte_dados: 'cadastro_manual',
    qualidade_dados: 50
  });

  // Estado para o score
  const [score, setScore] = useState<number>(0);

  // Estado para dados da Receita Federal
  const [receitaData, setReceitaData] = useState<Partial<BaseReceita>>({});

  // Estados para telefones adicionais, emails e endereços
  const [telefonesAdicionais, setTelefonesAdicionais] = useState<CreateBaseTelefone[]>([{
    cpf_id: 0,
    ddd: '',
    telefone: '',
    tipo_codigo: '3',
    tipo_texto: 'Outro',
    sigilo: 0
  }]);
  const [emailsAdicionais, setEmailsAdicionais] = useState<CreateBaseEmail[]>([{
    cpf_id: 0,
    email: '',
    prioridade: 1,
    score_email: 'REGULAR',
    email_pessoal: 'N',
    email_duplicado: 'N',
    blacklist: 'N'
  }]);
  const [enderecosAdicionais, setEnderecosAdicionais] = useState<Array<{
    cpf_id: number;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  }>>([{
    cpf_id: 0,
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  }]);
  
  // Estados para documentos RG e CNH
  const [rgDocumentos, setRgDocumentos] = useState<CreateBaseRg[]>([{
    cpf_id: 0,
    mai: '',
    rg: '',
    dni: '',
    dt_expedicao: '',
    nome: '',
    filiacao: '',
    naturalidade: '',
    dt_nascimento: '',
    registro_civil: '',
    titulo_eleitor: '',
    titulo_zona: '',
    titulo_secao: '',
    ctps: '',
    ctps_serie: '',
    ctps_uf: '',
    nis: '',
    pis: '',
    pasep: '',
    rg_profissional: '',
    cert_militar: '',
    cnh: '',
    cns: '',
    rg_anterior: '',
    via_p: '',
    via: '',
    diretor: 'Lúcio Flávio',
    orgao_expedidor: '',
    uf_emissao: '',
    fator_rh: '',
    qrcode: '',
    numeracao_folha: '',
    observacao: ''
  }]);
  const [cnhDocumentos, setCnhDocumentos] = useState<CreateBaseCnh[]>([{
    cpf_id: 0,
    n_espelho: '',
    nome: '',
    foto_cnh: '',
    doc_identidade: '',
    orgao_expedidor: '',
    uf_emissao: '',
    data_nascimento: '',
    pai: '',
    mae: '',
    permissao: '',
    acc: '',
    cat_hab: '',
    n_registro: '',
    validade: '',
    primeira_habilitacao: '',
    observacoes: '',
    assinatura: '',
    local: '',
    data_emissao: '',
    diretor: '',
    n_seg1: '',
    n_renach: '',
    qrcode: ''
  }]);
  
  // Estado para dados Credilink
  const [creditinkData, setCreditinkData] = useState<Partial<CreateBaseCredilink>>({});
  
  // Estado para dados de Vacinas
  const [vacinasData, setVacinasData] = useState<Partial<CreateBaseVacina>[]>([]);
  
  // Estado para dados de CNPJ MEI
  const [cnpjMeiData, setCnpjMeiData] = useState<Partial<CreateBaseCnpjMei>>({});
  
  // Estado para dados de Dívidas Ativas
  const [dividasAtivasData, setDividasAtivasData] = useState<Partial<CreateBaseDividasAtivas>[]>([]);
  
  // Estado para dados de Auxílio Emergencial
  const [auxilioEmergencialData, setAuxilioEmergencialData] = useState<Partial<CreateBaseAuxilioEmergencial>[]>([]);
  
  // Estado para dados de INSS
  const [inssData, setInssData] = useState<Partial<CreateBaseInss>>({});
  
  // Estado para dados de Histórico de Veículos
  const [historicoVeiculoData, setHistoricoVeiculoData] = useState<Partial<CreateBaseHistoricoVeiculo>[]>([]);
  
  // Estados para as novas seções
  const [parentesData, setParentesData] = useState<Partial<CreateBaseParente>[]>([]);
  const [boletinsData, setBoletinsData] = useState<Partial<CreateBaseBoletimOcorrencia>[]>([]);
  const [empresasSocioData, setEmpresasSocioData] = useState<Partial<CreateBaseEmpresasSocio>[]>([{
    cpf_id: 0,
    empresa_cnpj: '',
    socio_nome: '',
    socio_cpf: '',
    socio_qualificacao: '',
    socio_data_entrada: ''
  }]);
  const [vivoData, setVivoData] = useState<Partial<CreateBaseVivo>[]>([{
    cpf_id: 0,
    cpf: '',
    telefone: '',
    nome_assinante: '',
    plano: '',
    numero: '',
    uf: '',
    tipo_pessoa: ''
  }]);
  const [claroData, setClaroData] = useState<Partial<CreateBaseClaro>[]>([{
    cpf_id: 0,
    nome: '',
    pessoa: '',
    ddd: '',
    fone: '',
    inst: ''
  }]);
  const [timData, setTimData] = useState<Partial<CreateBaseTim>[]>([{
    cpf_id: 0,
    nome: '',
    tipoLogradouro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    ddd: '',
    tel: '',
    operadora: 'TIM'
  }]);
  const [senhaEmailData, setSenhaEmailData] = useState<Partial<CreateBaseSenhaEmail>[]>([{
    cpf_id: 0
  }]);
  const [senhaCpfData, setSenhaCpfData] = useState<Partial<CreateBaseSenhaCpf>[]>([{
    cpf_id: 0
  }]);

  const handleInputChange = (field: string, value: string | number) => {
    try {
      console.log('🔧 [INPUT_CHANGE] Field:', field, 'Value:', value);
      
      // Debug log para fonte_dados
      if (field === 'fonte_dados') {
        console.log('🔧 [FONTE_DADOS] Alterando valor:', { field, value, currentValue: dadosBasicos.fonte_dados });
      }
      
      // Lista de campos que devem ser convertidos para maiúsculo
      const uppercaseFields = [
        'nome', 'mae', 'pai', 'naturalidade', 'logradouro', 
        'bairro', 'cidade', 'complemento', 'cor', 'estado_civil',
        'escolaridade', 'tipo_emprego', 'cbo', 'poder_aquisitivo',
        'renda', 'fx_poder_aquisitivo', 'csb8_faixa', 'csba_faixa',
        'orgao_emissor', 'sexo'
      ];
      
      // Converter para maiúsculo se for um campo de texto que deve ser em maiúsculo
      // Exceto o campo fonte_dados que deve permanecer como está
      const finalValue = (typeof value === 'string' && uppercaseFields.includes(field)) 
        ? value.toUpperCase() 
        : value;
      
      console.log('🔧 [INPUT_CHANGE] Final value:', finalValue);
      
      setDadosBasicos(prev => ({ ...prev, [field]: finalValue }));
      
      console.log('✅ [INPUT_CHANGE] State updated successfully');
    } catch (error) {
      console.error('❌ [INPUT_CHANGE] Erro ao atualizar campo:', field, error);
      toast.error(`Erro ao atualizar campo ${field}`);
    }
  };

  const handleReceitaChange = (field: string, value: string) => {
    console.log('🔍 [RECEITA_CHANGE] Campo alterado:', field, 'Novo valor:', value);
    setReceitaData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('🔍 [RECEITA_CHANGE] Estado atualizado:', newData);
      return newData;
    });
  };

  // Função removida pois campos de endereço foram removidos da tabela

  // Função para fazer upload das fotos para o servidor externo
  const uploadPhotosToServer = async (cpf: string, photos: { photo?: string; photo2?: string; photo3?: string; photo4?: string }, cpfId: number) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const uploadedPhotos: string[] = [];
    
    // Converter base64 para File
    const base64ToFile = (base64: string, filename: string): File | null => {
      try {
        // Remover o prefixo data:image/...;base64, se existir
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
        const byteString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        return new File([blob], filename, { type: 'image/jpeg' });
      } catch (error) {
        console.error('❌ [FOTO_UPLOAD] Erro ao converter base64:', error);
        return null;
      }
    };
    
    // Array de fotos para fazer upload
    const photosToUpload: Array<{ key: string; data: string; filename: string }> = [];
    
    if (photos.photo) {
      photosToUpload.push({ key: 'photo', data: photos.photo, filename: `${cpfLimpo}.jpg` });
    }
    if (photos.photo2) {
      photosToUpload.push({ key: 'photo2', data: photos.photo2, filename: `${cpfLimpo}_2.jpg` });
    }
    if (photos.photo3) {
      photosToUpload.push({ key: 'photo3', data: photos.photo3, filename: `${cpfLimpo}_3.jpg` });
    }
    if (photos.photo4) {
      photosToUpload.push({ key: 'photo4', data: photos.photo4, filename: `${cpfLimpo}_4.jpg` });
    }
    
    // Fazer upload de cada foto
    for (const photoData of photosToUpload) {
      try {
        const file = base64ToFile(photoData.data, photoData.filename);
        if (!file) continue;
        
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('cpf', cpfLimpo);
        
        // Determinar o tipo de foto baseado no key
        if (photoData.key === 'photo2') {
          formData.append('type', 'foto2');
        } else if (photoData.key === 'photo3') {
          formData.append('type', 'foto3');
        } else if (photoData.key === 'photo4') {
          formData.append('type', 'foto4');
        }
        
        console.log(`📤 [FOTO_UPLOAD] Enviando ${photoData.key} para servidor...`);
        
        const response = await fetch('https://api.apipainel.com.br/upload-photo.php', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ [FOTO_UPLOAD] ${photoData.key} enviada com sucesso:`, result);
          uploadedPhotos.push(photoData.key);

          // Usar o nome de arquivo retornado pela API (sempre .jpg)
          const serverFileName = result?.data?.filename || photoData.filename;
          
          // Salvar o nome do arquivo no banco de dados
          try {
            const { baseFotoService } = await import('@/services/baseFotoService');
            const fotoResponse = await baseFotoService.create({
              cpf_id: cpfId,
              nome: dadosBasicos.nome || '',
              photo: serverFileName
            });
            
            if (fotoResponse.success) {
              console.log(`✅ [FOTO_DB] Nome do arquivo ${serverFileName} salvo no banco de dados`);
            } else {
              console.error(`❌ [FOTO_DB] Erro ao salvar no banco:`, fotoResponse.error);
            }
          } catch (dbError) {
            console.error(`❌ [FOTO_DB] Exceção ao salvar no banco:`, dbError);
          }
        } else {
          console.error(`❌ [FOTO_UPLOAD] Erro ao enviar ${photoData.key}:`, response.statusText);
        }
      } catch (error) {
        console.error(`❌ [FOTO_UPLOAD] Exceção ao enviar ${photoData.key}:`, error);
      }
    }
    
    return uploadedPhotos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica melhorada
    const cpfLimpo = (dadosBasicos.cpf || '').replace(/\D/g, '');
    const nomeValido = (dadosBasicos.nome || '').trim();
    
    if (!cpfLimpo || cpfLimpo.length !== 11) {
      toast.error('CPF deve ter 11 dígitos válidos');
      return;
    }
    
    if (!nomeValido || nomeValido.length < 2) {
      toast.error('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    // Validar CPF com algoritmo
    const isValidCpf = (cpf: string) => {
      if (cpf.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(cpf)) return false; // CPFs com todos os dígitos iguais
      
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let checkDigit = 11 - (sum % 11);
      if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
      if (checkDigit !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      checkDigit = 11 - (sum % 11);
      if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
      if (checkDigit !== parseInt(cpf.charAt(10))) return false;
      
      return true;
    };
    
    if (!isValidCpf(cpfLimpo)) {
      toast.error('CPF inválido. Verifique os dígitos informados');
      return;
    }

    setLoading(true);

    try {

      // Converter datas do formato DD/MM/AAAA para ISO
      const convertDateToISO = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 10) return '';
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return '';
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      // Preparar dados para envio
      const cleanedCpf = (dadosBasicos.cpf || '').replace(/\D/g, '');

      // Limpar dados removendo valores vazios e undefined
      const cleanData = (obj: any) => {
        const clean: any = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string') {
              const trimmed = value.trim();
              if (trimmed !== '') clean[key] = trimmed;
            } else {
              clean[key] = value;
            }
          }
        });
        return clean;
      };

      const rawPayload = {
        ...dadosBasicos,
        cpf: cleanedCpf,
        nome: (dadosBasicos.nome || '').trim(),
        // Converter datas para formato ISO apenas se válidas
        ...(dadosBasicos.data_nascimento && { data_nascimento: convertDateToISO(dadosBasicos.data_nascimento) }),
        ...(dadosBasicos.data_obito && { data_obito: convertDateToISO(dadosBasicos.data_obito) }),
        // Garantir que campos numéricos sejam números válidos
        qualidade_dados: Number(dadosBasicos.qualidade_dados) || 50,
        ...(dadosBasicos.csb8 && !isNaN(Number(dadosBasicos.csb8)) && { csb8: Number(dadosBasicos.csb8) }),
        ...(dadosBasicos.csba && !isNaN(Number(dadosBasicos.csba)) && { csba: Number(dadosBasicos.csba) }),
        // Definir data de última atualização
        ultima_atualizacao: new Date().toISOString(),
        // Incluir score
        score: score
      } as Record<string, any>;

      // Aplicar limpeza de dados para remover campos vazios/undefined
      const payload = cleanData(rawPayload);
      
      // Garantir que campos obrigatórios estejam presentes após limpeza
      if (!payload.cpf || !payload.nome) {
        toast.error('Erro: CPF e nome são obrigatórios');
        setLoading(false);
        return;
      }

      // Incluir telefones adicionais no payload se houver (filtrar telefones vazios)
      const telefonesValidos = telefonesAdicionais.filter(tel => tel.telefone && tel.telefone.trim().length > 0);
      if (telefonesValidos.length > 0) {
        payload.telefones = telefonesValidos;
        console.log('📤 [TELEFONES_ADICIONAIS] Incluindo telefones:', telefonesValidos);
      }

      // Incluir emails adicionais no payload se houver (filtrar emails vazios)
      const emailsValidos = emailsAdicionais.filter(email => email.email && email.email.trim().length > 0);
      if (emailsValidos.length > 0) {
        payload.emails = emailsValidos;
        console.log('📤 [EMAILS_ADICIONAIS] Incluindo emails:', emailsValidos);
      }

      // Incluir endereços adicionais no payload se houver (filtrar endereços vazios)
      const enderecosValidos = enderecosAdicionais.filter(endereco => 
        endereco.cep && endereco.cep.trim().length > 0 && 
        endereco.logradouro && endereco.logradouro.trim().length > 0
      );
      if (enderecosValidos.length > 0) {
        payload.enderecos = enderecosValidos;
        console.log('📤 [ENDERECOS_ADICIONAIS] Incluindo endereços:', enderecosValidos);
      }

       // Incluir documentos RG se houver
       console.log('🔍 [RG_DOCUMENTOS] Documentos RG antes da validação:', rgDocumentos);
       const ensuredRgDocs = rgDocumentos.map(doc => ({
         ...doc,
         rg: (doc.rg && doc.rg.trim()) || '',
       }));

       const rgDocumentosValidos = ensuredRgDocs.filter(doc => {
         // Considerar válido se tiver ao menos um campo preenchido além de cpf_id
         const hasAnyField = Object.entries(doc).some(([key, val]) => {
           if (key === 'cpf_id') return false;
           if (val === null || val === undefined) return false;
           if (typeof val === 'string') return val.trim().length > 0;
           return true;
         });
         const isValid = hasAnyField && !!doc.rg;
         console.log('🔍 [RG_DOCUMENTOS] Validando documento:', doc, 'Válido:', isValid);
         return isValid;
       });
       
       if (rgDocumentosValidos.length > 0) {
         // Adicionar cpf_id será feito no backend após criação do CPF principal
         payload.rg_documentos = rgDocumentosValidos.map(doc => ({ ...doc, cpf_id: 0 }));
         console.log('📤 [RG_DOCUMENTOS] Incluindo documentos RG válidos:', rgDocumentosValidos);
         console.log('📤 [RG_DOCUMENTOS] Campos MAI nos documentos:', rgDocumentosValidos.map(doc => ({ rg: doc.rg, mai: doc.mai })));
       } else {
         console.log('⚠️ [RG_DOCUMENTOS] Nenhum documento RG válido encontrado');
       }

      // Incluir documentos CNH se houver (filtrar documentos vazios)
      const cnhDocumentosValidos = cnhDocumentos.filter(doc => {
        // Verificar se pelo menos um campo foi preenchido (qualquer campo pode ser obrigatório)
        const hasAnyField = Object.entries(doc).some(([key, value]) => {
          // Ignorar cpf_id pois será preenchido no backend
          if (key === 'cpf_id') return false;
          // Verificar se o valor é válido (não vazio)
          return value && String(value).trim().length > 0;
        });
        return hasAnyField;
      });
      if (cnhDocumentosValidos.length > 0) {
        // Adicionar cpf_id será feito no backend após criação do CPF principal
        payload.cnh_documentos = cnhDocumentosValidos.map(doc => ({ ...doc, cpf_id: 0 }));
        console.log('📤 [CNH_DOCUMENTOS] Incluindo documentos CNH:', cnhDocumentosValidos);
      }

      console.log('📤 [CADASTRAR_CPF] Enviando dados:', payload);
      console.log('📤 [CADASTRAR_CPF] Quantidade de campos:', Object.keys(payload).length);
      console.log('📤 [CADASTRAR_CPF] Campos principais:', {
        cpf: payload.cpf,
        nome: payload.nome,
        data_nascimento: payload.data_nascimento,
        qualidade_dados: payload.qualidade_dados
      });

      const response = await baseCpfService.create(payload as Omit<BaseCpf, 'id' | 'created_at' | 'updated_at'>);

      if (response.success) {
        console.log('✅ [CADASTRAR_CPF] CPF cadastrado com sucesso, ID:', response.data?.id);
        
        // Upload das fotos para o servidor externo
        if (dadosBasicos.photo || dadosBasicos.photo2 || dadosBasicos.photo3 || dadosBasicos.photo4) {
          console.log('📤 [FOTOS] Iniciando upload das fotos para o servidor externo...');
          const uploadedPhotos = await uploadPhotosToServer(cleanedCpf, {
            photo: dadosBasicos.photo,
            photo2: dadosBasicos.photo2,
            photo3: dadosBasicos.photo3,
            photo4: dadosBasicos.photo4
          }, response.data.id);
          
          if (uploadedPhotos.length > 0) {
            console.log(`✅ [FOTOS] ${uploadedPhotos.length} foto(s) enviada(s) para o servidor externo`);
          }
        }
        
        // SEMPRE tentar salvar dados da Receita Federal se houver qualquer campo preenchido
        console.log('🔍 [RECEITA_CHECK] Estado atual receitaData:', receitaData);
        
        // Verificar se pelo menos um campo foi preenchido (diferentes de undefined, null, ou string vazia)
        const fieldsWithData = Object.entries(receitaData).filter(([key, value]) => {
          const hasValue = value !== undefined && value !== null && value !== '';
          console.log('🔍 [RECEITA_CHECK] Campo:', key, 'Valor:', `"${value}"`, 'Tem dados:', hasValue);
          return hasValue;
        });
        
        console.log('🔍 [RECEITA_CHECK] Campos com dados:', fieldsWithData.map(([k, v]) => `${k}: "${v}"`));
        const hasReceitaData = fieldsWithData.length > 0;
        console.log('🔍 [RECEITA_CHECK] Tem dados para salvar:', hasReceitaData);
        
        if (hasReceitaData && response.data?.id) {
          try {
            // Preparar dados da Receita Federal - ENVIAR TODOS os campos preenchidos
            console.log('📤 [RECEITA_FEDERAL] Preparando dados para envio...');
            
            // Normalizar datetime se necessário
            const normalizeDateTime = (dt?: string) => {
              if (!dt) return '';
              const withSpace = dt.replace('T', ' ');
              return withSpace.length === 16 ? `${withSpace}:00` : withSpace;
            };

            // Preparar payload - incluir TODOS os campos, mesmo vazios
            const receitaPayload = {
              cpf: cleanedCpf, // CPF sempre presente para o backend encontrar o ID
              situacao_cadastral: receitaData.situacao_cadastral || '',
              data_inscricao: receitaData.data_inscricao || '',
              digito_verificador: receitaData.digito_verificador || '',
              data_emissao: receitaData.data_emissao ? normalizeDateTime(receitaData.data_emissao) : '',
              codigo_controle: receitaData.codigo_controle || '',
              qr_link: receitaData.qr_link || ''
            };

            console.log('📤 [RECEITA_PAYLOAD] Dados completos para envio:', receitaPayload);
            
            const receitaResponse = await baseReceitaService.create(receitaPayload);

            if (receitaResponse.success) {
              console.log('✅ [RECEITA_FEDERAL] Dados da Receita Federal cadastrados');
              toast.success('CPF e dados da Receita Federal cadastrados com sucesso!');
            } else {
              console.warn('⚠️ [RECEITA_FEDERAL] Aviso nos dados da Receita:', receitaResponse.error);
              toast.success('CPF cadastrado com sucesso! (Dados da Receita Federal são opcionais)');
            }
          } catch (receitaError) {
            console.error('❌ [RECEITA_FEDERAL] Exceção ao cadastrar Receita:', receitaError);
            toast.success('CPF cadastrado com sucesso! (Dados da Receita Federal são opcionais)');
          }
        } else {
          toast.success('CPF cadastrado com sucesso!');
        }
        
        // Salvar dados Credilink se houver algum campo preenchido
        const hasCredilinkData = Object.values(creditinkData).some(value => {
          if (typeof value === 'string') {
            return value.trim().length > 0;
          }
          if (typeof value === 'number') {
            return value !== 0;
          }
          return value !== null && value !== undefined;
        });
        
        console.log('🔍 [CREDILINK] Verificando dados:', creditinkData);
        console.log('🔍 [CREDILINK] Tem dados?', hasCredilinkData);
        
        if (hasCredilinkData && response.data?.id) {
          try {
            console.log('🔄 [CREDILINK] Tentando salvar dados Credilink...');
            
            const { baseCreditinkService } = await import('@/services/baseCreditinkService');
            
            const creditinkPayload = {
              cpf_id: response.data.id,
              nome: creditinkData.nome || '',
              nome_mae: creditinkData.nome_mae || '',
              email: creditinkData.email || '',
              data_obito: creditinkData.data_obito || '',
              status_receita_federal: creditinkData.status_receita_federal || '',
              percentual_participacao: creditinkData.percentual_participacao || '',
              cbo: creditinkData.cbo || '',
              renda_presumida: creditinkData.renda_presumida || 0,
              telefones: creditinkData.telefones || '',
              uf: creditinkData.uf || '',
              estado: creditinkData.estado || '',
              cidade: creditinkData.cidade || '',
              tipo_endereco: creditinkData.tipo_endereco || '',
              logradouro: creditinkData.logradouro || '',
              complemento: creditinkData.complemento || '',
              bairro: creditinkData.bairro || '',
              numero: creditinkData.numero || '',
              cep: creditinkData.cep || ''
            };

            console.log('📤 [CREDILINK_PAYLOAD] Dados para envio:', creditinkPayload);
            
            const creditinkResponse = await baseCreditinkService.create(creditinkPayload);

            if (creditinkResponse.success) {
              console.log('✅ [CREDILINK] Dados Credilink cadastrados');
              toast.success('Dados Credilink cadastrados com sucesso!');
            } else {
              console.warn('⚠️ [CREDILINK] Aviso nos dados Credilink:', creditinkResponse.error);
              toast.error(`Erro ao cadastrar Credilink: ${creditinkResponse.error}`);
            }
          } catch (creditinkError) {
            console.error('❌ [CREDILINK] Exceção ao cadastrar Credilink:', creditinkError);
            toast.error('Erro ao cadastrar dados Credilink');
          }
        }
        
  // Salvar dados de Vacinas - verificar se há dados válidos primeiro
  const vacinasValidas = vacinasData.filter(vacina => {
    // Verificar se pelo menos um campo foi preenchido (qualquer campo pode ser suficiente)
    return Object.values(vacina).some(value => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (typeof value === 'number') {
        return value !== 0;
      }
      return value !== null && value !== undefined;
    });
  });
  
  if (vacinasValidas.length > 0 && response.data?.id) {
    try {
      console.log('🔄 [VACINAS] Tentando salvar dados de vacinas...');
      console.log('📤 [VACINAS] Vacinas válidas:', vacinasValidas);
      
      const { baseVacinaService } = await import('@/services/baseVacinaService');
      
      for (const vacina of vacinasValidas) {
        const vacinaPayload = {
          ...vacina,
          cpf_id: response.data.id
        };
        console.log('📤 [VACINA_PAYLOAD] Enviando vacina:', vacinaPayload);
        await baseVacinaService.create(vacinaPayload);
      }
      
      console.log('✅ [VACINAS] Dados de vacinas cadastrados');
      toast.success('Dados de vacinas cadastrados com sucesso!');
    } catch (vacinaError) {
      console.error('❌ [VACINAS] Exceção ao cadastrar vacinas:', vacinaError);
    }
  }
        
        // Salvar dados de CNPJ MEI se houver QUALQUER campo preenchido
        console.log('🔍 [CNPJ_MEI] INICIANDO verificação dos dados CNPJ MEI...');
        console.log('🔍 [CNPJ_MEI] Estado atual dos dados:', cnpjMeiData);
        console.log('🔍 [CNPJ_MEI] CPF ID disponível:', response.data?.id);
        
        const hasCnpjMeiData = Object.entries(cnpjMeiData).some(([key, value]) => {
          // Verificar se há pelo menos um campo com valor válido
          console.log(`🔍 [CNPJ_MEI] Verificando campo ${key}:`, `"${value}"`, typeof value);
          
          if (!value || value === null || value === undefined) {
            console.log(`🔍 [CNPJ_MEI] Campo ${key} está vazio/nulo`);
            return false;
          }
          
          if (typeof value === 'string') {
            const hasValue = value.trim().length > 0;
            console.log(`🔍 [CNPJ_MEI] Campo ${key} (string) tem valor:`, hasValue);
            return hasValue;
          }
          
          if (typeof value === 'number') {
            const hasValue = value > 0;
            console.log(`🔍 [CNPJ_MEI] Campo ${key} (number) tem valor:`, hasValue);
            return hasValue;
          }
          
          console.log(`🔍 [CNPJ_MEI] Campo ${key} tem valor (tipo ${typeof value}):`, true);
          return true;
        });
        
        console.log('🔍 [CNPJ_MEI] RESULTADO da verificação:', hasCnpjMeiData);
        console.log('🔍 [CNPJ_MEI] Condições para salvar:', {
          temDados: hasCnpjMeiData,
          temCpfId: !!response.data?.id,
          podeProcessar: hasCnpjMeiData && !!response.data?.id
        });
        
        if (hasCnpjMeiData && response.data?.id) {
          try {
            console.log('🔄 [CNPJ_MEI] ✅ INICIANDO processo de salvamento de CNPJ MEI...');
            
            // Importar serviço diretamente (sem dynamic import)
            console.log('📦 [CNPJ_MEI] Carregando serviço...');
            const { baseCnpjMeiService } = await import('@/services/baseCnpjMeiService');
            console.log('📦 [CNPJ_MEI] Serviço carregado com sucesso');
            
            // Preparar payload com TODOS os campos, mesmo que alguns sejam vazios
            const cnpjMeiPayload = {
              cpf_id: response.data.id,
              cnpj: cnpjMeiData.cnpj || '',
              razao_social: cnpjMeiData.razao_social || '',
              natureza_juridica: cnpjMeiData.natureza_juridica || '',
              qualificacao: cnpjMeiData.qualificacao || '',
              capital_social: cnpjMeiData.capital_social || 0,
              porte_empresa: cnpjMeiData.porte_empresa || '',
              ente_federativo: cnpjMeiData.ente_federativo || ''
            };

            console.log('📤 [CNPJ_MEI_PAYLOAD] Dados finais para envio:', cnpjMeiPayload);
            console.log('📤 [CNPJ_MEI_PAYLOAD] Campos não vazios:', Object.entries(cnpjMeiPayload).filter(([k,v]) => v !== '' && v !== 0));
            
            console.log('🌐 [CNPJ_MEI] Enviando para API externa...');
            const cnpjMeiResponse = await baseCnpjMeiService.create(cnpjMeiPayload);
            console.log('🌐 [CNPJ_MEI] Resposta da API:', cnpjMeiResponse);

            if (cnpjMeiResponse.success) {
              console.log('✅ [CNPJ_MEI] SUCESSO! Dados de CNPJ MEI cadastrados');
              // Sucesso será reportado na mensagem consolidada final
            } else {
              console.warn('⚠️ [CNPJ_MEI] AVISO da API:', cnpjMeiResponse.error);
              // Avisos individuais removidos - serão consolidados no final
            }
          } catch (cnpjMeiError) {
            console.error('❌ [CNPJ_MEI] ERRO CRÍTICO ao cadastrar CNPJ MEI:', cnpjMeiError);
            // Erros críticos continuam sendo reportados individualmente
            const errorMsg = cnpjMeiError instanceof Error ? cnpjMeiError.message : 'Erro desconhecido';
            if (!errorMsg.includes('Failed to fetch') && !errorMsg.includes('Endpoint não encontrado')) {
              toast.error(`Erro ao salvar dados de CNPJ MEI: ${errorMsg}`);
            }
          }
        } else {
          console.log('⏭️ [CNPJ_MEI] Pulando salvamento - não há dados ou CPF ID inválido');
        }
        
        // Salvar dados de Dívidas Ativas - aceitar QUALQUER campo preenchido
        console.log('🔍 [DIVIDAS_ATIVAS] INICIANDO verificação dos dados de dívidas ativas...');
        console.log('🔍 [DIVIDAS_ATIVAS] Estado atual dos dados:', dividasAtivasData);
        console.log('🔍 [DIVIDAS_ATIVAS] Quantidade de dívidas:', dividasAtivasData.length);
        console.log('🔍 [DIVIDAS_ATIVAS] CPF limpo disponível:', cleanedCpf);
        
        const hasDividasData = dividasAtivasData.some((divida, index) => {
          console.log(`🔍 [DIVIDAS_ATIVAS] Verificando dívida ${index + 1}:`, divida);
          
          const temDados = Object.entries(divida).some(([key, value]) => {
            console.log(`🔍 [DIVIDAS_ATIVAS] Campo ${key}:`, `"${value}"`, typeof value);
            
            if (!value || value === null || value === undefined) {
              console.log(`🔍 [DIVIDAS_ATIVAS] Campo ${key} está vazio/nulo`);
              return false;
            }
            
            if (typeof value === 'string') {
              const hasValue = value.trim().length > 0;
              console.log(`🔍 [DIVIDAS_ATIVAS] Campo ${key} (string) tem valor:`, hasValue);
              return hasValue;
            }
            
            if (typeof value === 'number') {
              const hasValue = value > 0;
              console.log(`🔍 [DIVIDAS_ATIVAS] Campo ${key} (number) tem valor:`, hasValue);
              return hasValue;
            }
            
            console.log(`🔍 [DIVIDAS_ATIVAS] Campo ${key} tem valor (tipo ${typeof value}):`, true);
            return true;
          });
          
          console.log(`🔍 [DIVIDAS_ATIVAS] Dívida ${index + 1} tem dados:`, temDados);
          return temDados;
        });
        
        console.log('🔍 [DIVIDAS_ATIVAS] RESULTADO da verificação:', hasDividasData);
        console.log('🔍 [DIVIDAS_ATIVAS] Condições para salvar:', {
          temDados: hasDividasData,
          temCpfId: !!response.data?.id,
          temCpfLimpo: !!cleanedCpf,
          podeProcessar: hasDividasData && !!response.data?.id
        });
        
        if (hasDividasData && response.data?.id) {
          try {
            console.log('🔄 [DIVIDAS_ATIVAS] ✅ INICIANDO processo de salvamento de dívidas ativas...');
            
            // Importar serviço diretamente (sem dynamic import)
            console.log('📦 [DIVIDAS_ATIVAS] Carregando serviço...');
            const { baseDividasAtivasService } = await import('@/services/baseDividasAtivasService');
            console.log('📦 [DIVIDAS_ATIVAS] Serviço carregado com sucesso');
            
            let dividasProcessadas = 0;
            let dividasComSucesso = 0;
            
            // Processar cada dívida, permitindo campos vazios
            for (const [index, divida] of dividasAtivasData.entries()) {
              console.log(`🔄 [DIVIDAS_ATIVAS] Processando dívida ${index + 1}/${dividasAtivasData.length}`);
              
              // Verificar se há pelo menos um campo preenchido nesta dívida
              const temDados = Object.entries(divida).some(([key, value]) => {
                if (!value || value === null || value === undefined) return false;
                if (typeof value === 'string') return value.trim().length > 0;
                if (typeof value === 'number') return value > 0;
                return true;
              });
              
              console.log(`🔍 [DIVIDAS_ATIVAS] Dívida ${index + 1} tem dados válidos:`, temDados);
              
              if (temDados) {
                const dividasPayload = {
                  cpf_id: cleanedCpf,
                  tipo_devedor: divida.tipo_devedor || '',
                  nome_devedor: divida.nome_devedor || '',
                  uf_devedor: divida.uf_devedor || '',
                  numero_inscricao: divida.numero_inscricao || '',
                  tipo_situacao_inscricao: divida.tipo_situacao_inscricao || '',
                  situacao_inscricao: divida.situacao_inscricao || '',
                  receita_principal: divida.receita_principal || '',
                  data_inscricao: divida.data_inscricao || '',
                  indicador_ajuizado: divida.indicador_ajuizado || '',
                  valor_consolidado: typeof divida.valor_consolidado === 'number' ? divida.valor_consolidado : (divida.valor_consolidado ? parseFloat(String(divida.valor_consolidado)) || 0 : 0)
                };
                
                console.log(`📤 [DIVIDA_PAYLOAD] Dados finais da dívida ${index + 1}:`, dividasPayload);
                console.log(`📤 [DIVIDA_PAYLOAD] Campos não vazios da dívida ${index + 1}:`, Object.entries(dividasPayload).filter(([k,v]) => v !== '' && v !== 0));
                
                dividasProcessadas++;
                console.log(`🌐 [DIVIDAS_ATIVAS] Enviando dívida ${index + 1} para API externa...`);
                
                const dividaResponse = await baseDividasAtivasService.create(dividasPayload);
                console.log(`🌐 [DIVIDAS_ATIVAS] Resposta da API para dívida ${index + 1}:`, dividaResponse);
                
                if (dividaResponse.success) {
                  dividasComSucesso++;
                  console.log(`✅ [DIVIDAS_ATIVAS] Dívida ${index + 1} salva com sucesso!`);
                } else {
                  console.warn(`⚠️ [DIVIDAS_ATIVAS] AVISO ao salvar dívida ${index + 1}:`, dividaResponse.error);
                }
              } else {
                console.log(`⏭️ [DIVIDAS_ATIVAS] Pulando dívida ${index + 1} - sem dados válidos`);
              }
            }
            
            console.log(`✅ [DIVIDAS_ATIVAS] CONCLUÍDO! Processadas: ${dividasProcessadas}, Sucessos: ${dividasComSucesso}`);
            
            if (dividasComSucesso > 0) {
              toast.success(`${dividasComSucesso} dívida(s) ativa(s) processada(s) com sucesso!`);
            }
            
            if (dividasProcessadas > dividasComSucesso) {
              toast.warning(`${dividasProcessadas - dividasComSucesso} dívida(s) com aviso - verifique os logs`);
            }
            
          } catch (dividasError) {
            console.error('❌ [DIVIDAS_ATIVAS] ERRO CRÍTICO ao cadastrar dívidas ativas:', dividasError);
            console.error('❌ [DIVIDAS_ATIVAS] Stack trace:', dividasError.stack);
            toast.error(`Erro ao salvar dados de dívidas ativas: ${dividasError.message}`);
          }
        } else {
          console.log('⏭️ [DIVIDAS_ATIVAS] Pulando salvamento - não há dados ou CPF ID inválido');
        }
        
        // Salvar dados de Auxílio Emergencial - aceitar QUALQUER campo preenchido
        const hasAuxilioData = auxilioEmergencialData.some(auxilio => {
          return Object.entries(auxilio).some(([key, value]) => {
            if (!value || value === null || value === undefined) return false;
            
            if (typeof value === 'string') {
              return value.trim().length > 0;
            }
            
            if (typeof value === 'number') {
              return value > 0;
            }
            
            return true;
          });
        });
        
        if (hasAuxilioData && response.data?.id) {
          try {
            console.log('🔄 [AUXILIO_EMERGENCIAL] Tentando salvar dados de auxílio emergencial...');
            console.log('📤 [AUXILIO_EMERGENCIAL] Dados originais:', auxilioEmergencialData);
            
            const { baseAuxilioEmergencialService } = await import('@/services/baseAuxilioEmergencialService');
            
            // Processar cada auxílio, permitindo campos vazios
            for (const auxilio of auxilioEmergencialData) {
              // Verificar se há pelo menos um campo preenchido neste auxílio
              const temDados = Object.entries(auxilio).some(([key, value]) => {
                if (!value || value === null || value === undefined) return false;
                if (typeof value === 'string') return value.trim().length > 0;
                if (typeof value === 'number') return value > 0;
                return true;
              });
              
              if (temDados) {
                const auxilioPayload = {
                  cpf_id: response.data!.id,
                  uf: auxilio.uf || '',
                  mes_disponibilizacao: auxilio.mes_disponibilizacao || '',
                  enquadramento: auxilio.enquadramento || '',
                  parcela: auxilio.parcela || '',
                  observacao: auxilio.observacao || '',
                  valor_beneficio: typeof auxilio.valor_beneficio === 'number' ? auxilio.valor_beneficio : (auxilio.valor_beneficio ? parseFloat(String(auxilio.valor_beneficio)) || 0 : 0)
                };
                
                console.log('📤 [AUXILIO_PAYLOAD] Enviando auxílio (permite campos vazios):', auxilioPayload);
                const auxilioResponse = await baseAuxilioEmergencialService.create(auxilioPayload);
                
                if (!auxilioResponse.success) {
                  console.warn('⚠️ [AUXILIO_EMERGENCIAL] Aviso ao salvar auxílio:', auxilioResponse.error);
                }
              }
            }
            
            console.log('✅ [AUXILIO_EMERGENCIAL] Processamento de auxílio emergencial concluído');
            toast.success('Dados de auxílio emergencial processados!');
          } catch (auxilioError) {
            console.error('❌ [AUXILIO_EMERGENCIAL] Exceção ao cadastrar auxílio emergencial:', auxilioError);
            console.warn('⚠️ [AUXILIO_EMERGENCIAL] Erro no processamento');
          }
        }
        
        // Salvar dados de INSS - aceitar QUALQUER campo preenchido  
        const hasInssData = Object.entries(inssData).some(([key, value]) => {
          if (!value || value === null || value === undefined) return false;
          
          if (typeof value === 'string') {
            return value.trim().length > 0;
          }
          
          if (typeof value === 'number') {
            return value > 0;
          }
          
          return true;
        });
        
        if (hasInssData && response.data?.id) {
          try {
            console.log('🔄 [INSS] Tentando salvar dados de INSS...');
            console.log('📤 [INSS] Dados originais:', inssData);
            
            const { baseInssService } = await import('@/services/baseInssService');
            
            const inssPayload = {
              cpf_id: response.data.id,
              cpf: cleanedCpf,
              nb: inssData.nb || '',
              entidade: inssData.entidade || '',
              especie: inssData.especie || '',
              especie_descricao: inssData.especie_descricao || '',
              valor: inssData.valor || ''
            };

            console.log('📤 [INSS_PAYLOAD] Dados para envio (permite campos vazios):', inssPayload);
            
            const inssResponse = await baseInssService.create(inssPayload);

            if (inssResponse.success) {
              console.log('✅ [INSS] Dados de INSS cadastrados');
              toast.success('Dados de INSS cadastrados com sucesso!');
            } else {
              console.warn('⚠️ [INSS] Aviso nos dados de INSS:', inssResponse.error);
              const errorMsg = inssResponse.error || 'Erro desconhecido';
              if (errorMsg.includes('Endpoint não encontrado')) {
                toast.warning(`Aviso INSS: Serviço temporariamente indisponível`);
              } else {
                toast.warning(`Aviso INSS: ${errorMsg}`);
              }
            }
          } catch (inssError) {
            console.error('❌ [INSS] Exceção ao cadastrar INSS:', inssError);
            const errorMsg = inssError instanceof Error ? inssError.message : 'Erro desconhecido';
            if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Endpoint não encontrado')) {
              toast.warning('Aviso INSS: Serviço temporariamente indisponível');
            } else {
              toast.error(`Erro ao salvar dados de INSS: ${errorMsg}`);
            }
            console.warn('⚠️ [INSS] Erro no processamento');
          }
        }
        
        // Salvar dados de Histórico de Veículos
        const hasHistoricoVeiculoData = historicoVeiculoData.length > 0 && historicoVeiculoData.some(v => 
          Object.entries(v).some(([key, value]) => {
            if (key === 'cpf_id') return false;
            if (!value || value === null || value === undefined) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            return true;
          })
        );
        
        if (hasHistoricoVeiculoData && response.data?.id) {
          try {
            console.log('🔄 [HISTORICO_VEICULO] Tentando salvar dados de veículos...');
            console.log('📤 [HISTORICO_VEICULO] Dados originais:', historicoVeiculoData);
            
            const { baseHistoricoVeiculoService } = await import('@/services/baseHistoricoVeiculoService');
            
            let veiculosSalvos = 0;
            for (const veiculo of historicoVeiculoData) {
              // Verificar se tem pelo menos um campo preenchido além de cpf_id
              const hasData = Object.entries(veiculo).some(([key, value]) => {
                if (key === 'cpf_id') return false;
                if (!value || value === null || value === undefined) return false;
                if (typeof value === 'string' && value.trim() === '') return false;
                return true;
              });
              
              if (hasData) {
                const veiculoPayload = {
                  cpf_id: response.data.id,
                  placa: veiculo.placa || '',
                  chassi: veiculo.chassi || '',
                  motor: veiculo.motor || '',
                  marca: veiculo.marca || '',
                  uf_placa: veiculo.uf_placa || '',
                  ano_fabricacao: veiculo.ano_fabricacao,
                  combustivel: veiculo.combustivel || '',
                  potencia: veiculo.potencia,
                  capacidade: veiculo.capacidade,
                  nacionalidade: veiculo.nacionalidade || '',
                  caixa_cambio: veiculo.caixa_cambio || '',
                  eixo_traseiro_dif: veiculo.eixo_traseiro_dif || '',
                  terceiro_eixo: veiculo.terceiro_eixo || '',
                  capacidade_max_tracao: veiculo.capacidade_max_tracao,
                  peso_bruto_total: veiculo.peso_bruto_total,
                  cilindradas: veiculo.cilindradas,
                  ano_modelo: veiculo.ano_modelo,
                  tipo_carroceria: veiculo.tipo_carroceria || '',
                  cor_veiculo: veiculo.cor_veiculo || '',
                  quantidade_passageiro: veiculo.quantidade_passageiro,
                  eixos: veiculo.eixos,
                  doc_faturado: veiculo.doc_faturado || '',
                  nome_faturado: veiculo.nome_faturado || '',
                  uf_faturado: veiculo.uf_faturado || '',
                  doc_proprietario: veiculo.doc_proprietario || '',
                  nome_proprietario: veiculo.nome_proprietario || '',
                  situacao_veiculo: veiculo.situacao_veiculo || '',
                  restricao_1: veiculo.restricao_1 || '',
                  restricao_2: veiculo.restricao_2 || '',
                  restricao_3: veiculo.restricao_3 || '',
                  restricao_4: veiculo.restricao_4 || '',
                  endereco: veiculo.endereco || '',
                  numero_casa: veiculo.numero_casa || '',
                  complemento: veiculo.complemento || '',
                  bairro: veiculo.bairro || '',
                  cep: veiculo.cep || '',
                  cidade: veiculo.cidade || '',
                  estado: veiculo.estado || ''
                };

                console.log('📤 [HISTORICO_VEICULO_PAYLOAD] Dados para envio:', veiculoPayload);
                
                const veiculoResponse = await baseHistoricoVeiculoService.create(veiculoPayload);

                if (veiculoResponse.success) {
                  veiculosSalvos++;
                  console.log('✅ [HISTORICO_VEICULO] Veículo cadastrado com sucesso');
                } else {
                  console.warn('⚠️ [HISTORICO_VEICULO] Aviso ao cadastrar veículo:', veiculoResponse.error);
                }
              }
            }
            
            if (veiculosSalvos > 0) {
              toast.success(`${veiculosSalvos} veículo(s) cadastrado(s) com sucesso!`);
            }
          } catch (veiculoError) {
            console.error('❌ [HISTORICO_VEICULO] Exceção ao cadastrar veículos:', veiculoError);
            const errorMsg = veiculoError instanceof Error ? veiculoError.message : 'Erro desconhecido';
            toast.error(`Erro ao salvar dados de veículos: ${errorMsg}`);
          }
        }
        
        // Salvar dados de Empresas Associadas (SÓCIO)
        const empresasSocioValidas = empresasSocioData.filter(empresa => {
          // Verificar se pelo menos um campo foi preenchido
          return Object.entries(empresa).some(([key, value]) => {
            if (key === 'cpf_id') return false;
            if (!value || value === null || value === undefined) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            return true;
          });
        });
        
        if (empresasSocioValidas.length > 0 && response.data?.id) {
          try {
            console.log('🔄 [EMPRESAS_SOCIO] Tentando salvar dados de empresas sócio...');
            console.log('📤 [EMPRESAS_SOCIO] Dados originais:', empresasSocioValidas);
            
            const { baseEmpresaSocioService } = await import('@/services/baseEmpresaSocioService');
            
            let empresasSalvas = 0;
            for (const empresa of empresasSocioValidas) {
              const empresaPayload = {
                cpf_id: response.data.id,
                empresa_cnpj: empresa.empresa_cnpj || '',
                socio_nome: empresa.socio_nome || '',
                socio_cpf: empresa.socio_cpf || '',
                socio_qualificacao: empresa.socio_qualificacao || '',
                socio_data_entrada: empresa.socio_data_entrada || ''
              };

              console.log('📤 [EMPRESA_SOCIO_PAYLOAD] Dados para envio:', empresaPayload);
              
              const empresaResponse = await baseEmpresaSocioService.create(empresaPayload);

              if (empresaResponse.success) {
                empresasSalvas++;
                console.log('✅ [EMPRESAS_SOCIO] Empresa sócio cadastrada com sucesso');
              } else {
                console.warn('⚠️ [EMPRESAS_SOCIO] Aviso ao cadastrar empresa:', empresaResponse.error);
              }
            }
            
            if (empresasSalvas > 0) {
              toast.success(`${empresasSalvas} empresa(s) sócio cadastrada(s) com sucesso!`);
            }
          } catch (empresaSocioError) {
            console.error('❌ [EMPRESAS_SOCIO] Exceção ao cadastrar empresas sócio:', empresaSocioError);
            const errorMsg = empresaSocioError instanceof Error ? empresaSocioError.message : 'Erro desconhecido';
            toast.error(`Erro ao salvar dados de empresas sócio: ${errorMsg}`);
          }
        }
        
        // Salvar dados de Senhas de Email
        const senhasEmailValidas = senhaEmailData.filter(senha => {
          // Verificar se pelo menos um campo foi preenchido
          return Object.entries(senha).some(([key, value]) => {
            if (key === 'cpf_id') return false;
            if (!value || value === null || value === undefined) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            return true;
          });
        });
        
        if (senhasEmailValidas.length > 0 && response.data?.id) {
          try {
            console.log('🔄 [SENHA_EMAIL] Tentando salvar senhas de email...');
            console.log('📤 [SENHA_EMAIL] Dados originais:', senhasEmailValidas);
            
            const { baseSenhaEmailService } = await import('@/services/baseSenhaEmailService');
            
            let senhasEmailSalvas = 0;
            for (const senha of senhasEmailValidas) {
              const senhaPayload = {
                cpf_id: response.data.id,
                email: senha.email || '',
                senha: senha.senha || ''
              };

              console.log('📤 [SENHA_EMAIL_PAYLOAD] Dados para envio:', senhaPayload);
              
              const senhaResponse = await baseSenhaEmailService.create(senhaPayload);

              if (senhaResponse.success) {
                senhasEmailSalvas++;
                console.log('✅ [SENHA_EMAIL] Senha de email cadastrada com sucesso');
              } else {
                console.warn('⚠️ [SENHA_EMAIL] Aviso ao cadastrar senha:', senhaResponse.error);
              }
            }
            
            if (senhasEmailSalvas > 0) {
              toast.success(`${senhasEmailSalvas} senha(s) de email cadastrada(s) com sucesso!`);
            }
          } catch (senhaEmailError) {
            console.error('❌ [SENHA_EMAIL] Exceção ao cadastrar senhas de email:', senhaEmailError);
            const errorMsg = senhaEmailError instanceof Error ? senhaEmailError.message : 'Erro desconhecido';
            toast.error(`Erro ao salvar senhas de email: ${errorMsg}`);
          }
        }
        
        // Salvar dados de Senhas de CPF
        const senhasCpfValidas = senhaCpfData.filter(senha => {
          // Verificar se pelo menos um campo foi preenchido
          return Object.entries(senha).some(([key, value]) => {
            if (key === 'cpf_id') return false;
            if (!value || value === null || value === undefined) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            return true;
          });
        });
        
        if (senhasCpfValidas.length > 0 && response.data?.id) {
          try {
            console.log('🔄 [SENHA_CPF] Tentando salvar senhas de CPF...');
            console.log('📤 [SENHA_CPF] Dados originais:', senhasCpfValidas);
            
            const { baseSenhaCpfService } = await import('@/services/baseSenhaCpfService');
            
            let senhasCpfSalvas = 0;
            for (const senha of senhasCpfValidas) {
              const senhaPayload = {
                cpf_id: response.data.id,
                cpf: senha.cpf || '',
                senha: senha.senha || ''
              };

              console.log('📤 [SENHA_CPF_PAYLOAD] Dados para envio:', senhaPayload);
              
              const senhaResponse = await baseSenhaCpfService.create(senhaPayload);

              if (senhaResponse.success) {
                senhasCpfSalvas++;
                console.log('✅ [SENHA_CPF] Senha de CPF cadastrada com sucesso');
              } else {
                console.warn('⚠️ [SENHA_CPF] Aviso ao cadastrar senha:', senhaResponse.error);
              }
            }
            
            if (senhasCpfSalvas > 0) {
              toast.success(`${senhasCpfSalvas} senha(s) de CPF cadastrada(s) com sucesso!`);
            }
          } catch (senhaCpfError) {
            console.error('❌ [SENHA_CPF] Exceção ao cadastrar senhas de CPF:', senhaCpfError);
            const errorMsg = senhaCpfError instanceof Error ? senhaCpfError.message : 'Erro desconhecido';
            toast.error(`Erro ao salvar senhas de CPF: ${errorMsg}`);
          }
        }
        
        // Conclusão com mensagem resumida
        console.log('🎉 [CADASTRO_COMPLETO] Processo de cadastro finalizado com sucesso');
        
        // Contar quantas seções foram preenchidas
        let secoesSalvas = 1; // CPF básico sempre salvo
        let avisos = [];
        
        if (hasCnpjMeiData) secoesSalvas++;
        if (hasDividasData) secoesSalvas++;
        if (hasAuxilioData) secoesSalvas++;
        if (hasInssData) secoesSalvas++;
        if (hasHistoricoVeiculoData) secoesSalvas++;
        if (senhasEmailValidas && senhasEmailValidas.length > 0) secoesSalvas++;
        if (senhasCpfValidas && senhasCpfValidas.length > 0) secoesSalvas++;
        
        // Mostrar mensagem de sucesso consolidada
        toast.success(
          `CPF cadastrado com sucesso! ${secoesSalvas} seção(ões) de dados foram salvas.`,
          { duration: 4000 }
        );
        
        // Se houve avisos, mostrar informação adicional
        if (avisos.length > 0) {
          setTimeout(() => {
            toast.info(
              `Alguns serviços estão temporariamente indisponíveis, mas os dados principais foram salvos com sucesso.`,
              { duration: 6000 }
            );
          }, 1000);
        }
        
        // Redirecionar para a página de visualização do CPF cadastrado
        navigate(`/dashboard/admin/cpf-view/${response.data.id}`);
      } else {
        const errorMessage = response.error || response.message || 'Erro ao cadastrar CPF';
        console.error('❌ [CADASTRAR_CPF] Erro da API:', errorMessage);
        console.error('❌ [CADASTRAR_CPF] Response completa:', response);
        
        // Mensagens de erro mais específicas
        if (errorMessage.includes('duplicate') || errorMessage.includes('duplicado') || errorMessage.includes('já existe')) {
          toast.error('Este CPF já está cadastrado no sistema');
        } else if (errorMessage.includes('invalid') || errorMessage.includes('inválido')) {
          toast.error('CPF inválido ou dados incorretos. Verifique as informações');
        } else if (errorMessage.includes('required') || errorMessage.includes('obrigatório')) {
          toast.error('Campos obrigatórios não preenchidos (CPF e Nome)');
        } else if (errorMessage.includes('authorization') || errorMessage.includes('token')) {
          toast.error('Sessão expirada. Faça login novamente');
        } else if (errorMessage.includes('connection') || errorMessage.includes('network')) {
          toast.error('Erro de conexão. Verifique sua internet');
        } else {
          toast.error(`Erro ao cadastrar CPF: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('❌ [CADASTRAR_CPF] Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('400')) {
        toast.error('Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos corretamente');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        toast.error('Sessão expirada. Faça login novamente');
      } else if (errorMessage.includes('500')) {
        toast.error('Erro interno do servidor. Tente novamente em alguns instantes');
      } else {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  console.log('🔧 [CADASTRAR_CPF] Antes do return, dadosBasicos:', dadosBasicos);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
              Fotos
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Adicione até 4 fotos do CPF (formato 3x4)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiplePhotoUploader
              photos={{
                photo: dadosBasicos.photo || '',
                photo2: dadosBasicos.photo2 || '',
                photo3: dadosBasicos.photo3 || '',
                photo4: dadosBasicos.photo4 || '',
              }}
              onChange={(photoKey, base64) => handleInputChange(photoKey, base64)}
            />
          </CardContent>
        </Card>

        {/* 2. Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
              Dados Básicos
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informações pessoais principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={dadosBasicos.cpf || ''}
                  onChange={(e) => handleInputChange('cpf', formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="placeholder:text-sm"
                  maxLength={14}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={dadosBasicos.nome || ''}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo"
                  className="placeholder:text-sm"
                  required
                />
               </div>
            </div>

            {/* Componente de validação dos dados obrigatórios */}
            <CpfValidationStatus 
              cpf={dadosBasicos.cpf || ''} 
              nome={dadosBasicos.nome || ''} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  value={dadosBasicos.data_nascimento || ''}
                  onChange={(e) => handleInputChange('data_nascimento', formatDateOfBirth(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="placeholder:text-sm"
                  maxLength={10}
                />
              </div>

              <div>
                <Label htmlFor="sexo">Sexo</Label>
                <Select 
                  value={dadosBasicos.sexo || ''} 
                  onValueChange={(value) => {
                    try {
                      console.log('🔧 [SEXO_FIELD] Valor selecionado:', value);
                      handleInputChange('sexo', value);
                      console.log('✅ [SEXO_FIELD] Sexo atualizado com sucesso');
                    } catch (error) {
                      console.error('❌ [SEXO_FIELD] Erro ao atualizar sexo:', error);
                      toast.error('Erro ao selecionar sexo');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">MASCULINO</SelectItem>
                    <SelectItem value="FEMININO">FEMININO</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div>
                <Label htmlFor="mae">Nome da Mãe</Label>
                <Input
                  id="mae"
                  value={dadosBasicos.mae || ''}
                  onChange={(e) => handleInputChange('mae', e.target.value)}
                  placeholder="Nome da mãe"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="pai">Nome do Pai</Label>
                <Input
                  id="pai"
                  value={dadosBasicos.pai || ''}
                  onChange={(e) => handleInputChange('pai', e.target.value)}
                  placeholder="Nome do pai"
                  className="placeholder:text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              Dados Pessoais
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informações complementares pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input
                  id="naturalidade"
                  value={dadosBasicos.naturalidade || ''}
                  onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                  placeholder="Cidade de nascimento"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="uf_naturalidade">UF Naturalidade</Label>
                <Select 
                  value={dadosBasicos.uf_naturalidade || ''} 
                  onValueChange={(value) => handleInputChange('uf_naturalidade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BRASILEIROS.map((estado) => (
                      <SelectItem key={estado.sigla} value={estado.sigla}>
                        {estado.sigla} - {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

               <div>
                <Label htmlFor="cor">Cor/Raça</Label>
                <Select 
                  value={dadosBasicos.cor || ''} 
                  onValueChange={(value) => {
                    console.log('🔍 [COR_CHANGE] Selecionando cor:', value);
                    handleInputChange('cor', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cor/raça" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="BRANCA">BRANCA</SelectItem>
                    <SelectItem value="PRETA">PRETA</SelectItem>
                    <SelectItem value="PARDA">PARDA</SelectItem>
                    <SelectItem value="AMARELA">AMARELA</SelectItem>
                    <SelectItem value="INDÍGENA">INDÍGENA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div>
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <Select 
                  value={dadosBasicos.escolaridade || ''} 
                  onValueChange={(value) => {
                    console.log('🔍 [ESCOLARIDADE_CHANGE] Selecionando escolaridade:', value);
                    handleInputChange('escolaridade', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar escolaridade" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="FUNDAMENTAL INCOMPLETO">FUNDAMENTAL INCOMPLETO</SelectItem>
                    <SelectItem value="FUNDAMENTAL COMPLETO">FUNDAMENTAL COMPLETO</SelectItem>
                    <SelectItem value="MÉDIO INCOMPLETO">MÉDIO INCOMPLETO</SelectItem>
                    <SelectItem value="MÉDIO COMPLETO">MÉDIO COMPLETO</SelectItem>
                    <SelectItem value="SUPERIOR INCOMPLETO">SUPERIOR INCOMPLETO</SelectItem>
                    <SelectItem value="SUPERIOR COMPLETO">SUPERIOR COMPLETO</SelectItem>
                    <SelectItem value="PÓS-GRADUAÇÃO">PÓS-GRADUAÇÃO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div>
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <Select 
                  value={dadosBasicos.estado_civil || ''} 
                  onValueChange={(value) => {
                    console.log('🔍 [ESTADO_CIVIL_CHANGE] Selecionando estado civil:', value);
                    handleInputChange('estado_civil', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar estado civil" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="SOLTEIRO">SOLTEIRO</SelectItem>
                    <SelectItem value="CASADO">CASADO</SelectItem>
                    <SelectItem value="UNIÃO ESTÁVEL">UNIÃO ESTÁVEL</SelectItem>
                    <SelectItem value="SEPARADO">SEPARADO</SelectItem>
                    <SelectItem value="DIVORCIADO">DIVORCIADO</SelectItem>
                    <SelectItem value="VIÚVO">VIÚVO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aposentado">Aposentado</Label>
                <Select 
                  value={dadosBasicos.aposentado || ''} 
                  onValueChange={(value) => handleInputChange('aposentado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo_emprego">Profissão</Label>
                <Input
                  id="tipo_emprego"
                  value={dadosBasicos.tipo_emprego || ''}
                  onChange={(e) => handleInputChange('tipo_emprego', e.target.value)}
                  placeholder="Profissão"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="cbo">CBO</Label>
                <Input
                  id="cbo"
                  value={dadosBasicos.cbo || ''}
                  onChange={(e) => handleInputChange('cbo', e.target.value)}
                  placeholder="Código Brasileiro de Ocupações"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="data_obito">Data de Óbito</Label>
                <Input
                  id="data_obito"
                  value={dadosBasicos.data_obito || ''}
                  onChange={(e) => handleInputChange('data_obito', formatDateOfBirth(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="placeholder:text-sm"
                  maxLength={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* 4. Título de Eleitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              Título de Eleitor
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informações do título de eleitor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                <Input
                  id="titulo_eleitor"
                  value={dadosBasicos.titulo_eleitor || ''}
                  onChange={(e) => handleInputChange('titulo_eleitor', e.target.value.toUpperCase())}
                  placeholder="Número do título"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <Label htmlFor="zona">Zona</Label>
                <Input
                  id="zona"
                  value={dadosBasicos.zona || ''}
                  onChange={(e) => handleInputChange('zona', e.target.value.toUpperCase())}
                  placeholder="Zona"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <Label htmlFor="secao">Seção</Label>
                <Input
                  id="secao"
                  value={dadosBasicos.secao || ''}
                  onChange={(e) => handleInputChange('secao', e.target.value.toUpperCase())}
                  placeholder="Seção"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Dados Financeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              Dados Financeiros
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
                <Input
                  id="poder_aquisitivo"
                  value={dadosBasicos.poder_aquisitivo || ''}
                  onChange={(e) => handleInputChange('poder_aquisitivo', e.target.value)}
                  placeholder="Poder aquisitivo"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="renda">Renda</Label>
                <Input
                  id="renda"
                  value={dadosBasicos.renda || ''}
                  onChange={(e) => handleInputChange('renda', e.target.value)}
                  placeholder="Renda mensal"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
                <Input
                  id="fx_poder_aquisitivo"
                  value={dadosBasicos.fx_poder_aquisitivo || ''}
                  onChange={(e) => handleInputChange('fx_poder_aquisitivo', e.target.value)}
                  placeholder="Faixa de poder aquisitivo"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="csb8">CSB8</Label>
                <Input
                  id="csb8"
                  type="number"
                  value={dadosBasicos.csb8 || ''}
                  onChange={(e) => handleInputChange('csb8', e.target.value)}
                  placeholder="Valor CSB8"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="csb8_faixa">Faixa CSB8</Label>
                <Input
                  id="csb8_faixa"
                  value={dadosBasicos.csb8_faixa || ''}
                  onChange={(e) => handleInputChange('csb8_faixa', e.target.value)}
                  placeholder="Faixa CSB8"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="csba">CSBA</Label>
                <Input
                  id="csba"
                  type="number"
                  value={dadosBasicos.csba || ''}
                  onChange={(e) => handleInputChange('csba', e.target.value)}
                  placeholder="Valor CSBA"
                  className="placeholder:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="csba_faixa">Faixa CSBA</Label>
                <Input
                  id="csba_faixa"
                  value={dadosBasicos.csba_faixa || ''}
                  onChange={(e) => handleInputChange('csba_faixa', e.target.value)}
                  placeholder="Faixa CSBA"
                  className="placeholder:text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Parentes */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                Parentes
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Informações de parentes do CPF
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ParenteForm
              parentes={parentesData}
              onChange={setParentesData}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setParentesData([...parentesData, {}])}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        {/* 7. Telefones */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                Telefones
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Números de telefone adicionais relacionados ao CPF
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {telefonesAdicionais.map((telefone, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Telefone {index + 1}</h4>
                  {telefonesAdicionais.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = telefonesAdicionais.filter((_, i) => i !== index);
                        setTelefonesAdicionais(updated);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label>Telefone</Label>
                     <Input
                      value={formatPhone(`${telefone.ddd || ''}${telefone.telefone || ''}`)}
                      onChange={(e) => {
                        const updated = [...telefonesAdicionais];
                        const { ddd, telefone: tel } = splitPhone(e.target.value);
                        updated[index].ddd = ddd;
                        updated[index].telefone = tel;
                        setTelefonesAdicionais(updated);
                      }}
                      placeholder="(11) 99999-9999"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select 
                      value={telefone.tipo_texto} 
                      onValueChange={(value: any) => {
                        const updated = [...telefonesAdicionais];
                        updated[index].tipo_texto = value;
                        const map: Record<string, string> = {
                          Residencial: '1',
                          Comercial: '2',
                          Celular: '3',
                          WhatsApp: '4',
                          Outro: '0',
                        };
                        updated[index].tipo_codigo = map[value] ?? '0';
                        setTelefonesAdicionais(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residencial">Residencial</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Celular">Celular</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setTelefonesAdicionais([...telefonesAdicionais, {
                  cpf_id: 0,
                  ddd: '',
                  telefone: '',
                  tipo_codigo: '3',
                  tipo_texto: 'Outro',
                  sigilo: 0
                }]);
              }}
              className="bg-success text-success-foreground hover:bg-success/90 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        {/* 8. Emails */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                Emails
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Endereços de email adicionais relacionados ao CPF
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailsAdicionais.map((email, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Email {index + 1}</h4>
                  {emailsAdicionais.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = emailsAdicionais.filter((_, i) => i !== index);
                        setEmailsAdicionais(updated);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label>Email</Label>
                     <Input
                      type="email"
                      value={email.email}
                      onChange={(e) => {
                        const updated = [...emailsAdicionais];
                        updated[index].email = e.target.value;
                        setEmailsAdicionais(updated);
                      }}
                      placeholder="email@exemplo.com"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Input
                      type="number"
                      min={0}
                      value={email.prioridade ?? 0}
                      onChange={(e) => {
                        const updated = [...emailsAdicionais];
                        updated[index].prioridade = Number(e.target.value);
                        setEmailsAdicionais(updated);
                      }}
                      placeholder="1"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Score</Label>
                    <Select
                      value={(email.score_email as any) ?? 'REGULAR'}
                      onValueChange={(value: any) => {
                        const updated = [...emailsAdicionais];
                        updated[index].score_email = value;
                        setEmailsAdicionais(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OTIMO">Ótimo</SelectItem>
                        <SelectItem value="BOM">Bom</SelectItem>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="RUIM">Ruim</SelectItem>
                        <SelectItem value="PESSIMO">Péssimo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pessoal</Label>
                    <Select
                      value={(email.email_pessoal as any) ?? 'N'}
                      onValueChange={(value: any) => {
                        const updated = [...emailsAdicionais];
                        updated[index].email_pessoal = value;
                        setEmailsAdicionais(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pessoal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">Sim</SelectItem>
                        <SelectItem value="N">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEmailsAdicionais([...emailsAdicionais, {
                  cpf_id: 0,
                  email: '',
                  prioridade: 1,
                  score_email: 'REGULAR',
                  email_pessoal: 'N',
                  email_duplicado: 'N',
                  blacklist: 'N'
                }]);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>


        {/* 9. Endereços */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                Endereços
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Endereços adicionais relacionados ao CPF
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {enderecosAdicionais.map((endereco, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Endereço {index + 1}</h4>
                  {enderecosAdicionais.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = enderecosAdicionais.filter((_, i) => i !== index);
                        setEnderecosAdicionais(updated);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label>CEP</Label>
                    <Input
                      value={endereco.cep || ''}
                      onChange={async (e) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].cep = formatCep(e.target.value);
                        
                        // Auto-preenchimento via CEP
                        const cepNumerico = e.target.value.replace(/\D/g, '');
                        if (cepNumerico.length === 8) {
                          try {
                            const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
                            const data = await response.json();
                            
                            if (!data.erro) {
                              updated[index] = {
                                ...updated[index],
                                logradouro: data.logradouro || '',
                                bairro: data.bairro || '',
                                cidade: data.localidade || '',
                                uf: data.uf || ''
                              };
                            }
                          } catch (error) {
                            console.error('Erro ao buscar CEP:', error);
                          }
                        }
                        
                        setEnderecosAdicionais(updated);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label>Logradouro</Label>
                     <Input
                      value={endereco.logradouro || ''}
                      onChange={(e) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].logradouro = e.target.value;
                        setEnderecosAdicionais(updated);
                      }}
                      placeholder="Rua, avenida, praça..."
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Número</Label>
                     <Input
                      value={endereco.numero || ''}
                      onChange={(e) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].numero = e.target.value;
                        setEnderecosAdicionais(updated);
                      }}
                      placeholder="123"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                     <Input
                      value={endereco.complemento || ''}
                      onChange={(e) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].complemento = e.target.value;
                        setEnderecosAdicionais(updated);
                      }}
                      placeholder="Apto, bloco, casa..."
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                     <Input
                      value={endereco.bairro || ''}
                      onChange={(e) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].bairro = e.target.value;
                        setEnderecosAdicionais(updated);
                      }}
                      placeholder="Nome do bairro"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                     <Input
                      value={endereco.cidade || ''}
                      onChange={(e) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].cidade = e.target.value;
                        setEnderecosAdicionais(updated);
                      }}
                      placeholder="Nome da cidade"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>UF</Label>
                    <Select 
                      value={endereco.uf || ''} 
                      onValueChange={(value: any) => {
                        const updated = [...enderecosAdicionais];
                        updated[index].uf = value;
                        setEnderecosAdicionais(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((estado) => (
                          <SelectItem key={estado.sigla} value={estado.sigla}>
                            {estado.sigla}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEnderecosAdicionais([...enderecosAdicionais, {
                  cpf_id: 0,
                  cep: '',
                  logradouro: '',
                  numero: '',
                  complemento: '',
                  bairro: '',
                  cidade: '',
                  uf: ''
                }]);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        {/* 10. Credilink (1) */}
        <CreditinkForm
          creditinkData={creditinkData}
          onInputChange={(field, value) => {
            setCreditinkData(prev => ({ ...prev, [field]: value }));
          }}
        />

        {/* 11. Vacinas */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                Vacinas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Dados de vacinação
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <VacinaSection
              vacinas={vacinasData}
              onChange={setVacinasData}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setVacinasData([...vacinasData, {
                cpf_id: 0,
                vaina: '',
                cor: '',
                cns: '',
                mae: '',
                nome_vacina: '',
                descricao_vacina: '',
                lote_vacina: '',
                grupo_atendimento: '',
                data_aplicacao: '',
                status: '',
                nome_estabelecimento: '',
                aplicador_vacina: '',
                uf: '',
                municipio: '',
                bairro: '',
                cep: ''
              }])}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        {/* 12. Empresas Associadas (SÓCIO) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                Empresas Associadas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Empresas onde o CPF possui participação societária
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {empresasSocioData.map((empresa, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Empresa {index + 1}</h4>
                  {empresasSocioData.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = empresasSocioData.filter((_, i) => i !== index);
                        setEmpresasSocioData(updated);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label>CNPJ da Empresa *</Label>
                     <Input
                      value={empresa.empresa_cnpj || ''}
                      onChange={(e) => {
                        const updated = [...empresasSocioData];
                        updated[index].empresa_cnpj = formatCnpj(e.target.value);
                        setEmpresasSocioData(updated);
                      }}
                      placeholder="00.000.000/0000-00"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Nome do Sócio *</Label>
                     <Input
                      value={empresa.socio_nome || ''}
                      onChange={(e) => {
                        const updated = [...empresasSocioData];
                        updated[index].socio_nome = e.target.value.toUpperCase();
                        setEmpresasSocioData(updated);
                      }}
                      placeholder="Nome completo do sócio"
                      className="placeholder:text-sm"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <Label>CPF do Sócio *</Label>
                     <Input
                      value={empresa.socio_cpf || ''}
                      onChange={(e) => {
                        const updated = [...empresasSocioData];
                        updated[index].socio_cpf = formatCpf(e.target.value);
                        setEmpresasSocioData(updated);
                      }}
                      placeholder="000.000.000-00"
                      className="placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <Label>Qualificação</Label>
                     <Input
                      value={empresa.socio_qualificacao || ''}
                      onChange={(e) => {
                        const updated = [...empresasSocioData];
                        updated[index].socio_qualificacao = e.target.value.toUpperCase();
                        setEmpresasSocioData(updated);
                      }}
                      placeholder="Ex: Sócio, Administrador"
                      className="placeholder:text-sm"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <Label>Data de Entrada</Label>
                    <Input
                      type="date"
                      value={empresa.socio_data_entrada || ''}
                      onChange={(e) => {
                        const updated = [...empresasSocioData];
                        updated[index].socio_data_entrada = e.target.value;
                        setEmpresasSocioData(updated);
                      }}
                    />
                  </div>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEmpresasSocioData([...empresasSocioData, {
                  cpf_id: 0,
                  empresa_cnpj: '',
                  socio_nome: '',
                  socio_cpf: '',
                  socio_qualificacao: '',
                  socio_data_entrada: ''
                }]);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        {/* 13. CNPJ MEI */}
        <CnpjMeiForm
          cnpjMeiData={cnpjMeiData}
          onInputChange={(field, value) => {
            setCnpjMeiData(prev => ({ ...prev, [field]: value }));
          }}
        />

        {/* 14. Dívidas Ativas (SIDA) */}
        <DividasAtivasSection
          dividasAtivas={dividasAtivasData}
          onChange={setDividasAtivasData}
        />

        {/* 15. Auxílio Emergencial */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                Auxílio Emergencial
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Informações sobre auxílio emergencial recebido
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AuxilioEmergencialSection
              auxiliosEmergenciais={auxilioEmergencialData}
              onChange={setAuxilioEmergencialData}
              onAdd={() => {
                const newAuxilio: Partial<CreateBaseAuxilioEmergencial> = {
                  cpf_id: 0,
                  uf: '',
                  mes_disponibilizacao: '',
                  enquadramento: '',
                  parcela: '',
                  observacao: '',
                  valor_beneficio: 0
                };
                setAuxilioEmergencialData([...auxilioEmergencialData, newAuxilio]);
              }}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                const newAuxilio: Partial<CreateBaseAuxilioEmergencial> = {
                  cpf_id: 0,
                  uf: '',
                  mes_disponibilizacao: '',
                  enquadramento: '',
                  parcela: '',
                  observacao: '',
                  valor_beneficio: 0
                };
                setAuxilioEmergencialData([...auxilioEmergencialData, newAuxilio]);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        {/* 16. Rais – Histórico de Emprego - TODO: Implementar */}
        {/* Placeholder para futura implementação */}

        {/* 17. INSS */}
        <InssForm 
          data={inssData}
          onChange={(field, value) => {
            setInssData(prev => ({ ...prev, [field]: value }));
          }}
        />

        {/* 18. Operadora Vivo */}
        <VivoForm
          data={vivoData}
          onChange={setVivoData}
        />

        {/* 19. Operadora Claro */}
        <ClaroForm
          data={claroData}
          onChange={setClaroData}
        />

        {/* 20. Operadora Tim */}
        <TimForm
          data={timData}
          onChange={setTimData}
        />

        {/* 21. Histórico de Veículos */}
        <HistoricoVeiculoForm 
          data={historicoVeiculoData}
          onChange={(data) => {
            setHistoricoVeiculoData(data);
          }}
        />

        {/* 22. Senhas de Email */}
        <SenhaEmailForm
          data={senhaEmailData}
          onChange={setSenhaEmailData}
        />

        {/* 23. Senhas de CPF */}
        <SenhaCpfForm
          data={senhaCpfData}
          onChange={setSenhaCpfData}
        />



        {/* 24. RG */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                RG
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Informações apresentadas do RG
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {rgDocumentos.map((documento, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Identidade {index + 1}</h4>
                  {rgDocumentos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          console.log('🔧 [RG_REMOVE] Removendo documento RG índice:', index);
                          const updated = rgDocumentos.filter((_, i) => i !== index);
                          setRgDocumentos(updated);
                          console.log('✅ [RG_REMOVE] Documento RG removido com sucesso');
                        } catch (error) {
                          console.error('❌ [RG_REMOVE] Erro ao remover documento RG:', error);
                          toast.error('Erro ao remover documento RG');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div>
                  <Label>MAI</Label>
                   <Input
                    value={documento.mai || ''}
                    onChange={(e) => {
                      try {
                        console.log('🔧 [RG_MAI] Alterando MAI:', e.target.value);
                        const updated = [...rgDocumentos];
                        updated[index].mai = e.target.value.toUpperCase();
                        setRgDocumentos(updated);
                        console.log('✅ [RG_MAI] MAI atualizado com sucesso:', updated[index].mai);
                      } catch (error) {
                        console.error('❌ [RG_MAI] Erro ao atualizar MAI:', error);
                        toast.error('Erro ao atualizar MAI: ' + error);
                      }
                    }}
                    placeholder="MAI"
                    className="placeholder:text-sm"
                  />
                </div>
                <div>
                  <Label>RG</Label>
                    <Input
                     value={documento.rg || ''}
                     onChange={(e) => {
                       try {
                         console.log('🔧 [RG_NUMERO] Alterando RG:', e.target.value);
                         const updated = [...rgDocumentos];
                         updated[index].rg = e.target.value.toUpperCase();
                         setRgDocumentos(updated);
                         console.log('✅ [RG_NUMERO] RG atualizado com sucesso:', updated[index].rg);
                       } catch (error) {
                         console.error('❌ [RG_NUMERO] Erro ao atualizar RG:', error);
                         toast.error('Erro ao atualizar RG: ' + error);
                       }
                     }}
                     placeholder="Número do RG"
                     className="placeholder:text-sm"
                   />
                </div>
                <div>
                  <Label>DNI</Label>
                   <Input
                    value={documento.dni || ''}
                    onChange={(e) => {
                      try {
                        console.log('🔧 [RG_DNI] Alterando DNI:', e.target.value);
                        const updated = [...rgDocumentos];
                        updated[index].dni = e.target.value.toUpperCase();
                        setRgDocumentos(updated);
                        console.log('✅ [RG_DNI] DNI atualizado com sucesso');
                      } catch (error) {
                        console.error('❌ [RG_DNI] Erro ao atualizar DNI:', error);
                        toast.error('Erro ao atualizar DNI: ' + error);
                      }
                    }}
                    placeholder="DNI"
                    className="placeholder:text-sm"
                  />
                </div>
                <div>
                  <Label>Data de Expedição</Label>
                  <Input
                    value={documento.dt_expedicao || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].dt_expedicao = formatDateOfBirth(e.target.value);
                      setRgDocumentos(updated);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                  />
                </div>
                 <div>
                   <Label>Nome</Label>
                   <Input
                     value={documento.nome || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].nome = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Nome completo"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Filiação</Label>
                   <Input
                     value={documento.filiacao || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].filiacao = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Filiação"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Naturalidade</Label>
                   <Input
                     value={documento.naturalidade || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].naturalidade = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Naturalidade"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input
                    value={documento.dt_nascimento || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].dt_nascimento = formatDateOfBirth(e.target.value);
                      setRgDocumentos(updated);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                  />
                </div>
                 <div>
                   <Label>Registro Civil</Label>
                   <Input
                     value={documento.registro_civil || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].registro_civil = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Registro Civil"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Título de Eleitor</Label>
                   <Input
                     value={documento.titulo_eleitor || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].titulo_eleitor = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Título de Eleitor"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Zona Eleitoral</Label>
                   <Input
                     value={documento.titulo_zona || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].titulo_zona = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Zona Eleitoral"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Seção Eleitoral</Label>
                   <Input
                     value={documento.titulo_secao || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].titulo_secao = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Seção Eleitoral"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>CTPS</Label>
                   <Input
                     value={documento.ctps || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].ctps = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="CTPS"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>CTPS Série</Label>
                   <Input
                     value={documento.ctps_serie || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].ctps_serie = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="CTPS Série"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                <div>
                  <Label>CTPS UF</Label>
                  <Select 
                    value={documento.ctps_uf || ''} 
                    onValueChange={(value: any) => {
                      const updated = [...rgDocumentos];
                      updated[index].ctps_uf = value;
                      setRgDocumentos(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map((estado) => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.sigla} - {estado.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                   <Label>NIS</Label>
                   <Input
                     value={documento.nis || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].nis = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="NIS"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>PIS</Label>
                   <Input
                     value={documento.pis || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].pis = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="PIS"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>PASEP</Label>
                   <Input
                     value={documento.pasep || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].pasep = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="PASEP"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>RG Profissional</Label>
                   <Input
                     value={documento.rg_profissional || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].rg_profissional = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="RG Profissional"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Certificado Militar</Label>
                   <Input
                     value={documento.cert_militar || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].cert_militar = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="Certificado Militar"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>CNH</Label>
                   <Input
                     value={documento.cnh || ''}
                     onChange={(e) => {
                       const updated = [...rgDocumentos];
                       updated[index].cnh = e.target.value.toUpperCase();
                       setRgDocumentos(updated);
                     }}
                     placeholder="CNH"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                <div>
                  <Label>CNS</Label>
                  <Input
                    value={documento.cns || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].cns = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="CNS"
                  />
                </div>
                <div>
                  <Label>RG Anterior</Label>
                  <Input
                    value={documento.rg_anterior || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].rg_anterior = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="RG Anterior"
                  />
                </div>
                <div>
                  <Label>Via P</Label>
                  <Input
                    value={documento.via_p || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].via_p = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="Via P"
                  />
                </div>
                <div>
                  <Label>Via</Label>
                  <Input
                    value={documento.via || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].via = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="Via"
                  />
                </div>
                <div>
                  <Label>Diretor</Label>
                  <Select 
                    value={documento.diretor || ''} 
                    onValueChange={(value: any) => {
                      const updated = [...rgDocumentos];
                      updated[index].diretor = value;
                      setRgDocumentos(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar diretor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lúcio Flávio">Lúcio Flávio</SelectItem>
                      <SelectItem value="Fábio Viegas">Fábio Viegas</SelectItem>
                      <SelectItem value="Fábio Sérgio">Fábio Sérgio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Órgão Expedidor</Label>
                  <Input
                    value={documento.orgao_expedidor || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].orgao_expedidor = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="Órgão expedidor"
                  />
                </div>
                <div>
                  <Label>UF Emissão</Label>
                  <Select 
                    value={documento.uf_emissao || ''} 
                    onValueChange={(value: any) => {
                      const updated = [...rgDocumentos];
                      updated[index].uf_emissao = value;
                      setRgDocumentos(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map((estado) => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.sigla}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fator RH</Label>
                  <Input
                    value={documento.fator_rh || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].fator_rh = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="Fator RH"
                  />
                </div>
                <div>
                  <Label>QR Code</Label>
                  <Input
                    value={documento.qrcode || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].qrcode = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="QR Code"
                  />
                </div>
                <div>
                  <Label>Numeração da Folha</Label>
                  <Input
                    value={documento.numeracao_folha || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].numeracao_folha = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="Numeração da Folha"
                  />
                </div>
                <div>
                  <Label>Observação</Label>
                  <Input
                    value={documento.observacao || ''}
                    onChange={(e) => {
                      const updated = [...rgDocumentos];
                      updated[index].observacao = e.target.value;
                      setRgDocumentos(updated);
                    }}
                    placeholder="Observação"
                  />
                </div>
              </div>
            </React.Fragment>
            ))}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setRgDocumentos([...rgDocumentos, {
                  cpf_id: 0,
                  mai: '',
                  rg: '',
                  dni: '',
                  dt_expedicao: '',
                  nome: '',
                  filiacao: '',
                  naturalidade: '',
                  dt_nascimento: '',
                  registro_civil: '',
                  titulo_eleitor: '',
                  titulo_zona: '',
                  titulo_secao: '',
                  ctps: '',
                  ctps_serie: '',
                  ctps_uf: '',
                  nis: '',
                  pis: '',
                  pasep: '',
                  rg_profissional: '',
                  cert_militar: '',
                  cnh: '',
                  cns: '',
                  rg_anterior: '',
                  via_p: '',
                  via: '',
                  diretor: 'Lúcio Flávio',
                  orgao_expedidor: '',
                  uf_emissao: '',
                  fator_rh: '',
                  qrcode: '',
                  numeracao_folha: '',
                  observacao: ''
                }]);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>


        {/* CNH */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                CNH
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Informações detalhadas da CNH
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {cnhDocumentos.map((documento, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Habilitação {index + 1}</h4>
                  {cnhDocumentos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = cnhDocumentos.filter((_, i) => i !== index);
                        setCnhDocumentos(updated);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 <div>
                   <Label>Número do Espelho</Label>
                   <Input
                     value={documento.n_espelho || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].n_espelho = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Número do espelho"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Nome</Label>
                   <Input
                     value={documento.nome || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].nome = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Nome completo"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Foto da CNH</Label>
                   <Input
                     value={documento.foto_cnh || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].foto_cnh = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="URL da foto"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Documento de Identidade</Label>
                   <Input
                     value={documento.doc_identidade || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].doc_identidade = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Documento de identidade"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Órgão Expedidor</Label>
                   <Input
                     value={documento.orgao_expedidor || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].orgao_expedidor = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Órgão expedidor"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                <div>
                  <Label>UF Emissão</Label>
                  <Select 
                    value={documento.uf_emissao || ''} 
                    onValueChange={(value: any) => {
                      const updated = [...cnhDocumentos];
                      updated[index].uf_emissao = value;
                      setCnhDocumentos(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map((estado) => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.sigla}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input
                    value={documento.data_nascimento || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].data_nascimento = formatDateOfBirth(e.target.value);
                      setCnhDocumentos(updated);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                  />
                </div>
                 <div>
                   <Label>Nome do Pai</Label>
                   <Input
                     value={documento.pai || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].pai = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Nome do pai"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                 <div>
                   <Label>Nome da Mãe</Label>
                   <Input
                     value={documento.mae || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].mae = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Nome da mãe"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                <div>
                  <Label>Categoria de Habilitação</Label>
                  <Select 
                    value={documento.cat_hab || ''} 
                    onValueChange={(value: any) => {
                      const updated = [...cnhDocumentos];
                      updated[index].cat_hab = value;
                      setCnhDocumentos(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Motocicleta</SelectItem>
                      <SelectItem value="B">B - Automóvel</SelectItem>
                      <SelectItem value="C">C - Caminhão</SelectItem>
                      <SelectItem value="D">D - Ônibus</SelectItem>
                      <SelectItem value="E">E - Caminhão com reboque</SelectItem>
                      <SelectItem value="AB">AB - A + B</SelectItem>
                      <SelectItem value="AC">AC - A + C</SelectItem>
                      <SelectItem value="AD">AD - A + D</SelectItem>
                      <SelectItem value="AE">AE - A + E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                   <Label>Permissão</Label>
                   <Input
                     value={documento.permissao || ''}
                     onChange={(e) => {
                       const updated = [...cnhDocumentos];
                       updated[index].permissao = e.target.value.toUpperCase();
                       setCnhDocumentos(updated);
                     }}
                     placeholder="Permissão"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
                <div>
                  <Label>ACC</Label>
                  <Input
                    value={documento.acc || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].acc = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="ACC"
                  />
                </div>
                <div>
                  <Label>Número de Registro</Label>
                  <Input
                    value={documento.n_registro || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].n_registro = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Número do registro"
                  />
                </div>
                <div>
                  <Label>Validade</Label>
                  <Input
                    value={documento.validade || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].validade = formatDateOfBirth(e.target.value);
                      setCnhDocumentos(updated);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label>Primeira Habilitação</Label>
                  <Input
                    value={documento.primeira_habilitacao || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].primeira_habilitacao = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Primeira habilitação"
                  />
                </div>
                <div>
                  <Label>Assinatura</Label>
                  <Input
                    value={documento.assinatura || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].assinatura = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Assinatura"
                  />
                </div>
                <div>
                  <Label>Local</Label>
                  <Input
                    value={documento.local || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].local = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Local"
                  />
                </div>
                <div>
                  <Label>Data de Emissão</Label>
                  <Input
                    value={documento.data_emissao || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].data_emissao = formatDateOfBirth(e.target.value);
                      setCnhDocumentos(updated);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label>Diretor</Label>
                  <Input
                    value={documento.diretor || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].diretor = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Nome do diretor"
                  />
                </div>
                <div>
                  <Label>Número Seg1</Label>
                  <Input
                    value={documento.n_seg1 || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].n_seg1 = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Número de segurança"
                  />
                </div>
                <div>
                  <Label>Número RENACH</Label>
                  <Input
                    value={documento.n_renach || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].n_renach = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Número RENACH"
                  />
                </div>
                <div>
                  <Label>QR Code</Label>
                  <Input
                    value={documento.qrcode || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].qrcode = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="QR Code"
                  />
                </div>
                <div className="col-span-full">
                  <Label>Observações</Label>
                  <Input
                    value={documento.observacoes || ''}
                    onChange={(e) => {
                      const updated = [...cnhDocumentos];
                      updated[index].observacoes = e.target.value;
                      setCnhDocumentos(updated);
                    }}
                    placeholder="Observações"
                  />
                </div>
              </div>
            </React.Fragment>
            ))}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setCnhDocumentos([...cnhDocumentos, {
                  cpf_id: 0,
                  n_espelho: '',
                  nome: '',
                  foto_cnh: '',
                  doc_identidade: '',
                  orgao_expedidor: '',
                  uf_emissao: '',
                  data_nascimento: '',
                  pai: '',
                  mae: '',
                  permissao: '',
                  acc: '',
                  cat_hab: '',
                  n_registro: '',
                  validade: '',
                  primeira_habilitacao: '',
                  observacoes: '',
                  assinatura: '',
                  local: '',
                  data_emissao: '',
                  diretor: '',
                  n_seg1: '',
                  n_renach: '',
                  qrcode: ''
                }]);
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>


        {/* 27. Receita Federal */}
        <BaseReceitaFormSection
          data={receitaData}
          onChange={handleReceitaChange}
          mode="create"
        />

        {/* 28. Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Score
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Pontuação de confiabilidade dos dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visualização do Score - Arco */}
            <div className="bg-gradient-to-br from-background via-background to-accent/5 border rounded-xl p-6 transition-all duration-300">
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Score Arc */}
                <div className="relative">
                  <div className="w-48 h-28">
                    <svg viewBox="0 0 200 120" className="w-full h-full">
                      {/* Background Arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      
                      {/* Progress Arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={`url(#scoreGradient-${score || 0})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * Math.min((score || 0) / 1000, 1))}
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id={`scoreGradient-${score || 0}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={score < 400 ? "#ef4444" : "#ef4444"} />
                          <stop offset="25%" stopColor={score < 400 ? "#ef4444" : "#eab308"} />
                          <stop offset="60%" stopColor={score < 600 ? "#eab308" : "#22c55e"} />
                          <stop offset="100%" stopColor={score < 800 ? "#22c55e" : "#10b981"} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Score Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold text-foreground mb-1 leading-none">
                        {score || 0}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        de 1000
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Label */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    score >= 800 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    score >= 600 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                    score >= 400 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {score >= 800 ? 'Excelente' :
                     score >= 600 ? 'Bom' :
                     score >= 400 ? 'Regular' : 'Baixo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles de Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="score_input">Score (0-1000)</Label>
                <Input
                  id="score_input"
                  type="number"
                  min={0}
                  max={1000}
                  value={score || ''}
                  onChange={(e) => setScore(Number(e.target.value) || 0)}
                  placeholder="Digite o score"
                  className="text-center font-mono text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ajuste com Slider ({score} pontos)</Label>
                <div className="pt-2">
                  <Slider
                    value={[score]}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(val) => setScore(val[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>500</span>
                    <span>1000</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 29. Outros Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              Outros Dados
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informações complementares
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ref">Referência</Label>
                <Input
                  id="ref"
                  value={dadosBasicos.ref || ''}
                  onChange={(e) => handleInputChange('ref', e.target.value)}
                  placeholder="Referência do registro"
                />
              </div>

              <div>
                <Label htmlFor="fonte_dados">Fonte dos Dados</Label>
                <Select 
                  value={dadosBasicos.fonte_dados || 'cadastro_manual'}
                  onValueChange={(value) => handleInputChange('fonte_dados', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cadastro_manual">Cadastro Manual</SelectItem>
                    <SelectItem value="importacao_planilha">Importação (Planilha)</SelectItem>
                    <SelectItem value="api_interna">API Interna</SelectItem>
                    <SelectItem value="api_externa">API Externa</SelectItem>
                    <SelectItem value="consulta_publica">Consulta Pública</SelectItem>
                    <SelectItem value="parceiro_comercial">Parceiro Comercial</SelectItem>
                    <SelectItem value="usuario">Informado pelo Usuário</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="qualidade_dados">Qualidade dos Dados ({dadosBasicos.qualidade_dados || 0}%)</Label>
                <div className="pt-2">
                  <Slider
                    id="qualidade_dados"
                    value={[Number(dadosBasicos.qualidade_dados || 0)]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(val) => handleInputChange('qualidade_dados', val[0])}
                    aria-label="Qualidade dos Dados"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Botão de Submit Flutuante */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            type="submit" 
            disabled={loading || !dadosBasicos.cpf || !dadosBasicos.nome || (dadosBasicos.cpf || '').replace(/\D/g, '').length !== 11} 
            variant="secondary"
            className={`min-w-[140px] bg-secondary/90 hover:bg-secondary/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
              (!dadosBasicos.cpf || !dadosBasicos.nome || (dadosBasicos.cpf || '').replace(/\D/g, '').length !== 11) 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                SALVAR
              </div>
            )}
          </Button>
        </div>
      </form>
      
      {/* Espaçamento para compensar o botão flutuante */}
      <div className="pb-20"></div>
    </div>
  );
};

// Wrapper do componente com error boundary
const CadastrarCPFWrapper = () => {
  try {
    return <CadastrarCPF />;
  } catch (error) {
    console.error('❌ [CADASTRAR_CPF_WRAPPER] Erro no componente:', error);
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Erro no Cadastro</h2>
        <p className="text-gray-600 mb-4">
          Ocorreu um erro ao carregar a página de cadastro. 
          Verifique o console para mais detalhes.
        </p>
        <Button onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
      </div>
    );
  }
};

export default CadastrarCPFWrapper;
