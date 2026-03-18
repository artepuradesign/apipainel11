import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, QrCode, CheckCircle, AlertCircle, Receipt, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDataApi } from "@/hooks/useUserDataApi";
import { useNavigate } from "react-router-dom";
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

interface PixPaymentData {
  payerFirstName: string;
  payerLastName: string;
  email: string;
  identificationType: string;
  identificationNumber: string;
  transactionAmount: string;
  description: string;
}

interface PixResponse {
  success: boolean;
  order_id?: string;
  status?: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  payment_id?: string;
  message?: string;
}

const MercadoPago: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userData, isLoading: loadingUserData } = useUserDataApi();
  const [loading, setLoading] = useState(false);
  const [loadingDocTypes, setLoadingDocTypes] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Array<{id: string, name: string}>>([]);
  const [pixResponse, setPixResponse] = useState<PixResponse | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  const [formData, setFormData] = useState<PixPaymentData>({
    payerFirstName: '',
    payerLastName: '',
    email: '',
    identificationType: 'CPF',
    identificationNumber: '',
    transactionAmount: '100.00',
    description: 'Recarga PIX'
  });

  // Auto-preencher dados do usuário
  useEffect(() => {
    if (userData) {
      const fullName = userData.full_name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        payerFirstName: firstName.toUpperCase(),
        payerLastName: lastName.toUpperCase(),
        email: userData.email?.toLowerCase() || '',
        identificationType: userData.cpf ? 'CPF' : 'CPF',
        identificationNumber: userData.cpf ? userData.cpf.replace(/\D/g, '') : ''
      }));
    }
  }, [userData]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!pixResponse?.payment_id || pixResponse?.status === 'approved') {
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/mercadopago/check-payment-status-live.php?payment_id=${pixResponse.payment_id}`
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const newStatus = data.data.status;
            
            if (newStatus === 'approved' && pixResponse.status !== 'approved') {
              setPixResponse(prev => prev ? { ...prev, status: 'approved' } : null);
              
              toast.success('🎉 Pagamento Aprovado!', {
                description: 'Seu saldo foi creditado com sucesso.',
                duration: 3000,
              });
              
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            } else if (newStatus !== pixResponse.status) {
              setPixResponse(prev => prev ? { ...prev, status: newStatus } : null);
              
              if (newStatus === 'rejected') {
                toast.error('Pagamento rejeitado', {
                  description: 'O pagamento não foi aprovado.'
                });
              } else if (newStatus === 'cancelled') {
                toast.warning('Pagamento cancelado');
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    const interval = setInterval(checkPaymentStatus, 3000);
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [pixResponse?.payment_id, pixResponse?.status]);

  const API_BASE_URL = 'https://api.artepuradesign.com.br';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toLowerCase()
      }));
    } else if (name === 'identificationNumber') {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = formData.identificationType === 'CPF' ? 11 : 14;
      setFormData(prev => ({
        ...prev,
        [name]: numericValue.substring(0, maxLength)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      identificationType: value
    }));
  };

  const loadDocumentTypes = async () => {
    setLoadingDocTypes(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mercadopago/document-types.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar tipos de documento');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setDocumentTypes(data.data);
        toast.success('Tipos de documento carregados!');
      } else {
        setDocumentTypes([
          { id: 'CPF', name: 'CPF' },
          { id: 'CNPJ', name: 'CNPJ' }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de documento:', error);
      toast.error('Erro ao carregar tipos de documento');
      setDocumentTypes([
        { id: 'CPF', name: 'CPF' },
        { id: 'CNPJ', name: 'CNPJ' }
      ]);
    } finally {
      setLoadingDocTypes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPixResponse(null);

    try {
      if (!formData.payerFirstName || !formData.payerLastName || !formData.email) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const fullName = `${formData.payerFirstName} ${formData.payerLastName}`.trim();
      
      const paymentData = {
        ...formData,
        payer_name: fullName,
        user_id: user?.id || null
      };

      const response = await fetch(`${API_BASE_URL}/mercadopago/create-pix-payment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Endpoint não configurado no servidor', {
            description: 'O arquivo create-pix-payment.php não está disponível'
          });
        } else {
          toast.error(responseData.message || 'Erro ao processar pagamento');
        }
        return;
      }

      if (responseData.success && responseData.data) {
        let finalPaymentId = responseData.data.payment_id;
        
        if (responseData.data.ticket_url) {
          const match = responseData.data.ticket_url.match(/\/payments\/(\d+)\//);
          if (match) {
            finalPaymentId = match[1];
          }
        }
        
        const finalResponse = {
          ...responseData.data,
          payment_id: finalPaymentId
        };
        
        setPixResponse(finalResponse as PixResponse);
        toast.success('QR Code PIX gerado com sucesso!', {
          description: 'Escaneie o código ou use o PIX Copia e Cola para realizar o pagamento.',
          duration: 5000,
        });
      } else {
        toast.error(responseData.message || 'Erro ao gerar pagamento PIX');
      }
    } catch (error) {
      console.error('Erro ao gerar pagamento:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mercadopago/test-credentials.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao testar credenciais');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Credenciais válidas! ✓', {
          description: `Ambiente: ${data.environment || 'N/A'}`
        });
      } else {
        toast.error('Credenciais inválidas', {
          description: data.message
        });
      }
    } catch (error) {
      console.error('Erro ao testar credenciais:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <DashboardTitleCard
        title="Mercado Pago"
        subtitle="Integração PIX com Mercado Pago"
        icon={<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard"
      />

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Formulário de Pagamento */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Dados do Pagamento</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preencha os dados para gerar um pagamento PIX
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payerFirstName" className="text-xs sm:text-sm">Nome *</Label>
                  <Input
                    id="payerFirstName"
                    name="payerFirstName"
                    value={formData.payerFirstName}
                    onChange={handleInputChange}
                    placeholder="JOÃO"
                    required
                    className="uppercase text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payerLastName" className="text-xs sm:text-sm">Sobrenome *</Label>
                  <Input
                    id="payerLastName"
                    name="payerLastName"
                    value={formData.payerLastName}
                    onChange={handleInputChange}
                    placeholder="SILVA"
                    required
                    className="uppercase text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="teste@email.com"
                  required
                  className="lowercase text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="identificationType" className="text-xs sm:text-sm">Tipo de Documento</Label>
                  <Select 
                    value={formData.identificationType} 
                    onValueChange={handleSelectChange}
                    disabled={!!userData?.cpf}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.length > 0 ? (
                        documentTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="CPF">CPF</SelectItem>
                          <SelectItem value="CNPJ">CNPJ</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {userData?.cpf && (
                    <p className="text-xs text-muted-foreground">CPF já cadastrado</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationNumber" className="text-xs sm:text-sm">
                    Número ({formData.identificationType === 'CPF' ? '11 dígitos' : '14 dígitos'})
                  </Label>
                  <Input
                    id="identificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleInputChange}
                    placeholder={formData.identificationType === 'CPF' ? '12345678900' : '12345678000100'}
                    disabled={!!userData?.cpf}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionAmount" className="text-xs sm:text-sm">Valor (R$) *</Label>
                  <Input
                    id="transactionAmount"
                    name="transactionAmount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.transactionAmount}
                    onChange={handleInputChange}
                    placeholder="100.00"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs sm:text-sm">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Recarga PIX"
                    className="text-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Gerar QR Code PIX
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* QR Code e Status */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">QR Code PIX</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {pixResponse ? 'Escaneie o código para pagar' : 'Aguardando geração do pagamento'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {pixResponse ? (
              <div className="space-y-4">
                {/* Status do Pagamento */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-xs sm:text-sm font-medium">Status:</span>
                  <Badge 
                    variant={pixResponse.status === 'approved' ? 'default' : 'secondary'}
                    className={`text-xs ${pixResponse.status === 'approved' ? 'bg-green-500' : ''}`}
                  >
                    {pixResponse.status === 'approved' ? 'Aprovado' : 
                     pixResponse.status === 'pending' ? 'Aguardando Pagamento' :
                     pixResponse.status === 'rejected' ? 'Rejeitado' : pixResponse.status}
                  </Badge>
                </div>

                {/* QR Code */}
                {pixResponse.qr_code_base64 && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img 
                      src={`data:image/png;base64,${pixResponse.qr_code_base64}`} 
                      alt="QR Code PIX"
                      className="w-48 h-48 sm:w-64 sm:h-64"
                    />
                  </div>
                )}

                {/* PIX Copia e Cola */}
                {pixResponse.qr_code && (
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">PIX Copia e Cola:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={pixResponse.qr_code} 
                        readOnly 
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(pixResponse.qr_code || '');
                          toast.success('Código copiado!');
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Informações do Pagamento */}
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  {pixResponse.payment_id && (
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <p className="font-mono">{pixResponse.payment_id}</p>
                    </div>
                  )}
                  {pixResponse.order_id && (
                    <div>
                      <span className="text-muted-foreground">Pedido:</span>
                      <p className="font-mono">{pixResponse.order_id}</p>
                    </div>
                  )}
                </div>

                {pixResponse.status === 'approved' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Pagamento confirmado! Redirecionando...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <QrCode className="h-16 w-16 sm:h-24 sm:w-24 mb-4 opacity-30" />
                <p className="text-xs sm:text-sm text-center">
                  Preencha os dados e clique em "Gerar QR Code PIX"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Ações</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={testCredentials}
              disabled={loading}
              size="sm"
              className="w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Testar Credenciais
            </Button>
            <Button
              variant="outline"
              onClick={loadDocumentTypes}
              disabled={loadingDocTypes}
              size="sm"
              className="w-full sm:w-auto"
            >
              {loadingDocTypes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar Tipos de Documento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MercadoPago;
