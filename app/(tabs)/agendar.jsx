import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { INFO_EMPRESA, POLITICAS_AGENDAMENTO } from '../../constants/Empresa';
import { HORARIOS_DISPONIVEIS, HORARIOS_PERSONAL_TRAINING } from '../../constants/Horarios';
import { REGRAS_REPOSICAO } from '../../constants/Planos';
import { useGlobal } from '../../context/GlobalProvider';
import { db } from '../../lib/firebase';

export default function Agendar() {
  const { user, userProfile, updateCurrentUserM2Coins } = useGlobal();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [agendamentos, setAgendamentos] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Estado para seleção de calendário (apenas para admins)
  const [calendarioSelecionado, setCalendarioSelecionado] = useState('alunos');

  // Verificar se o usuário pode agendar
  const canSchedule = userProfile && userProfile.aprovado;
  const isPersonalTraining = userProfile?.tipoUsuario === 'personal';
  const isAdmin = userProfile?.tipoUsuario === 'admin';
  
  // Determinar qual calendário mostrar
  const mostrarCalendarioPersonal = isPersonalTraining || (isAdmin && calendarioSelecionado === 'personal');

  // Carregar agendamentos do Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const agendamentosData = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.key) {
            agendamentosData[data.key] = data.alunos || [];
          }
        });
        setAgendamentos(agendamentosData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar agendamentos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Gerar dias da semana atual
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeek);

  // Navegar para próxima semana
  const nextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(next);
    setSelectedDay(null);
  };

  // Navegar para semana anterior
  const prevWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prev);
    setSelectedDay(null);
  };

  // Formatar data
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Formatar dia da semana
  const formatDayName = (date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  // Verificar se é hoje
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar se o cancelamento é permitido (1 hora antes da aula)
  const canCancelClass = (date, horario) => {
    const now = new Date();
    const [hours, minutes] = horario.split(':');
    const classTime = new Date(date);
    classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Se a aula já passou, não pode cancelar
    if (classTime <= now) {
      return false;
    }
    
    // Verificar se faltam pelo menos 1 hora
    const oneHourBefore = new Date(classTime.getTime() - (60 * 60 * 1000));
    return now <= oneHourBefore;
  };

  // Verificar se a aula já passou
  const isClassPassed = (date, horario) => {
    const now = new Date();
    const [hours, minutes] = horario.split(':');
    const classTime = new Date(date);
    classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return classTime <= now;
  };

  // Verificar se é o dia selecionado
  const isSelected = (date) => {
    return selectedDay && date.toDateString() === selectedDay.toDateString();
  };

  // Obter horários baseado no tipo de usuário e dia selecionado
  const getHorariosDisponiveis = () => {
    if (mostrarCalendarioPersonal) {
      // Para Personal Training, usar horários baseados no dia da semana
      if (!selectedDay) return [];
      
      // Mapear o dia da semana para a chave correta
      const dayOfWeek = selectedDay.getDay(); // 0 = domingo, 1 = segunda, etc.
      
      let dayKey;
      switch (dayOfWeek) {
        case 1: // Segunda-feira
          dayKey = 'segunda';
          break;
        case 2: // Terça-feira
          dayKey = 'terca';
          break;
        case 3: // Quarta-feira
          dayKey = 'quarta';
          break;
        case 4: // Quinta-feira
          dayKey = 'quinta';
          break;
        case 5: // Sexta-feira
          dayKey = 'sexta';
          break;
        default:
          return []; // Fim de semana não tem aulas
      }
      
      console.log('Dia selecionado (Personal):', selectedDay.toDateString());
      console.log('Dia da semana (Personal):', dayOfWeek, 'Chave:', dayKey);
      console.log('Horários disponíveis (Personal):', HORARIOS_PERSONAL_TRAINING[dayKey]);
      
      if (HORARIOS_PERSONAL_TRAINING[dayKey]) {
        return HORARIOS_PERSONAL_TRAINING[dayKey].map(h => h.hora);
      }
      
      return [];
    }
    
    // Para alunos normais, usar horários baseados no dia da semana
    if (!selectedDay) return [];
    
    // Mapear o dia da semana para a chave correta
    const dayOfWeek = selectedDay.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    let dayKey;
    switch (dayOfWeek) {
      case 1: // Segunda-feira
        dayKey = 'segunda';
        break;
      case 2: // Terça-feira
        dayKey = 'terca';
        break;
      case 3: // Quarta-feira
        dayKey = 'quarta';
        break;
      case 4: // Quinta-feira
        dayKey = 'quinta';
        break;
      case 5: // Sexta-feira
        dayKey = 'sexta';
        break;
      default:
        return []; // Fim de semana não tem aulas
    }
    
    console.log('Dia selecionado (Alunos):', selectedDay.toDateString());
    console.log('Dia da semana (Alunos):', dayOfWeek, 'Chave:', dayKey);
    console.log('Horários disponíveis (Alunos):', HORARIOS_DISPONIVEIS[dayKey]);
    
    if (HORARIOS_DISPONIVEIS[dayKey]) {
      return HORARIOS_DISPONIVEIS[dayKey].map(h => h.hora);
    }
    
    return [];
  };

  // Verificar se o usuário está agendado
  const isUserAgendado = (data, horario) => {
    const key = `${data.toDateString()}_${horario}`;
    const alunos = agendamentos[key] || [];
    return alunos.includes(user?.email);
  };

  // Salvar agendamento no Firestore
  const salvarAgendamento = async (key, alunos) => {
    try {
      // Buscar documento existente com esta chave
      const q = query(collection(db, 'agendamentos'), where('key', '==', key));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Se não existir e tiver alunos, criar novo documento
        if (alunos.length > 0) {
          await addDoc(collection(db, 'agendamentos'), {
            key: key,
            alunos: alunos,
            dataCriacao: serverTimestamp(),
            ultimaAtualizacao: serverTimestamp()
          });
        }
      } else {
        // Se existir
        const docRef = snapshot.docs[0].ref;
        
        if (alunos.length === 0) {
          // Se não há mais alunos, deletar o documento
          await deleteDoc(docRef);
        } else {
          // Se há alunos, atualizar o documento
          await updateDoc(docRef, {
            alunos: alunos,
            ultimaAtualizacao: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o agendamento.');
    }
  };

  // Adicionar/remover agendamento do usuário
  const toggleAgendamento = async (data, horario) => {
    const key = `${data.toDateString()}_${horario}`;
    const novosAgendamentos = { ...agendamentos };
    
    if (!novosAgendamentos[key]) {
      novosAgendamentos[key] = [];
    }
    
    const userEmail = user?.email;
    const userIndex = novosAgendamentos[key].indexOf(userEmail);
    
    if (userIndex === -1) {
      // Adicionar usuário - VERIFICAR SE TEM COINS SUFICIENTES
      if (userProfile.m2Coins < 1) {
        Alert.alert('Coins Insuficientes', 'Você precisa de pelo menos 1 M2 Coin para agendar uma aula.');
        return;
      }
      
      // Verificar limite baseado no tipo de calendário
      const limiteAlunos = mostrarCalendarioPersonal ? 1 : 8; // Personal: 1 aluno, Alunos: 8 alunos
      if (novosAgendamentos[key].length >= limiteAlunos) {
        const mensagem = mostrarCalendarioPersonal 
          ? 'Este horário já está ocupado por outro aluno.' 
          : 'Este horário já está com 8 alunos.';
        Alert.alert('Limite Atingido', mensagem);
        return;
      }
      
      // DEDUZIR 1 M2 COIN
      try {
        await updateCurrentUserM2Coins(userProfile.m2Coins - 1);
        const mensagem = mostrarCalendarioPersonal 
          ? 'Você foi agendado para Personal Training! 1 M2 Coin foi deduzido.'
          : 'Você foi agendado para esta aula! 1 M2 Coin foi deduzido.';
        Alert.alert('Sucesso', mensagem);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível deduzir os M2 Coins. Tente novamente.');
        return;
      }
      
      novosAgendamentos[key] = [...novosAgendamentos[key], userEmail];
      
      // Salvar no Firestore
      await salvarAgendamento(key, novosAgendamentos[key]);
      
    } else {
      // Remover usuário - DEVOLVER 1 M2 COIN
      try {
        await updateCurrentUserM2Coins(userProfile.m2Coins + 1);
        Alert.alert('Cancelado', 'Seu agendamento foi cancelado. 1 M2 Coin foi devolvido.');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível devolver os M2 Coins. Tente novamente.');
        return;
      }
      
      novosAgendamentos[key] = novosAgendamentos[key].filter((_, i) => i !== userIndex);
      
      // Salvar no Firestore
      await salvarAgendamento(key, novosAgendamentos[key]);
    }
    
    setAgendamentos(novosAgendamentos);
  };

  if (!canSchedule) {
    return (
      <View style={styles.container}>
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text className="text-red-600 font-pbold text-xl text-center mt-4">
            Acesso Restrito
          </Text>
          <Text className="text-gray-600 font-pregular text-base text-center mt-2">
            Sua conta ainda não foi aprovada. Aguarde a aprovação de um administrador.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 font-pregular">Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/images/M2_9.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>


          {/* Calendário semanal */}
          <View className="bg-blue-600 px-6 py-16">
            {/* Header do calendário com navegação */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={prevWeek}
                className="bg-blue-500 rounded-full p-2"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              
              <Text className="text-white font-pextrabold text-xl">
                {currentWeek.toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
              
              <TouchableOpacity
                onPress={nextWeek}
                className="bg-blue-500 rounded-full p-2"
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Seletor de Calendário para Admins */}
            {isAdmin && (
              <View className="bg-blue-500 rounded-lg p-3 mb-4">
                <Text className="text-white font-pbold text-sm text-center mb-2">
                  Visualizar Calendário:
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => setCalendarioSelecionado('alunos')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 ${
                      calendarioSelecionado === 'alunos'
                        ? 'bg-yellow-400 border-yellow-500'
                        : 'bg-blue-600 border-blue-400'
                    }`}
                  >
                    <Text className={`font-pbold text-sm text-center ${
                      calendarioSelecionado === 'alunos' ? 'text-gray-800' : 'text-white'
                    }`}>
                      👥 Alunos
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setCalendarioSelecionado('personal')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 ${
                      calendarioSelecionado === 'personal'
                        ? 'bg-yellow-400 border-yellow-500'
                        : 'bg-blue-600 border-blue-400'
                    }`}
                  >
                    <Text className={`font-pbold text-sm text-center ${
                      calendarioSelecionado === 'personal' ? 'text-gray-800' : 'text-white'
                    }`}>
                      🏃‍♂️ Personal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* M2 Coins */}
            <View className="bg-blue-500 rounded-lg p-3 mb-4">
              <View className="flex-row items-center justify-center">
                <Image 
                  source={require('../../assets/images/m2coin.png')} 
                  className="w-12 h-12 mr-3"
                />
                <Text className="text-white font-pbold text-3xl">
                  {userProfile?.m2Coins || 0}
                </Text>
              </View>
            </View>

            {/* Calendário semanal */}
            <View className="flex-row justify-between">
              {weekDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDay(day)}
                  className={`flex-1 items-center py-3 rounded-lg mx-1 ${
                    isSelected(day) 
                      ? 'bg-yellow-400' 
                      : isToday(day) 
                        ? 'bg-blue-500' 
                        : 'bg-blue-700'
                  }`}
                >
                  <Text className={`font-pregular text-xs ${
                    isSelected(day) ? 'text-gray-800' : 'text-white'
                  }`}>
                    {formatDayName(day)}
                  </Text>
                  <Text className={`font-pbold text-lg ${
                    isSelected(day) ? 'text-gray-800' : 'text-white'
                  }`}>
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lista de horários do dia selecionado */}
          {selectedDay && (
            <View className="px-6 py-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-800 font-pbold text-xl">
                  Horários - {formatDate(selectedDay)}
                </Text>
                <View className={`px-3 py-1 rounded-full ${
                  mostrarCalendarioPersonal 
                    ? 'bg-purple-100 border-2 border-purple-300' 
                    : 'bg-blue-100 border-2 border-blue-300'
                }`}>
                  <Text className={`font-pbold text-sm ${
                    mostrarCalendarioPersonal ? 'text-purple-700' : 'text-blue-700'
                  }`}>
                    {mostrarCalendarioPersonal ? '🏃‍♂️ Personal' : '👥 Alunos'}
                  </Text>
                </View>
              </View>

              {/* Lista de horários */}
              {getHorariosDisponiveis().length === 0 ? (
                <View className="bg-gray-50 rounded-xl p-8 items-center">
                  <Ionicons name="time-outline" size={64} color="#9CA3AF" />
                  <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                    Nenhum horário disponível
                  </Text>
                  <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
                    Este dia não possui horários de aula
                  </Text>
                </View>
              ) : (
                getHorariosDisponiveis().map((horario) => {
                  const key = `${selectedDay.toDateString()}_${horario}`;
                  const alunos = agendamentos[key] || [];
                  const userAgendado = isUserAgendado(selectedDay, horario);
                  
                  return (
                    <View key={horario} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-800 font-pbold text-lg">
                          {horario}
                        </Text>
                        <Text className="text-gray-500 font-pregular text-sm">
                          {alunos.length}/{mostrarCalendarioPersonal ? '1' : '8'} {mostrarCalendarioPersonal ? 'aluno' : 'alunos'}
                        </Text>
                      </View>

                      {/* Botão para agendar/desagendar */}
                      <TouchableOpacity
                        onPress={() => toggleAgendamento(selectedDay, horario)}
                        className={`p-3 rounded-lg mb-3 ${
                          userAgendado 
                            ? (isClassPassed(selectedDay, horario) 
                                ? 'bg-gray-400' 
                                : canCancelClass(selectedDay, horario)
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500')
                            : isClassPassed(selectedDay, horario)
                              ? 'bg-gray-400'
                              : alunos.length >= 8 
                                ? 'bg-gray-300' 
                                : 'bg-blue-600'
                        }`}
                        disabled={!userAgendado && (alunos.length >= (mostrarCalendarioPersonal ? 1 : 8) || isClassPassed(selectedDay, horario)) || (userAgendado && !canCancelClass(selectedDay, horario))}
                      >
                        <Text className="text-white font-pbold text-center">
                          {userAgendado 
                            ? (isClassPassed(selectedDay, horario)
                                ? 'Aula Realizada'
                                : canCancelClass(selectedDay, horario)
                                  ? 'Cancelar Aula'
                                  : 'Cancelamento Bloqueado')
                            : isClassPassed(selectedDay, horario)
                              ? 'Horário Passado'
                              : alunos.length >= (mostrarCalendarioPersonal ? 1 : 8)
                                ? (mostrarCalendarioPersonal ? 'Horário Ocupado' : 'Horário Lotado')
                                : 'Agendar Aula'
                          }
                        </Text>
                      </TouchableOpacity>

                      {/* Status da aula e informações de cancelamento */}
                      {userAgendado && (
                        <View className="mb-3">
                          {isClassPassed(selectedDay, horario) ? (
                            <View className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                              <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                                <Text className="text-gray-600 font-pregular text-sm ml-2">
                                  Aula já foi realizada
                                </Text>
                              </View>
                            </View>
                          ) : !canCancelClass(selectedDay, horario) ? (
                            <View className="bg-yellow-100 rounded-lg p-3 border border-yellow-300">
                              <View className="flex-row items-center">
                                <Ionicons name="time" size={16} color="#D97706" />
                                <Text className="text-yellow-700 font-pregular text-sm ml-2">
                                  Cancelamento permitido apenas até 1 hora antes da aula
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View className="bg-green-100 rounded-lg p-3 border border-green-300">
                              <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                                <Text className="text-green-700 font-pregular text-sm ml-2">
                                  Cancelamento permitido até 1 hora antes da aula
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Status para horários passados (quando não agendado) */}
                      {!userAgendado && isClassPassed(selectedDay, horario) && (
                        <View className="mb-3">
                          <View className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                            <View className="flex-row items-center">
                              <Ionicons name="time-outline" size={16} color="#6B7280" />
                              <Text className="text-gray-600 font-pregular text-sm ml-2">
                                Este horário já passou
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {/* Lista de alunos */}
                      <View className="space-y-2">
                        {alunos.map((aluno, index) => (
                          <View key={index} className="flex-row items-center bg-gray-50 p-3 rounded-lg">
                            <Ionicons 
                              name="person" 
                              size={16} 
                              color={aluno === user?.email ? '#3b82f6' : '#6b7280'} 
                            />
                            <Text className={`ml-2 font-pregular ${
                              aluno === user?.email ? 'text-blue-600 font-pbold' : 'text-gray-800'
                            }`}>
                              {aluno === user?.email 
                                ? user?.displayName || user?.email?.split('@')[0] || 'Você'
                                : aluno.split('@')[0]
                              }
                            </Text>
                          </View>
                        ))}
                        
                        {alunos.length === 0 && (
                          <Text className="text-gray-400 font-pregular text-center py-4">
                            Nenhum aluno agendado
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* Mensagem quando nenhum dia está selecionado */}
          {!selectedDay && (
            <View className="flex-1 justify-center items-center px-6 py-8">
              <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                Selecione um dia para ver os horários disponíveis
              </Text>
            </View>
          )}

          {/* Regras e Políticas */}
          <View className="px-6 py-6 bg-yellow-50">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Regras e Políticas
            </Text>
            
            <View className="bg-white rounded-2xl p-6 border border-yellow-200">
              <View className="space-y-3">
                {REGRAS_REPOSICAO.map((regra, index) => (
                  <View key={index} className="flex-row items-start">
                    <Text className="text-yellow-600 font-pbold text-lg mr-2">
                      ⚠️
                    </Text>
                    <Text className="text-gray-700 font-pregular text-sm flex-1">
                      {regra}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View className="bg-yellow-50 rounded-lg p-4 mt-4 border border-yellow-200">
                <Text className="text-yellow-800 font-pregular text-sm text-center">
                  📅 As aulas devem ser pré-agendadas conforme disponibilidade
                </Text>
              </View>
            </View>
          </View>

          {/* Informações Importantes */}
          <View className="px-6 py-6">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Informações Importantes
            </Text>
            
            <View className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <View className="space-y-2">
                <Text className="text-blue-800 font-pregular text-sm">
                  • Cada agendamento custa {POLITICAS_AGENDAMENTO.custoCoin} M2 Coin
                </Text>
                <Text className="text-blue-800 font-pregular text-sm">
                  • Não é possível agendar em horários ou dias que já passaram
                </Text>
                <Text className="text-blue-800 font-pregular text-sm">
                  • Cancelamento permitido até 1 hora antes da aula
                </Text>
                <Text className="text-blue-800 font-pregular text-sm">
                  • Após 1 hora antes da aula, o cancelamento é bloqueado
                </Text>
                <Text className="text-blue-800 font-pregular text-sm">
                  • Coins são devolvidos apenas em caso de cancelamento válido
                </Text>
                <Text className="text-blue-800 font-pregular text-sm">
                  • Reposição apenas com atestado médico
                </Text>
              </View>
            </View>
          </View>

          {/* Contato */}
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Precisa de Ajuda?
            </Text>
            
            <View className="bg-white rounded-2xl p-6 border border-gray-200">
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="call" size={20} color="#3B82F6" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.telefone}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.whatsapp}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color="#EF4444" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '140%',
    height: '140%',
    opacity: 0.35,
    left: '-15%',
    top: '-10%',
  },
  contentContainer: {
    flex: 1,
    zIndex: 10,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  coinText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 36,
  },
  // ... rest of existing styles ...
}); 