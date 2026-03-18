
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlanManagement from './personalization/PlanManagement';
import ApiPanelManagement from './personalization/ApiPanelManagement';
import ApiModulesManagement from './personalization/ApiModulesManagement';
import { Settings, Layers, Package, Crown } from 'lucide-react';

const PersonalizationSettings = () => {
  const [activeTab, setActiveTab] = useState('paineis');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Personalização do Sistema
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure painéis, módulos e planos do seu sistema
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Settings className="h-3 w-3 mr-1" />
          API Externa
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paineis" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Painéis
          </TabsTrigger>
          <TabsTrigger value="modulos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Planos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paineis">
          <ApiPanelManagement />
        </TabsContent>

        <TabsContent value="modulos">
          <ApiModulesManagement />
        </TabsContent>

        <TabsContent value="planos">
          <PlanManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizationSettings;
