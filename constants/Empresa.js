export const INFO_EMPRESA = {
  nome: 'M2 Academia de Futebol',
  cnpj: '10356007000102',
  pix: '10356007000102',
  endereco: 'Endereço da Academia',
  telefone: '(XX) XXXX-XXXX',
  email: 'contato@m2academia.com',
  instagram: '@m2academia',
  whatsapp: '+5541996433853',
  planos: [
    {
      nome: 'Quem corre é a bola⚽️',
      descricao: 'Plano básico para iniciantes',
      frequencia: '1x na semana'
    },
    {
      nome: 'Toca e passa⚽️',
      descricao: 'Plano intermediário',
      frequencia: '2x na semana'
    },
    {
      nome: 'Jogou onde fera⚽️',
      descricao: 'Plano avançado',
      frequencia: '3x na semana'
    },
    {
      nome: 'Segura Juvenil⚽️',
      descricao: 'Plano profissional',
      frequencia: '4x na semana'
    },
    {
      nome: 'Respeita a minha História⚽️',
      descricao: 'Plano elite',
      frequencia: '5x na semana'
    }
  ]
};

export const POLITICAS_AGENDAMENTO = {
  custoCoin: 1, // 1 M2 Coin por agendamento
  prazoCancelamento: 1, // 1 hora antes do treino
  reposicaoApenasComAtestado: true,
  agendamentoPrevio: true
};

export const HORARIOS_FUNCIONAMENTO = {
  segunda: '06:30 - 19:00',
  terca: '17:00 - 19:00',
  quarta: '06:30 - 19:00',
  quinta: '17:00 - 19:00',
  sexta: '06:30 - 19:00',
  sabado: 'Fechado',
  domingo: 'Fechado'
};
