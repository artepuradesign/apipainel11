import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Star, Plus, MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import UserAvatar from '@/components/UserAvatar';
import CreateTestimonialForm from '@/components/CreateTestimonialForm';
import { useAdminTestimonials } from '@/hooks/useAdminTestimonials';

const AdminDepoimentos = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  
  const {
    testimonials,
    loading,
    error,
    approveTestimonial,
    rejectTestimonial,
    deleteTestimonial,
    createTestimonial,
    pendingCount,
    approvedCount,
    rejectedCount
  } = useAdminTestimonials();

  const handleApprove = async (id: number) => {
    await approveTestimonial(id);
  };
  
  const handleReject = async (id: number) => {
    await rejectTestimonial(id);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteTestimonial(id);
    if (success) {
      toast.success('Depoimento excluído com sucesso!');
    } else {
      toast.error('Erro ao excluir depoimento. Tente novamente.');
    }
  };

  const handleCreateTestimonial = async (newTestimonial: any) => {
    const success = await createTestimonial({
      name: newTestimonial.name,
      message: newTestimonial.content,
      rating: newTestimonial.stars,
      position: newTestimonial.position,
      company: newTestimonial.company,
      status: 'pendente'
    });
    
    if (success) {
      toast.success('Depoimento criado com sucesso!');
      setIsCreateFormOpen(false);
    } else {
      toast.error('Erro ao criar depoimento. Tente novamente.');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">Pendente</Badge>;
      case 'ativo':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">Aprovado</Badge>;
      case 'inativo':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">Rejeitado</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">Pendente</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title="Gerenciar Depoimentos"
          subtitle="Gerencie os depoimentos enviados pelos clientes"
          icon={<MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
        />
        <Card>
          <CardContent className="flex items-center justify-center p-8 sm:p-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-500 text-sm">Carregando depoimentos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title="Gerenciar Depoimentos"
          subtitle="Gerencie os depoimentos enviados pelos clientes"
          icon={<MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
        />
        <Card>
          <CardContent className="flex items-center justify-center p-8 sm:p-12">
            <div className="text-center">
              <X className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2 text-sm sm:text-base">Erro ao carregar depoimentos</p>
              <p className="text-gray-500 text-xs sm:text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Gerenciar Depoimentos"
        subtitle="Gerencie os depoimentos enviados pelos clientes"
        icon={<MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium truncate">Total</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">{testimonials.length}</p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm font-medium truncate">Pendentes</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{pendingCount}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium truncate">Aprovados</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">{approvedCount}</p>
              </div>
              <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium truncate">Rejeitados</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-900 dark:text-red-100">{rejectedCount}</p>
              </div>
              <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card para Criar Depoimento */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">Criar Novo Depoimento</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Crie um depoimento como suporte para adicionar à lista de pendentes
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
              className="bg-gradient-to-r from-brand-purple to-purple-600 hover:from-brand-darkPurple hover:to-purple-700 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:hidden">Novo</span>
              <span className="hidden sm:inline">{isCreateFormOpen ? 'Fechar' : 'Novo Depoimento'}</span>
            </Button>
          </div>
        </CardHeader>
        {isCreateFormOpen && (
          <CardContent className="p-3 sm:p-6 pt-0">
            <CreateTestimonialForm 
              onCreateTestimonial={handleCreateTestimonial}
            />
          </CardContent>
        )}
      </Card>

      {/* Lista de Depoimentos */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Todos os Depoimentos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gerencie todos os depoimentos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {testimonials.length === 0 ? (
              <div className="text-center py-8 sm:py-10 text-gray-500 text-sm">
                Nenhum depoimento encontrado.
              </div>
            ) : (
              testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="overflow-hidden">
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage src={testimonial.avatar || undefined} alt={testimonial.name} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm sm:text-lg truncate">{testimonial.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm truncate">
                            {testimonial.position}
                            {testimonial.company && ` - ${testimonial.company}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex-shrink-0 self-start sm:self-center">
                        {getStatusBadge(testimonial.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {/* Avaliação por estrelas */}
                    <div className="flex items-center mb-2 sm:mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < testimonial.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'fill-gray-200 text-gray-200'
                          }`} 
                        />
                      ))}
                      <span className="ml-2 text-xs sm:text-sm text-gray-600">
                        {testimonial.rating} estrelas
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm italic line-clamp-3 sm:line-clamp-none">
                      "{testimonial.message}"
                    </p>
                  </CardContent>
                  
                  {testimonial.status === 'pendente' && (
                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 w-full sm:w-auto text-xs sm:text-sm"
                        onClick={() => handleReject(testimonial.id)}
                      >
                        <X size={14} className="mr-1" /> Rejeitar
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 w-full sm:w-auto text-xs sm:text-sm" 
                        onClick={() => handleApprove(testimonial.id)}
                      >
                        <Check size={14} className="mr-1" /> Aprovar
                      </Button>
                    </CardFooter>
                  )}

                  {(testimonial.status === 'ativo' || testimonial.status === 'inativo') && (
                    <CardFooter className="flex justify-end space-x-2 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto text-xs sm:text-sm"
                        onClick={() => handleDelete(testimonial.id)}
                      >
                        <X size={14} className="mr-1" /> Excluir
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDepoimentos;
