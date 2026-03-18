import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Save, User, FileText, Mail, Phone, MapPin, 
  Calendar, Info, Camera, Eye, DollarSign, Globe, Briefcase, Heart,
  CreditCard, TrendingUp
} from 'lucide-react';
import { toast } from "sonner";
import { baseCpfService, BaseCpf } from '@/services/baseCpfService';
import { getErrorMessage } from '@/utils/errorMessages';
import { formatCpf, formatCep, formatPhone, formatDateOfBirth } from '@/utils/formatters';
import MultiplePhotoUploader from '@/components/cpf/MultiplePhotoUploader';
import ScoreCard from '@/components/cpf/ScoreCard';
import BaseReceitaFormSection from '@/components/admin/BaseReceitaFormSection';
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { useBaseReceita } from '@/hooks/useBaseReceita';
import ParenteForm from '@/components/parente/ParenteForm';
import CreditinkForm from '@/components/credilink/CreditinkForm';
import VacinaSection from '@/components/vacina/VacinaSection';

// Estados brasileiros
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

// Opções de situação CPF
const SITUACAO_CPF_OPTIONS = [
  'Regular',
  'Suspensa',
  'Cancelada por Multiplicidade',
  'Nula',
  'Cancelada de Ofício',
  'Pendente de Regularização',
  'Cancelada a Pedido',
  'Titular Falecido'
];

const CpfEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cpf, setCpf] = useState<BaseCpf | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const numeroRef = useRef<HTMLInputElement>(null);

  // Estado para os dados editáveis
  const [dadosBasicos, setDadosBasicos] = useState<Partial<BaseCpf>>({});

  // Estado para o score
  const [score, setScore] = useState<number>(0);
  
  // Estado para dados da Receita Federal
  const [receitaData, setReceitaData] = useState<Partial<BaseReceita>>({});
  const { getReceitaByCpf } = useBaseReceita();

  // Estados para seções adicionais
  const [parentesData, setParentesData] = useState<any[]>([]);
  const [telefonesData, setTelefonesData] = useState<any[]>([]);
  const [emailsData, setEmailsData] = useState<any[]>([]);
  const [enderecosData, setEnderecosData] = useState<any[]>([]);
  const [creditinkData, setCreditinkData] = useState<any>({});
  const [vacinasData, setVacinasData] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadCpfData();
    }
  }, [id]);

  const loadCpfData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log('📊 [CPF_EDIT] Loading CPF data for ID:', id);
      const response = await baseCpfService.getById(Number(id));
      console.log('📊 [CPF_EDIT] Response:', response);
      
      if (response.success && response.data) {
        setCpf(response.data);
        // Converter datas ISO para formato DD/MM/AAAA para exibição
        const convertISOToDisplay = (isoDate: string | null | undefined) => {
          if (!isoDate) return '';
          const date = new Date(isoDate);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleDateString('pt-BR');
        };

        setDadosBasicos({
          ...response.data,
          data_nascimento: convertISOToDisplay(response.data.data_nascimento),
          data_obito: convertISOToDisplay(response.data.data_obito),
          dt_expedicao_cnh: convertISOToDisplay(response.data.dt_expedicao_cnh),
        });
        
        // Definir score inicial
        setScore(Number(response.data.score) || 0);
        
        // Carregar dados da Receita Federal usando o CPF
        try {
          const receitaResponse = await getReceitaByCpf(response.data.cpf);
          if (receitaResponse) {
            setReceitaData(receitaResponse);
          }
        } catch (receitaError) {
          console.error('❌ [CPF_EDIT] Erro ao carregar Receita Federal:', receitaError);
        }

        // Carregar dados relacionados
        await loadRelatedData(Number(id));
        
        console.log('✅ [CPF_EDIT] CPF data loaded:', response.data);
      } else {
        console.error('❌ [CPF_EDIT] Failed to load CPF data:', response.error);
        toast.error(response.error || 'Erro ao carregar dados do CPF');
        navigate('/dashboard/admin/base-cpf');
      }
    } catch (error) {
      console.error('❌ [CPF_EDIT] Load error:', error);
      toast.error(getErrorMessage(error));
      navigate('/dashboard/admin/base-cpf');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    // Lista de campos que devem ser convertidos para maiúsculo
    const uppercaseFields = [
      'nome', 'mae', 'pai', 'naturalidade', 'logradouro', 
      'bairro', 'cidade', 'complemento', 'cor', 'estado_civil',
      'escolaridade', 'tipo_emprego', 'cbo', 'poder_aquisitivo',
      'renda', 'fx_poder_aquisitivo', 'csb8_faixa', 'csba_faixa',
      'orgao_emissor', 'fonte_dados'
    ];
    
    // Converter para maiúsculo se for um campo de texto que deve ser em maiúsculo
    const finalValue = (typeof value === 'string' && uppercaseFields.includes(field)) 
      ? value.toUpperCase() 
      : value;
    
    setDadosBasicos(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleReceitaChange = (field: string, value: string) => {
    setReceitaData(prev => ({ ...prev, [field]: value }));
  };

  // Carregar dados relacionados
  const loadRelatedData = async (cpfId: number) => {
    try {
      // Carregar parentes
      const { baseParenteService } = await import('@/services/baseParenteService');
      const parentesResponse = await baseParenteService.getByCpfId(cpfId);
      if (parentesResponse.success && parentesResponse.data) {
        setParentesData(Array.isArray(parentesResponse.data) ? parentesResponse.data : [parentesResponse.data]);
      }

      // Carregar telefones
      const { baseTelefoneService } = await import('@/services/baseTelefoneService');
      const telefonesResponse = await baseTelefoneService.getByCpfId(cpfId);
      if (telefonesResponse.success && telefonesResponse.data) {
        setTelefonesData(Array.isArray(telefonesResponse.data) ? telefonesResponse.data : [telefonesResponse.data]);
      }

      // Carregar emails
      const { baseEmailService } = await import('@/services/baseEmailService');
      const emailsResponse = await baseEmailService.getByCpfId(cpfId);
      if (emailsResponse.success && emailsResponse.data) {
        setEmailsData(Array.isArray(emailsResponse.data) ? emailsResponse.data : [emailsResponse.data]);
      }

      // Carregar endereços
      const { baseEnderecoService } = await import('@/services/baseEnderecoService');
      const enderecosResponse = await baseEnderecoService.getByCpfId(cpfId);
      if (enderecosResponse.success && enderecosResponse.data) {
        setEnderecosData(Array.isArray(enderecosResponse.data) ? enderecosResponse.data : [enderecosResponse.data]);
      }

      // Carregar credilink
      const { baseCreditinkService } = await import('@/services/baseCreditinkService');
      const creditinkResponse = await baseCreditinkService.getByCpfId(cpfId);
      if (creditinkResponse.success && creditinkResponse.data) {
        const data = Array.isArray(creditinkResponse.data) ? creditinkResponse.data[0] : creditinkResponse.data;
        setCreditinkData(data || {});
      }

      // Carregar vacinas
      const { baseVacinaService } = await import('@/services/baseVacinaService');
      const vacinasResponse = await baseVacinaService.getByCpfId(cpfId);
      if (vacinasResponse.success && vacinasResponse.data) {
        setVacinasData(Array.isArray(vacinasResponse.data) ? vacinasResponse.data : [vacinasResponse.data]);
      }
    } catch (error) {
      console.error('❌ [CPF_EDIT] Erro ao carregar dados relacionados:', error);
    }
  };

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

  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCep(cep);
    handleInputChange('cep', formattedCep);

    // Auto-completar endereço quando CEP tiver 8 dígitos
    if (formattedCep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formattedCep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          handleInputChange('logradouro', data.logradouro || '');
          handleInputChange('bairro', data.bairro || '');
          handleInputChange('cidade', data.localidade || '');
          handleInputChange('uf_endereco', data.uf || '');
          
          // Focar no campo número
          setTimeout(() => {
            numeroRef.current?.focus();
          }, 100);
          
          toast.success('Endereço preenchido automaticamente');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar dados do CEP');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dadosBasicos.cpf || !dadosBasicos.nome) {
      toast.error('CPF e nome são obrigatórios');
      return;
    }

    setSaving(true);

    try {
      // Preparar dados para envio
      const cleanedCpf = (dadosBasicos.cpf || '').replace(/\D/g, '');
      const cleanedCep = (dadosBasicos.cep || '').replace(/\D/g, '');

      // Upload das fotos para o servidor externo se houver alterações
      if (dadosBasicos.photo || dadosBasicos.photo2 || dadosBasicos.photo3 || dadosBasicos.photo4) {
        console.log('📤 [FOTOS] Iniciando upload das fotos para o servidor externo...');
        const uploadedPhotos = await uploadPhotosToServer(cleanedCpf, {
          photo: dadosBasicos.photo,
          photo2: dadosBasicos.photo2,
          photo3: dadosBasicos.photo3,
          photo4: dadosBasicos.photo4
        }, Number(id));
        
        if (uploadedPhotos.length > 0) {
          console.log(`✅ [FOTOS] ${uploadedPhotos.length} foto(s) enviada(s) para o servidor externo`);
        }
      }

      // Converter datas do formato DD/MM/AAAA para ISO
      const convertDateToISO = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 10) return '';
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return '';
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      const rawPayload = {
        ...dadosBasicos,
        cpf: cleanedCpf,
        cep: cleanedCep,
        // Converter datas para formato ISO
        data_nascimento: convertDateToISO(dadosBasicos.data_nascimento || ''),
        data_obito: convertDateToISO(dadosBasicos.data_obito || ''),
        dt_expedicao_cnh: convertDateToISO(dadosBasicos.dt_expedicao_cnh || ''),
        // Garantir que campos numéricos sejam números
        qualidade_dados: Number(dadosBasicos.qualidade_dados) || 0,
        csb8: dadosBasicos.csb8 ? Number(dadosBasicos.csb8) : undefined,
        csba: dadosBasicos.csba ? Number(dadosBasicos.csba) : undefined,
        // Incluir score
        score: score,
        // Definir data de última atualização
        ultima_atualizacao: new Date().toISOString()
      } as Record<string, any>;

      // Remover campos vazios/indefinidos
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );

      console.log('💾 [CPF_EDIT] Saving CPF data:', payload);
      const response = await baseCpfService.update(Number(id), payload);
      console.log('✅ [CPF_EDIT] Update response:', response);
      
      if (response.success) {
        // Salvar dados da Receita Federal se houver
        if (Object.keys(receitaData).length > 0 && cleanedCpf) {
          try {
            console.log('💾 [CPF_EDIT] Saving Receita Federal data:', receitaData);
            
            // Preparar dados da Receita Federal com CPF
            const receitaPayload = {
              ...receitaData,
              cpf: cleanedCpf
            };
            
            let receitaResponse;
            
            // Se já existe um ID, fazer update, senão criar novo
            if (receitaData.id) {
              console.log('🔄 [CPF_EDIT] Updating existing Receita Federal data with ID:', receitaData.id);
              const { id, cpf, ...updateData } = receitaPayload;
              receitaResponse = await baseReceitaService.update(receitaData.id, updateData);
            } else {
              console.log('➕ [CPF_EDIT] Creating new Receita Federal data');
              receitaResponse = await baseReceitaService.create(receitaPayload);
            }
            
            console.log('✅ [CPF_EDIT] Receita Federal response:', receitaResponse);
            
            if (receitaResponse.success) {
              console.log('✅ [CPF_EDIT] Receita Federal data saved successfully');
            } else {
              console.warn('⚠️ [CPF_EDIT] Warning saving Receita Federal:', receitaResponse.error);
              toast.error(`Erro ao salvar dados da Receita Federal: ${receitaResponse.error}`);
            }
          } catch (receitaError) {
            console.error('❌ [CPF_EDIT] Error saving Receita Federal:', receitaError);
            toast.error('Erro ao salvar dados da Receita Federal');
          }
        }

        toast.success('CPF atualizado com sucesso');
        navigate(`/dashboard/admin/cpf-view/${id}`);
      } else {
        throw new Error(response.error || 'Erro ao atualizar CPF');
      }
    } catch (error) {
      console.error('❌ [CPF_EDIT] Save error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/admin/cpf-view/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-muted-foreground">Carregando dados do CPF...</p>
      </div>
    );
  }

  if (!cpf) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">CPF não encontrado</p>
        <Button onClick={() => navigate('/dashboard/admin/base-cpf')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/dashboard/admin/cpf-view/${id}`)}
        >
          <Eye className="h-4 w-4" />
          Visualizar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar CPF</h1>
          <p className="text-muted-foreground">
            Edite as informações do CPF {cpf.cpf}
          </p>
        </div>
      </div>

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
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Básicos
            </CardTitle>
            <CardDescription>
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
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  value={dadosBasicos.data_nascimento || ''}
                  onChange={(e) => handleInputChange('data_nascimento', formatDateOfBirth(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
              </div>

              <div>
                <Label htmlFor="sexo">Sexo</Label>
                <Select 
                  value={dadosBasicos.sexo || ''} 
                  onValueChange={(value) => handleInputChange('sexo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="situacao_cpf">Situação CPF</Label>
                <Select 
                  value={dadosBasicos.situacao_cpf || ''} 
                  onValueChange={(value) => handleInputChange('situacao_cpf', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar situação" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUACAO_CPF_OPTIONS.map((situacao) => (
                      <SelectItem key={situacao} value={situacao}>
                        {situacao}
                      </SelectItem>
                    ))}
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
                />
              </div>

              <div>
                <Label htmlFor="pai">Nome do Pai</Label>
                <Input
                  id="pai"
                  value={dadosBasicos.pai || ''}
                  onChange={(e) => handleInputChange('pai', e.target.value)}
                  placeholder="Nome do pai"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receita Federal */}
        <BaseReceitaFormSection
          data={receitaData}
          onChange={handleReceitaChange}
          mode="edit"
        />

        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Informações complementares pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input
                  id="naturalidade"
                  value={dadosBasicos.naturalidade || ''}
                  onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                  placeholder="Cidade de nascimento"
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
                  onValueChange={(value) => handleInputChange('cor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cor/raça" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Branca">Branca</SelectItem>
                    <SelectItem value="Preta">Preta</SelectItem>
                    <SelectItem value="Parda">Parda</SelectItem>
                    <SelectItem value="Amarela">Amarela</SelectItem>
                    <SelectItem value="Indígena">Indígena</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <Select 
                  value={dadosBasicos.escolaridade || ''} 
                  onValueChange={(value) => handleInputChange('escolaridade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar escolaridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fundamental Incompleto">Fundamental Incompleto</SelectItem>
                    <SelectItem value="Fundamental Completo">Fundamental Completo</SelectItem>
                    <SelectItem value="Médio Incompleto">Médio Incompleto</SelectItem>
                    <SelectItem value="Médio Completo">Médio Completo</SelectItem>
                    <SelectItem value="Superior Incompleto">Superior Incompleto</SelectItem>
                    <SelectItem value="Superior Completo">Superior Completo</SelectItem>
                    <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <Select 
                  value={dadosBasicos.estado_civil || ''} 
                  onValueChange={(value) => handleInputChange('estado_civil', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                    <SelectItem value="Separado">Separado</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                    <SelectItem value="Viúvo">Viúvo</SelectItem>
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
                <Label htmlFor="tipo_emprego">Tipo de Emprego</Label>
                <Input
                  id="tipo_emprego"
                  value={dadosBasicos.tipo_emprego || ''}
                  onChange={(e) => handleInputChange('tipo_emprego', e.target.value)}
                  placeholder="Tipo de emprego"
                />
              </div>

              <div>
                <Label htmlFor="cbo">CBO</Label>
                <Input
                  id="cbo"
                  value={dadosBasicos.cbo || ''}
                  onChange={(e) => handleInputChange('cbo', e.target.value)}
                  placeholder="Código Brasileiro de Ocupações"
                />
              </div>

              <div>
                <Label htmlFor="data_obito">Data de Óbito</Label>
                <Input
                  id="data_obito"
                  value={dadosBasicos.data_obito || ''}
                  onChange={(e) => handleInputChange('data_obito', formatDateOfBirth(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Título de Eleitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Título de Eleitor
            </CardTitle>
            <CardDescription>
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
                  onChange={(e) => handleInputChange('titulo_eleitor', e.target.value)}
                  placeholder="Número do título"
                />
              </div>

              <div>
                <Label htmlFor="zona">Zona</Label>
                <Input
                  id="zona"
                  value={dadosBasicos.zona || ''}
                  onChange={(e) => handleInputChange('zona', e.target.value)}
                  placeholder="Zona"
                />
              </div>

              <div>
                <Label htmlFor="secao">Seção</Label>
                <Input
                  id="secao"
                  value={dadosBasicos.secao || ''}
                  onChange={(e) => handleInputChange('secao', e.target.value)}
                  placeholder="Seção"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Financeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados Financeiros
            </CardTitle>
            <CardDescription>
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
                />
              </div>

              <div>
                <Label htmlFor="renda">Renda</Label>
                <Input
                  id="renda"
                  value={dadosBasicos.renda || ''}
                  onChange={(e) => handleInputChange('renda', e.target.value)}
                  placeholder="Renda mensal"
                />
              </div>

              <div>
                <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
                <Input
                  id="fx_poder_aquisitivo"
                  value={dadosBasicos.fx_poder_aquisitivo || ''}
                  onChange={(e) => handleInputChange('fx_poder_aquisitivo', e.target.value)}
                  placeholder="Faixa de poder aquisitivo"
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
                />
              </div>

              <div>
                <Label htmlFor="csb8_faixa">Faixa CSB8</Label>
                <Input
                  id="csb8_faixa"
                  value={dadosBasicos.csb8_faixa || ''}
                  onChange={(e) => handleInputChange('csb8_faixa', e.target.value)}
                  placeholder="Faixa CSB8"
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
                />
              </div>

              <div>
                <Label htmlFor="csba_faixa">Faixa CSBA</Label>
                <Input
                  id="csba_faixa"
                  value={dadosBasicos.csba_faixa || ''}
                  onChange={(e) => handleInputChange('csba_faixa', e.target.value)}
                  placeholder="Faixa CSBA"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parentes */}
        <ParenteForm
          parentes={parentesData}
          onChange={(parentes) => setParentesData(parentes)}
        />

        {/* Telefones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Telefones
            </CardTitle>
            <CardDescription>
              Gerenciar telefones cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {telefonesData.length > 0 ? (
              <div className="space-y-2">
                {telefonesData.map((telefone, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <p className="font-medium">{formatPhone(`${telefone.ddd || ''}${telefone.telefone || ''}`)}</p>
                    <p className="text-sm text-muted-foreground">{telefone.tipo_texto}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum telefone adicional cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Emails
            </CardTitle>
            <CardDescription>
              Gerenciar emails cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailsData.length > 0 ? (
              <div className="space-y-2">
                {emailsData.map((email, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <p className="font-medium">{email.email}</p>
                    <p className="text-sm text-muted-foreground">{email.tipo}</p>
                    {email.observacao && <p className="text-sm">{email.observacao}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum email adicional cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Endereços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereços
            </CardTitle>
            <CardDescription>
              Gerenciar endereços cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enderecosData.length > 0 ? (
              <div className="space-y-2">
                {enderecosData.map((endereco, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <p className="font-medium">{endereco.logradouro}, {endereco.numero}</p>
                    {endereco.complemento && <p className="text-sm">{endereco.complemento}</p>}
                    <p className="text-sm text-muted-foreground">
                      {endereco.bairro} - {endereco.cidade}/{endereco.uf} - CEP: {endereco.cep}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum endereço adicional cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Credilink */}
        <CreditinkForm
          creditinkData={creditinkData}
          onInputChange={(field, value) => setCreditinkData(prev => ({ ...prev, [field]: value }))}
        />

        {/* Vacinas */}
        <VacinaSection
          vacinas={vacinasData}
          onChange={(vacinas) => setVacinasData(vacinas)}
        />

        {/* Botões de ação */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CpfEdit;