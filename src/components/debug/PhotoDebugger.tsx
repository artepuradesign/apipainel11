import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedImage from '@/components/ui/AuthenticatedImage';

const PhotoDebugger = () => {
  const [photoName, setPhotoName] = useState('80136494315.jpg');
  const [testUrl, setTestUrl] = useState('');

  const testPhotoUrl = `https://api.apipainel.com.br/fotos/${photoName}`;

  const testDirectAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token encontrado:', !!token);
      
      const response = await fetch(testUrl || testPhotoUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📸 Test response status:', response.status);
      console.log('📸 Test response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        console.log('✅ Foto acessível');
      } else {
        console.log('❌ Erro ao acessar foto:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Photo Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome da Foto:</label>
          <Input
            value={photoName}
            onChange={(e) => setPhotoName(e.target.value)}
            placeholder="Ex: 80136494315.jpg"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">URL de Teste (opcional):</label>
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="URL completa para testar"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={testDirectAccess}>
            Testar Acesso Direto
          </Button>
          <Button onClick={() => console.log('URL:', testUrl || testPhotoUrl)}>
            Log URL
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preview com AuthenticatedImage:</label>
          <div className="border rounded-lg overflow-hidden bg-muted">
            <AuthenticatedImage
              src={testUrl || testPhotoUrl}
              alt="Teste de foto"
              className="w-full h-64 object-cover"
              onLoad={() => console.log('✅ AuthenticatedImage: Foto carregada')}
              onError={() => console.log('❌ AuthenticatedImage: Erro ao carregar foto')}
              fallbackText="Foto não encontrada"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preview com IMG simples (sem auth):</label>
          <div className="border rounded-lg overflow-hidden bg-muted">
            <img
              src={testUrl || testPhotoUrl}
              alt="Teste de foto simples"
              className="w-full h-64 object-cover"
              onLoad={() => console.log('✅ IMG simples: Foto carregada')}
              onError={() => console.log('❌ IMG simples: Erro ao carregar foto')}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>URL de teste:</strong> {testUrl || testPhotoUrl}</p>
          <p><strong>Token presente:</strong> {localStorage.getItem('token') ? 'Sim' : 'Não'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoDebugger;