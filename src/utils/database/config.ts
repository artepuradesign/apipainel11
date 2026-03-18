
// Configuração do banco de dados MySQL local
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const defaultDatabaseConfig: DatabaseConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'apipainel_db'
};

export const getDatabaseConfig = (): DatabaseConfig => {
  const config = localStorage.getItem('mysql_config');
  if (config) {
    return JSON.parse(config);
  }
  return defaultDatabaseConfig;
};

export const saveDatabaseConfig = (config: DatabaseConfig): void => {
  localStorage.setItem('mysql_config', JSON.stringify(config));
};

export const isDatabaseConfigured = (): boolean => {
  const config = localStorage.getItem('mysql_config');
  const connection = localStorage.getItem('mysql_connected');
  return !!(config && connection === 'true');
};
