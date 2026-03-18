
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Tablet, Plus, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Device {
  id: string;
  name: string;
  ip: string;
  type: 'desktop' | 'mobile' | 'tablet';
  lastAccess: string;
  active: boolean;
}

const CadastrarDispositivos = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'desktop' as const });
  const [currentIP, setCurrentIP] = useState('');
  const userPlan = localStorage.getItem("user_plan") || "Pré-Pago";
  
  // Check if user has King plan
  const isKingPlan = userPlan.includes('Rei');

  useEffect(() => {
    // Get current IP (simulated)
    setCurrentIP('192.168.1.' + Math.floor(Math.random() * 255));
    
    // Load devices from localStorage
    const savedDevices = localStorage.getItem('user_devices');
    if (savedDevices) {
      setDevices(JSON.parse(savedDevices));
    } else {
      // Add current device as first device
      const currentDevice: Device = {
        id: '1',
        name: 'Dispositivo Principal',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        type: 'desktop',
        lastAccess: new Date().toISOString(),
        active: true
      };
      setDevices([currentDevice]);
      localStorage.setItem('user_devices', JSON.stringify([currentDevice]));
    }
  }, []);

  const addDevice = () => {
    if (!newDevice.name.trim()) {
      toast.error("Digite um nome para o dispositivo");
      return;
    }

    if (devices.length >= 3) {
      toast.error("Máximo de 3 dispositivos permitidos");
      return;
    }

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      ip: currentIP,
      type: newDevice.type,
      lastAccess: new Date().toISOString(),
      active: true
    };

    const updatedDevices = [...devices, device];
    setDevices(updatedDevices);
    localStorage.setItem('user_devices', JSON.stringify(updatedDevices));
    
    setNewDevice({ name: '', type: 'desktop' });
    toast.success("Dispositivo adicionado com sucesso!");
  };

  const removeDevice = (deviceId: string) => {
    const updatedDevices = devices.filter(d => d.id !== deviceId);
    setDevices(updatedDevices);
    localStorage.setItem('user_devices', JSON.stringify(updatedDevices));
    toast.success("Dispositivo removido com sucesso!");
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (!isKingPlan) {
    return (
      <div className="space-y-6">
        <PageHeaderCard 
          title="Cadastrar Dispositivos" 
          subtitle="Gerencie os dispositivos autorizados para acesso"
        />
        
        <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Funcionalidade exclusiva para Planos Reis</strong>
            <br />
            Para cadastrar dispositivos adicionais, você precisa ter um plano Rei ativo.
            <br />
            <Button className="mt-2 bg-brand-purple hover:bg-brand-darkPurple" size="sm">
              Fazer Upgrade para Rei
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Cadastrar Dispositivos" 
        subtitle="Gerencie os dispositivos autorizados para acesso (máximo 3 dispositivos)"
      />

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Novo Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Nome do Dispositivo</Label>
              <Input
                id="device-name"
                placeholder="Ex: Notebook Pessoal"
                value={newDevice.name}
                onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-type">Tipo de Dispositivo</Label>
              <select
                id="device-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newDevice.type}
                onChange={(e) => setNewDevice({...newDevice, type: e.target.value as any})}
              >
                <option value="desktop">Desktop/Notebook</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>IP atual:</strong> {currentIP}
          </div>
          <Button
            onClick={addDevice}
            className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            disabled={devices.length >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Dispositivo ({devices.length}/3)
          </Button>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Dispositivos Autorizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getDeviceIcon(device.type)}
                      <span className="ml-2 font-medium">{device.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{device.ip}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {device.type === 'desktop' ? 'Desktop' : 
                       device.type === 'mobile' ? 'Mobile' : 'Tablet'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(device.lastAccess).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={device.active ? "bg-green-500" : "bg-red-500"}>
                      {device.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {device.id !== '1' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDevice(device.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança:</strong> Apenas dispositivos cadastrados poderão acessar sua conta.
          O dispositivo principal não pode ser removido por questões de segurança.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CadastrarDispositivos;
