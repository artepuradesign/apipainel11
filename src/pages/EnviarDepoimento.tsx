import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Instagram } from 'lucide-react';
import { toast } from "sonner";
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';
import PageLayout from '@/components/layout/PageLayout';
import UserAvatar from '@/components/UserAvatar';
import { useNavigate } from 'react-router-dom';

const EnviarDepoimento = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    instagram: '',
    stars: 5,
    content: ''
  });

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, stars: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.content) {
      toast.error("Por favor, preencha pelo menos o nome e o comentário");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Replace with MySQL database integration
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Depoimento enviado:', formData);
      
      toast.success("Depoimento enviado com sucesso! Aguarde a aprovação para que apareça no site.");
      
      // Reset form
      setFormData({
        name: '',
        position: '',
        company: '',
        instagram: '',
        stars: 5,
        content: ''
      });
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error("Erro ao enviar depoimento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout 
      variant="landing" 
      backgroundOpacity="medium" 
      showGradients={true}
      className="flex flex-col min-h-screen"
    >
      <MenuSuperior />
      
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Compartilhe sua Experiência
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Conte-nos sobre sua experiência com nossos serviços. Seu feedback é muito importante para nós!
              </p>
            </div>

            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
                  Enviar Depoimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Preview do Avatar */}
                  {formData.name && (
                    <div className="flex items-center justify-center mb-6">
                      <div className="text-center">
                        <UserAvatar 
                          name={formData.name} 
                          instagramHandle={formData.instagram} 
                          size="lg"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Preview do seu avatar
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                        Nome *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="position" className="text-gray-700 dark:text-gray-300">
                        Função/Cargo
                      </Label>
                      <Input
                        id="position"
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Ex: Gerente de TI"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">
                        Nome da Empresa
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nome da sua empresa"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Instagram className="h-4 w-4" />
                        Instagram (opcional)
                      </Label>
                      <Input
                        id="instagram"
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="@seuusuario ou seuusuario"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Sua foto do Instagram será usada como avatar
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 mb-3 block">
                      Classificação *
                    </Label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleStarClick(i + 1)}
                          className="transition-all duration-200 hover:scale-110"
                        >
                          <Star 
                            className={`h-8 w-8 ${
                              i < formData.stars 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300 hover:text-yellow-300'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {formData.stars} de 5 estrelas
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-gray-700 dark:text-gray-300">
                      Seu Depoimento *
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Conte-nos sobre sua experiência com nossos serviços..."
                      className="mt-1 min-h-[120px]"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Mínimo de 20 caracteres. Máximo de 500 caracteres.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Importante:</strong> Seu depoimento passará por uma análise antes de ser publicado no site. 
                      Isso garante a qualidade e veracidade dos comentários.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-purple hover:bg-brand-darkPurple text-white"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Depoimento"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </PageLayout>
  );
};

export default EnviarDepoimento;
