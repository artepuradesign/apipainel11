
// Authentication service
import { getMySQLConnection } from './mysqlSimulator';
import { getDatabaseConfig } from './config';
import { User } from './types';

export const authService = {
  async authenticate(usernameOrEmail: string, password: string): Promise<User | null> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        console.log('MySQL não conectado, usando dados do localStorage');
        // Fallback para localStorage se MySQL não estiver conectado
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const user = users.find((u: any) => 
          (u.login === usernameOrEmail || u.email === usernameOrEmail) && 
          u.senhaalfa === password
        );
        return user || null;
      }

      const result = await mysql.query(
        'SELECT * FROM users WHERE (login = ? OR email = ?) AND senhaalfa = ? AND status IN ("ativo", "pendente")',
        [usernameOrEmail, usernameOrEmail, password]
      );

      if (result.success && result.data && result.data.length > 0) {
        const user = result.data[0];
        
        // Atualizar último login
        await mysql.query(
          'UPDATE users SET ultimo_login = NOW() WHERE id = ?',
          [user.id]
        );

        return user;
      }

      return null;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return null;
    }
  }
};
