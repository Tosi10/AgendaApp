export const PLANOS_DISPONIVEIS = [
  {
    id: 'quem-corre-e-a-bola',
    nome: 'Quem corre é a bola⚽️',
    descricao: '1x na semana - 4 aulas no mês',
    aulasPorMes: 4,
    frequencia: '1x na semana',
    reposicao: false,
    valores: {
      mensal: { valor: 135.90, forma: 'Dinheiro ou PIX' },
      trimestral: null,
      avista: null
    },
    cor: '#3B82F6'
  },
  {
    id: 'toca-e-passa',
    nome: 'Toca e passa⚽️',
    descricao: '2x na semana - 8 aulas no mês',
    aulasPorMes: 8,
    frequencia: '2x na semana',
    reposicao: false,
    valores: {
      mensal: { valor: 199.90, forma: 'Dinheiro ou PIX' },
      trimestral: { valor: 179.90, forma: '3x no cartão' },
      avista: { valor: 480.00, forma: 'À vista' }
    },
    cor: '#10B981'
  },
  {
    id: 'jogou-onde-fera',
    nome: 'Jogou onde fera⚽️',
    descricao: '3x na semana - 12 aulas no mês',
    aulasPorMes: 12,
    frequencia: '3x na semana',
    reposicao: false,
    valores: {
      mensal: { valor: 239.90, forma: 'Dinheiro ou PIX' },
      trimestral: { valor: 219.90, forma: '3x no cartão' },
      avista: { valor: 580.00, forma: 'À vista' }
    },
    cor: '#F59E0B'
  },
  {
    id: 'segura-juvenil',
    nome: 'Segura Juvenil⚽️',
    descricao: '4x na semana - 16 aulas no mês',
    aulasPorMes: 16,
    frequencia: '4x na semana',
    reposicao: false,
    valores: {
      mensal: { valor: 259.90, forma: 'Dinheiro ou PIX' },
      trimestral: { valor: 239.90, forma: '3x no cartão' },
      avista: { valor: 640.00, forma: 'Trimestral à vista' }
    },
    cor: '#EF4444'
  },
  {
    id: 'respeita-minha-historia',
    nome: 'Respeita a minha História⚽️',
    descricao: '5x na semana - 20 aulas no mês',
    aulasPorMes: 20,
    frequencia: '5x na semana',
    reposicao: false,
    valores: {
      mensal: { valor: 279.90, forma: 'Dinheiro ou PIX' },
      trimestral: { valor: 259.90, forma: '3x no cartão' },
      avista: { valor: 700.00, forma: 'À vista' }
    },
    cor: '#8B5CF6'
  }
];

export const PLANO_PERSONAL_TRAINING = {
  id: 'personal-training',
  nome: 'Personal Training⚽️',
  descricao: 'Treino individualizado com horários flexíveis',
  aulasPorMes: 8,
  frequencia: 'Flexível',
  reposicao: true,
  valores: {
    mensal: { valor: 399.90, forma: 'Dinheiro ou PIX' },
    trimestral: { valor: 359.90, forma: '3x no cartão' },
    avista: { valor: 999.00, forma: 'À vista' }
  },
  cor: '#EC4899'
};

export const REGRAS_REPOSICAO = [
  '❌ Reposição de aulas somente com atestado médico',
  '❌ Reposição durante a vigência do plano',
  '🎁 As aulas devem ser pré-agendadas conforme disponibilidade'
];
