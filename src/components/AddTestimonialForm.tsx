
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface AddTestimonialFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTestimonialForm: React.FC<AddTestimonialFormProps> = ({ isOpen, onOpenChange }) => {
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
      // Simular envio (substituir por integração real posteriormente)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar novo depoimento
      const newTestimonial = {
        id: Date.now(), // ID temporário baseado em timestamp
        name: formData.name.trim(),
        position: formData.position.trim() || null,
        company: formData.company.trim() || null,
        instagram: formData.instagram.trim() || null,
        photo_url: null,
        stars: formData.stars,
        content: formData.content.trim(),
        status: 'pending'
      };

      // Salvar no localStorage para ser exibido na página de administração
      const existingTestimonials = localStorage.getItem('pending_testimonials');
      const testimonials = existingTestimonials ? JSON.parse(existingTestimonials) : [];
      testimonials.push(newTestimonial);
      localStorage.setItem('pending_testimonials', JSON.stringify(testimonials));

      // Resetar formulário
      setFormData({
        name: '',
        position: '',
        company: '',
        instagram: '',
        content: '',
        stars: 5
      });

      toast.success("Depoimento enviado com sucesso! Aguarde a aprovação.");
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao enviar depoimento:', error);
      toast.error("Erro ao enviar depoimento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compartilhe sua experiência</DialogTitle>
          <DialogDescription>
            Conte-nos como o APIPainel ajudou sua empresa. Seu depoimento será revisado antes da publicação.
          </DialogDescription>
        </DialogHeader>

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
              <p className="text-sm text-gray-500">Preview do seu avatar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ex: Gerente de TI"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Nome da sua empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (opcional)</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="Ex: seu.usuario"
                className="pl-8"
              />
              <p className="text-xs text-gray-500">
                Usaremos sua foto do Instagram como avatar
              </p>
            </div>
          </div>

          {/* Avaliação por estrelas */}
          <div className="space-y-2">
            <Label>Avaliação *</Label>
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
              <span className="ml-2 text-sm text-gray-600">
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
              placeholder="Conte-nos como o APIPainel ajudou sua empresa..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-brand-purple to-purple-600 hover:from-brand-darkPurple hover:to-purple-700"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Depoimento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestimonialForm;
