
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye } from 'lucide-react';
import { useActivities } from './activity/useActivities';
import ActivityList from './activity/ActivityList';

const AdminActivityTabs: React.FC = () => {
  const { activities, filterActivities } = useActivities();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Atividade em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="new_user">Cadastros</TabsTrigger>
            <TabsTrigger value="consultation">Consultas</TabsTrigger>
            <TabsTrigger value="recharge">Recargas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ActivityList activities={activities} />
          </TabsContent>

          <TabsContent value="new_user" className="mt-4">
            <ActivityList activities={filterActivities('new_user')} />
          </TabsContent>

          <TabsContent value="consultation" className="mt-4">
            <ActivityList activities={filterActivities('consultation')} />
          </TabsContent>

          <TabsContent value="recharge" className="mt-4">
            <ActivityList activities={filterActivities('recharge')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminActivityTabs;
