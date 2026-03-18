import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from 'lucide-react';
import { toast } from "sonner";
import { useTestimonials } from '@/hooks/useTestimonials';

interface TestimonialFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ isOpen, onClose }) => {
  const { createTestimonial } = useTestimonials();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    message: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error('Nome e mensagem são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createTestimonial({
        name: formData.name,
        message: formData.message,
        rating: formData.rating,
        position: formData.position || undefined,
        company: formData.company || undefined
      });

      if (success) {
        setFormData({
          name: '',
          company: '',
          position: '',
          message: '',
          rating: 5
        });
        onClose();
      }
    } catch (error) {
      console.error('Erro ao enviar depoimento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white text-center">
            Compartilhe sua experiência
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Nome *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome"
              required
              className="mt-1 h-8"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="company" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Empresa
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Empresa"
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label htmlFor="position" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Cargo
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Cargo"
                className="mt-1 h-8"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Avaliação
            </Label>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 cursor-pointer transition-colors ${
                    i < formData.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 hover:fill-yellow-300 hover:text-yellow-300'
                  }`}
                  onClick={() => handleInputChange('rating', i + 1)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Depoimento *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Conte sua experiência..."
              required
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-8"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-purple hover:bg-purple-700 h-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialForm;