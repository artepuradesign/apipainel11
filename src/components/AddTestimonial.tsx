
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const AddTestimonial = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [stars, setStars] = useState<number>(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !content) {
      toast.error("Por favor, preencha seu nome e depoimento.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // TODO: Replace with MySQL database integration
      // For now, simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Seu depoimento foi enviado com sucesso! Ele será exibido após aprovação.");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao enviar depoimento:", error);
      toast.error("Não foi possível enviar seu depoimento. Tente novamente mais tarde.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setPosition('');
    setCompany('');
    setStars(5);
    setContent('');
  };

  return (
    <div className="pt-8 pb-16 text-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-lightPurple">
            Compartilhar sua experiência
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhe sua experiência</DialogTitle>
            <DialogDescription>
              Conte-nos como a API Painel ajudou seu negócio. Seu depoimento será exibido após revisão.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="position">Cargo</Label>
                <Input 
                  id="position" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: Gerente de TI"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input 
                  id="company" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>
              
              <div>
                <Label>Avaliação *</Label>
                <RadioGroup
                  value={stars.toString()}
                  onValueChange={(value) => setStars(Number(value))}
                  className="flex space-x-2 mt-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center">
                      <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="sr-only" />
                      <Label
                        htmlFor={`rating-${value}`}
                        className={`cursor-pointer p-2 rounded-full ${
                          stars >= value ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="content">Seu depoimento *</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Conte como a API Painel ajudou seu negócio..."
                  className="h-24"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-brand-purple hover:bg-brand-darkPurple"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar depoimento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddTestimonial;
