import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';

interface RecaptchaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
}

const RecaptchaModal = ({ open, onOpenChange, onVerify }: RecaptchaModalProps) => {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [challenge, setChallenge] = useState<{ target: string; images: string[] }>({
    target: '',
    images: []
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Desafios disponíveis
  const challenges = [
    {
      target: 'Selecione todas as imagens com semáforos',
      correctIndexes: [1, 4, 6],
      images: ['🚗', '🚦', '🏠', '🌳', '🚦', '🚲', '🚦', '🏢', '🌸']
    },
    {
      target: 'Selecione todas as imagens com carros',
      correctIndexes: [0, 3, 7],
      images: ['🚗', '🚦', '🏠', '🚗', '🌳', '🚲', '🏢', '🚗', '🌸']
    },
    {
      target: 'Selecione todas as imagens com árvores',
      correctIndexes: [2, 5, 8],
      images: ['🚗', '🚦', '🌳', '🏠', '🚲', '🌳', '🏢', '🚦', '🌳']
    }
  ];

  // Gerar novo desafio ao abrir o modal
  useEffect(() => {
    if (open) {
      generateNewChallenge();
      setSelectedImages([]);
      setError('');
    }
  }, [open]);

  const generateNewChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setChallenge(randomChallenge);
  };

  const handleImageClick = (index: number) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter(i => i !== index));
    } else {
      setSelectedImages([...selectedImages, index]);
    }
    setError('');
  };

  const handleVerify = () => {
    setIsVerifying(true);

    // Pegar os índices corretos do desafio atual
    const currentChallenge = challenges.find(c => c.target === challenge.target);
    const correctIndexes = currentChallenge?.correctIndexes || [];

    // Verificar se selecionou todos corretos e nenhum errado
    const isCorrect = 
      selectedImages.length === correctIndexes.length &&
      selectedImages.every(index => correctIndexes.includes(index));

    setTimeout(() => {
      if (isCorrect) {
        onVerify();
        onOpenChange(false);
      } else {
        setError('Seleção incorreta. Tente novamente.');
        setSelectedImages([]);
        generateNewChallenge();
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-brand-purple" />
            Verificação de Segurança
          </DialogTitle>
          <DialogDescription className="text-sm">
            Confirme que você não é um robô
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instrução do desafio */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {challenge.target}
            </p>
          </div>

          {/* Grid de imagens */}
          <div className="grid grid-cols-3 gap-2">
            {challenge.images.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`
                  aspect-square flex items-center justify-center text-3xl
                  rounded-lg border-2 transition-all duration-200
                  hover:scale-105 active:scale-95
                  ${
                    selectedImages.includes(index)
                      ? 'border-brand-purple bg-brand-lightPurple/30 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-brand-purple'
                  }
                `}
                disabled={isVerifying}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateNewChallenge}
              className="flex-1"
              disabled={isVerifying}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Novo
            </Button>
            <Button
              onClick={handleVerify}
              disabled={selectedImages.length === 0 || isVerifying}
              className="flex-1 bg-brand-purple hover:bg-brand-darkPurple"
            >
              {isVerifying ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>

          {/* Info de segurança */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Proteção contra robôs</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecaptchaModal;
