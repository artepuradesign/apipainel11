import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PhotoTester = () => {
  const testPhotoUrl = 'https://api.apipainel.com.br/fotos/80136494315.jpg';
  const testPhoto2Url = 'https://api.apipainel.com.br/fotos/80136494315_.jpg';

  const testDirectAccess = async (url: string, name: string) => {
    try {
      console.log(`🧪 Testando acesso à ${name}:`, url);
      
      // Testar sem autenticação primeiro
      const response1 = await fetch(url, { 
        method: 'HEAD'
      });
      
      console.log(`📊 ${name} - Sem auth - Status:`, response1.status);
      console.log(`📊 ${name} - Sem auth - Headers:`, Object.fromEntries(response1.headers.entries()));
      
      // Testar com autenticação
      const token = localStorage.getItem('token');
      console.log(`🔑 Token presente:`, !!token);
      
      if (token) {
        const response2 = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`📊 ${name} - Com auth - Status:`, response2.status);
        console.log(`📊 ${name} - Com auth - Headers:`, Object.fromEntries(response2.headers.entries()));
      }
      
    } catch (error) {
      console.error(`❌ Erro ao testar ${name}:`, error);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Teste de Fotos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={() => testDirectAccess(testPhotoUrl, 'Foto 1')}
            className="w-full"
          >
            Testar Foto 1 (80136494315.jpg)
          </Button>
          
          <Button 
            onClick={() => testDirectAccess(testPhoto2Url, 'Foto 2')}
            className="w-full"
          >
            Testar Foto 2 (80136494315_.jpg)
          </Button>
          
          <Button 
            onClick={() => testDirectAccess('https://api.artepuradesign.com.br/', 'API Root')}
            className="w-full"
            variant="outline"
          >
            Testar API Root
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Preview das fotos:</p>
          
          {/* Teste com AuthenticatedImage */}
          <div className="border rounded p-2">
            <p className="text-xs mb-2">AuthenticatedImage (foto 1):</p>
            <div className="h-32 bg-muted rounded">
              <img 
                src={`data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">
                    <rect width="200" height="100" fill="#f0f0f0"/>
                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="12" fill="#666">
                      Placeholder - Testando
                    </text>
                  </svg>
                `)}`}
                alt="Placeholder"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Teste com img simples */}
          <div className="border rounded p-2">
            <p className="text-xs mb-2">IMG simples (sem auth):</p>
            <img 
              src={testPhotoUrl}
              alt="Teste foto 1"
              className="w-full h-32 object-cover"
              onLoad={() => console.log('✅ IMG: Foto 1 carregada')}
              onError={() => console.log('❌ IMG: Erro ao carregar foto 1')}
            />
          </div>

          <div className="border rounded p-2">
            <p className="text-xs mb-2">IMG simples (foto 2, sem auth):</p>
            <img 
              src={testPhoto2Url}
              alt="Teste foto 2"
              className="w-full h-32 object-cover"
              onLoad={() => console.log('✅ IMG: Foto 2 carregada')}
              onError={() => console.log('❌ IMG: Erro ao carregar foto 2')}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>URLs testadas:</strong></p>
          <p>Foto 1: {testPhotoUrl}</p>
          <p>Foto 2: {testPhoto2Url}</p>
          <p><strong>Possíveis problemas:</strong></p>
          <p>• As fotos não existem fisicamente no servidor</p>
          <p>• Problemas de autenticação (endpoint protegido)</p>
          <p>• Configuração incorreta do .htaccess</p>
          <p>• Problemas de CORS</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoTester;