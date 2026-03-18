
interface UserData {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'assinante' | 'suporte';
  plan: string;
  balance: number;
}

const defaultUsers: UserData[] = [];

export const initializeUsers = () => {
  // Clear existing users
  localStorage.removeItem('system_users');
  localStorage.removeItem('current_user_id');
  localStorage.removeItem('user_balance');
  localStorage.removeItem('user_plan');
  localStorage.setItem('system_users', JSON.stringify([]));
};

export const authenticateUser = (username: string, password: string): UserData | null => {
  const users = JSON.parse(localStorage.getItem('system_users') || '[]') as UserData[];
  return users.find(user => user.username === username && user.password === password) || null;
};

export const getCurrentUser = (): UserData | null => {
  const userId = localStorage.getItem('current_user_id');
  if (!userId) return null;
  
  const users = JSON.parse(localStorage.getItem('system_users') || '[]') as UserData[];
  return users.find(user => user.id === userId) || null;
};

export const updateUserBalance = (userId: string, newBalance: number) => {
  const users = JSON.parse(localStorage.getItem('system_users') || '[]') as UserData[];
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].balance = newBalance;
    localStorage.setItem('system_users', JSON.stringify(users));
    localStorage.setItem('user_balance', newBalance.toString());
  }
};

export const setUserPlan = (userId: string, plan: string) => {
  const users = JSON.parse(localStorage.getItem('system_users') || '[]') as UserData[];
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].plan = plan;
    localStorage.setItem('system_users', JSON.stringify(users));
    localStorage.setItem('user_plan', plan);
  }
};
