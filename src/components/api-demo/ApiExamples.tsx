
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CpfApiExample from './CpfApiExample';
import CnpjApiExample from './CnpjApiExample';

const ApiExamples = () => {
  const [activeTab, setActiveTab] = useState('cpf');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-none"
    >
      <h3 className="text-2xl font-bold dashboard-text-primary mb-6">Exemplos de Requisições</h3>
      
      <div className="dashboard-card rounded-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="dashboard-border border-b p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cpf" className="text-sm">Consulta CPF</TabsTrigger>
              <TabsTrigger value="cnpj" className="text-sm">Consulta CNPJ</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <div className="w-full overflow-hidden">
              <TabsContent value="cpf" className="mt-0 w-full">
                <div className="w-full max-w-none overflow-x-auto">
                  <CpfApiExample />
                </div>
              </TabsContent>
              
              <TabsContent value="cnpj" className="mt-0 w-full">
                <div className="w-full max-w-none overflow-x-auto">
                  <CnpjApiExample />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ApiExamples;
