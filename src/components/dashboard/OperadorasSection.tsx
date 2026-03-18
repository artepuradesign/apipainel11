import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone } from 'lucide-react';
import { baseVivoService, BaseVivo } from '@/services/baseVivoService';
import { baseClaroService, BaseClaro } from '@/services/baseClaroService';
import { baseTimService, BaseTim } from '@/services/baseTimService';
import { formatCpf, formatPhone } from '@/utils/formatters';

interface OperadorasSectionProps {
  cpfId: number;
}

const OperadorasSection: React.FC<OperadorasSectionProps> = ({ cpfId }) => {
  const [vivo, setVivo] = useState<BaseVivo[]>([]);
  const [claro, setClaro] = useState<BaseClaro[]>([]);
  const [tim, setTim] = useState<BaseTim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperadoras();
  }, [cpfId]);

  const loadOperadoras = async () => {
    setLoading(true);
    try {
      const [vivoResponse, claroResponse, timResponse] = await Promise.all([
        baseVivoService.getByCpfId(cpfId),
        baseClaroService.getByCpfId(cpfId),
        baseTimService.getByCpfId(cpfId)
      ]);
      
      setVivo(vivoResponse.success && vivoResponse.data ? vivoResponse.data : []);
      setClaro(claroResponse.success && claroResponse.data ? claroResponse.data : []);
      setTim(timResponse.success && timResponse.data ? timResponse.data : []);
    } catch (error) {
      console.error('Erro ao carregar operadoras:', error);
      setVivo([]);
      setClaro([]);
      setTim([]);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: any) => {
    const displayValue = value || '-';
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };

  const renderOperadoraData = (data: any[], operadora: string) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <Smartphone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm">Nenhum registro {operadora} encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((registro, index) => (
          <div key={registro.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
            {renderField('CPF', registro.cpf ? formatCpf(registro.cpf) : '-')}
            {renderField('Nome', registro.nome?.toUpperCase())}
            {renderField('Tipo Pessoa', registro.pessoa?.toUpperCase())}
            {renderField('DDD', registro.ddd)}
            {renderField('Telefone', registro.fone ? formatPhone(registro.fone) : '-')}
            {renderField('Instituição', registro.inst?.toUpperCase())}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Smartphone className="h-5 w-5" />
            Operadoras de Telefonia
          </CardTitle>
          <CardDescription>Carregando dados das operadoras...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRegistros = vivo.length + claro.length + tim.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <Smartphone className="h-5 w-5" />
          Operadoras de Telefonia
        </CardTitle>
        <CardDescription>
          {totalRegistros === 0 ? 'Nenhum registro encontrado' : `${totalRegistros} registro(s) encontrado(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vivo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vivo">
              Vivo ({vivo.length})
            </TabsTrigger>
            <TabsTrigger value="claro">
              Claro ({claro.length})
            </TabsTrigger>
            <TabsTrigger value="tim">
              TIM ({tim.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vivo" className="mt-4">
            {renderOperadoraData(vivo, 'Vivo')}
          </TabsContent>
          <TabsContent value="claro" className="mt-4">
            {renderOperadoraData(claro, 'Claro')}
          </TabsContent>
          <TabsContent value="tim" className="mt-4">
            {renderOperadoraData(tim, 'TIM')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OperadorasSection;
