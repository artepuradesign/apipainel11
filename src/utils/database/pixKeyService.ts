
// Serviço para gerenciar chaves PIX
import { getMySQLConnection } from './mysqlSimulator';
import { getDatabaseConfig } from './config';

export interface PixKey {
  id: number;
  user_id: number;
  chave_pix: string;
  tipo_chave: 'cpf' | 'cnpj' | 'email' | 'telefone';
  is_primary: boolean;
  status: 'ativa' | 'inativa';
  criado_em: string;
  atualizado_em: string;
}

export const pixKeyService = {
  async getPixKeysByUserId(userId: number): Promise<PixKey[]> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const keys = JSON.parse(localStorage.getItem(`pix_keys_user_${userId}`) || '[]');
        return keys;
      }

      const result = await mysql.query(
        'SELECT * FROM pix_keys WHERE user_id = ? AND status = "ativa" ORDER BY is_primary DESC, criado_em ASC',
        [userId]
      );

      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error('Erro ao buscar chaves PIX:', error);
      return [];
    }
  },

  async validatePixKey(chave: string, tipo: 'cpf' | 'cnpj' | 'email' | 'telefone', userCpf: string, userCnpj?: string): Promise<{ valid: boolean; message?: string }> {
    // Validar formato da chave
    switch (tipo) {
      case 'cpf':
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        if (!cpfRegex.test(chave)) {
          return { valid: false, message: 'CPF deve estar no formato 000.000.000-00' };
        }
        if (chave !== userCpf) {
          return { valid: false, message: 'A chave PIX CPF deve ser igual ao CPF cadastrado na conta' };
        }
        break;
      case 'cnpj':
        const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        if (!cnpjRegex.test(chave)) {
          return { valid: false, message: 'CNPJ deve estar no formato 00.000.000/0000-00' };
        }
        if (!userCnpj) {
          return { valid: false, message: 'Você precisa ter um CNPJ cadastrado para usar chave PIX CNPJ' };
        }
        if (chave !== userCnpj) {
          return { valid: false, message: 'A chave PIX CNPJ deve ser igual ao CNPJ cadastrado na conta' };
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(chave)) {
          return { valid: false, message: 'Email deve ter um formato válido' };
        }
        break;
      case 'telefone':
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!phoneRegex.test(chave)) {
          return { valid: false, message: 'Telefone deve estar no formato (11) 99999-9999' };
        }
        break;
      default:
        return { valid: false, message: 'Tipo de chave inválido' };
    }

    // Verificar se a chave já existe para outro usuário
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (mysql.isConnected()) {
        const result = await mysql.query(
          'SELECT user_id FROM pix_keys WHERE chave_pix = ? AND status = "ativa"',
          [chave]
        );
        
        if (result.success && result.data && result.data.length > 0) {
          return { valid: false, message: 'Esta chave PIX já está cadastrada por outro usuário' };
        }
      }
    } catch (error) {
      console.error('Erro ao validar chave PIX:', error);
    }

    return { valid: true };
  },

  async addPixKey(userId: number, chave: string, tipo: 'cpf' | 'cnpj' | 'email' | 'telefone', userCpf: string, userCnpj?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se o usuário já tem 3 chaves
      const existingKeys = await this.getPixKeysByUserId(userId);
      if (existingKeys.length >= 3) {
        return { success: false, message: 'Limite máximo de 3 chaves PIX atingido' };
      }

      // Validar a chave
      const validation = await this.validatePixKey(chave, tipo, userCpf, userCnpj);
      if (!validation.valid) {
        return { success: false, message: validation.message || 'Chave PIX inválida' };
      }

      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        // Fallback para localStorage
        const newKey: PixKey = {
          id: Date.now(),
          user_id: userId,
          chave_pix: chave,
          tipo_chave: tipo,
          is_primary: existingKeys.length === 0,
          status: 'ativa',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };
        
        existingKeys.push(newKey);
        localStorage.setItem(`pix_keys_user_${userId}`, JSON.stringify(existingKeys));
        return { success: true, message: 'Chave PIX adicionada com sucesso!' };
      }

      const isPrimary = existingKeys.length === 0 ? 1 : 0;
      const result = await mysql.query(
        'INSERT INTO pix_keys (user_id, chave_pix, tipo_chave, is_primary) VALUES (?, ?, ?, ?)',
        [userId, chave, tipo, isPrimary]
      );

      if (result.success) {
        return { success: true, message: 'Chave PIX adicionada com sucesso!' };
      }

      return { success: false, message: 'Erro ao salvar chave PIX' };
    } catch (error) {
      console.error('Erro ao adicionar chave PIX:', error);
      return { success: false, message: 'Erro interno ao adicionar chave PIX' };
    }
  },

  async removePixKey(keyId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        // Fallback para localStorage
        const keys = JSON.parse(localStorage.getItem(`pix_keys_user_${userId}`) || '[]');
        const filteredKeys = keys.filter((key: PixKey) => key.id !== keyId);
        localStorage.setItem(`pix_keys_user_${userId}`, JSON.stringify(filteredKeys));
        return { success: true, message: 'Chave PIX removida com sucesso!' };
      }

      const result = await mysql.query(
        'UPDATE pix_keys SET status = "inativa" WHERE id = ? AND user_id = ?',
        [keyId, userId]
      );

      if (result.success && result.affectedRows! > 0) {
        return { success: true, message: 'Chave PIX removida com sucesso!' };
      }

      return { success: false, message: 'Chave PIX não encontrada' };
    } catch (error) {
      console.error('Erro ao remover chave PIX:', error);
      return { success: false, message: 'Erro interno ao remover chave PIX' };
    }
  },

  async setPrimaryPixKey(keyId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        // Fallback para localStorage
        const keys = JSON.parse(localStorage.getItem(`pix_keys_user_${userId}`) || '[]');
        const updatedKeys = keys.map((key: PixKey) => ({
          ...key,
          is_primary: key.id === keyId
        }));
        localStorage.setItem(`pix_keys_user_${userId}`, JSON.stringify(updatedKeys));
        return { success: true, message: 'Chave PIX principal definida!' };
      }

      // Remover primary de todas as chaves do usuário
      await mysql.query(
        'UPDATE pix_keys SET is_primary = 0 WHERE user_id = ?',
        [userId]
      );

      // Definir a nova chave como primary
      const result = await mysql.query(
        'UPDATE pix_keys SET is_primary = 1 WHERE id = ? AND user_id = ?',
        [keyId, userId]
      );

      if (result.success && result.affectedRows! > 0) {
        return { success: true, message: 'Chave PIX principal definida!' };
      }

      return { success: false, message: 'Erro ao definir chave PIX principal' };
    } catch (error) {
      console.error('Erro ao definir chave PIX principal:', error);
      return { success: false, message: 'Erro interno ao definir chave PIX principal' };
    }
  }
};
