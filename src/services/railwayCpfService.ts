/**
 * Serviço para enviar CPF para o Railway (cpf-telegram)
 * Endpoint: https://cpf-telegram-production.up.railway.app/cpf
 */

import { getFullApiUrl } from '@/utils/apiHelper';

// Usar URL ABSOLUTA da API para funcionar em produção e no build
// Roteador do backend aceita a versão sem .php
const RAILWAY_API_URL = getFullApiUrl('/n8n/railway-send-cpf');

export const railwayCpfService = {
  /**
   * Envia CPF para consulta no sistema Railway
   * @param cpf CPF sem formatação (11 dígitos)
   */
  async enviarCpf(cpf: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🚂 [RAILWAY] Enviando CPF:', cpf);
      console.log('🌐 [RAILWAY] URL:', RAILWAY_API_URL);
      
      const response = await fetch(RAILWAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ cpf })
      });

      console.log('📊 [RAILWAY] Status da resposta:', response.status);
      
      // Ler resposta como texto primeiro
      const rawText = await response.text();
      const contentType = response.headers.get('content-type') || '';
      console.log('📄 [RAILWAY] Resposta raw (primeiros 200 caracteres):', rawText.substring(0, 200));
      console.log('📄 [RAILWAY] Content-Type:', contentType);
      
      // Tentar parsear como JSON, com fallback para extração
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        const sample = rawText.trim().substring(0, 400);
        // HTML ou página de erro
        if (sample.startsWith('<') || sample.includes('<!DOCTYPE') || contentType.includes('text/html')) {
          return {
            success: false,
            error: 'Serviço externo indisponível no momento. Tente novamente em instantes.'
          };
        }
        
        // Fallback: tentar extrair JSON no final da resposta
        const jsonMatch = rawText.match(/\{[\s\S]*\}$/);

        // Se HTTP estiver OK e não parecer HTML, tratar como sucesso mesmo sem JSON válido
        if (response.ok && !(sample.startsWith('<') || sample.includes('<!DOCTYPE') || contentType.includes('text/html'))) {
          console.warn('⚠️ [RAILWAY] Resposta não JSON mas HTTP OK. Prosseguindo como sucesso otimista.');
          return { success: true, message: 'Solicitação enviada' };
        }

        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error('❌ [RAILWAY] Falha ao extrair JSON:', extractError);
            return {
              success: false,
              error: 'Falha na comunicação com o serviço externo. Tente novamente.'
            };
          }
        } else {
          return {
            success: false,
            error: 'Falha na comunicação com o serviço externo. Tente novamente.'
          };
        }
      }
      
      console.log('📊 [RAILWAY] Resposta parseada:', data);
      
      if (response.ok && (data?.success || data?.status === 'enviado')) {
        return { success: true, message: data.message || 'CPF enviado' };
      }
      
      const errMsg = (typeof data === 'object' && data?.error) 
        ? data.error 
        : `Falha ao enviar CPF (HTTP ${response.status})`;
      return { success: false, error: errMsg };
      
    } catch (error: any) {
      console.error('❌ [RAILWAY] Erro:', error);
      return { success: false, error: error.message || 'Erro de conexão' };
    }
  },
};
