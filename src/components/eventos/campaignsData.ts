
import { Gift, Users } from 'lucide-react';

export const campaigns = [
  {
    id: 'promocao-novo-usuario',
    title: 'Promoção Novo Usuário',
    subtitle: 'Bônus para novos cadastros com código de indicação',
    icon: Gift,
    color: 'from-purple-500 to-purple-600',
    description: 'Ganhe bônus ao se cadastrar usando um código de indicação válido',
    benefits: [
      {
        title: 'Benefícios para novos usuários',
        items: [
          'Bônus de boas-vindas no saldo do plano',
          'Código válido por 7 dias',
          'Crédito automático após validação da conta'
        ]
      }
    ],
    terms: 'Válido para novos usuários que se cadastrarem com código de indicação e completarem a validação.',
    active: true
  },
  {
    id: 'indique-amigos',
    title: 'Indique e Ganhe',
    subtitle: 'Ganhe por cada novo usuário cadastrado e validado',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    description: 'Ganhe o valor definido pelo sistema para cada novo usuário que se cadastrar e validar sua conta usando seu código',
    benefits: [
      {
        title: 'Benefícios da indicação',
        items: [
          'Valor do bônus definido pelo administrador',
          'Comissão sobre recargas dos indicados',
          'Coleta manual dos lucros para carteira'
        ]
      }
    ],
    terms: 'Válido para novos usuários que completarem o cadastro e validação.',
    active: true
  }
];
