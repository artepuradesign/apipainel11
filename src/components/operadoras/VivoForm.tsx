import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2 } from 'lucide-react';

export interface CreateBaseVivo {
  cpf_id: number;
  cpf?: string;
  telefone?: string;
  data_primeira_recarga?: string;
  data_ultima_recarga?: string;
  plano?: string;
  numero?: string;
  uf?: string;
  tipo_pessoa?: string;
  data_instalacao?: string;
  telefone_anterior?: string;
  descricao_estado_linha?: string;
  descricao_produto?: string;
  nome_assinante?: string;
  descricao_email?: string;
  tipo_endereco?: string;
  data_vigencia_inclusao?: string;
  endereco?: string;
  numero_endereco?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  maior_atraso?: string;
  menor_atraso?: string;
  flag_divida?: string;
  ano_mes_contrato?: string;
  valor_fatura?: string;
}

interface VivoFormProps {
  data: Partial<CreateBaseVivo>[];
  onChange: (data: Partial<CreateBaseVivo>[]) => void;
}

const VivoForm: React.FC<VivoFormProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          Operadora Vivo
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Informações de linhas da operadora Vivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((vivo, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Linha {index + 1}</h4>
              {data.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = data.filter((_, i) => i !== index);
                    onChange(updated);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Nome do Assinante</Label>
                <Input
                  value={vivo.nome_assinante || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].nome_assinante = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Nome completo"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  value={vivo.cpf || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].cpf = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="000.000.000-00"
                  className="placeholder:text-sm"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={vivo.telefone || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].telefone = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label>Número da Linha</Label>
                <Input
                  value={vivo.numero || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].numero = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label>Plano</Label>
                <Input
                  value={vivo.plano || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].plano = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Tipo de plano"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Tipo de Pessoa</Label>
                <Select 
                  value={vivo.tipo_pessoa || ''} 
                  onValueChange={(value) => {
                    const updated = [...data];
                    updated[index].tipo_pessoa = value;
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Física">Pessoa Física</SelectItem>
                    <SelectItem value="Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  value={vivo.uf || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].uf = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="SP"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Data de Instalação</Label>
                <Input
                  type="date"
                  value={vivo.data_instalacao || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].data_instalacao = e.target.value;
                    onChange(updated);
                  }}
                />
              </div>
              <div>
                <Label>Primeira Recarga</Label>
                <Input
                  type="date"
                  value={vivo.data_primeira_recarga || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].data_primeira_recarga = e.target.value;
                    onChange(updated);
                  }}
                />
              </div>
              <div>
                <Label>Última Recarga</Label>
                <Input
                  type="date"
                  value={vivo.data_ultima_recarga || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].data_ultima_recarga = e.target.value;
                    onChange(updated);
                  }}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={vivo.descricao_email || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].descricao_email = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label>Estado da Linha</Label>
                <Input
                  value={vivo.descricao_estado_linha || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].descricao_estado_linha = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Ativa, Suspensa"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  value={vivo.endereco || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].endereco = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Rua, Avenida"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={vivo.numero_endereco || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].numero_endereco = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="123"
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  value={vivo.bairro || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].bairro = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Nome do bairro"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>CEP</Label>
                <Input
                  value={vivo.cep || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].cep = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <Label>Valor da Fatura</Label>
                <Input
                  value={vivo.valor_fatura || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].valor_fatura = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label>Flag Dívida</Label>
                <Select 
                  value={vivo.flag_divida || ''} 
                  onValueChange={(value) => {
                    const updated = [...data];
                    updated[index].flag_divida = value;
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </React.Fragment>
        ))}
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            onChange([...data, {
              cpf_id: 0,
              cpf: '',
              telefone: '',
              nome_assinante: '',
              plano: '',
              numero: '',
              uf: '',
              tipo_pessoa: ''
            }]);
          }}
          className="w-full sm:w-auto mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
};

export default VivoForm;
