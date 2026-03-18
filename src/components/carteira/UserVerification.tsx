
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, XCircle, Calendar, Mail } from 'lucide-react';

interface UserInfo {
  exists: boolean;
  firstName: string | null;
  email: string | null;
  id: string;
  joinDate: string | null;
}

interface UserVerificationProps {
  userInfo: UserInfo;
}

const UserVerification: React.FC<UserVerificationProps> = ({ userInfo }) => {
  if (!userInfo.exists) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="font-medium text-red-700 dark:text-red-300">Usuário não encontrado</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">
          O ID <strong>{userInfo.id}</strong> não corresponde a nenhum usuário cadastrado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="font-medium text-green-700 dark:text-green-300">Usuário encontrado</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            <strong>{userInfo.firstName}</strong>
          </span>
          <Badge variant="outline" className="text-xs">
            ID: {userInfo.id}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {userInfo.email}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Cadastrado em: {userInfo.joinDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserVerification;
