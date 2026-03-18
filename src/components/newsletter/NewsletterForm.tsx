import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { newsletterService } from '@/services/newsletterService';
import { toast } from 'sonner';

interface NewsletterFormProps {
  source?: string;
  className?: string;
  placeholder?: string;
  buttonText?: string;
  showName?: boolean;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({
  source = 'footer_newsletter',
  className = '',
  placeholder = 'Seu melhor e-mail',
  buttonText = 'Inscrever',
  showName = false
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor, digite seu email');
      return;
    }

    if (!newsletterService.validateEmail(email)) {
      toast.error('Por favor, digite um email válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await newsletterService.subscribe({
        email: email.trim(),
        name: showName ? name.trim() : undefined,
        source
      });

      if (response.success) {
        setIsSubscribed(true);
        setEmail('');
        setName('');
        toast.success('🎉 Inscrição realizada com sucesso!', {
          description: 'Você receberá nossas novidades em breve.',
          duration: 5000
        });
        
        // Reset após 3 segundos
        setTimeout(() => {
          setIsSubscribed(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Erro ao realizar inscrição');
      }
    } catch (error: any) {
      console.error('Erro na inscrição:', error);
      
      if (error.message.includes('already exists') || error.message.includes('já cadastrado')) {
        toast.warning('📧 Este email já está inscrito!', {
          description: 'Você já receberá nossas novidades.',
          duration: 4000
        });
      } else {
        toast.error('❌ Erro ao realizar inscrição', {
          description: 'Tente novamente em alguns instantes.',
          duration: 4000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50 ${className}`}>
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
        <span className="text-green-800 dark:text-green-300 font-medium">
          Inscrição realizada com sucesso!
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {showName && (
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome (opcional)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all duration-300"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="px-6 py-3 bg-brand-purple hover:bg-brand-darkPurple text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-brand-purple/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 min-w-[120px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        🔒 Seus dados estão seguros. Não fazemos spam.
      </p>
    </form>
  );
};

export default NewsletterForm;