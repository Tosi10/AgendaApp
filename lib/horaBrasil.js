// Utilitário simplificado para hora do Brasil
export const getHoraBrasil = () => {
  try {
    const horaBrasil = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const match = horaBrasil.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      return {
        hora: parseInt(match[1]),
        minuto: parseInt(match[2]),
        segundo: parseInt(match[3])
      };
    }
  } catch (error) {
    console.error('Erro ao obter hora Brasil:', error);
  }
  
  const agora = new Date();
  return {
    hora: agora.getHours(),
    minuto: agora.getMinutes(),
    segundo: agora.getSeconds()
  };
};

export const getDataAtualBrasil = () => {
  const horaBrasil = getHoraBrasil();
  const agora = new Date();
  const agoraBrasil = new Date(agora);
  agoraBrasil.setHours(horaBrasil.hora, horaBrasil.minuto, horaBrasil.segundo, 0);
  return agoraBrasil;
};

export const isHorarioPassado = (date, time) => {
  const horaBrasil = getHoraBrasil();
  const [hours, minutes] = time.split(':').map(Number);
  const horario = new Date(date);
  horario.setHours(hours, minutes, 0, 0);
  
  const agoraBrasil = getDataAtualBrasil();
  return horario < agoraBrasil;
};

/**
 * Calcula quantas horas faltam para um horário específico
 * Retorna string formatada como "X horas" ou "X minutos" ou "Em Hoje"
 */
export const getHorasFaltando = (date, time) => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const horario = new Date(date);
    horario.setHours(hours, minutes, 0, 0);
    
    const agoraBrasil = getDataAtualBrasil();
    
    // Se já passou, retorna "Passado"
    if (horario < agoraBrasil) {
      return "Passado";
    }
    
    // Calcular diferença em milissegundos
    const diffMs = horario.getTime() - agoraBrasil.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Se for hoje
    const hoje = new Date();
    const isHoje = date.toDateString() === hoje.toDateString();
    
         if (isHoje) {
       if (diffHours > 0) {
         return `${diffHours}h ${diffMinutes}min`;
       } else if (diffMinutes > 0) {
         return `${diffMinutes}min`;
       } else {
         return "Agora";
       }
     } else {
       // Se não for hoje, verificar se é amanhã
       const amanha = new Date();
       amanha.setDate(amanha.getDate() + 1);
       const isAmanha = date.toDateString() === amanha.toDateString();
       
       if (isAmanha) {
         return "Amanhã";
       } else {
         // Se não for hoje nem amanhã, mostrar dias
         const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
         if (diffDays > 0) {
           return `${diffDays}d`;
         } else {
           return `${diffHours}h ${diffMinutes}min`;
         }
       }
     }
  } catch (error) {
    console.error('Erro ao calcular horas faltando:', error);
    return "Em Hoje";
  }
};
