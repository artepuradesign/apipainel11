
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from 'lucide-react';
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface CreateTestimonialFormProps {
  onCreateTestimonial: (testimonial: any) => void;
}

const CreateTestimonialForm: React.FC<CreateTestimonialFormProps> = ({ onCreateTestimonial }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    instagram: '',
    content: '',
    stars: 5
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      stars: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Por favor, preencha pelo menos o nome e o depoimento.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar novo depoimento
      const newTestimonial = {
        id: Date.now(),
        name: formData.name.trim(),
        position: formData.position.trim() || null,
        company: formData.company.trim() || null,
        instagram: formData.instagram.trim() || null,
        photo_url: null,
        stars: formData.stars,
        content: formData.content.trim(),
        status: 'pending'
      };

      onCreateTestimonial(newTestimonial);

      // Resetar formulário
      setFormData({
        name: '',
        position: '',
        company: '',
        instagram: '',
        content: '',
        stars: 5
      });

    } catch (error) {
      console.error('Erro ao criar depoimento:', error);
      toast.error("Erro ao criar depoimento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      company: '',
      instagram: '',
      content: '',
      stars: 5
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview do Avatar */}
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <UserAvatar 
              name={formData.name || 'Usuário'}
              instagramHandle={formData.instagram || null}
              size="lg"
              className="mx-auto mb-2"
            />
            <p className="text-sm text-gray-500">Preview do avatar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome completo"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Ex: Gerente de TI"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Nome da empresa"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram (opcional)</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="Ex: usuario.instagram"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Será usado para buscar a foto do perfil
            </p>
          </div>
        </div>

        {/* Avaliação por estrelas */}
        <div className="space-y-2">
          <Label>Avaliação *</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-1">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const rating = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStarClick(rating)}
                    className="transition-colors duration-200"
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        rating <= formData.stars 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-400'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-sm text-gray-600">
              {formData.stars} estrela{formData.stars !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Depoimento *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Digite o conteúdo do depoimento..."
            rows={4}
            required
            className="w-full resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetForm}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Limpar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-brand-purple to-purple-600 hover:from-brand-darkPurple hover:to-purple-700 w-full sm:w-auto"
          >
            {isSubmitting ? 'Criando...' : 'Criar Depoimento'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTestimonialForm;
