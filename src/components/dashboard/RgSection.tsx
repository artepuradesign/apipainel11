import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Copy } from 'lucide-react';
import { useBaseRg } from '@/hooks/useBaseRg';
import { BaseRg } from '@/services/baseRgService';
import { toast } from "sonner";

interface RgSectionProps {
  cpfId?: number;
}

const RgSection: React.FC<RgSectionProps> = ({ cpfId }) => {
  const { isLoading, getRgsByCpfId } = useBaseRg();
  const [rgs, setRgs] = useState<BaseRg[]>([]);

  useEffect(() => {
    const loadRgs = async () => {
      if (cpfId) {
        const result = await getRgsByCpfId(cpfId);
        if (result) {
          setRgs(result);
        }
      }
    };

    loadRgs();
  }, [cpfId, getRgsByCpfId]);

  const copyRgsData = () => {
    if (rgs.length === 0) return;
    
    const dados = rgs.map((rg, idx) => 
      `RG ${idx + 1}:\n` +
      `Número: ${rg.rg || '-'}\n` +
      `Órgão Expedidor: ${rg.orgao_expedidor || '-'}\n` +
      `UF: ${rg.uf_emissao || '-'}\n` +
      `Data Expedição: ${rg.dt_expedicao || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de RG copiados!');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <FileText className="h-5 w-5" />
            RG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Carregando documentos RG...</p>
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
              RG
            </CardTitle>
            {rgs.length > 0 && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {rgs.length}
              </div>
            )}
          </div>
          {rgs.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={copyRgsData}
              className="h-8 w-8"
              title="Copiar dados da seção"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {rgs.length > 0 ? (
          <div className="space-y-4">
            {rgs.map((rg, index) => (
              <div key={rg.id}>
                {index > 0 && <div className="border-t pt-3"></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`rg_${rg.id}`}>RG</Label>
                    <Input
                      id={`rg_${rg.id}`}
                      value={rg.rg || '-'}
                      disabled
                      className="bg-muted text-[14px] md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`orgao_${rg.id}`}>Órgão Expedidor</Label>
                    <Input
                      id={`orgao_${rg.id}`}
                      value={rg.orgao_expedidor?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted uppercase text-[14px] md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`uf_${rg.id}`}>UF Emissão</Label>
                    <Input
                      id={`uf_${rg.id}`}
                      value={rg.uf_emissao?.toUpperCase() || '-'}
                      disabled
                      className="bg-muted uppercase text-[14px] md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`data_${rg.id}`}>Data Expedição</Label>
                    <Input
                      id={`data_${rg.id}`}
                      value={rg.dt_expedicao || '-'}
                      disabled
                      className="bg-muted text-[14px] md:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">
              Nenhum documento RG detalhado encontrado para este CPF
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RgSection;
