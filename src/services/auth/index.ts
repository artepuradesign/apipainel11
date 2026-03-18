
import { register } from './registerService';
import { login } from './loginService';
import { getCurrentUser } from './userService';
import { logout } from './logoutService';
import { requestPasswordRecovery, resetPasswordWithToken } from './passwordRecoveryService';

export const authApiService = {
  register,
  login,
  getCurrentUser,
  logout,
  requestPasswordRecovery,
  resetPasswordWithToken,
};

export * from './registerService';
export * from './loginService';
export * from './userService';
export * from './logoutService';
export * from './passwordRecoveryService';
export * from './apiHelpers';
