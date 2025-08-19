import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../lib/firebase';
import { getHorasFaltando } from '../../lib/horaBrasil';

import LoadingScreen from '../../components/LoadingScreen';
import { INFO_EMPRESA } from '../../constants/Empresa';
import { PLANOS_DISPONIVEIS, PLANO_PERSONAL_TRAINING } from '../../constants/Planos';
import { useGlobal } from '../../context/GlobalProvider';

export default function Perfil() {
  const { user, signOut, userProfile, updateApelido, updateUserM2Coins, approveUser, rejectUser, fetchAllUsers } = useGlobal();
  const [historicoAulas, setHistoricoAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditApelido, setShowEditApelido] = useState(false);
  const [novoApelido, setNovoApelido] = useState('');
  const [editandoApelido, setEditandoApelido] = useState(false);
  
  // Estados para edição de coins
  const [showEditCoins, setShowEditCoins] = useState(false);
  const [editandoCoins, setEditandoCoins] = useState(false);
  const [usuarioEditandoCoins, setUsuarioEditandoCoins] = useState(null);
  const [novosCoins, setNovosCoins] = useState('');
  
  // Estados para funcionalidades administrativas
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Estados para seleção de planos
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [usuarioEditandoPlano, setUsuarioEditandoPlano] = useState(null);
  const [editandoPlano, setEditandoPlano] = useState(false);
  
  // Estados para edição de tipo de usuário
  const [showTipoUsuarioModal, setShowTipoUsuarioModal] = useState(false);
  const [usuarioEditandoTipo, setUsuarioEditandoTipo] = useState(null);
  const [editandoTipo, setEditandoTipo] = useState(false);
  
  // Estado para busca de usuários
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para controlar qual tab está ativa
  const [tabAtiva, setTabAtiva] = useState('proxima'); // 'proxima', 'agendadas', 'realizadas'

  // Estados para paginação
  const [aulasAgendadasLimit, setAulasAgendadasLimit] = useState(3);
  const [aulasRealizadasLimit, setAulasRealizadasLimit] = useState(3);

  const isAdmin = userProfile?.tipoUsuario === 'admin';
  const m2Coins = userProfile?.m2Coins || 0;
  
  // Resetar tab ativa quando a aba ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Aba Perfil ganhou foco - Resetando tab para "proxima"');
      setTabAtiva('proxima');
      // Resetar limites de paginação
      setAulasAgendadasLimit(3);
      setAulasRealizadasLimit(3);
    }, [])
  );

  // Função para buscar informações dos usuários (apelidos)
  const buscarInfoUsuarios = async (emails) => {
    try {
      const usuariosInfo = [];
      for (const email of emails) {
        const userQuery = query(collection(db, 'usuarios'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          usuariosInfo.push({
            email: email,
            apelido: userData.apelido || email.split('@')[0], // Fallback para parte do email se não tiver apelido
            tipoUsuario: userData.tipoUsuario || 'aluno'
          });
        }
      }
      return usuariosInfo;
    } catch (error) {
      console.error('❌ Erro ao buscar informações dos usuários:', error);
      return emails.map(email => ({
        email: email,
        apelido: email.split('@')[0],
        tipoUsuario: 'aluno'
      }));
    }
  };

  // Função para parsear data no formato "Tue Aug 19 2025"
  const parsearData = (dataStr) => {
    try {
      // Mapeamento de meses abreviados para números
      const meses = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      // Parsear "Tue Aug 19 2025"
      const partes = dataStr.split(' ');
      if (partes.length === 4) {
        const diaSemana = partes[0]; // Tue
        const mes = partes[1]; // Aug
        const dia = parseInt(partes[2]); // 19
        const ano = parseInt(partes[3]); // 2025
        
        const mesNumero = meses[mes];
        if (mesNumero !== undefined && !isNaN(dia) && !isNaN(ano)) {
          return new Date(ano, mesNumero, dia);
        }
      }
      
      // Fallback: tentar criar data diretamente
      return new Date(dataStr);
    } catch (error) {
      console.error('❌ Erro ao parsear data:', dataStr, error);
      return null;
    }
  };

  // Funções para paginação
  const carregarMaisAulasAgendadas = () => {
    setAulasAgendadasLimit(prev => prev + 3);
  };

  const carregarMaisAulasRealizadas = () => {
    setAulasRealizadasLimit(prev => prev + 3);
  };

  const fecharAulasAgendadas = () => {
    setAulasAgendadasLimit(3);
  };

  const fecharAulasRealizadas = () => {
    setAulasRealizadasLimit(3);
  };

  // Carregar agendamentos do usuário para mostrar a próxima aula
  useEffect(() => {
    if (!user || isAdmin) {
      setLoading(false);
      return;
    }

    console.log('🔄 Carregando agendamentos para:', user.email);

    const unsubscribe = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const aulasData = [];
        console.log('📊 Total de documentos recebidos:', snapshot.size);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Documento:', doc.id, 'Key:', data.key, 'Alunos:', data.alunos);
          
          if (data.key && data.alunos && data.alunos.includes(user.email)) {
            // Extrair data e horário da chave
            const [dataStr, horario] = data.key.split('_');
            
            try {
              // Criar data de forma mais robusta
              let dataCompleta;
              
              // Parsear a data usando nossa função personalizada
              const dataBase = parsearData(dataStr);
              if (!dataBase) {
                throw new Error('Não foi possível parsear a data');
              }
              
              // Adicionar o horário à data
              const [hora, minuto] = horario.split(':');
              dataBase.setHours(parseInt(hora), parseInt(minuto), 0, 0);
              dataCompleta = dataBase;
              
              console.log('🔧 Construindo data da aula:');
              console.log('🔧 Data string:', dataStr);
              console.log('🔧 Horário string:', horario);
              console.log('🔧 Data base parseada:', dataBase.toLocaleDateString());
              console.log('🔧 Data final com horário:', dataCompleta.toLocaleString());
              console.log('🔧 Data construída (timestamp):', dataCompleta.getTime());
              
              // Verificar se a data foi construída corretamente
              if (isNaN(dataCompleta.getTime())) {
                console.error('❌ ERRO: Data inválida construída!');
                return; // Pular esta aula se a data for inválida
              }
              
              // Determinar status baseado na data atual
              const agora = new Date();
              const status = dataCompleta > agora ? 'agendada' : 'realizada';
              
              console.log('🔧 Status da aula:', status);
              console.log('🔧 Data da aula vs agora:', dataCompleta.toLocaleString(), 'vs', agora.toLocaleString());
              
              const aula = {
                id: doc.id,
                data: dataCompleta,
                horario: horario,
                status: status,
                alunos: data.alunos || [], // Array de emails dos alunos
                alunosInfo: [] // Array com informações dos alunos (será preenchido depois)
              };
              
              aulasData.push(aula);
              console.log('✅ Aula adicionada:', aula);
              
            } catch (error) {
              console.error('❌ ERRO ao processar aula:', error);
              console.error('❌ Chave:', data.key);
              console.error('❌ Data string:', dataStr);
              console.error('❌ Horário:', horario);
              // Continuar com a próxima aula em vez de quebrar tudo
            }
          }
        });
        
        console.log('🎯 Total de aulas encontradas para o usuário:', aulasData.length);
        console.log('📅 Aulas agendadas:', aulasData.filter(a => a.status === 'agendada').length);
        console.log('✅ Aulas realizadas:', aulasData.filter(a => a.status === 'realizada').length);
        
        setHistoricoAulas(aulasData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erro ao carregar agendamentos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Carregar usuários para administradores
  useEffect(() => {
    if (!isAdmin) return;

    setLoadingUsuarios(true);
    
    const q = query(collection(db, 'usuarios'), orderBy('dataCriacao', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setTodosUsuarios(users);
      setLoadingUsuarios(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Simular loading inicial
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);









  // Formatar data
  const formatarData = (data) => {
    if (!data) return 'Data não definida';
    try {
      return new Date(data).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Formatar dia da semana
  const formatarDiaSemana = (data) => {
    if (!data) return 'Dia não definido';
    try {
      return new Date(data).toLocaleDateString('pt-BR', { weekday: 'long' });
    } catch (error) {
      return 'Dia inválido';
    }
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    return status === 'realizada' ? '#10B981' : '#F59E0B';
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    return status === 'realizada' ? 'checkmark-circle' : 'time';
  };


  // Atualizar apelido
  const atualizarApelido = async () => {
    if (!novoApelido.trim() || novoApelido.trim().length < 2) {
      Alert.alert('Erro', 'Apelido deve ter pelo menos 2 caracteres');
      return;
    }

    setEditandoApelido(true);
    try {
      await updateApelido(novoApelido.trim());
      
      setNovoApelido('');
      setShowEditApelido(false);
      Alert.alert('Sucesso', 'Apelido atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar apelido:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o apelido');
    } finally {
      setEditandoApelido(false);
    }
  };

  // Funções administrativas
  const handleApproveUser = async (userId) => {
    try {
      await approveUser(userId);
      Alert.alert('Sucesso', 'Usuário aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o usuário');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      // Atualizar status para rejeitado no Firestore
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        aprovado: false,
        status: 'rejeitado',
        dataRejeicao: new Date()
      });
      
      Alert.alert('Sucesso', 'Usuário rejeitado. Ele não poderá fazer login.');
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      Alert.alert('Erro', 'Não foi possível rejeitar o usuário');
    }
  };

  const handleUpdateUserCoins = async (userId, currentCoins) => {
    setUsuarioEditandoCoins({ id: userId, currentCoins });
    setNovosCoins(currentCoins.toString());
    setShowEditCoins(true);
  };

  const handleSelectPlano = async (userId) => {
    setUsuarioEditandoPlano({ id: userId });
    setShowPlanoModal(true);
  };
  
  const handleEditTipoUsuario = async (userId) => {
    setUsuarioEditandoTipo({ id: userId });
    setShowTipoUsuarioModal(true);
  };

  const aplicarPlano = async (plano) => {
    if (!usuarioEditandoPlano) return;
    
    setEditandoPlano(true);
    try {
      const userRef = doc(db, 'usuarios', usuarioEditandoPlano.id);
      
      // Calcular M2 Coins baseado no plano (1 aula = 1 M2 Coin)
      const m2Coins = plano.aulasPorMes;
      
      await updateDoc(userRef, {
        plano: plano.id,
        planoNome: plano.nome,
        m2Coins: m2Coins,
        dataAtualizacaoPlano: new Date(),
        status: 'ativo'
      });
      
      setShowPlanoModal(false);
      setUsuarioEditandoPlano(null);
      Alert.alert('Sucesso', `Plano "${plano.nome}" aplicado! Usuário recebeu ${m2Coins} M2 Coins.`);
    } catch (error) {
      console.error('Erro ao aplicar plano:', error);
      Alert.alert('Erro', 'Não foi possível aplicar o plano');
    } finally {
      setEditandoPlano(false);
    }
  };
  
  const aplicarTipoUsuario = async (novoTipo) => {
    if (!usuarioEditandoTipo) return;
    
    setEditandoTipo(true);
    try {
      const userRef = doc(db, 'usuarios', usuarioEditandoTipo.id);
      
      // Configurações baseadas no novo tipo
      let configuracao = {
        tipoUsuario: novoTipo,
        ultimaAtualizacao: new Date()
      };
      
      if (novoTipo === 'admin') {
        configuracao = {
          ...configuracao,
          m2Coins: 999,
          plano: 'Admin Ilimitado',
          aprovado: true
        };
      } else if (novoTipo === 'personal') {
        configuracao = {
          ...configuracao,
          m2Coins: 8, // 8 aulas por mês
          plano: 'Personal Training',
          aprovado: true
        };
      } else if (novoTipo === 'aluno') {
        configuracao = {
          ...configuracao,
          m2Coins: 4, // 4 aulas por mês (plano básico)
          plano: 'Plano Básico',
          aprovado: false // Precisa de aprovação
        };
      }
      
      await updateDoc(userRef, configuracao);
      
      setShowTipoUsuarioModal(false);
      setUsuarioEditandoTipo(null);
      Alert.alert('Sucesso', `Usuário alterado para ${novoTipo === 'admin' ? 'ADMINISTRADOR' : novoTipo === 'personal' ? 'PERSONAL TRAINING' : 'ALUNO'}!`);
    } catch (error) {
      console.error('Erro ao alterar tipo de usuário:', error);
      Alert.alert('Erro', 'Não foi possível alterar o tipo de usuário');
    } finally {
      setEditandoTipo(false);
    }
  };

  const salvarNovosCoins = async () => {
    if (!usuarioEditandoCoins) return;
    
    const coins = parseInt(novosCoins);
    if (isNaN(coins) || coins < 0) {
      Alert.alert('Erro', 'Digite um valor válido para os M2 Coins');
      return;
    }

    setEditandoCoins(true);
    try {
      await updateUserM2Coins(usuarioEditandoCoins.id, coins);
      
      setShowEditCoins(false);
      setUsuarioEditandoCoins(null);
      setNovosCoins('');
      Alert.alert('Sucesso', 'M2 Coins atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar M2 Coins:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os M2 Coins');
    } finally {
      setEditandoCoins(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 font-pregular text-lg text-center">
            Usuário não autenticado
          </Text>
        </View>
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
          {/* Header com título */}
          <View style={styles.header}>
            <Text style={styles.titleText}>
              Meu Perfil
            </Text>
            <Text style={styles.subtitleText}>
              Gerencie sua conta e funcionalidades administrativas
            </Text>
          </View>

          {/* Header com M2 Coins */}
          <View style={styles.coinHeader}>
            <Image
              source={require('../../assets/images/m2coin.png')}
              style={styles.coinImage}
            />
            <Text style={styles.coinText}>
              {m2Coins}
            </Text>
          </View>

          {/* Estatísticas do usuário */}
          {!isAdmin && (
            <View className="px-6 py-6 bg-white">
              <View className="flex-row space-x-4">
                {/* Aulas Agendadas */}
                <TouchableOpacity 
                  onPress={() => setTabAtiva('agendadas')}
                  className={`flex-1 bg-blue-200 rounded-xl p-4 border-4 ${
                    tabAtiva === 'agendadas' ? 'border-blue-500 bg-blue-200' : 'border-blue-600'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar" size={20} color="#1E40AF" />
                      <Text className="text-blue-800 font-pbold text-sm ml-2">
                        Aulas Agendadas
                      </Text>
                    </View>
                  </View>
                  <Text className={`font-pextrabold text-2xl mt-2 ${
                    tabAtiva === 'agendadas' ? 'text-blue-900' : 'text-blue-600'
                  }`}>
                    {historicoAulas.filter(aula => aula.status === 'agendada').length}
                  </Text>
                </TouchableOpacity>

                {/* Aulas Realizadas */}
                <TouchableOpacity 
                  onPress={() => setTabAtiva('realizadas')}
                  className={`flex-1 bg-green-200 rounded-xl p-4 border-4 ${
                    tabAtiva === 'realizadas' ? 'border-green-500 bg-green-200' : 'border-green-600'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text className="text-green-800 font-pbold text-sm ml-2">
                        Aulas Realizadas
                      </Text>
                    </View>
                  </View>
                  <Text className={`font-pextrabold text-2xl mt-2 ${
                    tabAtiva === 'realizadas' ? 'text-green-900' : 'text-green-600'
                  }`}>
                    {historicoAulas.filter(aula => aula.status === 'realizada').length}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Conteúdo baseado na tab ativa */}
          {!isAdmin && (
            <View className="px-6 py-6 bg-white">
              {/* Header baseado na tab ativa */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <Ionicons 
                    name={tabAtiva === 'proxima' ? 'calendar' : tabAtiva === 'agendadas' ? 'time' : 'checkmark-circle'} 
                    size={24} 
                    color={tabAtiva === 'proxima' ? '#1E40AF' : tabAtiva === 'agendadas' ? '#3B82F6' : '#059669'} 
                  />
                  <Text className="text-gray-800 font-pextrabold text-2xl ml-2">
                    {tabAtiva === 'proxima' ? 'Próxima Aula' : 
                     tabAtiva === 'agendadas' ? 'Aulas Agendadas' : 'Histórico de Aulas'}
                  </Text>
                </View>
                <View className={`rounded-full px-3 py-1 ${
                  tabAtiva === 'proxima' ? 'bg-green-100' : 
                  tabAtiva === 'agendadas' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <Text className={`font-pbold text-sm ${
                    tabAtiva === 'proxima' ? 'text-green-800' : 
                    tabAtiva === 'agendadas' ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {tabAtiva === 'proxima' ? 'Próximo Agendamento' : 
                     tabAtiva === 'agendadas' ? 'Futuras' : 'Realizadas'}
                  </Text>
                </View>
              </View>

              {/* Conteúdo baseado na tab ativa */}
              {(() => {
                if (tabAtiva === 'proxima') {
                  // Mostrar próxima aula
                  console.log('🔍 Calculando próxima aula...');
                  console.log('📊 historicoAulas:', historicoAulas);
                  console.log('📅 Aulas agendadas:', historicoAulas.filter(aula => aula.status === 'agendada'));
                  console.log('⏰ Aulas futuras:', historicoAulas.filter(aula => aula.status === 'agendada' && aula.data > new Date()));
                  
                  const proximaAula = historicoAulas
                    .filter(aula => {
                      const agora = new Date();
                      const dataAula = new Date(aula.data);
                      
                      // Aula é futura se a data/hora for maior que agora
                      const isFutura = dataAula > agora;
                      console.log(`📅 Aula ${aula.horario} em ${formatarData(aula.data)} às ${aula.horario}: ${isFutura ? 'FUTURA' : 'PASSADA'}`);
                      console.log(`📅 Data da aula: ${dataAula.toLocaleString()}`);
                      console.log(`📅 Agora: ${agora.toLocaleString()}`);
                      
                      return aula.status === 'agendada' && isFutura;
                    })
                    .sort((a, b) => new Date(a.data) - new Date(b.data))[0];

                  console.log('🎯 Próxima aula encontrada:', proximaAula);

                  if (!proximaAula) {
                    console.log('❌ Nenhuma próxima aula encontrada');
                    return (
                      <View className="bg-gray-50 rounded-xl p-8 items-center">
                        <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                          Nenhuma aula agendada
                        </Text>
                        <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
                          Agende sua próxima aula na aba "Agendar"
                        </Text>
                      </View>
                    );
                  }

                  // Calcular tempo restante até a aula usando hora correta do Brasil
                  const tempoTexto = getHorasFaltando(proximaAula.data, proximaAula.horario);

                  return (
                    <View className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-400">
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={24} color="#1E40AF" />
                          <Text className="text-blue-800 font-pextrabold text-xl ml-2">
                            {proximaAula.horario}
                          </Text>
                        </View>
                        <View className="bg-blue-100 rounded-full px-3 py-1">
                          <Text className="text-blue-800 font-pbold text-sm">
                            {tempoTexto}
                          </Text>
                        </View>
                      </View>

                      <View className="space-y-3">
                        <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <Text className="text-blue-800 font-pbold text-lg">
                            {formatarDiaSemana(proximaAula.data)}
                          </Text>
                          <Text className="text-blue-700 font-pregular text-sm">
                            {formatarData(proximaAula.data)}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <Text className="text-green-700 font-pbold text-sm ml-2">
                              Confirmado
                            </Text>
                          </View>
                          <View className="bg-green-500 rounded-full px-3 py-1">
                            <Text className="text-white font-pbold text-xs">
                              Próxima Aula
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }

                if (tabAtiva === 'agendadas') {
                  // Mostrar lista de aulas agendadas
                  const aulasAgendadas = historicoAulas
                    .filter(aula => aula.status === 'agendada' && aula.data > new Date())
                    .sort((a, b) => a.data - b.data);

                  if (aulasAgendadas.length === 0) {
                    return (
                      <View className="bg-gray-50 rounded-xl p-8 items-center">
                        <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                          Nenhuma aula agendada
                        </Text>
                        <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
                          Agende suas aulas na aba "Agendar"
                        </Text>
                      </View>
                    );
                  }

                  const aulasVisiveis = aulasAgendadas.slice(0, aulasAgendadasLimit);
                  const podeCarregarMais = aulasAgendadasLimit < aulasAgendadas.length;

                  return (
                    <View className="space-y-3">
                      {aulasVisiveis.map((aula) => (
                        <View key={aula.id} className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-500">
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                              <Ionicons name="time" size={20} color="#3B82F6" />
                              <Text className="text-blue-600 font-pbold text-sm ml-2">
                                Agendada
                              </Text>
                            </View>
                            <Text className="text-gray-500 font-pregular text-sm">
                              {aula.horario}
                            </Text>
                          </View>

                          <View className="space-y-2">
                            <Text className="text-gray-800 font-pbold text-lg">
                              {formatarDiaSemana(aula.data)}
                            </Text>
                            <Text className="text-gray-600 font-pregular text-sm">
                              {formatarData(aula.data)}
                            </Text>
                          </View>
                        </View>
                      ))}

                      {/* Controles de paginação */}
                      <View className="flex-row space-x-3 mt-4">
                        {podeCarregarMais && (
                          <TouchableOpacity
                            onPress={carregarMaisAulasAgendadas}
                            className="flex-1 bg-blue-500 rounded-lg py-3 px-4"
                            activeOpacity={0.8}
                          >
                            <Text className="text-white font-pbold text-center">
                              Carregar Mais ({aulasAgendadas.length - aulasVisiveis.length} restantes)
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        {aulasVisiveis.length > 3 && (
                          <TouchableOpacity
                            onPress={fecharAulasAgendadas}
                            className="bg-gray-500 rounded-lg py-3 px-4"
                            activeOpacity={0.8}
                          >
                            <Text className="text-white font-pbold text-center">
                              Fechar
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }

                if (tabAtiva === 'realizadas') {
                  // Mostrar histórico de aulas realizadas
                  const aulasRealizadas = historicoAulas
                    .filter(aula => aula.status === 'realizada')
                    .sort((a, b) => b.data - a.data);

                  if (aulasRealizadas.length === 0) {
                    return (
                      <View className="bg-gray-50 rounded-xl p-8 items-center">
                        <Ionicons name="checkmark-circle-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                          Nenhuma aula realizada ainda
                        </Text>
                        <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
                          Suas aulas aparecerão aqui após serem realizadas
                        </Text>
                      </View>
                    );
                  }

                  const aulasVisiveis = aulasRealizadas.slice(0, aulasRealizadasLimit);
                  const podeCarregarMais = aulasRealizadasLimit < aulasRealizadas.length;

                  return (
                    <View className="space-y-3">
                      {aulasVisiveis.map((aula) => (
                        <View key={aula.id} className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-500">
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                              <Text className="text-green-600 font-pbold text-sm ml-2">
                                Realizada
                              </Text>
                            </View>
                            <Text className="text-gray-500 font-pregular text-sm">
                              {aula.horario}
                            </Text>
                          </View>

                          <View className="space-y-2">
                            <Text className="text-gray-800 font-pbold text-lg">
                              {formatarDiaSemana(aula.data)}
                            </Text>
                            <Text className="text-gray-600 font-pregular text-sm">
                              {formatarData(aula.data)}
                            </Text>
                          </View>
                        </View>
                      ))}

                      {/* Controles de paginação */}
                      <View className="flex-row space-x-3 mt-4">
                        {podeCarregarMais && (
                          <TouchableOpacity
                            onPress={carregarMaisAulasRealizadas}
                            className="flex-1 bg-green-500 rounded-lg py-3 px-4"
                            activeOpacity={0.8}
                          >
                            <Text className="text-white font-pbold text-center">
                              Carregar Mais ({aulasRealizadas.length - aulasVisiveis.length} restantes)
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        {aulasVisiveis.length > 3 && (
                          <TouchableOpacity
                            onPress={fecharAulasRealizadas}
                            className="bg-gray-500 rounded-lg py-3 px-4"
                            activeOpacity={0.8}
                          >
                            <Text className="text-white font-pbold text-center">
                              Fechar
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }

                return null;
              })()}
            </View>
          )}

          {/* Painel Administrativo */}
          {isAdmin && (
            <View className="px-6 py-6 bg-gray-50">
              <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                  Painel Administrativo
                </Text>
                
                {/* Campo de Busca */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-white border-2 border-blue-300 rounded-xl px-4 py-3 shadow-sm">
                    <Ionicons name="search" size={20} color="#2563eb" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-800 font-pregular text-base"
                      placeholder="Buscar usuários por nome ou email..."
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        className="ml-2"
                      >
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Contador de resultados */}
                  {searchQuery.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-gray-600 font-pregular text-sm">
                        {todosUsuarios.filter(usuario => {
                          const query = searchQuery.toLowerCase();
                          return (
                            (usuario.apelido && usuario.apelido.toLowerCase().includes(query)) ||
                            (usuario.email && usuario.email.toLowerCase().includes(query)) ||
                            (usuario.tipoUsuario && usuario.tipoUsuario.toLowerCase().includes(query))
                          );
                        }).length} usuário(s) encontrado(s)
                      </Text>
                    </View>
                  )}
                </View>
                
                {loadingUsuarios ? (
                  <Text className="text-gray-600 font-pregular text-center">
                    Carregando usuários...
                  </Text>
                ) : (
                  <View className="space-y-3">
                    {/* Usuários filtrados pela busca */}
                    {(() => {
                      const usuariosFiltrados = todosUsuarios.filter(usuario => {
                        if (!searchQuery.trim()) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          (usuario.apelido && usuario.apelido.toLowerCase().includes(query)) ||
                          (usuario.email && usuario.email.toLowerCase().includes(query)) ||
                          (usuario.tipoUsuario && usuario.tipoUsuario.toLowerCase().includes(query))
                        );
                      });
                      
                      if (searchQuery.trim() && usuariosFiltrados.length === 0) {
                        return (
                          <View className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                            <Ionicons name="search-outline" size={48} color="#D97706" />
                            <Text className="text-yellow-800 font-pbold text-lg mt-3 mb-2">
                              Nenhum usuário encontrado
                            </Text>
                            <Text className="text-yellow-700 font-pregular text-base">
                              Tente buscar por outro termo ou verifique a ortografia.
                            </Text>
                          </View>
                        );
                      }
                      
                      return usuariosFiltrados.map((usuario) => (
                      <View key={usuario.id} className="bg-white rounded-xl p-4 border-2 border-blue-300 shadow-lg mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-gray-800 font-pextrabold text-xl">
                            {usuario.apelido || usuario.email}
                          </Text>
                          <View className={`px-3 py-1 rounded-full border ${
                            usuario.tipoUsuario === 'admin' 
                              ? 'bg-red-100 border-red-300' 
                              : usuario.tipoUsuario === 'personal'
                              ? 'bg-purple-100 border-purple-300'
                              : 'bg-blue-100 border-blue-300'
                          }`}>
                            <Text className={`text-xs font-pextrabold ${
                              usuario.tipoUsuario === 'admin' 
                                ? 'text-red-700' 
                                : usuario.tipoUsuario === 'personal'
                                ? 'text-purple-700'
                                : 'text-blue-700'
                            }`}>
                              {usuario.tipoUsuario}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="flex-row items-center justify-between mb-4">
                          {/* M2 Coins (apenas para alunos) */}
                          {usuario.tipoUsuario === 'aluno' && (
                            <View className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                              <Text className="text-gray-600 text-sm font-pbold">
                                M2 Coins: <Text className="text-blue-600 font-pextrabold">{usuario.m2Coins || 0}</Text>
                              </Text>
                            </View>
                          )}
                          <View className={`px-3 py-1 rounded-full border ${
                            usuario.aprovado ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'
                          }`}>
                            <Text className={`text-sm font-pextrabold ${
                              usuario.aprovado ? 'text-green-700' : 'text-yellow-700'
                            }`}>
                              {usuario.aprovado ? 'Aprovado' : 'Pendente'}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="space-y-2">
                          {usuario.tipoUsuario !== 'admin' && (
                            <>
                              {!usuario.aprovado ? (
                                <TouchableOpacity
                                  onPress={() => handleApproveUser(usuario.id)}
                                  className="bg-green-500 rounded-lg p-3 border border-green-400 shadow-sm"
                                >
                                  <Text className="text-white font-pextrabold text-sm text-center">
                                    ✅ Aprovar Usuário
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => handleRejectUser(usuario.id)}
                                  className="bg-red-500 rounded-lg p-3 border border-red-400 shadow-sm"
                                >
                                  <Text className="text-white font-pextrabold text-sm text-center">
                                    ❌ Rejeitar Usuário
                                  </Text>
                                </TouchableOpacity>
                              )}
                              
                              <View className="h-3" />
                              
                              <TouchableOpacity
                                onPress={() => handleSelectPlano(usuario.id)}
                                className="bg-purple-500 rounded-lg p-3 border border-purple-400 shadow-sm"
                              >
                                <Text className="text-white font-pextrabold text-sm text-center">
                                  🎯 Escolher Plano
                                </Text>
                              </TouchableOpacity>
                            </>
                          )}
                          
                          <TouchableOpacity
                            onPress={() => handleEditTipoUsuario(usuario.id)}
                            className="bg-orange-500 rounded-lg p-3 border border-orange-400 shadow-sm"
                          >
                            <Text className="text-white font-pextrabold text-sm text-center">
                              🔄 Alterar Tipo
                            </Text>
                          </TouchableOpacity>
                          
                          {/* Botão Editar M2 Coins (apenas para alunos) */}
                          {usuario.tipoUsuario === 'aluno' && (
                            <TouchableOpacity
                              onPress={() => handleUpdateUserCoins(usuario.id, usuario.m2Coins || 0)}
                              className="bg-blue-500 rounded-lg p-3 border border-blue-400 shadow-sm"
                            >
                              <Text className="text-white font-pextrabold text-sm text-center">
                                💰 Editar M2 Coins
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ));
                  })()}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Informações do Usuário */}
          <View className="px-6 py-6 bg-blue-50">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-600">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="person" size={24} color="#1E40AF" />
                  <Text className="text-gray-800 font-pextrabold text-2xl ml-2">
                    Meu Perfil
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowEditApelido(true)}
                  className="bg-blue-500 rounded-lg px-4 py-2"
                >
                  <Text className="text-white font-pbold text-sm">
                    Editar Apelido
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View className="space-y-3">
                {/* Apelido */}
                <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <Text className="text-blue-800 font-pbold text-lg text-center mb-2">
                    Apelido
                  </Text>
                  <Text className="text-blue-600 font-pregular text-base text-center">
                    {userProfile?.apelido || 'Não definido'}
                  </Text>
                </View>

                {/* Tipo de Usuário */}
                <View className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <Text className="text-purple-800 font-pbold text-lg text-center mb-2">
                    Tipo de Usuário
                  </Text>
                  <View className="flex-row justify-center items-center">
                    <View className={`px-3 py-1 rounded-full ${
                      userProfile?.tipoUsuario === 'admin' 
                        ? 'bg-red-100' 
                        : userProfile?.tipoUsuario === 'personal'
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}>
                      <Text className={`font-pbold ${
                        userProfile?.tipoUsuario === 'admin' 
                          ? 'text-red-700' 
                          : userProfile?.tipoUsuario === 'personal'
                          ? 'text-purple-700'
                          : 'text-blue-700'
                      }`}>
                        {userProfile?.tipoUsuario === 'admin' ? 'ADMINISTRADOR' :
                         userProfile?.tipoUsuario === 'personal' ? 'PERSONAL TRAINING' :
                         'ALUNO'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status de Aprovação */}
                {userProfile?.tipoUsuario !== 'admin' && (
                  <View className={`rounded-xl p-4 border ${
                    userProfile?.aprovado 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <Text className={`font-pbold text-lg text-center mb-2 ${
                      userProfile?.aprovado 
                        ? 'text-green-800' 
                        : 'text-yellow-800'
                    }`}>
                      Status
                    </Text>
                    <View className="flex-row justify-center items-center">
                      <View className={`px-3 py-1 rounded-full ${
                        userProfile?.aprovado 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                      }`}>
                        <Text className={`font-pbold ${
                          userProfile?.aprovado 
                            ? 'text-green-700' 
                            : 'text-yellow-700'
                        }`}>
                          {userProfile?.aprovado ? 'APROVADO' : 'AGUARDANDO APROVAÇÃO'}
                        </Text>
                      </View>
                    </View>
                    {!userProfile?.aprovado && (
                      <Text className="text-yellow-600 font-pregular text-sm text-center mt-2">
                        Seu cadastro será analisado por um administrador
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Seção de Planos Disponíveis */}
          {!isAdmin && (
            <View className="px-6 py-6 bg-white">
              <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                Planos Disponíveis
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row space-x-4">
                  {userProfile?.tipoUsuario === 'personal' ? (
                    <View className="bg-purple-50 rounded-xl p-4 border border-purple-200 min-w-[280]">
                      <Text className="text-purple-800 font-pbold text-lg mb-2">
                        {PLANO_PERSONAL_TRAINING.nome}
                      </Text>
                      <Text className="text-purple-700 font-pregular text-sm mb-3">
                        {PLANO_PERSONAL_TRAINING.descricao}
                      </Text>
                      <View className="space-y-1">
                        <Text className="text-purple-800 font-pbold text-lg">
                          R$ {PLANO_PERSONAL_TRAINING.valores.mensal.valor}
                        </Text>
                        <Text className="text-purple-600 font-pregular text-xs">
                          {PLANO_PERSONAL_TRAINING.valores.mensal.forma}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    PLANOS_DISPONIVEIS.map((plano, index) => (
                      <View key={plano.id} className="bg-blue-50 rounded-xl p-4 border border-blue-200 min-w-[280]">
                        <Text className="text-blue-800 font-pbold text-lg mb-2">
                          {plano.nome}
                        </Text>
                        <Text className="text-blue-700 font-pregular text-sm mb-3">
                          {plano.descricao}
                        </Text>
                        <View className="space-y-1">
                          <Text className="text-blue-800 font-pbold text-lg">
                            R$ {plano.valores.mensal.valor}
                          </Text>
                          <Text className="text-blue-600 font-pregular text-xs">
                            {plano.valores.mensal.forma}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
              
              <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <Text className="text-yellow-800 font-pregular text-sm text-center">
                  💡 Entre em contato para mais informações sobre os planos
                </Text>
              </View>
            </View>
          )}

          {/* Informações da Empresa */}
          <View className="px-6 py-6 bg-gray-50">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                M2 Academia de Futebol
              </Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="business" size={20} color="#3B82F6" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    CNPJ: {INFO_EMPRESA.cnpj}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="call" size={20} color="#10B981" />
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
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-instagram" size={20} color="#EC4899" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.instagram}
                  </Text>
                </View>
              </View>
              
              <View className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                <Text className="text-blue-800 font-pregular text-sm text-center">
                  💳 PIX: {INFO_EMPRESA.pix}
                </Text>
              </View>
            </View>
          </View>

          {/* Botão de Logout */}
          <View className="px-6 py-6 bg-gray-50">
            <TouchableOpacity
              onPress={signOut}
              className="bg-red-500 rounded-xl p-4 items-center"
            >
              <Text className="text-white font-pbold text-lg">
                Sair da Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal para Editar Apelido */}
          {showEditApelido && (
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="absolute inset-0 bg-black/50 justify-center items-center px-6"
            >
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                  Editar Apelido
                </Text>
                
                <Text className="text-gray-600 font-pregular text-base text-center mb-4">
                  Escolha um apelido que será exibido em todo o app
                </Text>
                
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg font-pbold"
                  placeholder="Digite seu apelido"
                  value={novoApelido}
                  onChangeText={setNovoApelido}
                  autoCapitalize="words"
                  maxLength={20}
                  autoFocus
                />
                
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    onPress={() => {
                      setShowEditApelido(false);
                      setNovoApelido('');
                    }}
                    className="flex-1 bg-gray-300 rounded-lg p-3 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={atualizarApelido}
                    disabled={editandoApelido}
                    className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      {editandoApelido ? 'Salvando...' : 'Salvar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}

          {/* Modal para editar M2 Coins */}
          {showEditCoins && (
            <Modal
              visible={showEditCoins}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowEditCoins(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
                  <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                    Editar M2 Coins
                  </Text>
                  
                  <Text className="text-gray-600 font-pregular text-base text-center mb-4">
                    Digite a nova quantidade de M2 Coins para o usuário
                  </Text>
                  
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg font-pbold w-full"
                    placeholder="Quantidade de coins"
                    value={novosCoins}
                    onChangeText={setNovosCoins}
                    keyboardType="numeric"
                    maxLength={10}
                    autoFocus
                  />
                  
                  <View className="flex-row space-x-3 w-full">
                    <TouchableOpacity 
                      onPress={() => {
                        setShowEditCoins(false);
                        setUsuarioEditandoCoins(null);
                        setNovosCoins('');
                      }}
                      className="flex-1 bg-gray-500 rounded-lg p-3 items-center"
                    >
                      <Text className="text-white font-pbold text-base">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={salvarNovosCoins}
                      disabled={editandoCoins}
                      className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                    >
                      <Text className="text-white font-pbold text-base">
                        {editandoCoins ? 'Salvando...' : 'Salvar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {/* Modal para seleção de planos */}
          {showPlanoModal && (
            <Modal
              visible={showPlanoModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPlanoModal(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80%]">
                  <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                    Escolher Plano
                  </Text>
                  
                  <Text className="text-gray-600 font-pregular text-base text-center mb-6">
                    Selecione um plano para o usuário. Os M2 Coins serão calculados automaticamente.
                  </Text>
                  
                  <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                    <View className="space-y-3">
                      {/* Planos regulares */}
                      {PLANOS_DISPONIVEIS.map((plano) => (
                        <TouchableOpacity
                          key={plano.id}
                          onPress={() => aplicarPlano(plano)}
                          disabled={editandoPlano}
                          className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-blue-800 font-pbold text-lg">
                              {plano.nome}
                            </Text>
                            <View className="bg-blue-100 rounded-full px-3 py-1">
                              <Text className="text-blue-700 font-pbold text-sm">
                                {plano.aulasPorMes} aulas
                              </Text>
                            </View>
                          </View>
                          
                          <Text className="text-blue-700 font-pregular text-sm mb-2">
                            {plano.descricao}
                          </Text>
                          
                          <View className="flex-row items-center justify-between">
                            <Text className="text-blue-800 font-pbold text-lg">
                              R$ {plano.valores.mensal.valor}
                            </Text>
                            <Text className="text-blue-600 font-pbold text-sm">
                              {plano.aulasPorMes} M2 Coins
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                      
                      {/* Plano Personal Training */}
                      <TouchableOpacity
                        onPress={() => aplicarPlano(PLANO_PERSONAL_TRAINING)}
                        disabled={editandoPlano}
                        className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-purple-800 font-pbold text-lg">
                            {PLANO_PERSONAL_TRAINING.nome}
                          </Text>
                          <View className="bg-purple-100 rounded-full px-3 py-1">
                            <Text className="text-purple-700 font-pbold text-sm">
                              {PLANO_PERSONAL_TRAINING.aulasPorMes} aulas
                            </Text>
                          </View>
                        </View>
                        
                        <Text className="text-purple-700 font-pregular text-sm mb-2">
                          {PLANO_PERSONAL_TRAINING.descricao}
                        </Text>
                        
                        <View className="flex-row items-center justify-between">
                          <Text className="text-purple-800 font-pbold text-lg">
                            R$ {PLANO_PERSONAL_TRAINING.valores.mensal.valor}
                          </Text>
                          <Text className="text-purple-600 font-pbold text-sm">
                            {PLANO_PERSONAL_TRAINING.aulasPorMes} M2 Coins
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      setShowPlanoModal(false);
                      setUsuarioEditandoPlano(null);
                    }}
                    className="bg-gray-500 rounded-lg p-3 mt-4 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* Modal para edição de tipo de usuário */}
          {showTipoUsuarioModal && (
            <Modal
              visible={showTipoUsuarioModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowTipoUsuarioModal(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                    Alterar Tipo de Usuário
                  </Text>
                  
                  <Text className="text-gray-600 font-pregular text-base text-center mb-6">
                    Selecione o novo tipo de usuário. As configurações serão ajustadas automaticamente.
                  </Text>
                  
                  <View className="space-y-3">
                    {/* Tipo Admin */}
                    <TouchableOpacity
                      onPress={() => aplicarTipoUsuario('admin')}
                      disabled={editandoTipo}
                      className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-red-800 font-pbold text-lg">
                          👑 ADMINISTRADOR
                        </Text>
                        <View className="bg-red-100 rounded-full px-3 py-1">
                          <Text className="text-red-700 font-pbold text-sm">
                            Sistema
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-red-700 font-pregular text-sm mb-2">
                        Controle completo do sistema, acesso total, aprovado automaticamente
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Tipo Personal Training */}
                    <TouchableOpacity
                      onPress={() => aplicarTipoUsuario('personal')}
                      disabled={editandoTipo}
                      className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-purple-800 font-pbold text-lg">
                          🏃‍♂️ PERSONAL TRAINING
                        </Text>
                        <View className="bg-purple-100 rounded-full px-3 py-1">
                          <Text className="text-purple-700 font-pbold text-sm">
                            8 Aulas
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-purple-700 font-pregular text-sm mb-2">
                        Horários flexíveis, 8 aulas por mês, ministra aulas, aprovado automaticamente
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Tipo Aluno */}
                    <TouchableOpacity
                      onPress={() => aplicarTipoUsuario('aluno')}
                      disabled={editandoTipo}
                      className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-blue-800 font-pbold text-lg">
                          👥 ALUNO
                        </Text>
                        <View className="bg-blue-100 rounded-full px-3 py-1">
                          <Text className="text-blue-700 font-pbold text-sm">
                            4 Aulas
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-blue-700 font-pregular text-sm mb-2">
                        Horários fixos, 4 aulas por mês, consome M2 Coins, precisa de aprovação
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      setShowTipoUsuarioModal(false);
                      setUsuarioEditandoTipo(null);
                    }}
                    className="bg-gray-500 rounded-lg p-3 mt-6 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
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
  },
  titleText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitleText: {
    color: '#dbeafe',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: 16,
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    marginTop: -10,
    marginBottom: 10,
  },
  coinImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  coinText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
});
