
// User query service
import { getMySQLConnection } from './mysqlSimulator';
import { getDatabaseConfig } from './config';
import { User } from './types';

export const userQueries = {
  async getUserById(id: number): Promise<User | null> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        return users.find((u: any) => u.id === id) || null;
      }

      const result = await mysql.query('SELECT * FROM users WHERE id = ?', [id]);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        return users.find((u: any) => u.email === email) || null;
      }

      const result = await mysql.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  },

  async getUserByLogin(login: string): Promise<User | null> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        return users.find((u: any) => u.login === login) || null;
      }

      const result = await mysql.query('SELECT * FROM users WHERE login = ?', [login]);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário por login:', error);
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        return JSON.parse(localStorage.getItem('system_users') || '[]');
      }

      const result = await mysql.query('SELECT * FROM users ORDER BY created_at DESC');
      
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  async checkCpfExists(cpf: string, excludeUserId?: number): Promise<boolean> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        return users.some((u: any) => u.cpf === cpf && u.id !== excludeUserId);
      }

      let query = 'SELECT id FROM users WHERE cpf = ?';
      const params = [cpf];
      
      if (excludeUserId) {
        query += ' AND id != ?';
        params.push(excludeUserId.toString());
      }

      const result = await mysql.query(query, params);
      return result.success && result.data && result.data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    }
  },

  async checkCnpjExists(cnpj: string, excludeUserId?: number): Promise<boolean> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        return users.some((u: any) => u.cnpj === cnpj && u.id !== excludeUserId);
      }

      let query = 'SELECT id FROM users WHERE cnpj = ?';
      const params = [cnpj];
      
      if (excludeUserId) {
        query += ' AND id != ?';
        params.push(excludeUserId.toString());
      }

      const result = await mysql.query(query, params);
      return result.success && result.data && result.data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar CNPJ:', error);
      return false;
    }
  }
};
