// User management service
import { getMySQLConnection } from './mysqlSimulator';
import { getDatabaseConfig } from './config';
import { User, ServiceResponse } from './types';
import { userQueries } from './userQueries';

export const userManager = {
  async createUser(userData: Partial<User>): Promise<number | null> {
    try {
      // Verificar se CPF ou CNPJ já existe (se fornecido)
      if (userData.cpf) {
        const cpfExists = await userQueries.checkCpfExists(userData.cpf);
        if (cpfExists) {
          throw new Error('Este CPF já está cadastrado por outro usuário');
        }
      }
      
      if (userData.cnpj) {
        const cnpjExists = await userQueries.checkCnpjExists(userData.cnpj);
        if (cnpjExists) {
          throw new Error('Este CNPJ já está cadastrado por outro usuário');
        }
      }

      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        
        // Verificar se email ou login já existem
        if (users.some((u: any) => u.email === userData.email || u.login === userData.login)) {
          throw new Error('Email ou login já cadastrado');
        }
        
        const newUserId = Date.now();
        const hasDocument = userData.cpf || userData.cnpj;
        const newUser = {
          id: newUserId,
          login: userData.login,
          email: userData.email,
          senhaalfa: userData.senhaalfa,
          cpf: userData.cpf || null,
          cnpj: userData.cnpj || null,
          full_name: userData.full_name,
          tipoplano: 'Pré-Pago',
          status: hasDocument ? 'ativo' : 'pendente',
          user_role: userData.user_role || 'assinante',
          saldo: 0.00,
          saldo_atualizado: false,
          aceite_termos: userData.aceite_termos || false,
          tipo_pessoa: userData.tipo_pessoa || 'fisica',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('system_users', JSON.stringify(users));
        return newUserId;
      }

      const hasDocument = userData.cpf || userData.cnpj;
      const status = hasDocument ? 'ativo' : 'pendente';
      const result = await mysql.query(`
        INSERT INTO users (login, email, senhaalfa, cpf, cnpj, full_name, tipoplano, user_role, saldo, aceite_termos, status, indicador_id, saldo_atualizado, tipo_pessoa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userData.login,
        userData.email,
        userData.senhaalfa,
        userData.cpf || null,
        userData.cnpj || null,
        userData.full_name,
        'Pré-Pago',
        userData.user_role || 'assinante',
        0.00,
        userData.aceite_termos ? 1 : 0,
        status,
        userData.indicador_id || 5,
        0,
        userData.tipo_pessoa || 'fisica'
      ]);

      if (result.success && result.insertId) {
        return result.insertId;
      }

      return null;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async updateUserData(userId: number, userData: Partial<User>): Promise<ServiceResponse> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex !== -1) {
          // Atualizar usuário no array
          users[userIndex] = {
            ...users[userIndex],
            ...userData,
            updated_at: new Date().toISOString()
          };
          
          localStorage.setItem('system_users', JSON.stringify(users));
          console.log('Dados atualizados no localStorage');
          return { success: true, message: 'Dados atualizados com sucesso' };
        }
        
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Construir query de update dinamicamente
      const updateFields = [];
      const updateValues = [];
      
      // Campos que podem ser atualizados
      const allowedFields = [
        'login', 'email', 'full_name', 'data_nascimento', 'telefone',
        'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado',
        'tipoplano', 'data_inicio', 'data_fim', 'saldo', 'indicador_id', 'status', 'tipo_pessoa', 'cnpj'
      ];

      allowedFields.forEach(field => {
        if (userData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(userData[field]);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, message: 'Nenhum campo para atualizar' };
      }

      // Adicionar updated_at
      updateFields.push('updated_at = NOW()');
      updateValues.push(userId);

      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const result = await mysql.query(query, updateValues);

      if (result.success && result.affectedRows! > 0) {
        console.log('Dados atualizados no banco de dados');
        return { success: true, message: 'Dados atualizados com sucesso' };
      }

      return { success: false, message: 'Nenhum registro foi atualizado' };
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return { success: false, message: 'Erro interno ao atualizar dados' };
    }
  },

  async updateUserDocument(userId: number, documentType: 'cpf' | 'cnpj', documentValue: string): Promise<ServiceResponse> {
    try {
      // Verificar se documento já existe
      if (documentType === 'cpf') {
        const cpfExists = await userQueries.checkCpfExists(documentValue, userId);
        if (cpfExists) {
          return { success: false, message: 'Este CPF já está cadastrado por outro usuário' };
        }
      } else {
        const cnpjExists = await userQueries.checkCnpjExists(documentValue, userId);
        if (cnpjExists) {
          return { success: false, message: 'Este CNPJ já está cadastrado por outro usuário' };
        }
      }

      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex][documentType] = documentValue;
          users[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('system_users', JSON.stringify(users));
          return { success: true, message: 'Perfil atualizado! Para ganhar o bônus, cadastre sua chave PIX.' };
        }
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Atualizar documento mas NÃO alterar status da conta
      const result = await mysql.query(
        `UPDATE users SET ${documentType} = ?, updated_at = NOW() WHERE id = ?`,
        [documentValue, userId]
      );

      if (result.success && result.affectedRows! > 0) {
        return { success: true, message: 'Perfil atualizado! Para ganhar o bônus, cadastre sua chave PIX.' };
      }

      return { success: false, message: `Erro ao atualizar ${documentType.toUpperCase()}` };
    } catch (error) {
      console.error(`Erro ao atualizar ${documentType}:`, error);
      return { success: false, message: `Erro interno ao atualizar ${documentType.toUpperCase()}` };
    }
  },

  async updateUserBalance(userId: number, newBalance: number): Promise<boolean> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].saldo = newBalance;
          users[userIndex].saldo_atualizado = true;
          localStorage.setItem('system_users', JSON.stringify(users));
          return true;
        }
        return false;
      }

      const result = await mysql.query(
        'UPDATE users SET saldo = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?',
        [newBalance, userId]
      );

      return result.success && result.affectedRows! > 0;
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      return false;
    }
  },

  async updateUserPlan(userId: number, plan: string, dataInicio?: string, dataFim?: string): Promise<boolean> {
    try {
      const mysql = getMySQLConnection(getDatabaseConfig());
      
      if (!mysql.isConnected()) {
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].tipoplano = plan;
          if (dataInicio) users[userIndex].data_inicio = dataInicio;
          if (dataFim) users[userIndex].data_fim = dataFim;
          localStorage.setItem('system_users', JSON.stringify(users));
          return true;
        }
        return false;
      }

      const result = await mysql.query(
        'UPDATE users SET tipoplano = ?, data_inicio = ?, data_fim = ?, updated_at = NOW() WHERE id = ?',
        [plan, dataInicio, dataFim, userId]
      );

      return result.success && result.affectedRows! > 0;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      return false;
    }
  }
};
