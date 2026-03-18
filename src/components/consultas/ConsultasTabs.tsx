
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CpfConsulta from './CpfConsulta';
import CnpjConsulta from './CnpjConsulta';
import VeiculosConsulta from './VeiculosConsulta';
import ScoreConsulta from './ScoreConsulta';

interface ConsultasTabsProps {
  onConsultaClick: (type: string) => void;
}

const ConsultasTabs = ({ onConsultaClick }: ConsultasTabsProps) => {
  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="cpf" className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="cpf" className="px-8 data-[state=active]:bg-brand-purple data-[state=active]:text-white">CPF</TabsTrigger>
              <TabsTrigger value="cnpj" className="px-8 data-[state=active]:bg-brand-purple data-[state=active]:text-white">CNPJ</TabsTrigger>
              <TabsTrigger value="veiculos" className="px-8 data-[state=active]:bg-brand-purple data-[state=active]:text-white">Veículos</TabsTrigger>
              <TabsTrigger value="score" className="px-8 data-[state=active]:bg-brand-purple data-[state=active]:text-white">Score</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="cpf">
            <CpfConsulta onConsultaClick={onConsultaClick} />
          </TabsContent>
          
          <TabsContent value="cnpj">
            <CnpjConsulta onConsultaClick={onConsultaClick} />
          </TabsContent>
          
          <TabsContent value="veiculos">
            <VeiculosConsulta onConsultaClick={onConsultaClick} />
          </TabsContent>
          
          <TabsContent value="score">
            <ScoreConsulta onConsultaClick={onConsultaClick} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ConsultasTabs;
