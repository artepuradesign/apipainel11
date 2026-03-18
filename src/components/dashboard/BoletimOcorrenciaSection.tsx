import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Copy } from 'lucide-react';
import { baseBoletimOcorrenciaService, BaseBoletimOcorrencia } from '@/services/baseBoletimOcorrenciaService';
import { toast } from "sonner";

interface BoletimOcorrenciaSectionProps {
  cpfId: number;
}

const BoletimOcorrenciaSection: React.FC<BoletimOcorrenciaSectionProps> = ({ cpfId }) => {
  const [boletins, setBoletins] = useState<BaseBoletimOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoletins();
  }, [cpfId]);

  const loadBoletins = async () => {
    setLoading(true);
    try {
      const data = await baseBoletimOcorrenciaService.getByCpfId(cpfId);
      setBoletins(data);
    } catch (error) {
      console.error('Erro ao carregar boletins:', error);
      setBoletins([]);
    } finally {
      setLoading(false);
    }
  };

  const copyBoletinsData = () => {
    if (boletins.length === 0) return;
    
    const dados = boletins.map((boletim, idx) => 
      `Boletim ${idx + 1}:\n` +
      `Número BO: ${boletim.numero_bo || '-'}\n` +
      `Delegacia: ${boletim.delegacia || '-'}\n` +
      `Data: ${boletim.data_ocorrencia || '-'}\n` +
      `Tipo: ${boletim.tipo_ocorrencia || '-'}\n` +
      `Descrição: ${boletim.descricao || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de boletins copiados!');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <FileText className="h-5 w-5" />
            Boletim de Ocorrência
          </CardTitle>
          <CardDescription>Boletins de ocorrência registrados</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <FileText className="h-5 w-5" />
              Boletim de Ocorrência
            </CardTitle>
            {boletins.length > 0 && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {boletins.length}
              </div>
            )}
          </div>
          <div>
            <CardDescription>
              {boletins.length === 0 ? '' : `${boletins.length} boletim(ns) encontrado(s)`}
            </CardDescription>
          </div>
          {boletins.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={copyBoletinsData}
              className="h-8 w-8"
              title="Copiar dados da seção"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {boletins.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">Nenhum boletim de ocorrência registrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {boletins.map((boletim, index) => (
              <div key={boletim.id}>
                {index > 0 && <div className="border-t pt-3"></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`numero_${boletim.id}`}>Número BO</Label>
                    <Input
                      id={`numero_${boletim.id}`}
                      value={boletim.numero_bo || '-'}
                      disabled
                      className="bg-muted text-[14px] md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`delegacia_${boletim.id}`}>Delegacia</Label>
                    <Input
                      id={`delegacia_${boletim.id}`}
                      value={boletim.delegacia?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted uppercase text-[14px] md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`data_${boletim.id}`}>Data Ocorrência</Label>
                    <Input
                      id={`data_${boletim.id}`}
                      value={boletim.data_ocorrencia || '-'}
                      disabled
                      className="bg-muted text-[14px] md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`tipo_${boletim.id}`}>Tipo</Label>
                    <Input
                      id={`tipo_${boletim.id}`}
                      value={boletim.tipo_ocorrencia?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted uppercase text-[14px] md:text-sm"
                    />
                  </div>
                  
                  {boletim.descricao && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label htmlFor={`descricao_${boletim.id}`}>Descrição</Label>
                      <Input
                        id={`descricao_${boletim.id}`}
                        value={boletim.descricao || '-'}
                        disabled
                        className="bg-muted text-[14px] md:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BoletimOcorrenciaSection;
