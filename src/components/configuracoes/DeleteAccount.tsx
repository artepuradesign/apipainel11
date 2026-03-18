
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'EXCLUIR CONTA') {
      toast.error('Digite "EXCLUIR CONTA" para confirmar');
      return;
    }

    setLoading(true);
    try {
      // Remove dados do usuário
      if (user) {
        const systemUsers = JSON.parse(localStorage.getItem('system_users') || '[]');
        const updatedUsers = systemUsers.filter((u: any) => u.id !== user.id);
        localStorage.setItem('system_users', JSON.stringify(updatedUsers));
        
        // Remove dados específicos do usuário
        localStorage.removeItem(`user_balance_${user.id}`);
        localStorage.removeItem(`user_plan_balance_${user.id}`);
        localStorage.removeItem(`user_transactions_${user.id}`);
      }

      toast.success('Conta excluída com sucesso!');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-red-800 dark:text-red-400">
            Excluir Conta Permanentemente
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            Esta ação é irreversível. Todos os seus dados, histórico, saldo e configurações serão permanentemente removidos.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="confirmDelete" className="text-red-800 dark:text-red-400">
              Digite "EXCLUIR CONTA" para confirmar:
            </Label>
            <Input
              id="confirmDelete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="EXCLUIR CONTA"
              className="border-red-300 dark:border-red-800"
            />
          </div>

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={loading || confirmText !== 'EXCLUIR CONTA'}
            className="w-full"
          >
            {loading ? (
              'Excluindo...'
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Conta Permanentemente
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeleteAccount;
