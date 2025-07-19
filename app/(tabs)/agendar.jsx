import { Ionicons } from '@expo/vector-icons';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useGlobal } from '../../context/GlobalProvider';
import { db } from '../../lib/firebase';

export default function Agendar() {
  const { user } = useGlobal();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [agendamentos, setAgendamentos] = useState({});
  const [loading, setLoading] = useState(true);

  // Carregar agendamentos do Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const agendamentosData = {};
        snapshot.forEach((doc) => {
          agendamentosData[doc.id] = doc.data().alunos || [];
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

  // Salvar agendamento no Firestore
  const salvarAgendamento = async (key, alunos) => {
    try {
      await setDoc(doc(db, 'agendamentos', key), {
        alunos: alunos,
        dataCriacao: new Date(),
        ultimaAtualizacao: new Date()
      });
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o agendamento.');
    }
  };

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

  // Verificar se é o dia selecionado
  const isSelected = (date) => {
    return selectedDay && date.toDateString() === selectedDay.toDateString();
  };

  // Apenas 2 horários
  const horarios = ['06:00', '18:00'];

  // Verificar se o usuário está agendado
  const isUserAgendado = (data, horario) => {
    const key = `${data.toDateString()}_${horario}`;
    const alunos = agendamentos[key] || [];
    return alunos.includes(user?.email);
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
      // Adicionar usuário
      if (novosAgendamentos[key].length >= 8) {
        Alert.alert('Limite Atingido', 'Este horário já está com 8 alunos.');
        return;
      }
      novosAgendamentos[key] = [...novosAgendamentos[key], userEmail];
      
      // Salvar no Firestore
      await salvarAgendamento(key, novosAgendamentos[key]);
      
      Alert.alert('Sucesso', 'Você foi agendado para esta aula!');
    } else {
      // Remover usuário
      novosAgendamentos[key] = novosAgendamentos[key].filter((_, i) => i !== userIndex);
      
      // Salvar no Firestore
      await salvarAgendamento(key, novosAgendamentos[key]);
      
      Alert.alert('Cancelado', 'Seu agendamento foi cancelado.');
    }
    
    setAgendamentos(novosAgendamentos);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 font-pregular">Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header com navegação */}
      <View className="bg-blue-600 px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={prevWeek} className="p-2">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-white font-pbold text-lg">
            {currentWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity onPress={nextWeek} className="p-2">
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
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
          <Text className="text-gray-800 font-pbold text-xl mb-4">
            Horários - {formatDate(selectedDay)}
          </Text>

          {/* Lista de horários */}
          {horarios.map((horario) => {
            const key = `${selectedDay.toDateString()}_${horario}`;
            const alunos = agendamentos[key] || [];
            const userAgendado = isUserAgendado(selectedDay, horario);
            
            return (
              <View key={horario} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-800 font-pbold text-lg">
                    {horario === '06:00' ? '06:00 AM' : '18:00 PM'}
                  </Text>
                  <Text className="text-gray-500 font-pregular text-sm">
                    {alunos.length}/8 alunos
                  </Text>
                </View>

                {/* Botão para agendar/desagendar */}
                <TouchableOpacity
                  onPress={() => toggleAgendamento(selectedDay, horario)}
                  className={`p-3 rounded-lg mb-3 ${
                    userAgendado 
                      ? 'bg-red-500' 
                      : alunos.length >= 8 
                        ? 'bg-gray-300' 
                        : 'bg-blue-600'
                  }`}
                  disabled={!userAgendado && alunos.length >= 8}
                >
                  <Text className="text-white font-pbold text-center">
                    {userAgendado 
                      ? 'Cancelar Aula' 
                      : alunos.length >= 8 
                        ? 'Horário Lotado' 
                        : 'Agendar Aula'
                    }
                  </Text>
                </TouchableOpacity>

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
          })}
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
    </ScrollView>
  );
} 