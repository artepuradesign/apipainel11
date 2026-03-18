
// Main user service - exports all user-related functionality
import { User, ServiceResponse } from './types';
import { authService } from './authService';
import { userQueries } from './userQueries';
import { userManager } from './userManager';

// Re-export types using export type for TypeScript compatibility
export type { User, ServiceResponse };

// Main service object that combines all functionality
export const userService = {
  // Authentication methods
  authenticate: authService.authenticate,

  // Query methods
  getUserById: userQueries.getUserById,
  getUserByEmail: userQueries.getUserByEmail,
  getUserByLogin: userQueries.getUserByLogin,
  getAllUsers: userQueries.getAllUsers,
  checkCpfExists: userQueries.checkCpfExists,
  checkCnpjExists: userQueries.checkCnpjExists,

  // Management methods
  createUser: userManager.createUser,
  updateUserData: userManager.updateUserData,
  updateUserDocument: userManager.updateUserDocument,
  updateUserBalance: userManager.updateUserBalance,
  updateUserPlan: userManager.updateUserPlan
};
